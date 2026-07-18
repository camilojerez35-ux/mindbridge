// SOLO DESARROLLO — eliminar antes de producción
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'No disponible en producción' }, { status: 403 });
  }

  const { to } = await req.json().catch(() => ({ to: null }));
  if (!to) return Response.json({ error: 'Falta el campo "to"' }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM ?? 'noreply@mentebridge.com';
  const fromName  = process.env.EMAIL_FROM_NAME ?? 'MenteBridge Colombia';

  // Diagnóstico de variables
  const diagnostico = {
    RESEND_API_KEY: apiKey ? `✅ configurada (${apiKey.slice(0, 8)}...)` : '❌ NO configurada',
    EMAIL_FROM: fromEmail,
    EMAIL_FROM_NAME: fromName,
  };

  if (!apiKey) {
    return Response.json({
      ok: false,
      diagnostico,
      mensaje: 'RESEND_API_KEY no está en .env.local — el email solo se imprime en consola del servidor',
    });
  }

  // Intentar enviar
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: '✅ Test de email — MenteBridge',
      text: 'Si recibes esto, el email está funcionando correctamente.',
      html: '<p>✅ Si recibes esto, el email está funcionando correctamente en <strong>MenteBridge</strong>.</p>',
    }),
  });

  const body = await res.json().catch(() => ({}));

  return Response.json({
    ok: res.ok,
    status: res.status,
    diagnostico,
    respuesta_resend: body,
  });
}
