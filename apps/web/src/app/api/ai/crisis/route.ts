/**
 * POST /api/ai/crisis — Notificación al psicólogo cuando se detecta crisis
 *
 * Llamado internamente por el sistema de detección de crisis (chat, diario, ánimo).
 * También puede usarse desde el cliente cuando el usuario activa el botón de pánico.
 */
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db, registrarAuditLog } from '@/lib/db/client';
import { z } from 'zod';
import { capturarErrorApi } from '@/lib/monitoring/sentry';
import { registrarIncidente } from '@/lib/crisis/incident-logger';
import crypto from 'crypto';

const CrisisSchema = z.object({
  nivel:                  z.enum(['CRITICO', 'ALTO', 'MODERADO', 'BAJO']),
  sesionId:               z.string().min(1),
  indicadoresDetectados:  z.array(z.string()).default([]),
  fragmentoAnonimizado:   z.string().max(500).default(''),
  fuente:                 z.enum(['chat', 'diario', 'animo', 'panico_manual']).default('chat'),
}).strict();

/** Detecta si la hora actual está fuera del horario laboral en Colombia (UTC-5, 8am-8pm L-V). */
function esFueraDeHorarioLaboral(): boolean {
  const bogota = new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' });
  const fecha = new Date(bogota);
  const dia = fecha.getDay(); // 0=Dom, 6=Sab
  const hora = fecha.getHours();
  return dia === 0 || dia === 6 || hora < 8 || hora >= 20;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CrisisSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: 'Datos inválidos', detalles: parsed.error.flatten() }, { status: 400 });
    }

    const { nivel, sesionId, indicadoresDetectados, fragmentoAnonimizado, fuente } = parsed.data;
    const usuarioId = session.user.id;

    // Token de confirmación — solo para CRITICO/ALTO (requieren respuesta del psicólogo)
    const tokenConfirmacion = (nivel === 'CRITICO' || nivel === 'ALTO')
      ? crypto.randomBytes(32).toString('hex')
      : undefined;

    await registrarIncidente({
      usuarioId,
      sesionId,
      nivel,
      indicadoresDetectados,
      fragmentoAnonimizado,
      timestampDeteccion: new Date(),
      protocoloActivado: true,
      psicologoNotificado: false,
      tokenConfirmacion,
    });

    let psicologoNotificado = false;
    if (nivel === 'CRITICO' || nivel === 'ALTO') {
      psicologoNotificado = await notificarPsicologoAsignado(
        usuarioId, nivel, fragmentoAnonimizado, fuente, tokenConfirmacion!,
      );
    }

    await registrarAuditLog({
      usuarioId,
      accion: `CRISIS_${nivel}_DETECTADA`,
      recurso: 'CrisisIncidente',
      recursoId: sesionId,
      ipAddress: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined,
      userAgent: req.headers.get('user-agent') ?? undefined,
      metadatos: { nivel, fuente, indicadoresDetectados, psicologoNotificado },
    });

    return Response.json({ ok: true, nivel, psicologoNotificado });

  } catch (error) {
    capturarErrorApi(error, { ruta: '/api/ai/crisis', metodo: 'POST' });
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}

async function notificarPsicologoAsignado(
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

    if (!cita) return false;

    const usuario = await db.usuario.findUnique({
      where: { id: usuarioId },
      select: { nombre: true, email: true },
    });

    const psicologoUsuario = await db.usuario.findUnique({
      where: { id: cita.psicologo.usuarioId },
      select: { email: true },
    });

    if (!psicologoUsuario?.email) return false;

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

    await enviarEmail({
      to: psicologoUsuario.email,
      subject: `[${nivelTexto}]${fueraDeHorario ? ' ⚠️ FUERA DE HORARIO' : ''} Crisis detectada — ${usuario?.nombre ?? 'Usuario'} — MenteBridge`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${nivel === 'CRITICO' ? '#7f1d1d' : '#78350f'}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Alerta de Crisis — Nivel ${nivelTexto}</h2>
            ${fueraDeHorario ? '<p style="margin:8px 0 0;font-size:14px;opacity:0.9;">⚠️ Generada fuera de horario laboral</p>' : ''}
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
            <p>Estimado/a <strong>${cita.psicologo.nombreCompleto}</strong>,</p>
            <p>El sistema de MenteBridge ha detectado una posible crisis de nivel <strong>${nivelTexto}</strong> en uno de sus pacientes.</p>

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
    return false;
  }
}
