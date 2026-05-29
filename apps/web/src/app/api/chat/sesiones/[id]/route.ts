import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';

// GET /api/chat/sesiones/[id] — Carga mensajes de una sesión
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  const sesion = await db.sesionChat.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      titulo: true,
      usuarioId: true,
      mensajes: {
        select: {
          id: true,
          rol: true,
          contenido: true,
          esCrisis: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!sesion || sesion.usuarioId !== session.user.id) {
    return Response.json({ error: 'Sesión no encontrada' }, { status: 404 });
  }

  return Response.json({
    id: sesion.id,
    titulo: sesion.titulo,
    mensajes: sesion.mensajes.map(m => ({
      id: m.id,
      rol: m.rol,
      contenido: m.contenido,
      esCrisis: m.esCrisis,
      timestamp: m.createdAt,
    })),
  });
}

// PATCH /api/chat/sesiones/[id] — Actualiza el título de la sesión
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { titulo } = await req.json();

  const sesion = await db.sesionChat.findUnique({
    where: { id: params.id },
    select: { usuarioId: true },
  });

  if (!sesion || sesion.usuarioId !== session.user.id) {
    return Response.json({ error: 'Sesión no encontrada' }, { status: 404 });
  }

  await db.sesionChat.update({
    where: { id: params.id },
    data: { titulo },
  });

  return Response.json({ ok: true });
}
