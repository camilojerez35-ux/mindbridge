import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { enviarEmail, escapeHtml } from '@/lib/email/confirmaciones';
import { enviarPushUno } from '@/lib/push/expo';

const TZ = 'America/Bogota';
const fmtCita = (fecha: Date) =>
  fecha.toLocaleString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit', timeZone: TZ,
  });

// Colombia no tiene horario de verano — offset fijo UTC-5.
const OFFSET_BOGOTA_MS = 5 * 60 * 60 * 1000;

/** Medianoche de "hoy" en hora de Bogotá, expresada como instante UTC correcto. */
function medianocheBogotaHoy(): Date {
  const bogotaNow = new Date(Date.now() - OFFSET_BOGOTA_MS);
  return new Date(Date.UTC(bogotaNow.getUTCFullYear(), bogotaNow.getUTCMonth(), bogotaNow.getUTCDate()) + OFFSET_BOGOTA_MS);
}

// ── Helpers de email ──────────────────────────────────────────

function emailRecordatorio24h(params: {
  to: string; nombrePaciente: string; nombrePsicologo: string;
  fechaFmt: string; citaId: string; appUrl: string;
}) {
  const p = escapeHtml(params.nombrePaciente);
  const ps = escapeHtml(params.nombrePsicologo);
  return enviarEmail({
    to: params.to,
    subject: '📅 Recordatorio: tu cita es mañana — MenteBridge',
    text: `Hola ${p},\n\nRecuerda que mañana tienes una cita con ${ps} a las ${params.fechaFmt}.\n\nUna hora antes recibirás otro recordatorio con el enlace directo.\n\nEquipo MenteBridge`,
    html: `<div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#0d9488">📅 Tu cita es mañana</h2>
      <p>Hola <strong>${p}</strong>,</p>
      <p>Este es un recordatorio de tu cita programada:</p>
      <div style="background:#f0fdf4;border-left:4px solid #0d9488;padding:14px 18px;border-radius:6px;margin:16px 0">
        <p style="margin:0;font-weight:bold;color:#111">${ps}</p>
        <p style="margin:6px 0 0;font-size:16px;font-weight:bold;color:#0d9488">${params.fechaFmt}</p>
        <p style="margin:6px 0 0;color:#555">Duración: 45 minutos · Videollamada</p>
      </div>
      <p style="color:#555;font-size:14px">Recibirás otro aviso 1 hora antes con el enlace directo a la sesión.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
      <p style="color:#aaa;font-size:12px">MenteBridge Colombia · Apoyo emocional profesional</p>
    </div>`,
  });
}

function emailRecordatorio1h(params: {
  to: string; nombrePaciente: string; nombrePsicologo: string;
  fechaFmt: string; citaId: string; appUrl: string;
}) {
  const p = escapeHtml(params.nombrePaciente);
  const ps = escapeHtml(params.nombrePsicologo);
  const enlace = `${params.appUrl}/dashboard/citas/${params.citaId}/videollamada`;
  return enviarEmail({
    to: params.to,
    subject: '🔔 Tu sesión comienza en 1 hora — MenteBridge',
    text: `Hola ${p},\n\nTu sesión con ${ps} comienza en 1 hora (${params.fechaFmt}).\n\nEntra aquí cuando estés listo: ${enlace}\n\nEquipo MenteBridge`,
    html: `<div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#0d9488">🔔 Tu sesión comienza en 1 hora</h2>
      <p>Hola <strong>${p}</strong>,</p>
      <div style="background:#f0fdf4;border-left:4px solid #0d9488;padding:14px 18px;border-radius:6px;margin:16px 0">
        <p style="margin:0;font-weight:bold;color:#111">${ps}</p>
        <p style="margin:6px 0 0;font-size:16px;font-weight:bold;color:#0d9488">${params.fechaFmt}</p>
      </div>
      <p style="color:#555;font-size:14px">Asegúrate de tener tu cámara y micrófono listos.</p>
      <a href="${enlace}" style="display:inline-block;background:#0d9488;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;margin-top:4px">
        Entrar a la sesión →
      </a>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
      <p style="color:#aaa;font-size:12px">MenteBridge Colombia · Línea de crisis: 106</p>
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
    subject: '🔔 Tu sesión comienza en 1 hora — MenteBridge',
    text: `Hola ${params.nombrePsicologo},\n\nTu sesión con ${params.nombrePaciente} comienza en 1 hora (${params.fechaFmt}).\n\nEntra aquí: ${enlace}\n\nEquipo MenteBridge`,
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
      <p style="color:#aaa;font-size:12px">MenteBridge Colombia</p>
    </div>`,
  });
}

// ── Cron: recordatorios 24h ───────────────────────────────────

async function recordatorios24h(appUrl: string) {
  const ahora = new Date();
  const limite24h = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

  // Cualquier cita confirmada cuya hora caiga dentro de las próximas 24h y aún no
  // haya recibido el recordatorio — no depende de que el cron corra en un instante
  // exacto, así que se auto-recupera sin importar la frecuencia de ejecución.
  const citas = await db.cita.findMany({
    where: {
      estado: 'CONFIRMADA',
      fechaHora: { gt: ahora, lte: limite24h },
      recordatorio24hEnviadoEn: null,
    },
    include: {
      usuario:   { select: { nombre: true, apellido: true, email: true, pushToken: true } },
      psicologo: { select: { nombreCompleto: true,
                             usuario: { select: { email: true, pushToken: true } } } },
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
    if (cita.usuario.pushToken) {
      await enviarPushUno(
        cita.usuario.pushToken,
        '📅 Cita mañana',
        `Tu cita con ${cita.psicologo.nombreCompleto} es mañana a las ${fechaFmt}`,
        { tipo: 'cita', citaId: cita.id },
      ).catch(console.error);
    }

    await db.cita.update({
      where: { id: cita.id },
      data: { recordatorio24hEnviadoEn: new Date() },
    });
  }

  return { job: 'recordatorios-24h', citas: citas.length, enviados };
}

// ── Cron: recordatorios 1h ────────────────────────────────────

async function recordatorios1h(appUrl: string) {
  const ahora = new Date();
  const limite1h = new Date(ahora.getTime() + 60 * 60 * 1000);

  const citas = await db.cita.findMany({
    where: {
      estado: 'CONFIRMADA',
      fechaHora: { gt: ahora, lte: limite1h },
      recordatorio1hEnviadoEn: null,
    },
    include: {
      usuario:   { select: { nombre: true, apellido: true, email: true, pushToken: true } },
      psicologo: { select: { nombreCompleto: true,
                             usuario: { select: { email: true, pushToken: true } } } },
    },
  });

  let enviados = 0;
  for (const cita of citas) {
    const fechaFmt = fmtCita(cita.fechaHora);
    const nombrePaciente = [cita.usuario.nombre, cita.usuario.apellido].filter(Boolean).join(' ') || 'Paciente';

    // Push al paciente
    if (cita.usuario.pushToken) {
      await enviarPushUno(
        cita.usuario.pushToken,
        '🔔 Tu sesión en 1 hora',
        `Con ${cita.psicologo.nombreCompleto} — ${fechaFmt}. ¡Prepara tu cámara!`,
        { tipo: 'videollamada', citaId: cita.id },
      ).catch(console.error);
    }
    // Push al psicólogo
    if (cita.psicologo.usuario?.pushToken) {
      await enviarPushUno(
        cita.psicologo.usuario.pushToken,
        '🔔 Sesión en 1 hora',
        `Con ${nombrePaciente} — ${fechaFmt}`,
        { tipo: 'videollamada', citaId: cita.id },
      ).catch(console.error);
    }

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

    await db.cita.update({
      where: { id: cita.id },
      data: { recordatorio1hEnviadoEn: new Date() },
    });
  }

  return { job: 'recordatorios-1h', citas: citas.length, enviados };
}

// ── Cron: recordatorio de ánimo diario ───────────────────────
// Notifica a usuarios activos que no han registrado su ánimo hoy

async function recordatorioAnimo(appUrl: string) {
  const hoy = medianocheBogotaHoy();
  const manana = new Date(hoy.getTime() + 24 * 60 * 60 * 1000);

  // Usuarios activos que no registraron entrada hoy
  const usuariosSinRegistro = await db.usuario.findMany({
    where: {
      estado: 'ACTIVO',
      email: { not: null },
      entradasDiario: { none: { createdAt: { gte: hoy, lt: manana } } },
    },
    select: { email: true, nombre: true },
    take: 500,
  });

  let enviados = 0;
  for (const u of usuariosSinRegistro) {
    if (!u.email) continue;
    const nombre = escapeHtml(u.nombre ?? 'amigo/a');
    await enviarEmail({
      to: u.email,
      subject: '💚 ¿Cómo te sientes hoy? — MenteBridge',
      text: `Hola ${nombre},\n\nNo olvides registrar tu estado de ánimo hoy. Solo toma un minuto y te ayuda a entender tus patrones emocionales.\n\n${appUrl}/dashboard/diario\n\nEquipo MenteBridge`,
      html: `<div style="font-family:sans-serif;max-width:520px;margin:auto">
        <h2 style="color:#0d9488">💚 ¿Cómo te sientes hoy?</h2>
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Registrar tu estado de ánimo solo toma un minuto y te ayuda a entender tus patrones emocionales.</p>
        <a href="${appUrl}/dashboard/diario" style="display:inline-block;background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">Registrar mi ánimo →</a>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
        <p style="color:#aaa;font-size:12px">MenteBridge Colombia · Puedes desactivar estos recordatorios en tu perfil.</p>
      </div>`,
    }).catch(console.error);
    enviados++;
  }

  return { job: 'recordatorio-animo', usuariosSinRegistro: usuariosSinRegistro.length, enviados };
}

// ── Cron: inactividad IA (lunes) ──────────────────────────────
// Re-engancha usuarios que llevan 7+ días sin usar el diario. A diferencia de la
// versión anterior (que solo capturaba a quien cruzaba el umbral esa semana exacta),
// esto reintenta cada 7 días mientras el usuario siga inactivo — sin límite de cuánto
// tiempo lleve inactivo — pero nunca más de una vez por semana por usuario (dedup).

async function inactividadIA(appUrl: string) {
  const haceSemana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const usuarios = await db.usuario.findMany({
    where: {
      estado: 'ACTIVO',
      email: { not: null },
      entradasDiario: { none: { createdAt: { gte: haceSemana } } },
      OR: [
        { ultimaInactividadIAEnviadoEn: null },
        { ultimaInactividadIAEnviadoEn: { lt: haceSemana } },
      ],
    },
    select: { id: true, email: true, nombre: true },
    take: 500,
  });

  let enviados = 0;
  for (const u of usuarios) {
    if (!u.email) continue;
    const nombre = escapeHtml(u.nombre ?? 'amigo/a');
    await enviarEmail({
      to: u.email,
      subject: '🤝 Te echamos de menos — MenteBridge',
      text: `Hola ${nombre},\n\nHace unos días que no usas tu diario de bienestar ni el chat con nuestra IA. Estamos aquí cuando lo necesites.\n\n${appUrl}/dashboard\n\nEquipo MenteBridge`,
      html: `<div style="font-family:sans-serif;max-width:520px;margin:auto">
        <h2 style="color:#0d9488">🤝 Te echamos de menos</h2>
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Hace unos días que no registras tu bienestar. Recuerda que tu salud mental importa, y nuestra IA está disponible cuando la necesites.</p>
        <a href="${appUrl}/dashboard" style="display:inline-block;background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">Volver a MenteBridge →</a>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
        <p style="color:#aaa;font-size:12px">MenteBridge Colombia · Puedes desactivar estos avisos en tu perfil.</p>
      </div>`,
    }).catch(console.error);

    await db.usuario.update({
      where: { id: u.id },
      data: { ultimaInactividadIAEnviadoEn: new Date() },
    });
    enviados++;
  }

  return { job: 'inactividad-ia', usuariosInactivos: usuarios.length, enviados };
}

// ── Cron: reengagement push por inactividad (3+ días) ─────────
// Empuja a usuarios sin ninguna actividad (diario/ánimo) en 3+ días,
// con mensaje personalizado referenciando su última entrada del diario.
// Se reenvía como máximo una vez cada 7 días por usuario (dedup) — sin esto,
// un usuario inactivo recibiría el push todos los días indefinidamente.

async function reengagement3Dias() {
  const hace3Dias = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const hace7Dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const usuarios = await db.usuario.findMany({
    where: {
      estado: 'ACTIVO',
      pushToken: { not: null },
      entradasDiario: { none: { createdAt: { gte: hace3Dias } } },
      registrosAnimo: { none: { fecha: { gte: hace3Dias } } },
      OR: [
        { ultimoReengagementEnviadoEn: null },
        { ultimoReengagementEnviadoEn: { lt: hace7Dias } },
      ],
    },
    select: {
      id: true,
      pushToken: true,
      nombre: true,
      entradasDiario: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        select: { emociones: true, sentimientos: true },
      },
    },
    take: 500,
  });

  let enviados = 0;
  for (const u of usuarios) {
    if (!u.pushToken) continue;
    const nombre = u.nombre?.split(' ')[0] ?? '';
    const ultimaEntrada = u.entradasDiario[0];
    const emocion = [
      ...((ultimaEntrada?.emociones as string[]) ?? []),
      ...((ultimaEntrada?.sentimientos as string[]) ?? []),
    ][0];

    const cuerpo = emocion
      ? `La última vez hablaste de sentirte "${emocion}". ¿Cómo has estado desde entonces?`
      : 'Hace unos días que no sabemos de ti. Tu espacio sigue aquí cuando quieras volver.';

    await enviarPushUno(
      u.pushToken,
      nombre ? `Hola ${nombre} 💚` : 'Te extrañamos 💚',
      cuerpo,
      { tipo: 'reengagement' },
    ).catch(console.error);

    await db.usuario.update({
      where: { id: u.id },
      data: { ultimoReengagementEnviadoEn: new Date() },
    });
    enviados++;
  }

  return { job: 'reengagement-3dias', usuariosInactivos: usuarios.length, enviados };
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

    if (job === 'recordatorio-animo') return Response.json(await recordatorioAnimo(appUrl));
    if (job === 'inactividad-ia')    return Response.json(await inactividadIA(appUrl));
    if (job === 'reengagement-3dias') return Response.json(await reengagement3Dias());

    if (job === 'limpiar-senales-rtc') {
      const { count } = await db.senalRTC.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
      console.log(`[CRON] Señales RTC expiradas eliminadas: ${count}`);
      return Response.json({ job, eliminadas: count });
    }

    return Response.json({ error: 'Job inválido' }, { status: 400 });
  } catch (error) {
    console.error(`[CRON ${job} ERROR]`, error);
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}
