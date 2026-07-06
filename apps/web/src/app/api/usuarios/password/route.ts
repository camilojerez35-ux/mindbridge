import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { capturarErrorApi } from '@/lib/monitoring/sentry';
import { getAuthUser } from '@/lib/auth/get-auth-user';

const CambiarPasswordSchema = z.object({
  passwordActual: z.string().min(1),
  passwordNueva:  z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres').max(128),
}).strict();

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 });

    let body: unknown;
    try { body = await req.json(); }
    catch { return Response.json({ error: 'Body inválido' }, { status: 400 }); }

    const resultado = CambiarPasswordSchema.safeParse(body);
    if (!resultado.success) {
      return Response.json({ error: resultado.error.errors[0].message }, { status: 400 });
    }

    const { passwordActual: hashedPasswordActual, passwordNueva: hashedPasswordNueva } = resultado.data;

    const usuario = await db.usuario.findUnique({
      where:  { id: user.id },
      select: { hashedPassword: true },
    });

    if (!usuario) return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });

    if (!usuario.hashedPassword) {
      return Response.json({ error: 'Tu cuenta usa Google Sign-In. No puedes cambiar la contraseña desde aquí.' }, { status: 400 });
    }

    const coincide = await bcrypt.compare(hashedPasswordActual, usuario.hashedPassword);
    if (!coincide) {
      return Response.json({ error: 'La contraseña actual es incorrecta' }, { status: 400 });
    }

    if (await bcrypt.compare(hashedPasswordNueva, usuario.hashedPassword)) {
      return Response.json({ error: 'La nueva contraseña debe ser diferente a la actual' }, { status: 400 });
    }

    const hash = await bcrypt.hash(hashedPasswordNueva, 12);
    await db.usuario.update({
      where: { id: user.id },
      data:  { hashedPassword: hash },
    });

    return Response.json({ exito: true });

  } catch (error) {
    capturarErrorApi(error, { ruta: '/api/usuarios/hashedPassword', metodo: 'POST' });
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
