import { type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { rateLimits } from '@/lib/rate-limit';
import { generarTokenVerificacion } from '@/lib/email/tokens';
import { enviarVerificacionEmail } from '@/lib/email/confirmaciones';
import { env } from '@/lib/env';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  // Mismo límite que registro: 5 por hora por IP
  const { allowed } = await rateLimits.registro(ip);
  if (!allowed) {
    return Response.json(
      { error: 'Demasiados intentos. Intenta de nuevo en una hora.' },
      { status: 429 }
    );
  }

  const { email } = await req.json().catch(() => ({}));
  if (!email || typeof email !== 'string') {
    return Response.json({ error: 'Email requerido' }, { status: 400 });
  }

  const usuario = await db.usuario.findUnique({
    where:  { email },
    select: { id: true, nombre: true, estado: true, emailVerificado: true },
  });

  // Respuesta genérica para no confirmar si el email existe
  if (!usuario || usuario.emailVerificado || usuario.estado !== 'PENDIENTE_VERIFICACION') {
    return Response.json({ exito: true });
  }

  const { token, ts } = generarTokenVerificacion(email);
  const params = new URLSearchParams({ email, token, ts: String(ts) });
  const urlVerificacion = `${env.APP_URL}/api/auth/verificar-email?${params}`;

  await enviarVerificacionEmail({
    email,
    nombre: usuario.nombre ?? 'Usuario',
    token,
    url: urlVerificacion,
  });

  return Response.json({ exito: true });
}
