import { type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { verificarTokenEmail } from '@/lib/email/tokens';
import { enviarEmailBienvenida } from '@/lib/email/confirmaciones';

// GET /api/auth/verificar-email?email=...&token=...&ts=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email') ?? '';
  const token = searchParams.get('token') ?? '';
  const ts    = Number(searchParams.get('ts') ?? '0');

  const appUrl = process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  if (!email || !token || !ts) {
    return Response.redirect(`${appUrl}/verificar-email?error=enlace-incompleto`);
  }

  const { valido, razon } = verificarTokenEmail(email, token, ts);
  if (!valido) {
    const msg = encodeURIComponent(razon ?? 'Enlace inválido');
    return Response.redirect(`${appUrl}/verificar-email?error=${msg}`);
  }

  const usuario = await db.usuario.findUnique({
    where:  { email },
    select: { id: true, nombre: true, estado: true, emailVerificado: true },
  });

  if (!usuario) {
    return Response.redirect(`${appUrl}/verificar-email?error=usuario-no-encontrado`);
  }

  // Idempotente: si ya estaba verificado redirigir al login directamente
  if (usuario.emailVerificado) {
    return Response.redirect(`${appUrl}/login?verificado=ya`);
  }

  await db.usuario.update({
    where: { id: usuario.id },
    data: {
      emailVerificado: new Date(),
      estado: 'ACTIVO',
    },
  });

  // Email de bienvenida (no bloquea la respuesta)
  enviarEmailBienvenida({ email, nombre: usuario.nombre ?? 'Usuario' }).catch(err =>
    console.error('[EMAIL] Error al enviar bienvenida:', err)
  );

  return Response.redirect(`${appUrl}/verificar-email?exito=true`);
}
