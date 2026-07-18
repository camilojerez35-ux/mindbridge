/**
 * GET /api/crisis/confirmar/[token]
 *
 * El psicólogo hace clic en este enlace desde el email de alerta para confirmar
 * que recibió la notificación y está atendiendo al usuario en crisis.
 * Idempotente: confirmar dos veces es seguro.
 */
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } },
) {
  const { token } = params;

  if (!token || token.length !== 64) {
    return htmlResponse('Token inválido', false);
  }

  try {
    const incidente = await db.incidenteCrisis.findUnique({
      where: { tokenConfirmacion: token },
      select: {
        id: true,
        nivel: true,
        confirmacionRecibidaAt: true,
        timestampDeteccion: true,
        usuario: { select: { nombre: true } },
      },
    });

    if (!incidente) {
      return htmlResponse('Token no encontrado o expirado', false);
    }

    if (!incidente.confirmacionRecibidaAt) {
      await db.incidenteCrisis.update({
        where: { id: incidente.id },
        data: { confirmacionRecibidaAt: new Date() },
      });
    }

    const minutosTranscurridos = Math.round(
      (Date.now() - incidente.timestampDeteccion.getTime()) / 60000,
    );

    return htmlResponse(
      `Confirmación registrada para el usuario ${incidente.usuario.nombre ?? ''} (nivel ${incidente.nivel}). Han pasado ${minutosTranscurridos} minutos desde la detección.`,
      true,
    );
  } catch {
    return htmlResponse('Error al procesar la confirmación. Contacte soporte.', false);
  }
}

function htmlResponse(mensaje: string, exito: boolean) {
  const color = exito ? '#16a34a' : '#dc2626';
  const icono = exito ? '✅' : '❌';
  return new Response(
    `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MenteBridge — Confirmación de crisis</title>
  <style>
    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center;
           min-height: 100vh; margin: 0; background: #0d1a12; color: white; }
    .card { background: #1a2e1f; border-radius: 16px; padding: 40px; max-width: 480px; text-align: center; }
    .icono { font-size: 48px; margin-bottom: 16px; }
    h1 { color: ${color}; margin: 0 0 12px; }
    p { color: #9ca3af; line-height: 1.6; }
    .emergencia { margin-top: 24px; background: #1f2937; border-radius: 8px; padding: 16px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icono">${icono}</div>
    <h1>${exito ? 'Confirmación registrada' : 'Error'}</h1>
    <p>${mensaje}</p>
    ${exito ? `<div class="emergencia">
      <strong>Recuerde:</strong> si el usuario está en peligro inmediato, llame al <strong>123</strong>.<br>
      Línea Salud Mental: <strong>106</strong> (Bogotá) / <strong>800-112-5555</strong> (Nacional)
    </div>` : ''}
  </div>
</body>
</html>`,
    {
      status: exito ? 200 : 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    },
  );
}
