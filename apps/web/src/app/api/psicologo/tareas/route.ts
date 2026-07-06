import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

const CrearTareaSchema = z.object({
  usuarioId:   z.string(),
  titulo:      z.string().min(3).max(200),
  descripcion: z.string().max(2000).optional(),
  tipo:        z.enum(['LECTURA', 'EJERCICIO', 'REGISTRO', 'PRACTICA']).default('PRACTICA'),
  fechaLimite: z.string().datetime().optional(),
  citaId:      z.string().optional(),
});

async function getPsicologoId(usuarioId: string) {
  const p = await db.psicologo.findUnique({ where: { usuarioId }, select: { id: true } });
  return p?.id ?? null;
}

// Psicólogo: listar tareas asignadas (filtradas por paciente si se indica)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.rol !== 'PSICOLOGO') return Response.json({ error: 'Solo psicólogos' }, { status: 403 });

  const psicologoId = await getPsicologoId(session.user.id);
  if (!psicologoId) return Response.json({ error: 'Perfil no encontrado' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const usuarioId = searchParams.get('usuarioId');

  const tareas = await db.tareaSesion.findMany({
    where: {
      psicologoId,
      ...(usuarioId ? { usuarioId } : {}),
    },
    include: {
      usuario: { select: { nombre: true, apellido: true, email: true } },
    },
    orderBy: [{ createdAt: 'desc' }],
  });

  return Response.json({ tareas });
}

// Psicólogo: crear tarea para paciente
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.rol !== 'PSICOLOGO') return Response.json({ error: 'Solo psicólogos' }, { status: 403 });

  const psicologoId = await getPsicologoId(session.user.id);
  if (!psicologoId) return Response.json({ error: 'Perfil no encontrado' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const parsed = CrearTareaSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'Datos inválidos', detalles: parsed.error.errors }, { status: 400 });

  const { usuarioId, titulo, descripcion, tipo, fechaLimite, citaId } = parsed.data;

  // Verificar que el usuario tiene citas con este psicólogo
  const citaExiste = await db.cita.findFirst({
    where: { psicologoId, usuarioId },
  });
  if (!citaExiste) return Response.json({ error: 'No tienes citas con este paciente' }, { status: 403 });

  const tarea = await db.tareaSesion.create({
    data: {
      psicologoId,
      usuarioId,
      citaId:      citaId ?? null,
      titulo,
      descripcion: descripcion ?? null,
      tipo,
      fechaLimite: fechaLimite ? new Date(fechaLimite) : null,
    },
  });

  return Response.json({ ok: true, tarea }, { status: 201 });
}
