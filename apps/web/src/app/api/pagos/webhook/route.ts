import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { verificarWebhook } from '@/app/api/pagos/wompi';
import { enviarConfirmacionSuscripcion } from '@/lib/email/confirmaciones';
import { capturarErrorApi } from '@/lib/monitoring/sentry';

const PRECIOS_PLAN: Record<string, number> = {
  PLUS: 25000,
  FAMILIA: 45000,
};

// Wompi envía el payload como texto plano para verificar la firma
export async function POST(req: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return Response.json({ error: 'Payload inválido' }, { status: 400 });
  }

  // ── Verificar firma HMAC del webhook ──────────────────────────
  const firma = req.headers.get('x-event-checksum') ?? '';
  const firmaValida = await verificarWebhook(rawBody, firma).catch(() => false);
  if (!firmaValida) {
    console.warn('[WEBHOOK] Firma inválida — posible petición no autorizada');
    return Response.json({ error: 'Firma inválida' }, { status: 401 });
  }

  let evento: any;
  try {
    evento = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const tipo = evento?.event;
  if (tipo !== 'transaction.updated') {
    // Eventos que no procesamos — responder 200 para que Wompi no reintente
    return Response.json({ ok: true, ignorado: true });
  }

  const txn = evento?.data?.transaction;
  if (!txn?.reference || !txn?.id) {
    return Response.json({ error: 'Datos de transacción incompletos' }, { status: 400 });
  }

  // Solo procesar transacciones aprobadas
  if (txn.status !== 'APPROVED') {
    return Response.json({ ok: true, estado: txn.status });
  }

  try {
    await procesarTransaccionAprobada(txn);
    return Response.json({ ok: true });
  } catch (error: any) {
    // P2002 = violación unique constraint → ya procesado (idempotente)
    if (error?.code === 'P2002') {
      console.log(`[WEBHOOK] Transacción ya procesada (idempotente): ${txn.id}`);
      return Response.json({ ok: true, idempotente: true });
    }

    capturarErrorApi(error, {
      ruta: '/api/pagos/webhook',
      metodo: 'POST',
      statusCode: 500,
    });
    console.error('[WEBHOOK ERROR]', error);
    // Retornar 500 para que Wompi reintente el webhook
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}

async function procesarTransaccionAprobada(txn: any) {
  const referencia: string = txn.reference;
  const idTransaccion: string = txn.id;
  const montoCOP: number = Math.round((txn.amount_in_cents ?? 0) / 100);
  const metodoPago: string = txn.payment_method_type ?? 'DESCONOCIDO';

  // Determinar tipo de referencia: suscripción o cita
  const esSuscripcion = referencia.startsWith('SUBS-');
  const esCita = referencia.startsWith('CITA-');

  await db.$transaction(async (tx) => {
    // ── Idempotencia atómica ──────────────────────────────────────
    // Usar upsert con constraint único en referencia.
    // Si la referencia ya existe, la UPDATE no cambia nada (idempotente).
    // Si no existe, la crea (INSERT). El constraint unique en `referencia`
    // garantiza que dos webhooks concurrentes no dupliquen el registro.
    const pago = await tx.pago.upsert({
      where: { referencia },
      update: {}, // No modificar si ya existe — solo leer el id
      create: {
        referencia,
        idTransaccionPasarela: idTransaccion,
        montoCOP,
        metodoPago,
        pasarela: 'WOMPI',
        estadoPasarela: 'APROBADO',
        respuestaPasarela: txn,
        estado: 'APROBADO',
        fechaPago: new Date(),
      },
    });

    // Si el pago ya existía con estado APROBADO, salir sin reprocessar
    if (pago.estado === 'APROBADO' && pago.idTransaccionPasarela !== null && pago.idTransaccionPasarela !== idTransaccion) {
      return; // Ya procesado por otra instancia
    }

    if (esSuscripcion) {
      await procesarSuscripcion(tx, referencia, pago.id, montoCOP, metodoPago, idTransaccion);
    } else if (esCita) {
      await procesarCita(tx, referencia, pago.id);
    }
  });
}

async function procesarSuscripcion(
  tx: any,
  referencia: string,
  pagoId: string,
  montoCOP: number,
  metodoPago: string,
  idTransaccion: string,
) {
  // Extraer datos de la referencia: SUBS-{usuarioId}-{plan}-{timestamp}
  const partes = referencia.split('-');
  if (partes.length < 3) throw new Error(`Referencia de suscripción inválida: ${referencia}`);

  const usuarioId = partes[1];
  const plan = partes[2] as 'PLUS' | 'FAMILIA' | 'EMPRESARIAL';

  const planesValidos = ['PLUS', 'FAMILIA', 'EMPRESARIAL'];
  if (!planesValidos.includes(plan)) throw new Error(`Plan desconocido: ${plan}`);

  const precioEsperado = PRECIOS_PLAN[plan];
  if (precioEsperado && montoCOP !== precioEsperado) {
    throw new Error(`Monto no coincide con el plan ${plan}: recibido ${montoCOP}, esperado ${precioEsperado}`);
  }

  const fechaVencimiento = new Date();
  fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);

  // Crear suscripción vinculada al pago
  await tx.suscripcion.create({
    data: {
      usuarioId,
      plan,
      estado: 'ACTIVA',
      montoCOP,
      fechaVencimiento,
      referenciaPago: referencia,
      idTransaccion,
      metodoPago,
    },
  });

  // Actualizar plan del usuario
  await tx.usuario.update({
    where: { id: usuarioId },
    data: {
      planActual: plan,
      suscripcionVence: fechaVencimiento,
    },
  });

  // Obtener datos del usuario para el email (fuera del tx mínimo necesario)
  const usuario = await tx.usuario.findUnique({
    where: { id: usuarioId },
    select: { email: true, nombre: true },
  });

  if (usuario?.email) {
    // Email enviado fuera del try de la transacción para no revertir el pago si falla el email
    // Se lanza como promesa independiente con logging
    enviarConfirmacionSuscripcion({
      email: usuario.email,
      nombre: usuario.nombre ?? 'Usuario',
      plan,
      montoCOP,
      fechaVencimiento,
      idTransaccion,
    }).catch((err) => {
      console.error('[WEBHOOK] Error enviando email de confirmación:', err);
    });
  }

  console.log(`[WEBHOOK] ✅ Suscripción ${plan} activada para usuario ${usuarioId}`);
}

async function procesarCita(tx: any, referencia: string, pagoId: string) {
  // Referencia formato: CITA-{citaId}-{timestamp}
  const citaId = referencia.split('-')[1];
  if (!citaId) throw new Error(`Referencia de cita inválida: ${referencia}`);

  const cita = await tx.cita.findFirst({
    where: { id: citaId, estadoPago: 'PENDIENTE' },
    select: { id: true },
  });

  if (cita) {
    await tx.cita.update({
      where: { id: cita.id },
      data: { estadoPago: 'APROBADO', pagoId },
    });
  } else {
    console.warn(`[WEBHOOK] Cita no encontrada o ya procesada: ${citaId}`);
  }

  console.log(`[WEBHOOK] ✅ Pago de cita confirmado. Referencia: ${referencia}`);
}
