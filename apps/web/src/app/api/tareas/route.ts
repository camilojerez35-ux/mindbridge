import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

const PatchSchema = z.object({
  tareaId: z.string(),
  estado:  z.enum(['PENDIENTE', 'EN_PROCESO', 'COMPLETADA']),
  nota:    z.string().max(500).optional(),
});

// Paciente: listar sus tareas
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const soloActivas = searchParams.get('activas') !== 'false';

  const tareas = await db.tareaSesion.findMany({
    where: {
      usuarioId: session.user.id,
      ...(soloActivas ? { estado: { not: 'COMPLETADA' } } : {}),
    },
    include: {
      psicologo: {
        include: { usuario: { select: { nombre: true, apellido: true } } },
      },
    },
    orderBy: [{ estado: 'asc' }, { fechaLimite: 'asc' }, { createdAt: 'desc' }],
  });

  return Response.json({ tareas });
}

// Paciente: actualizar estado de tarea
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'Datos inválidos' }, { status: 400 });

  const { tareaId, estado, nota } = parsed.data;

  const tarea = await db.tareaSesion.findFirst({
    where: { id: tareaId, usuarioId: session.user.id },
  });
  if (!tarea) return Response.json({ error: 'Tarea no encontrada' }, { status: 404 });

  const actualizada = await db.tareaSesion.update({
    where: { id: tareaId },
    data: {
      estado,
      notaUsuario:  nota ?? tarea.notaUsuario,
      completadaEn: estado === 'COMPLETADA' ? new Date() : null,
    },
  });

  return Response.json({ ok: true, tarea: actualizada });
}
