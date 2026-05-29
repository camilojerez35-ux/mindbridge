/**
 * POST /api/resenas  — paciente crea reseña de una cita COMPLETADA
 * GET  /api/resenas?psicologoId=xxx — listar reseñas públicas de un psicólogo
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { z } from 'zod';

const CrearResenaSchema = z.object({
  citaId:       z.string().cuid(),
  calificacion: z.number().int().min(1).max(5),
  comentario:   z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = CrearResenaSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.errors[0]?.message ?? 'Datos inválidos' }, { status: 400 });
  }

  const { citaId, calificacion, comentario } = parsed.data;

  // Verificar que la cita pertenece al usuario y está COMPLETADA
  const cita = await db.cita.findUnique({
    where: { id: citaId },
    select: { id: true, usuarioId: true, psicologoId: true, estado: true, resena: { select: { id: true } } },
  });

  if (!cita) return Response.json({ error: 'Cita no encontrada' }, { status: 404 });
  if (cita.usuarioId !== session.user.id) return Response.json({ error: 'No autorizado' }, { status: 403 });
  if (cita.estado !== 'COMPLETADA') return Response.json({ error: 'Solo puedes reseñar citas completadas' }, { status: 400 });
  if (cita.resena) return Response.json({ error: 'Ya dejaste una reseña para esta cita' }, { status: 409 });

  const resena = await db.resena.create({
    data: { citaId, psicologoId: cita.psicologoId, calificacion, comentario: comentario ?? null },
    select: { id: true, calificacion: true, comentario: true, createdAt: true },
  });

  // Actualizar calificación promedio del psicólogo
  const todas = await db.resena.findMany({
    where: { psicologoId: cita.psicologoId, aprobada: true },
    select: { calificacion: true },
  });
  const promedio = todas.reduce((s, r) => s + r.calificacion, 0) / todas.length;

  await db.psicologo.update({
    where: { id: cita.psicologoId },
    data: { calificacionPromedio: Math.round(promedio * 10) / 10, totalResenas: todas.length },
  });

  return Response.json({ resena }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const psicologoId = searchParams.get('psicologoId');
  const citaId      = searchParams.get('citaId');

  if (citaId) {
    const resena = await db.resena.findUnique({
      where: { citaId },
      select: { id: true, calificacion: true, comentario: true, createdAt: true },
    });
    return Response.json({ resena });
  }

  if (!psicologoId) return Response.json({ error: 'Falta psicologoId o citaId' }, { status: 400 });

  const resenas = await db.resena.findMany({
    where: { psicologoId, aprobada: true },
    select: {
      id: true, calificacion: true, comentario: true, createdAt: true,
      cita: { select: { usuario: { select: { nombre: true, apellido: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return Response.json({ resenas });
}
