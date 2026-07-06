import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

const PatchSchema = z.object({
  titulo:      z.string().min(3).max(200).optional(),
  descripcion: z.string().max(2000).optional(),
  fechaLimite: z.string().datetime().optional().nullable(),
});

async function getPsicologoId(usuarioId: string) {
  const p = await db.psicologo.findUnique({ where: { usuarioId }, select: { id: true } });
  return p?.id ?? null;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.rol !== 'PSICOLOGO') return Response.json({ error: 'Solo psicólogos' }, { status: 403 });

  const psicologoId = await getPsicologoId(session.user.id);
  if (!psicologoId) return Response.json({ error: 'Perfil no encontrado' }, { status: 404 });

  const tarea = await db.tareaSesion.findFirst({ where: { id: params.id, psicologoId } });
  if (!tarea) return Response.json({ error: 'No encontrada' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'Datos inválidos' }, { status: 400 });

  const actualizada = await db.tareaSesion.update({
    where: { id: params.id },
    data: {
      ...(parsed.data.titulo      ? { titulo: parsed.data.titulo }           : {}),
      ...(parsed.data.descripcion ? { descripcion: parsed.data.descripcion } : {}),
      fechaLimite: parsed.data.fechaLimite !== undefined
        ? (parsed.data.fechaLimite ? new Date(parsed.data.fechaLimite) : null)
        : tarea.fechaLimite,
    },
  });

  return Response.json({ ok: true, tarea: actualizada });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.rol !== 'PSICOLOGO') return Response.json({ error: 'Solo psicólogos' }, { status: 403 });

  const psicologoId = await getPsicologoId(session.user.id);
  if (!psicologoId) return Response.json({ error: 'Perfil no encontrado' }, { status: 404 });

  const tarea = await db.tareaSesion.findFirst({ where: { id: params.id, psicologoId } });
  if (!tarea) return Response.json({ error: 'No encontrada' }, { status: 404 });

  await db.tareaSesion.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
}
