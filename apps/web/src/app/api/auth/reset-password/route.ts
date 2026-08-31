import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db/client';
import { verificarTokenReset } from '@/lib/email/tokens';
import { capturarErrorApi } from '@/lib/monitoring/sentry';
import { rateLimits } from '@/lib/rate-limit';

const Schema = z.object({
  email:    z.string().email(),
  token:    z.string().min(64).max(64),
  ts:       z.number().int().positive(),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128)
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe tener al menos una minúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe tener al menos un carácter especial'),
}).strict();

export async function POST(req: NextRequest) {
  const ip = req.ip ?? req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  const { allowed } = await rateLimits.resetPassword(ip);
  if (!allowed) {
    return Response.json(
      { error: 'Demasiados intentos de restablecimiento desde esta IP. Intenta más tarde.' },
      { status: 429 },
    );
  }
  try {
    let body: unknown;
    try { body = await req.json(); }
    catch { return Response.json({ error: 'Body inválido' }, { status: 400 }); }

    const resultado = Schema.safeParse(body);
    if (!resultado.success) {
      return Response.json({ error: resultado.error.issues[0].message }, { status: 400 });
    }

    const { email, token, ts, password } = resultado.data;

    const verificacion = verificarTokenReset(email, token, ts);
    if (!verificacion.valido) {
      return Response.json({ error: verificacion.razon }, { status: 400 });
    }

    const usuario = await db.usuario.findUnique({
      where:  { email },
      select: { id: true, estado: true },
    });

    if (!usuario || usuario.estado === 'ELIMINADO' || usuario.estado === 'SUSPENDIDO') {
      return Response.json({ error: 'Cuenta no encontrada o inactiva' }, { status: 404 });
    }

    const hash = await bcrypt.hash(password, 12);

    await db.usuario.update({
      where: { id: usuario.id },
      data:  { hashedPassword: hash, passwordChangedAt: new Date() },
    });

    return Response.json({ ok: true });

  } catch (error) {
    capturarErrorApi(error, { ruta: '/api/auth/reset-password', metodo: 'POST' });
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
