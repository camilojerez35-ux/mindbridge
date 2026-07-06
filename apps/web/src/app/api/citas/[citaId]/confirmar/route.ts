/**
 * PATCH /api/citas/[citaId]/confirmar
 * El psicólogo confirma o rechaza una cita PENDIENTE.
 *
 * Body:
 *   { accion: 'confirmar' | 'rechazar', motivo?: string }
 */

import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth/get-auth-user';
import { db } from '@/lib/db/client';
import { z } from 'zod';
import { enviarEmail } from '@/lib/email/confirmaciones';

const ConfirmarSchema = z.object({
  accion: z.enum(['confirmar', 'rechazar']),
  motivo: z.string().max(300).optional(),
});

const TZ = 'America/Bogota';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { citaId: string } },
) {
  const user = await getAuthUser(req);
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = ConfirmarSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  const { accion, motivo } = parsed.data;

  const cita = await db.cita.findUnique({
    where: { id: params.citaId },
    include: {
      psicologo: { select: { usuarioId: true, nombreCompleto: true } },
      usuario:   { select: { email: true, nombre: true, apellido: true } },
    },
  });

  if (!cita) return Response.json({ error: 'Cita no encontrada' }, { status: 404 });

  // Solo el psicólogo asignado puede confirmar/rechazar
  if (cita.psicologo.usuarioId !== user.id) {
    return Response.json({ error: 'Solo el psicólogo asignado puede gestionar esta cita' }, { status: 403 });
  }

  if (cita.estado !== 'PENDIENTE') {
    return Response.json(
      { error: `La cita ya está en estado ${cita.estado} y no puede modificarse` },
      { status: 400 },
    );
  }

  const fechaFmt = cita.fechaHora.toLocaleString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit', timeZone: TZ,
  });

  const nombrePaciente = [cita.usuario?.nombre, cita.usuario?.apellido].filter(Boolean).join(' ') || 'Paciente';

  if (accion === 'confirmar') {
    await db.cita.update({
      where: { id: params.citaId },
      data: { estado: 'CONFIRMADA' },
    });

    if (cita.usuario?.email) {
      await enviarEmail({
        to: cita.usuario.email,
        subject: '✅ Tu cita fue confirmada por el psicólogo — MindBridge',
        text: `Hola ${nombrePaciente},\n\n${cita.psicologo.nombreCompleto} ha confirmado tu cita para el ${fechaFmt}.\n\nEquipo MindBridge`,
        html: `<div style="font-family:sans-serif;max-width:520px;margin:auto">
          <h2 style="color:#0d9488">✅ Cita confirmada</h2>
          <p>Hola <strong>${nombrePaciente}</strong>,</p>
          <p><strong>${cita.psicologo.nombreCompleto}</strong> ha confirmado tu cita:</p>
          <div style="background:#f0fdf4;border-left:4px solid #0d9488;padding:14px 18px;border-radius:6px;margin:16px 0">
            <p style="margin:0;font-size:16px;font-weight:bold;color:#0d9488">${fechaFmt}</p>
            <p style="margin:6px 0 0;color:#555">Duración: ${cita.duracionMinutos} minutos · Videollamada</p>
          </div>
          <p style="color:#555;font-size:13px">Podrás entrar a la videollamada desde la sección <strong>Mis Citas</strong> en tu dashboard, 5 minutos antes de la hora.</p>
          <a href="${process.env.APP_URL}/dashboard/citas" style="display:inline-block;background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Ver mis citas →</a>
        </div>`,
      }).catch(console.error);
    }

    return Response.json({ ok: true, estado: 'CONFIRMADA', mensaje: 'Cita confirmada correctamente' });

  } else {
    // rechazar
    await db.cita.update({
      where: { id: params.citaId },
      data: {
        estado: 'CANCELADA_PSICOLOGO',
        estadoPago: cita.estadoPago === 'APROBADO' ? 'REEMBOLSADO' : cita.estadoPago,
      },
    });

    if (cita.usuario?.email) {
      await enviarEmail({
        to: cita.usuario.email,
        subject: '⚠️ Cita no disponible — MindBridge',
        text: `Hola ${nombrePaciente},\n\nLamentablemente ${cita.psicologo.nombreCompleto} no puede atenderte en el horario solicitado.\n\n${motivo ? `Motivo: ${motivo}\n\n` : ''}Por favor agenda una nueva cita con otro psicólogo disponible.\n\nEquipo MindBridge`,
        html: `<div style="font-family:sans-serif;max-width:520px;margin:auto">
          <h2 style="color:#d97706">⚠️ Cita no disponible</h2>
          <p>Hola <strong>${nombrePaciente}</strong>,</p>
          <p>Lamentablemente <strong>${cita.psicologo.nombreCompleto}</strong> no puede atenderte en el horario del ${fechaFmt}.</p>
          ${motivo ? `<div style="background:#fffbeb;border-left:4px solid #d97706;padding:12px 16px;border-radius:6px;margin:16px 0"><p style="margin:0;color:#92400e">${motivo}</p></div>` : ''}
          ${cita.estadoPago === 'APROBADO' ? '<p style="color:#0d9488;font-weight:bold">💰 Tu pago será reembolsado en los próximos 3-5 días hábiles.</p>' : ''}
          <a href="${process.env.APP_URL}/psicologos" style="display:inline-block;background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Buscar otro psicólogo →</a>
        </div>`,
      }).catch(console.error);
    }

    return Response.json({ ok: true, estado: 'CANCELADA_PSICOLOGO', mensaje: 'Cita rechazada. Paciente notificado.' });
  }
}
