/**
 * PATCH /api/psicologo/citas/[id]
 * El psicólogo confirma o cancela una cita propia.
 * Body: { accion: 'CONFIRMAR' | 'CANCELAR' }
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { z } from 'zod';
import { enviarEmail } from '@/lib/email/confirmaciones';

const TZ = 'America/Bogota';
const fmtCita = (iso: string) =>
  new Date(iso).toLocaleString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit', timeZone: TZ,
  });

const Schema = z.object({
  accion: z.enum(['CONFIRMAR', 'CANCELAR']),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (session.user.rol !== 'PSICOLOGO') {
    return Response.json({ error: 'Acceso restringido a psicólogos' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Acción inválida. Usa CONFIRMAR o CANCELAR.' }, { status: 400 });
  }

  const psicologo = await db.psicologo.findUnique({
    where: { usuarioId: session.user.id },
    select: { id: true },
  });
  if (!psicologo) {
    return Response.json({ error: 'Perfil de psicólogo no encontrado' }, { status: 404 });
  }

  const cita = await db.cita.findUnique({
    where: { id: params.id },
    select: { id: true, psicologoId: true, estado: true, fechaHora: true,
              usuario: { select: { nombre: true, apellido: true, email: true } } },
  });

  if (!cita) {
    return Response.json({ error: 'Cita no encontrada' }, { status: 404 });
  }
  if (cita.psicologoId !== psicologo.id) {
    return Response.json({ error: 'Esta cita no pertenece a tu perfil' }, { status: 403 });
  }
  if (cita.estado !== 'PENDIENTE') {
    return Response.json({ error: `No se puede modificar una cita en estado ${cita.estado}` }, { status: 409 });
  }

  const nuevoEstado = parsed.data.accion === 'CONFIRMAR' ? 'CONFIRMADA' : 'CANCELADA_PSICOLOGO';

  const psicologoPerfil = await db.psicologo.findUnique({
    where: { id: psicologo.id },
    select: { nombreCompleto: true },
  });

  const citaActualizada = await db.cita.update({
    where: { id: params.id },
    data: { estado: nuevoEstado },
    select: { id: true, estado: true, fechaHora: true },
  });

  // Notificar al paciente por email (async)
  if (cita.usuario.email) {
    const nombrePaciente = [cita.usuario.nombre, cita.usuario.apellido].filter(Boolean).join(' ') || 'Paciente';
    const fechaFmt = fmtCita(cita.fechaHora.toISOString());
    const psNombre = psicologoPerfil?.nombreCompleto ?? 'tu psicólogo';
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';

    if (parsed.data.accion === 'CONFIRMAR') {
      enviarEmail({
        to: cita.usuario.email,
        subject: '✅ Cita confirmada — MenteBridge',
        text: `Hola ${nombrePaciente},\n\nTu cita con ${psNombre} ha sido CONFIRMADA para el ${fechaFmt}.\n\nVer mis citas: ${appUrl}/dashboard/citas\n\nEquipo MenteBridge`,
        html: `<div style="font-family:sans-serif;max-width:520px;margin:auto">
          <h2 style="color:#0d9488">✅ Cita confirmada</h2>
          <p>Hola <strong>${nombrePaciente}</strong>,</p>
          <p>Tu cita con <strong>${psNombre}</strong> ha sido <strong style="color:#0d9488">confirmada</strong>:</p>
          <div style="background:#f0fdf4;border-left:4px solid #0d9488;padding:14px 18px;border-radius:6px;margin:16px 0">
            <p style="margin:0;font-size:16px;font-weight:bold;color:#0d9488">${fechaFmt}</p>
            <p style="margin:6px 0 0;color:#555">Duración: 45 minutos · Videollamada</p>
          </div>
          <a href="${appUrl}/dashboard/citas" style="display:inline-block;background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Ver mis citas →</a>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
          <p style="color:#aaa;font-size:12px">MenteBridge Colombia</p>
        </div>`,
      }).catch(console.error);
    } else {
      enviarEmail({
        to: cita.usuario.email,
        subject: '❌ Cita cancelada — MenteBridge',
        text: `Hola ${nombrePaciente},\n\nLamentamos informarte que tu cita del ${fechaFmt} con ${psNombre} ha sido cancelada por el profesional.\n\nPuedes agendar una nueva cita en: ${appUrl}/dashboard/citas\n\nEquipo MenteBridge`,
        html: `<div style="font-family:sans-serif;max-width:520px;margin:auto">
          <h2 style="color:#dc2626">❌ Cita cancelada</h2>
          <p>Hola <strong>${nombrePaciente}</strong>,</p>
          <p>Tu cita del <strong>${fechaFmt}</strong> con <strong>${psNombre}</strong> ha sido cancelada por el profesional.</p>
          <a href="${appUrl}/dashboard/citas" style="display:inline-block;background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">Agendar nueva cita →</a>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
          <p style="color:#aaa;font-size:12px">MenteBridge Colombia</p>
        </div>`,
      }).catch(console.error);
    }
  }

  return Response.json({ cita: citaActualizada, mensaje: parsed.data.accion === 'CONFIRMAR' ? 'Cita confirmada' : 'Cita cancelada' });
}
