import { db } from '@/lib/db/client';
import { capturarErrorEmail } from '@/lib/monitoring/sentry';

/** Detecta si la hora actual está fuera del horario laboral en Colombia (UTC-5, 8am-8pm L-V). */
export function esFueraDeHorarioLaboral(): boolean {
  const bogota = new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' });
  const fecha = new Date(bogota);
  const dia = fecha.getDay(); // 0=Dom, 6=Sab
  const hora = fecha.getHours();
  return dia === 0 || dia === 6 || hora < 8 || hora >= 20;
}

/**
 * Notifica por email al psicólogo asignado del usuario ante una crisis CRITICO/ALTO.
 * Llamado desde api/ai/chat, api/animo, api/diario (detección real) y api/ai/crisis
 * (uso desde el botón de pánico del cliente).
 */
export async function notificarPsicologoAsignado(
  usuarioId: string,
  nivel: 'CRITICO' | 'ALTO',
  fragmento: string,
  fuente: string,
  tokenConfirmacion: string,
): Promise<boolean> {
  try {
    const cita = await db.cita.findFirst({
      where: {
        usuarioId,
        estado: { in: ['CONFIRMADA', 'COMPLETADA', 'PENDIENTE'] },
      },
      orderBy: { fechaHora: 'desc' },
      select: {
        psicologoId: true,
        psicologo: {
          select: {
            nombreCompleto: true,
            usuarioId: true,
          },
        },
      },
    });

    const usuario = await db.usuario.findUnique({
      where: { id: usuarioId },
      select: { nombre: true, email: true },
    });

    // Sin cita previa (usuario nuevo/plan gratuito sin psicólogo asignado) o sin
    // email del psicólogo: escala al correo de administración en vez de quedar en silencio.
    const adminEmail = process.env.SENDGRID_FROM_EMAIL;
    let destinatarioEmail: string | undefined;
    let nombreDestinatario: string;
    let sinPsicologoAsignado = false;

    if (cita) {
      const psicologoUsuario = await db.usuario.findUnique({
        where: { id: cita.psicologo.usuarioId },
        select: { email: true },
      });
      destinatarioEmail = psicologoUsuario?.email ?? undefined;
      nombreDestinatario = cita.psicologo.nombreCompleto;
    }

    if (!destinatarioEmail) {
      destinatarioEmail = adminEmail;
      nombreDestinatario = 'Equipo de guardia MenteBridge';
      sinPsicologoAsignado = true;
    }

    if (!destinatarioEmail) return false;

    const { enviarEmail } = await import('@/lib/email/confirmaciones');

    const fueraDeHorario = esFueraDeHorarioLaboral();
    const nivelTexto = nivel === 'CRITICO' ? '🔴 CRÍTICO' : '🟠 ALTO';
    const accionRecomendada = nivel === 'CRITICO'
      ? 'Contacta al usuario INMEDIATAMENTE o llama al 123 si no puedes localizarlo.'
      : 'Contacta al usuario en las próximas 2 horas.';

    const baseUrl = process.env.NEXTAUTH_URL ?? 'https://mentebridge.com';
    const urlConfirmacion = `${baseUrl}/api/crisis/confirmar/${tokenConfirmacion}`;

    const bannerFueraHorario = fueraDeHorario ? `
      <div style="background:#1e3a5f;color:#93c5fd;border-left:4px solid #3b82f6;padding:12px;margin:16px 0;border-radius:4px;">
        <strong>⚠️ ALERTA FUERA DE HORARIO LABORAL</strong><br>
        Esta alerta se generó fuera del horario de atención (L-V 8am-8pm hora Colombia).<br>
        Si no puede atender al usuario, active el protocolo de guardia o redirija a la <strong>Línea 106</strong> (salud mental) o <strong>123</strong> (emergencias).
      </div>` : '';

    const bannerSinPsicologo = sinPsicologoAsignado ? `
      <div style="background:#3f1d1d;color:#fca5a5;border-left:4px solid #ef4444;padding:12px;margin:16px 0;border-radius:4px;">
        <strong>⚠️ USUARIO SIN PSICÓLOGO ASIGNADO</strong><br>
        Este usuario no tiene ninguna cita registrada — no hay un profesional asignado que pueda contactarlo directamente.
        Se requiere asignar un psicólogo de guardia o contactar al usuario por otro canal disponible.
      </div>` : '';

    await enviarEmail({
      to: destinatarioEmail,
      subject: `[${nivelTexto}]${fueraDeHorario ? ' ⚠️ FUERA DE HORARIO' : ''}${sinPsicologoAsignado ? ' ⚠️ SIN PSICÓLOGO' : ''} Crisis detectada — ${usuario?.nombre ?? 'Usuario'} — MenteBridge`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${nivel === 'CRITICO' ? '#7f1d1d' : '#78350f'}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Alerta de Crisis — Nivel ${nivelTexto}</h2>
            ${fueraDeHorario ? '<p style="margin:8px 0 0;font-size:14px;opacity:0.9;">⚠️ Generada fuera de horario laboral</p>' : ''}
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
            <p>Estimado/a <strong>${nombreDestinatario}</strong>,</p>
            <p>El sistema de MenteBridge ha detectado una posible crisis de nivel <strong>${nivelTexto}</strong> en uno de los usuarios.</p>

            ${bannerSinPsicologo}
            ${bannerFueraHorario}

            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px; background: #f9fafb; font-weight: bold; width: 40%;">Usuario</td><td style="padding: 8px;">${usuario?.nombre ?? 'Desconocido'}</td></tr>
              <tr><td style="padding: 8px; background: #f9fafb; font-weight: bold;">Fuente</td><td style="padding: 8px;">${fuente}</td></tr>
              <tr><td style="padding: 8px; background: #f9fafb; font-weight: bold;">Hora (Colombia)</td><td style="padding: 8px;">${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</td></tr>
              ${fragmento ? `<tr><td style="padding: 8px; background: #f9fafb; font-weight: bold;">Fragmento</td><td style="padding: 8px; font-style: italic;">"${fragmento}"</td></tr>` : ''}
            </table>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0;">
              <strong>Acción requerida:</strong> ${accionRecomendada}
            </div>

            <div style="text-align:center; margin: 20px 0;">
              <a href="${urlConfirmacion}"
                 style="background:#16a34a;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
                ✅ Confirmar recepción y atención
              </a>
              <p style="font-size:12px;color:#6b7280;margin-top:8px;">
                Si no puede confirmar haciendo clic, copie este enlace: ${urlConfirmacion}
              </p>
            </div>

            <p><strong>Recursos de emergencia:</strong></p>
            <ul>
              <li>Emergencias Colombia: <strong>123</strong></li>
              <li>Línea Salud Mental: <strong>106</strong> (Bogotá) / <strong>800-112-5555</strong> (Nacional)</li>
            </ul>

            ${nivel === 'CRITICO' ? `
            <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px;margin:16px 0;">
              <strong>🚨 Sin confirmación en 15 minutos:</strong> el sistema enviará una nueva alerta automática.
              Si no hay respuesta en 30 minutos, se activará el protocolo de guardia.
            </div>` : ''}

            <p style="color: #6b7280; font-size: 12px;">
              Este mensaje es confidencial y está protegido por la Ley 1581/2012.
              No reenvíe ni divulgue la información del usuario.
            </p>
          </div>
        </div>
      `,
      text: `ALERTA CRISIS ${nivel}${fueraDeHorario ? ' (FUERA DE HORARIO)' : ''} — ${usuario?.nombre ?? 'Usuario'} — ${fuente} — ${new Date().toLocaleString('es-CO')}. ${accionRecomendada}. Confirmar: ${urlConfirmacion}. Emergencias: 123.`,
    });

    return true;
  } catch (error) {
    console.error('[CRISIS] Error notificando al psicólogo:', error);
    capturarErrorEmail(error, 'crisis_notificacion_psicologo');
    return false;
  }
}
