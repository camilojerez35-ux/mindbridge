import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { generarTokenReset } from '@/lib/email/tokens';
import { enviarEmail } from '@/lib/email/confirmaciones';
import { env } from '@/lib/env';
import { capturarErrorApi } from '@/lib/monitoring/sentry';

const Schema = z.object({ email: z.string().email() }).strict();

// Respuesta siempre idéntica — nunca revelar si el email existe (enumeración)
const OK = { ok: true, mensaje: 'Si ese email está registrado, recibirás un enlace en breve.' };

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try { body = await req.json(); }
    catch { return Response.json({ error: 'Body inválido' }, { status: 400 }); }

    const resultado = Schema.safeParse(body);
    if (!resultado.success) return Response.json(OK);

    const { email } = resultado.data;

    const usuario = await db.usuario.findUnique({
      where:  { email },
      select: { nombre: true, estado: true },
    });

    if (!usuario || usuario.estado === 'ELIMINADO' || usuario.estado === 'SUSPENDIDO') {
      return Response.json(OK);
    }

    const { token, ts } = generarTokenReset(email);
    const url = `${env.APP_URL}/reset-password?email=${encodeURIComponent(email)}&token=${token}&ts=${ts}`;
    const nombre = usuario.nombre ?? 'Usuario';

    await enviarEmail({
      to: email,
      subject: 'Recupera tu contraseña de MindBridge',
      text: `Hola ${nombre}, haz clic en este enlace para restablecer tu contraseña (válido 1 hora): ${url}. Si no solicitaste esto, ignora este mensaje.`,
      html: `
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0d1a12;font-family:Inter,system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto">
    <tr><td style="padding:0 20px">
      <div style="text-align:center;margin-bottom:24px">
        <h1 style="color:#2dd4bf;font-size:26px;font-weight:900;margin:0">MindBridge</h1>
      </div>
      <div style="background:rgba(255,255,255,0.03);border:1px solid #1a2e1f;border-radius:16px;padding:32px">
        <h2 style="color:white;font-size:18px;font-weight:800;margin:0 0 12px">Restablecer contraseña</h2>
        <p style="color:#8aab96;font-size:14px;line-height:1.6;margin:0 0 24px">
          Hola ${nombre}, recibimos una solicitud para restablecer la contraseña de tu cuenta.
        </p>
        <div style="text-align:center;margin:28px 0">
          <a href="${url}" style="display:inline-block;background:#1a6b4a;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px">
            Restablecer contraseña →
          </a>
        </div>
        <p style="color:#3d5c48;font-size:12px;text-align:center;margin:0">
          Válido por <strong style="color:#8aab96">1 hora</strong>. Si no solicitaste esto, ignora este mensaje.
        </p>
      </div>
      <p style="color:#2a3d2e;font-size:11px;text-align:center;margin-top:20px">
        Crisis: <strong style="color:#2dd4bf">Línea 106 · 123</strong>
      </p>
    </td></tr>
  </table>
</body></html>`,
    });

    return Response.json(OK);

  } catch (error) {
    capturarErrorApi(error, { ruta: '/api/auth/forgot-password', metodo: 'POST' });
    return Response.json(OK); // nunca exponer detalles del error
  }
}
