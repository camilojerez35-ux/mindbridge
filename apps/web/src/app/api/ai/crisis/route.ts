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

const CrisisSchema = z.object({
  nivel:                  z.enum(['CRITICO', 'ALTO', 'MODERADO', 'BAJO']),
  sesionId:               z.string().min(1),
  indicadoresDetectados:  z.array(z.string()).default([]),
  fragmentoAnonimizado:   z.string().max(500).default(''),
  fuente:                 z.enum(['chat', 'diario', 'animo', 'panico_manual']).default('chat'),
}).strict();

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

    // Registrar el incidente
    await registrarIncidente({
      usuarioId,
      sesionId,
      nivel,
      indicadoresDetectados,
      fragmentoAnonimizado,
      timestampDeteccion: new Date(),
      protocoloActivado: true,
      psicologoNotificado: false, // se actualiza abajo
    });

    // Notificar al psicólogo si nivel CRITICO o ALTO
    let psicologoNotificado = false;
    if (nivel === 'CRITICO' || nivel === 'ALTO') {
      psicologoNotificado = await notificarPsicologoAsignado(usuarioId, nivel, fragmentoAnonimizado, fuente);
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
): Promise<boolean> {
  try {
    // Buscar la cita más reciente activa o completada del usuario
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

    const nivelTexto = nivel === 'CRITICO' ? '🔴 CRÍTICO' : '🟠 ALTO';
    const accionRecomendada = nivel === 'CRITICO'
      ? 'Contacta al usuario INMEDIATAMENTE o llama al 123 si no puedes localizarlo.'
      : 'Contacta al usuario en las próximas 2 horas.';

    await enviarEmail({
      to: psicologoUsuario.email,
      subject: `[${nivelTexto}] Crisis detectada — ${usuario?.nombre ?? 'Usuario'} — MindBridge`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${nivel === 'CRITICO' ? '#7f1d1d' : '#78350f'}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Alerta de Crisis — Nivel ${nivelTexto}</h2>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
            <p>Estimado/a <strong>${cita.psicologo.nombreCompleto}</strong>,</p>
            <p>El sistema de MindBridge ha detectado una posible crisis de nivel <strong>${nivelTexto}</strong> en uno de sus pacientes.</p>

            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px; background: #f9fafb; font-weight: bold; width: 40%;">Usuario</td><td style="padding: 8px;">${usuario?.nombre ?? 'Desconocido'}</td></tr>
              <tr><td style="padding: 8px; background: #f9fafb; font-weight: bold;">Fuente</td><td style="padding: 8px;">${fuente}</td></tr>
              <tr><td style="padding: 8px; background: #f9fafb; font-weight: bold;">Hora</td><td style="padding: 8px;">${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</td></tr>
              ${fragmento ? `<tr><td style="padding: 8px; background: #f9fafb; font-weight: bold;">Fragmento</td><td style="padding: 8px; font-style: italic;">"${fragmento}"</td></tr>` : ''}
            </table>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0;">
              <strong>Acción requerida:</strong> ${accionRecomendada}
            </div>

            <p><strong>Recursos de emergencia:</strong></p>
            <ul>
              <li>Emergencias Colombia: <strong>123</strong></li>
              <li>Línea Salud Mental: <strong>106</strong> (Bogotá) / <strong>800-112-5555</strong> (Nacional)</li>
            </ul>

            <p style="color: #6b7280; font-size: 12px;">
              Este mensaje es confidencial y está protegido por la Ley 1581/2012.
              No reenvíe ni divulgue la información del usuario.
            </p>
          </div>
        </div>
      `,
      text: `ALERTA CRISIS ${nivel} — ${usuario?.nombre ?? 'Usuario'} — ${fuente} — ${new Date().toLocaleString('es-CO')}. ${accionRecomendada}. Emergencias: 123.`,
    });

    return true;
  } catch (error) {
    console.error('[CRISIS] Error notificando al psicólogo:', error);
    return false;
  }
}
