/**
 * POST /api/webhooks/wompi
 * Recibe notificaciones de pago de Wompi y actualiza el estado de
 * suscripciones y citas en la base de datos.
 *
 * Docs: https://docs.wompi.co/docs/colombia/eventos/
 * Verificación: SHA-256(prop_values + timestamp + EVENTS_SECRET)
 */

import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { capturarErrorApi } from '@/lib/monitoring/sentry';
import { enviarEmail } from '@/lib/email/confirmaciones';

const EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET ?? '';

// ── Verificación de firma ──────────────────────────────────────
async function verificarFirma(body: WompiEvent): Promise<boolean> {
  if (!EVENTS_SECRET) {
    console.warn('[WOMPI WEBHOOK] WOMPI_EVENTS_SECRET no configurado — rechazando');
    return false;
  }

  const { signature, timestamp } = body;
  if (!signature?.checksum || !signature?.properties || !timestamp) return false;

  // Concatenar los valores de las propiedades indicadas + timestamp + secret
  let cadena = '';
  for (const prop of signature.properties) {
    // Navegar el objeto anidado: "transaction.id" → body.data.transaction.id
    const partes = prop.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let valor: any = body;
    for (const p of partes) valor = valor?.[p];
    cadena += String(valor ?? '');
  }
  cadena += timestamp + EVENTS_SECRET;

  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(cadena));
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return hashHex === signature.checksum;
}

// ── Tipos Wompi ────────────────────────────────────────────────
interface WompiTransaction {
  id: string;
  status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING';
  reference: string;
  amount_in_cents: number;
  currency: string;
  payment_method_type: string;
  finalized_at?: string;
}

interface WompiEvent {
  event: string;
  data: { transaction: WompiTransaction };
  environment: string;
  signature: { properties: string[]; checksum: string };
  timestamp: number;
}

// ── Handler principal ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  let body: WompiEvent;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: 'Payload inválido' }, { status: 400 });
  }

  const firmaValida = await verificarFirma(body);
  if (!firmaValida) {
    console.warn('[WOMPI WEBHOOK] Firma inválida rechazada');
    return Response.json({ error: 'Firma inválida' }, { status: 401 });
  }

  if (body.event !== 'transaction.updated') {
    return Response.json({ ok: true, ignorado: true });
  }

  const tx = body.data?.transaction;
  if (!tx?.reference) {
    return Response.json({ error: 'Transacción sin referencia' }, { status: 400 });
  }

  try {
    if (tx.reference.startsWith('SUBS-')) {
      await procesarPagoSuscripcion(tx);
    } else if (tx.reference.startsWith('CITA-')) {
      await procesarPagoCita(tx);
    } else {
      console.warn('[WOMPI WEBHOOK] Referencia desconocida:', tx.reference);
    }

    return Response.json({ ok: true });
  } catch (error) {
    capturarErrorApi(error, { ruta: '/api/webhooks/wompi', metodo: 'POST' });
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}

// ── Suscripción: SUBS-{userId}-{plan}-{timestamp} ──────────────
async function procesarPagoSuscripcion(tx: WompiTransaction) {
  // Evitar procesar duplicados
  const pagoExiste = await db.pago.findUnique({
    where: { idTransaccionPasarela: tx.id },
    select: { id: true },
  });
  if (pagoExiste) return;

  const pago = await db.pago.findUnique({
    where: { referencia: tx.reference },
    select: { id: true, suscripcionId: true },
  });

  const estadoPago = tx.status === 'APPROVED' ? 'APROBADO'
    : tx.status === 'DECLINED' ? 'RECHAZADO'
    : tx.status === 'VOIDED'   ? 'RECHAZADO'
    : 'PENDIENTE';

  await db.pago.update({
    where: { referencia: tx.reference },
    data: {
      estado: estadoPago as 'APROBADO' | 'RECHAZADO' | 'PENDIENTE',
      idTransaccionPasarela: tx.id,
      estadoPasarela: tx.status,
    },
  });

  if (tx.status !== 'APPROVED') return;

  // Parsear referencia: SUBS-{userId}-{plan}-{timestamp}
  const partes = tx.reference.split('-');
  if (partes.length < 4) return;
  const userId = partes[1];
  const plan   = partes[2] as 'PLUS' | 'FAMILIA' | 'EMPRESARIAL';

  if (!['PLUS', 'FAMILIA', 'EMPRESARIAL'].includes(plan)) return;

  const ahora = new Date();
  const vence = new Date(ahora);
  vence.setMonth(vence.getMonth() + 1);

  // Crear o actualizar suscripción
  let suscripcionId = pago?.suscripcionId;
  if (!suscripcionId) {
    const suscripcion = await db.suscripcion.create({
      data: {
        usuarioId: userId,
        plan,
        estado: 'ACTIVA',
        montoCOP: tx.amount_in_cents / 100,
        fechaInicio: ahora,
        fechaVencimiento: vence,
        referenciaPago: tx.reference,
        idTransaccion: tx.id,
        metodoPago: 'WOMPI',
      },
    });
    suscripcionId = suscripcion.id;

    if (pago) {
      await db.pago.update({
        where: { referencia: tx.reference },
        data: { suscripcionId },
      });
    }
  }

  // Activar plan en usuario
  await db.usuario.update({
    where: { id: userId },
    data: {
      planActual: plan,
      suscripcionVence: vence,
    },
  });

  // Email de confirmación
  const usuario = await db.usuario.findUnique({
    where: { id: userId },
    select: { email: true, nombre: true },
  });

  if (usuario?.email) {
    const precioFmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(tx.amount_in_cents / 100);
    const venceFmt  = vence.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

    await enviarEmail({
      to: usuario.email,
      subject: `✅ Plan ${plan} activado — MenteBridge`,
      text: `Hola ${usuario.nombre},\n\nTu plan ${plan} ha sido activado. Próxima renovación: ${venceFmt}.\n\nEquipo MenteBridge`,
      html: `<div style="font-family:sans-serif;max-width:520px;margin:auto">
        <h2 style="color:#0d9488">✅ Plan ${plan} activado</h2>
        <p>Hola <strong>${usuario.nombre}</strong>,</p>
        <p>Tu pago fue procesado exitosamente. Ya puedes disfrutar de todas las funciones de tu plan.</p>
        <div style="background:#f0fdf4;border-left:4px solid #0d9488;padding:14px 18px;border-radius:6px;margin:16px 0">
          <p style="margin:0;font-weight:bold">Plan: ${plan}</p>
          <p style="margin:6px 0 0">Monto: ${precioFmt}</p>
          <p style="margin:6px 0 0">Válido hasta: ${venceFmt}</p>
        </div>
        <a href="${process.env.APP_URL}/dashboard" style="display:inline-block;background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Ir al dashboard →</a>
      </div>`,
    }).catch(console.error);
  }
}

// ── Cita: CITA-{citaId}-{timestamp} ───────────────────────────
async function procesarPagoCita(tx: WompiTransaction) {
  const pagoExiste = await db.pago.findUnique({
    where: { idTransaccionPasarela: tx.id },
    select: { id: true },
  });
  if (pagoExiste) return;

  // Parsear referencia: CITA-{citaId}-{timestamp}
  const partes = tx.reference.split('-');
  if (partes.length < 3) return;
  const citaId = partes[1];

  const estadoPago = tx.status === 'APPROVED' ? 'APROBADO'
    : tx.status === 'DECLINED' ? 'RECHAZADO'
    : 'PENDIENTE';

  await db.pago.update({
    where: { referencia: tx.reference },
    data: {
      estado: estadoPago as 'APROBADO' | 'RECHAZADO' | 'PENDIENTE',
      idTransaccionPasarela: tx.id,
      estadoPasarela: tx.status,
    },
  });

  if (tx.status !== 'APPROVED') return;

  // Confirmar cita
  const cita = await db.cita.update({
    where: { id: citaId },
    data: {
      estadoPago: 'APROBADO',
      estado: 'CONFIRMADA',
    },
    include: {
      usuario: { select: { email: true, nombre: true, apellido: true } },
      psicologo: { select: { nombreCompleto: true, usuarioId: true } },
    },
  });

  const TZ = 'America/Bogota';
  const fechaFmt = cita.fechaHora.toLocaleString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit', timeZone: TZ,
  });

  // Email al paciente
  if (cita.usuario?.email) {
    await enviarEmail({
      to: cita.usuario.email,
      subject: '✅ Cita confirmada — MenteBridge',
      text: `Tu cita con ${cita.psicologo.nombreCompleto} el ${fechaFmt} está confirmada.`,
      html: `<div style="font-family:sans-serif;max-width:520px;margin:auto">
        <h2 style="color:#0d9488">✅ Cita confirmada</h2>
        <p>Hola <strong>${cita.usuario.nombre}</strong>,</p>
        <p>Tu pago fue procesado. Tu cita está confirmada:</p>
        <div style="background:#f0fdf4;border-left:4px solid #0d9488;padding:14px 18px;border-radius:6px;margin:16px 0">
          <p style="margin:0;font-weight:bold;color:#0d9488">${fechaFmt}</p>
          <p style="margin:6px 0 0">Con: ${cita.psicologo.nombreCompleto}</p>
          <p style="margin:6px 0 0">Duración: ${cita.duracionMinutos} minutos · Videollamada</p>
        </div>
        <a href="${process.env.APP_URL}/dashboard/citas" style="display:inline-block;background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Ver mis citas →</a>
      </div>`,
    }).catch(console.error);
  }

  // Email al psicólogo
  const psicologoUser = await db.usuario.findUnique({
    where: { id: cita.psicologo.usuarioId },
    select: { email: true },
  });
  if (psicologoUser?.email) {
    await enviarEmail({
      to: psicologoUser.email,
      subject: '✅ Cita pagada y confirmada — MenteBridge',
      text: `La cita con ${cita.usuario?.nombre} el ${fechaFmt} está confirmada y pagada.`,
      html: `<div style="font-family:sans-serif;max-width:520px;margin:auto">
        <h2 style="color:#0d9488">✅ Cita confirmada y pagada</h2>
        <p>Hola <strong>${cita.psicologo.nombreCompleto}</strong>,</p>
        <div style="background:#f0fdf4;border-left:4px solid #0d9488;padding:14px 18px;border-radius:6px;margin:16px 0">
          <p style="margin:0;font-weight:bold">${cita.usuario?.nombre} ${cita.usuario?.apellido ?? ''}</p>
          <p style="margin:6px 0 0;font-size:16px;font-weight:bold;color:#0d9488">${fechaFmt}</p>
        </div>
        <a href="${process.env.APP_URL}/dashboard/psicologo" style="display:inline-block;background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Ver en mi panel →</a>
      </div>`,
    }).catch(console.error);
  }
}
