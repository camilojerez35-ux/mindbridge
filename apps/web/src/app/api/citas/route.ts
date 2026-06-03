/**
 * MindBridge — API Route: Citas con Psicólogos
 * GET  /api/citas  → listar citas del usuario
 * POST /api/citas  → crear cita pendiente y devolver datos para widget Wompi
 */

import { NextRequest } from 'next/server';
import { createHash } from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { z } from 'zod';
import { enviarEmail, escapeHtml } from '@/lib/email/confirmaciones';

const TZ = 'America/Bogota';
const fmtCita = (iso: string) =>
  new Date(iso).toLocaleString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit', timeZone: TZ,
  });

const AgendarCitaSchema = z.object({
  psicologoId: z.string().cuid(),
  fechaHora:   z.string().datetime(),
  metodoPago:  z.enum(['PSE', 'TARJETA', 'NEQUI', 'DAVIPLATA']),
});

// GET — Listar citas del usuario autenticado
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const estadoParam = searchParams.get('estado');
  const limite  = Math.min(parseInt(searchParams.get('limite') || '10'), 50);
  const pagina  = parseInt(searchParams.get('pagina') || '1');

  const EstadoCitaSchema = z.enum([
    'PENDIENTE', 'CONFIRMADA', 'EN_CURSO', 'COMPLETADA',
    'CANCELADA_USUARIO', 'CANCELADA_PSICOLOGO', 'NO_SHOW',
  ]).optional();
  const estadoParsed = EstadoCitaSchema.safeParse(estadoParam ?? undefined);
  if (!estadoParsed.success) {
    return Response.json({ error: 'Estado inválido' }, { status: 400 });
  }
  const estado = estadoParsed.data;

  try {
    const where: Record<string, unknown> = { usuarioId: session.user.id };
    if (estado) where.estado = estado;

    const [citas, total] = await Promise.all([
      db.cita.findMany({
        where,
        include: {
          psicologo: {
            select: { nombreCompleto: true, especialidades: true, fotoUrl: true, calificacionPromedio: true },
          },
          pago:   { select: { metodoPago: true } },
          resena: { select: { id: true, calificacion: true, comentario: true } },
        },
        orderBy: { fechaHora: 'desc' },
        take: limite,
        skip: (pagina - 1) * limite,
      }),
      db.cita.count({ where }),
    ]);

    return Response.json({
      citas,
      paginacion: { total, pagina, limite, totalPaginas: Math.ceil(total / limite) },
    });
  } catch (error) {
    console.error('[CITAS GET ERROR]', error);
    return Response.json({ error: 'Error al obtener citas' }, { status: 500 });
  }
}

// POST — Crear cita pendiente + devolver parámetros del widget Wompi
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  const usuarioId = session.user.id;

  try {
    const body = await req.json().catch(() => null);
    if (!body) return Response.json({ error: 'Body inválido' }, { status: 400 });

    const parsed = AgendarCitaSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.errors[0]?.message ?? 'Datos inválidos' },
        { status: 400 },
      );
    }

    const { psicologoId, fechaHora, metodoPago } = parsed.data;
    const fechaCita = new Date(fechaHora);

    if (fechaCita <= new Date()) {
      return Response.json({ error: 'La fecha de la cita debe ser en el futuro' }, { status: 400 });
    }

    // Verificar psicólogo activo
    const psicologo = await db.psicologo.findFirst({
      where: { id: psicologoId, activo: true, estado: { in: ['ACTIVO', 'VERIFICADO'] } },
      select: { id: true, nombreCompleto: true, tarifaCOP: true, usuarioId: true },
    });
    if (!psicologo) {
      return Response.json({ error: 'Psicólogo no disponible' }, { status: 404 });
    }

    // Verificar disponibilidad (prevenir double-booking)
    const citaExistente = await db.cita.findFirst({
      where: {
        psicologoId,
        fechaHora: {
          gte: new Date(fechaCita.getTime() - 30 * 60 * 1000),
          lte: new Date(fechaCita.getTime() + 75 * 60 * 1000),
        },
        estado: { notIn: ['CANCELADA_USUARIO', 'CANCELADA_PSICOLOGO'] },
      },
      select: { id: true },
    });
    if (citaExistente) {
      return Response.json({ error: 'El psicólogo no está disponible en ese horario' }, { status: 409 });
    }

    const comisionPct = parseInt(process.env.COMISION_CITAS_PORCENTAJE || '20');
    const montoCOP = psicologo.tarifaCOP;
    const comisionCOP = Math.round(montoCOP * comisionPct / 100);
    const montoPsicologoCOP = montoCOP - comisionCOP;

    // Crear cita primero para obtener el id y construir la referencia con él
    const cita = await db.cita.create({
      data: {
        usuarioId,
        psicologoId,
        fechaHora: fechaCita,
        duracionMinutos: 45,
        estado: 'PENDIENTE',
        tipo: 'PRIMERA_CONSULTA',
        modalidad: 'VIDEOLLAMADA',
        montoCOP,
        comisionCOP,
        montoPsicologoCOP,
        estadoPago: 'PENDIENTE',
      },
    });

    // Referencia incluye citaId para correlación exacta en el webhook
    const referencia = `CITA-${cita.id}-${Date.now()}`;

    // Enviar notificaciones por email (async, no bloquea la respuesta)
    const usuario = await db.usuario.findUnique({
      where: { id: usuarioId },
      select: { nombre: true, apellido: true, email: true },
    });
    const psicologoUsuario = await db.usuario.findUnique({
      where: { id: psicologo.usuarioId },
      select: { email: true },
    });
    const fechaFmt = fmtCita(fechaCita.toISOString());
    const nombrePaciente = escapeHtml([usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ') || 'Paciente');
    const nombrePsicologo = escapeHtml(psicologo.nombreCompleto);

    // Email al paciente
    enviarEmail({
      to: usuario?.email ?? session.user.email ?? '',
      subject: '📅 Cita agendada — MindBridge',
      text: `Hola ${nombrePaciente},\n\nTu cita con ${nombrePsicologo} ha sido agendada para el ${fechaFmt}.\n\nEsta pendiente de confirmación por el psicólogo. Te avisaremos cuando sea confirmada.\n\nEquipo MindBridge`,
      html: `<div style="font-family:sans-serif;max-width:520px;margin:auto">
        <h2 style="color:#0d9488">📅 Cita agendada</h2>
        <p>Hola <strong>${nombrePaciente}</strong>,</p>
        <p>Tu cita con <strong>${nombrePsicologo}</strong> ha sido agendada:</p>
        <div style="background:#f0fdf4;border-left:4px solid #0d9488;padding:14px 18px;border-radius:6px;margin:16px 0">
          <p style="margin:0;font-size:16px;font-weight:bold;color:#0d9488">${fechaFmt}</p>
          <p style="margin:6px 0 0;color:#555">Duración: 45 minutos · Videollamada</p>
        </div>
        <p style="color:#888;font-size:13px">⏳ Pendiente de confirmación por el psicólogo.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
        <p style="color:#aaa;font-size:12px">MindBridge Colombia · Apoyo emocional profesional</p>
      </div>`,
    }).catch(console.error);

    // Email al psicólogo
    if (psicologoUsuario?.email) {
      enviarEmail({
        to: psicologoUsuario.email,
        subject: '🔔 Nueva cita pendiente — MindBridge',
        text: `Hola ${nombrePsicologo},\n\nTienes una nueva cita con ${nombrePaciente} el ${fechaFmt}.\n\nIngresa a tu panel para confirmarla: ${process.env.APP_URL ?? 'http://localhost:3000'}/dashboard/psicologo\n\nEquipo MindBridge`,
        html: `<div style="font-family:sans-serif;max-width:520px;margin:auto">
          <h2 style="color:#0d9488">🔔 Nueva cita pendiente</h2>
          <p>Hola <strong>${nombrePsicologo}</strong>,</p>
          <p>Tienes una nueva solicitud de cita:</p>
          <div style="background:#f0fdf4;border-left:4px solid #0d9488;padding:14px 18px;border-radius:6px;margin:16px 0">
            <p style="margin:0;font-weight:bold;color:#111">${nombrePaciente}</p>
            <p style="margin:6px 0 0;font-size:16px;font-weight:bold;color:#0d9488">${fechaFmt}</p>
          </div>
          <a href="${process.env.APP_URL ?? 'http://localhost:3000'}/dashboard/psicologo" style="display:inline-block;background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">Ver en mi panel →</a>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
          <p style="color:#aaa;font-size:12px">MindBridge Colombia</p>
        </div>`,
      }).catch(console.error);
    }

    // Construir datos para el widget Wompi
    const publicKey      = process.env.WOMPI_PUBLIC_KEY    ?? '';
    // WOMPI_INTEGRITY_KEY firma el widget; WOMPI_EVENTS_SECRET valida webhooks — son claves distintas
    const integrityKey   = process.env.WOMPI_INTEGRITY_KEY ?? '';
    const amountInCents  = montoCOP * 100;
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
    const redirectUrl = `${appUrl}/dashboard/citas?pago=exitoso&citaId=${cita.id}`;

    // Firma de integridad SHA256: concatenar reference + amount + currency + integrity_key
    let integritySignature = '';
    if (integrityKey) {
      const data = `${referencia}${amountInCents}COP${integrityKey}`;
      integritySignature = createHash('sha256').update(data).digest('hex');
    }

    return Response.json({
      citaId:     cita.id,
      referencia,
      psicologo:  psicologo.nombreCompleto,
      montoCOP,
      datosWidget: {
        publicKey,
        currency:          'COP',
        amountInCents,
        reference:         referencia,
        integritySignature,
        redirectUrl,
        customerData: {
          email:    usuario?.email    ?? session.user.email ?? '',
          fullName: `${usuario?.nombre ?? ''} ${usuario?.apellido ?? ''}`.trim() || session.user.name || '',
        },
      },
    }, { status: 201 });

  } catch (error) {
    console.error('[CITAS POST ERROR]', error);
    return Response.json({ error: 'Error al agendar la cita' }, { status: 500 });
  }
}
