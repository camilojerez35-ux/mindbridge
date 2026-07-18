/**
 * GET /api/cron/crisis-escalacion
 *
 * Cron cada 15 minutos (vercel.json). Detecta incidentes CRÍTICO/ALTO sin
 * confirmación del psicólogo y envía una segunda alerta de escalación.
 * Protegido con CRON_SECRET para que solo Vercel pueda invocarlo.
 */
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';

const UMBRAL_MINUTOS_CRITICO = 15;
const UMBRAL_MINUTOS_ALTO = 30;

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization');
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const ahora = new Date();

    const incidentesPendientes = await db.incidenteCrisis.findMany({
      where: {
        nivel: { in: ['CRITICO', 'ALTO'] },
        confirmacionRecibidaAt: null,
        tokenConfirmacion: { not: null },
        timestampDeteccion: {
          // Solo incidentes generados en las últimas 24h (evita ruido histórico)
          gte: new Date(ahora.getTime() - 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        nivel: true,
        timestampDeteccion: true,
        tokenConfirmacion: true,
        usuario: { select: { nombre: true } },
      },
    });

    let escalados = 0;

    for (const incidente of incidentesPendientes) {
      const minutosTranscurridos = (ahora.getTime() - incidente.timestampDeteccion.getTime()) / 60000;
      const umbral = incidente.nivel === 'CRITICO' ? UMBRAL_MINUTOS_CRITICO : UMBRAL_MINUTOS_ALTO;

      if (minutosTranscurridos < umbral) continue;

      // Solo escalar una vez por ventana de 15 min (evitar spam)
      const yaEscalado = await db.auditLog.findFirst({
        where: {
          accion: 'CRISIS_ESCALACION_AUTO',
          recursoId: incidente.id,
          createdAt: { gte: new Date(ahora.getTime() - 15 * 60 * 1000) },
        },
      });
      if (yaEscalado) continue;

      await escalarIncidente(incidente.id, incidente.nivel as 'CRITICO' | 'ALTO', incidente.usuario.nombre ?? 'Usuario', incidente.tokenConfirmacion!);
      escalados++;
    }

    return Response.json({ ok: true, escalados, revisados: incidentesPendientes.length });
  } catch (error) {
    console.error('[CRON CRISIS]', error);
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}

async function escalarIncidente(
  incidenteId: string,
  nivel: 'CRITICO' | 'ALTO',
  nombreUsuario: string,
  tokenConfirmacion: string,
) {
  try {
    const incidente = await db.incidenteCrisis.findUnique({
      where: { id: incidenteId },
      select: {
        usuarioId: true,
        timestampDeteccion: true,
        usuario: { select: { nombre: true } },
      },
    });
    if (!incidente) return;

    const minutosTranscurridos = Math.round(
      (Date.now() - incidente.timestampDeteccion.getTime()) / 60000,
    );

    const cita = await db.cita.findFirst({
      where: {
        usuarioId: incidente.usuarioId,
        estado: { in: ['CONFIRMADA', 'COMPLETADA', 'PENDIENTE'] },
      },
      orderBy: { fechaHora: 'desc' },
      select: {
        psicologo: { select: { nombreCompleto: true, usuarioId: true } },
      },
    });

    if (!cita) return;

    const psicologoUsuario = await db.usuario.findUnique({
      where: { id: cita.psicologo.usuarioId },
      select: { email: true },
    });

    if (!psicologoUsuario?.email) return;

    const baseUrl = process.env.NEXTAUTH_URL ?? 'https://mentebridge.com';
    const urlConfirmacion = `${baseUrl}/api/crisis/confirmar/${tokenConfirmacion}`;

    const { enviarEmail } = await import('@/lib/email/confirmaciones');
    await enviarEmail({
      to: psicologoUsuario.email,
      subject: `🚨 ESCALACIÓN AUTOMÁTICA — Crisis ${nivel} sin confirmar — ${minutosTranscurridos} min — ${nombreUsuario}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#7f1d1d;color:white;padding:20px;border-radius:8px 8px 0 0;">
            <h2 style="margin:0;">⚠️ Escalación automática — ${minutosTranscurridos} minutos sin confirmación</h2>
          </div>
          <div style="padding:20px;border:1px solid #e5e7eb;border-radius:0 0 8px 8px;">
            <p>La alerta de crisis nivel <strong>${nivel}</strong> para el usuario <strong>${nombreUsuario}</strong>
               lleva <strong>${minutosTranscurridos} minutos</strong> sin confirmación de atención.</p>
            <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px;margin:16px 0;">
              Si no puede atender esta crisis, active el protocolo de guardia o contacte la línea de emergencias.
            </div>
            <div style="text-align:center;margin:20px 0;">
              <a href="${urlConfirmacion}"
                 style="background:#16a34a;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
                ✅ Confirmar atención ahora
              </a>
            </div>
            <ul>
              <li>Emergencias: <strong>123</strong></li>
              <li>Línea Salud Mental: <strong>106</strong> / <strong>800-112-5555</strong></li>
            </ul>
          </div>
        </div>
      `,
      text: `ESCALACIÓN CRISIS ${nivel} — ${nombreUsuario} — ${minutosTranscurridos} min sin confirmación. Confirmar: ${urlConfirmacion}. Emergencias: 123.`,
    });

    await db.auditLog.create({
      data: {
        accion: 'CRISIS_ESCALACION_AUTO',
        recurso: 'IncidenteCrisis',
        recursoId: incidenteId,
        metadatos: { nivel, minutosTranscurridos, emailDestino: psicologoUsuario.email },
      },
    });
  } catch (error) {
    console.error('[CRON CRISIS] Error escalando incidente:', incidenteId, error);
  }
}
