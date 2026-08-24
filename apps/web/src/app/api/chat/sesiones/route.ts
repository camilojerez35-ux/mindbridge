import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { getAuthUser } from '@/lib/auth/get-auth-user';
import { capturarEvento } from '@/lib/analytics/posthog';

const CrearSesionSchema = z.object({
  titulo: z.string().max(120).optional(),
});

// GET /api/chat/sesiones — Lista sesiones del usuario autenticado
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const sesiones = await db.sesionChat.findMany({
      where: {
        usuarioId: user.id,
        estado: { not: 'ARCHIVADA' },
      },
      select: {
        id: true,
        titulo: true,
        createdAt: true,
        _count: { select: { mensajes: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 30,
    });

    return Response.json(
      sesiones.map(s => ({
        id: s.id,
        titulo: s.titulo ?? 'Sesión sin título',
        creadaEn: s.createdAt,
        estado: 'ACTIVA',
        mensajes: s._count.mensajes,
      }))
    );
  } catch (error) {
    console.error('[SESIONES GET ERROR]', error);
    return Response.json({ error: 'Error al obtener las sesiones' }, { status: 500 });
  }
}

// POST /api/chat/sesiones — Crea una nueva sesión
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { body = {}; }

  const resultado = CrearSesionSchema.safeParse(body);
  if (!resultado.success) {
    return Response.json({ error: resultado.error.issues[0].message }, { status: 400 });
  }

  try {
    const sesion = await db.sesionChat.create({
      data: {
        usuarioId: user.id,
        titulo: resultado.data.titulo ?? null,
      },
      select: { id: true, titulo: true, createdAt: true },
    });

    capturarEvento('sesion_chat_iniciada', { usuarioId: user.id });

    return Response.json({ id: sesion.id, titulo: sesion.titulo, creadaEn: sesion.createdAt, estado: 'ACTIVA' }, { status: 201 });
  } catch (error) {
    console.error('[SESIONES POST ERROR]', error);
    return Response.json({ error: 'Error al crear la sesión' }, { status: 500 });
  }
}
