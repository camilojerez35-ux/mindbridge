/**
 * GET  /api/psicologo/citas/[id]/notas  — leer notas clínicas
 * PATCH /api/psicologo/citas/[id]/notas — guardar notas clínicas
 * Solo accesible por el psicólogo dueño de la cita.
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { z } from 'zod';

const NotasSchema = z.object({
  notasClinicas: z.string().max(10000),
});

async function getPsicologoId(usuarioId: string) {
  const p = await db.psicologo.findUnique({ where: { usuarioId }, select: { id: true } });
  return p?.id ?? null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.rol !== 'PSICOLOGO') return Response.json({ error: 'Solo psicólogos' }, { status: 403 });

  const psicologoId = await getPsicologoId(session.user.id);
  if (!psicologoId) return Response.json({ error: 'Perfil no encontrado' }, { status: 404 });

  const cita = await db.cita.findUnique({
    where: { id: params.id },
    select: { id: true, psicologoId: true, notasClinicas: true },
  });

  if (!cita) return Response.json({ error: 'Cita no encontrada' }, { status: 404 });
  if (cita.psicologoId !== psicologoId) return Response.json({ error: 'No autorizado' }, { status: 403 });

  return Response.json({ notasClinicas: cita.notasClinicas ?? '' });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.rol !== 'PSICOLOGO') return Response.json({ error: 'Solo psicólogos' }, { status: 403 });

  const psicologoId = await getPsicologoId(session.user.id);
  if (!psicologoId) return Response.json({ error: 'Perfil no encontrado' }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = NotasSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'Datos inválidos' }, { status: 400 });

  const cita = await db.cita.findUnique({
    where: { id: params.id },
    select: { psicologoId: true },
  });

  if (!cita) return Response.json({ error: 'Cita no encontrada' }, { status: 404 });
  if (cita.psicologoId !== psicologoId) return Response.json({ error: 'No autorizado' }, { status: 403 });

  const actualizada = await db.cita.update({
    where: { id: params.id },
    data: { notasClinicas: parsed.data.notasClinicas },
    select: { id: true, updatedAt: true },
  });

  return Response.json({ ok: true, updatedAt: actualizada.updatedAt });
}
