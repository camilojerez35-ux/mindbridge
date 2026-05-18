import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

type TipoNotificacion =
  | 'RECORDATORIO_ANIMO'
  | 'RECORDATORIO_SESION_IA'
  | 'CITA_PROXIMA_24H'
  | 'CITA_PROXIMA_1H'
  | 'PAGO_APROBADO'
  | 'NUEVA_RESENA'
  | 'SESION_DISPONIBLE';

const PLANTILLAS: Record<TipoNotificacion, { titulo: string; cuerpo: (d?: Record<string, string>) => string; icono: string }> = {
  RECORDATORIO_ANIMO: {
    titulo: '¿Cómo estás hoy? 😊',
    cuerpo: () => 'Tómate un momento para registrar cómo te sientes. Solo tarda 10 segundos.',
    icono: 'emoji_emotions',
  },
  RECORDATORIO_SESION_IA: {
    titulo: 'MindBridge te extraña 💚',
    cuerpo: () => 'Han pasado 3 días sin una sesión. La IA está lista para escucharte.',
    icono: 'psychology',
  },
  CITA_PROXIMA_24H: {
    titulo: 'Tu cita es mañana 📅',
    cuerpo: (d) => `Recuerda tu cita con ${d?.nombrePsicologo || 'tu psicólogo/a'} mañana a las ${d?.hora || ''}`,
    icono: 'event',
  },
  CITA_PROXIMA_1H: {
    titulo: '¡Tu cita comienza en 1 hora! 📹',
    cuerpo: (d) => `Prepárate para tu sesión con ${d?.nombrePsicologo || 'tu psicólogo/a'}`,
    icono: 'videocam',
  },
  PAGO_APROBADO: {
    titulo: 'Pago aprobado ✅',
    cuerpo: (d) => `Tu ${d?.tipo || 'pago'} fue procesado exitosamente.`,
    icono: 'check_circle',
  },
  NUEVA_RESENA: {
    titulo: 'Nueva reseña recibida ⭐',
    cuerpo: (d) => `${d?.paciente || 'Un paciente'} dejó una calificación de ${d?.calificacion || '5'} estrellas.`,
    icono: 'star',
  },
  SESION_DISPONIBLE: {
    titulo: 'Sesiones disponibles esta semana',
    cuerpo: (d) => `Te quedan ${d?.sesiones || '3'} sesiones de IA disponibles esta semana.`,
    icono: 'chat',
  },
};

// POST — envío manual desde el sistema (solo ADMIN o SUPERADMIN)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'No autorizado. Inicie sesión.' }, { status: 401 });
  }
  if (!['ADMIN', 'SUPERADMIN'].includes(session.user.rol)) {
    return Response.json({ error: 'Acceso denegado.' }, { status: 403 });
  }

  try {
    const { usuarioId, tipo, datos } = await req.json();

    if (!usuarioId || !tipo) {
      return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const plantilla = PLANTILLAS[tipo as TipoNotificacion];
    if (!plantilla) {
      return Response.json({ error: 'Tipo de notificación inválido' }, { status: 400 });
    }

    // TODO: implementar envío real con Firebase Admin SDK
    console.log(`[NOTIFICACIÓN] Enviando a ${usuarioId}: ${plantilla.titulo}`);

    return Response.json({
      exito: true,
      notificacion: { titulo: plantilla.titulo, cuerpo: plantilla.cuerpo(datos) },
    });

  } catch (error) {
    console.error('[NOTIFICACIONES ERROR]', error);
    return Response.json({ error: 'Error enviando notificación' }, { status: 500 });
  }
}

// GET — cron jobs internos (requiere CRON_SECRET en header Authorization)
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[CRON] CRON_SECRET no está definido');
    return Response.json({ error: 'Configuración inválida' }, { status: 500 });
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const job = searchParams.get('job');

  if (job === 'recordatorio-animo') {
    console.log('[CRON] Enviando recordatorios de ánimo...');
    return Response.json({ mensaje: 'Recordatorios de ánimo enviados' });
  }

  if (job === 'citas-24h') {
    console.log('[CRON] Enviando recordatorios de citas 24h...');
    return Response.json({ mensaje: 'Recordatorios de citas enviados' });
  }

  if (job === 'inactividad-ia') {
    console.log('[CRON] Enviando recordatorios de inactividad...');
    return Response.json({ mensaje: 'Recordatorios de inactividad enviados' });
  }

  return Response.json({ error: 'Job inválido' }, { status: 400 });
}
