import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { getAuthUser } from '@/lib/auth/get-auth-user';

const PatchSesionSchema = z.object({
  titulo: z.string().min(1).max(120),
});

// GET /api/chat/sesiones/[id] — Carga mensajes de una sesión
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(req);
  if (!user) {
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

  if (!sesion || sesion.usuarioId !== user.id) {
    return Response.json({ error: 'Sesión no encontrada' }, { status: 404 });
  }

  return Response.json({
    sesion: { id: sesion.id, titulo: sesion.titulo, estado: 'ACTIVA', creadaEn: new Date().toISOString() },
    mensajes: sesion.mensajes.map(m => ({
      id: m.id,
      rol: m.rol.toUpperCase(),
      contenido: m.contenido,
      esCrisis: m.esCrisis,
      nivelCrisis: 'NINGUNO',
      creadoEn: m.createdAt,
    })),
  });
}

// PATCH /api/chat/sesiones/[id] — Actualiza el título de la sesión
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = PatchSesionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Título inválido (1-120 caracteres)' }, { status: 400 });
  }
  const { titulo } = parsed.data;

  const sesion = await db.sesionChat.findUnique({
    where: { id: params.id },
    select: { usuarioId: true },
  });

  if (!sesion || sesion.usuarioId !== user.id) {
    return Response.json({ error: 'Sesión no encontrada' }, { status: 404 });
  }

  await db.sesionChat.update({
    where: { id: params.id },
    data: { titulo },
  });

  return Response.json({ ok: true });
}
