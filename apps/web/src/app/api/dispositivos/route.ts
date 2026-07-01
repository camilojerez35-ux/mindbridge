import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth/get-auth-user';
import { db } from '@/lib/db/client';

const Schema = z.object({
  pushToken: z.string().startsWith('ExponentPushToken[').endsWith(']'),
});

// POST /api/dispositivos — guarda el Expo Push Token del usuario autenticado
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const resultado = Schema.safeParse(body);
  if (!resultado.success) {
    return Response.json({ error: 'Token inválido' }, { status: 400 });
  }

  await db.usuario.update({
    where: { id: user.id },
    data: { pushToken: resultado.data.pushToken },
  });

  return Response.json({ exito: true });
}

// DELETE /api/dispositivos — elimina el push token (logout / deshabilitar notifs)
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 });

  await db.usuario.update({
    where: { id: user.id },
    data: { pushToken: null },
  });

  return Response.json({ exito: true });
}
