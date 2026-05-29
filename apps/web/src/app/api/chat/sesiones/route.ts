import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';

const CrearSesionSchema = z.object({
  titulo: z.string().max(120).optional(),
});

// GET /api/chat/sesiones — Lista sesiones del usuario autenticado
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const sesiones = await db.sesionChat.findMany({
      where: {
        usuarioId: session.user.id,
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
        fecha: s.createdAt,
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
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { body = {}; }

  const resultado = CrearSesionSchema.safeParse(body);
  if (!resultado.success) {
    return Response.json({ error: resultado.error.errors[0].message }, { status: 400 });
  }

  try {
    const sesion = await db.sesionChat.create({
      data: {
        usuarioId: session.user.id,
        titulo: resultado.data.titulo ?? null,
      },
      select: { id: true, titulo: true, createdAt: true },
    });

    return Response.json(sesion, { status: 201 });
  } catch (error) {
    console.error('[SESIONES POST ERROR]', error);
    return Response.json({ error: 'Error al crear la sesión' }, { status: 500 });
  }
}
