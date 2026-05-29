import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { enviarEmail } from '@/lib/email/confirmaciones';

const TZ = 'America/Bogota';
const fmtCita = (fecha: Date) =>
  fecha.toLocaleString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit', timeZone: TZ,
  });

// ── Helpers de email ──────────────────────────────────────────

function emailRecordatorio24h(params: {
  to: string; nombrePaciente: string; nombrePsicologo: string;
  fechaFmt: string; citaId: string; appUrl: string;
}) {
  return enviarEmail({
    to: params.to,
    subject: '📅 Recordatorio: tu cita es mañana — MindBridge',
    text: `Hola ${params.nombrePaciente},\n\nRecuerda que mañana tienes una cita con ${params.nombrePsicologo} a las ${params.fechaFmt}.\n\nUna hora antes recibirás otro recordatorio con el enlace directo.\n\nEquipo MindBridge`,
    html: `<div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#0d9488">📅 Tu cita es mañana</h2>
      <p>Hola <strong>${params.nombrePaciente}</strong>,</p>
      <p>Este es un recordatorio de tu cita programada:</p>
      <div style="background:#f0fdf4;border-left:4px solid #0d9488;padding:14px 18px;border-radius:6px;margin:16px 0">
        <p style="margin:0;font-weight:bold;color:#111">${params.nombrePsicologo}</p>
        <p style="margin:6px 0 0;font-size:16px;font-weight:bold;color:#0d9488">${params.fechaFmt}</p>
        <p style="margin:6px 0 0;color:#555">Duración: 45 minutos · Videollamada</p>
      </div>
      <p style="color:#555;font-size:14px">Recibirás otro aviso 1 hora antes con el enlace directo a la sesión.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
      <p style="color:#aaa;font-size:12px">MindBridge Colombia · Apoyo emocional profesional</p>
    </div>`,
  });
}

function emailRecordatorio1h(params: {
  to: string; nombrePaciente: string; nombrePsicologo: string;
  fechaFmt: string; citaId: string; appUrl: string;
}) {
  const enlace = `${params.appUrl}/dashboard/citas/${params.citaId}/videollamada`;
  return enviarEmail({
    to: params.to,
    subject: '🔔 Tu sesión comienza en 1 hora — MindBridge',
    text: `Hola ${params.nombrePaciente},\n\nTu sesión con ${params.nombrePsicologo} comienza en 1 hora (${params.fechaFmt}).\n\nEntra aquí cuando estés listo: ${enlace}\n\nEquipo MindBridge`,
    html: `<div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#0d9488">🔔 Tu sesión comienza en 1 hora</h2>
      <p>Hola <strong>${params.nombrePaciente}</strong>,</p>
      <div style="background:#f0fdf4;border-left:4px solid #0d9488;padding:14px 18px;border-radius:6px;margin:16px 0">
        <p style="margin:0;font-weight:bold;color:#111">${params.nombrePsicologo}</p>
        <p style="margin:6px 0 0;font-size:16px;font-weight:bold;color:#0d9488">${params.fechaFmt}</p>
      </div>
      <p style="color:#555;font-size:14px">Asegúrate de tener tu cámara y micrófono listos.</p>
      <a href="${enlace}" style="display:inline-block;background:#0d9488;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;margin-top:4px">
        Entrar a la sesión →
      </a>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
      <p style="color:#aaa;font-size:12px">MindBridge Colombia · Línea de crisis: 106</p>
    </div>`,
  });
}

function emailRecordatorio1hPsicologo(params: {
  to: string; nombrePsicologo: string; nombrePaciente: string;
  fechaFmt: string; citaId: string; appUrl: string;
}) {
  const enlace = `${params.appUrl}/dashboard/citas/${params.citaId}/videollamada`;
  return enviarEmail({
    to: params.to,
    subject: '🔔 Tu sesión comienza en 1 hora — MindBridge',
    text: `Hola ${params.nombrePsicologo},\n\nTu sesión con ${params.nombrePaciente} comienza en 1 hora (${params.fechaFmt}).\n\nEntra aquí: ${enlace}\n\nEquipo MindBridge`,
    html: `<div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#0d9488">🔔 Tu sesión comienza en 1 hora</h2>
      <p>Hola <strong>${params.nombrePsicologo}</strong>,</p>
      <div style="background:#f0fdf4;border-left:4px solid #0d9488;padding:14px 18px;border-radius:6px;margin:16px 0">
        <p style="margin:0;font-weight:bold;color:#111">Paciente: ${params.nombrePaciente}</p>
        <p style="margin:6px 0 0;font-size:16px;font-weight:bold;color:#0d9488">${params.fechaFmt}</p>
      </div>
      <a href="${enlace}" style="display:inline-block;background:#0d9488;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;margin-top:4px">
        Iniciar sesión →
      </a>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
      <p style="color:#aaa;font-size:12px">MindBridge Colombia</p>
    </div>`,
  });
}

// ── Cron: recordatorios 24h ───────────────────────────────────

async function recordatorios24h(appUrl: string) {
  const ahora = new Date();
  const desde = new Date(ahora.getTime() + 23 * 60 * 60 * 1000);
  const hasta  = new Date(ahora.getTime() + 25 * 60 * 60 * 1000);

  const citas = await db.cita.findMany({
    where: { estado: 'CONFIRMADA', fechaHora: { gte: desde, lte: hasta } },
    include: {
      usuario:   { select: { nombre: true, apellido: true, email: true } },
      psicologo: { select: { nombreCompleto: true,
                             usuario: { select: { email: true } } } },
    },
  });

  let enviados = 0;
  for (const cita of citas) {
    const fechaFmt = fmtCita(cita.fechaHora);
    const nombrePaciente = [cita.usuario.nombre, cita.usuario.apellido].filter(Boolean).join(' ') || 'Paciente';

    if (cita.usuario.email) {
      await emailRecordatorio24h({
        to: cita.usuario.email, nombrePaciente,
        nombrePsicologo: cita.psicologo.nombreCompleto,
        fechaFmt, citaId: cita.id, appUrl,
      }).catch(console.error);
      enviados++;
    }
  }

  return { job: 'recordatorios-24h', citas: citas.length, enviados };
}

// ── Cron: recordatorios 1h ────────────────────────────────────

async function recordatorios1h(appUrl: string) {
  const ahora = new Date();
  const desde = new Date(ahora.getTime() + 55 * 60 * 1000);
  const hasta  = new Date(ahora.getTime() + 65 * 60 * 1000);

  const citas = await db.cita.findMany({
    where: { estado: 'CONFIRMADA', fechaHora: { gte: desde, lte: hasta } },
    include: {
      usuario:   { select: { nombre: true, apellido: true, email: true } },
      psicologo: { select: { nombreCompleto: true,
                             usuario: { select: { email: true } } } },
    },
  });

  let enviados = 0;
  for (const cita of citas) {
    const fechaFmt = fmtCita(cita.fechaHora);
    const nombrePaciente = [cita.usuario.nombre, cita.usuario.apellido].filter(Boolean).join(' ') || 'Paciente';

    // Email al paciente
    if (cita.usuario.email) {
      await emailRecordatorio1h({
        to: cita.usuario.email, nombrePaciente,
        nombrePsicologo: cita.psicologo.nombreCompleto,
        fechaFmt, citaId: cita.id, appUrl,
      }).catch(console.error);
      enviados++;
    }

    // Email al psicólogo
    if (cita.psicologo.usuario?.email) {
      await emailRecordatorio1hPsicologo({
        to: cita.psicologo.usuario.email,
        nombrePsicologo: cita.psicologo.nombreCompleto,
        nombrePaciente, fechaFmt, citaId: cita.id, appUrl,
      }).catch(console.error);
      enviados++;
    }
  }

  return { job: 'recordatorios-1h', citas: citas.length, enviados };
}

// ── POST: envío manual (solo ADMIN) ──────────────────────────

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 });
  if (!['ADMIN', 'SUPERADMIN'].includes(session.user.rol)) {
    return Response.json({ error: 'Acceso denegado' }, { status: 403 });
  }

  try {
    const { job } = await req.json();
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';

    if (job === 'citas-24h') return Response.json(await recordatorios24h(appUrl));
    if (job === 'citas-1h')  return Response.json(await recordatorios1h(appUrl));

    return Response.json({ error: 'Job inválido' }, { status: 400 });
  } catch (error) {
    console.error('[NOTIFICACIONES POST ERROR]', error);
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}

// ── GET: cron jobs de Vercel ──────────────────────────────────

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
  const { searchParams } = new URL(req.url);
  const job = searchParams.get('job');

  try {
    if (job === 'citas-24h') return Response.json(await recordatorios24h(appUrl));
    if (job === 'citas-1h')  return Response.json(await recordatorios1h(appUrl));

    if (job === 'recordatorio-animo') {
      console.log('[CRON] recordatorio-animo — pendiente de implementar');
      return Response.json({ job, mensaje: 'pendiente' });
    }
    if (job === 'inactividad-ia') {
      console.log('[CRON] inactividad-ia — pendiente de implementar');
      return Response.json({ job, mensaje: 'pendiente' });
    }

    return Response.json({ error: 'Job inválido' }, { status: 400 });
  } catch (error) {
    console.error(`[CRON ${job} ERROR]`, error);
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}
