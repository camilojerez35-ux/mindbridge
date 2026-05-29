/**
 * GET  /api/videollamada/[citaId]/signal  — Polling: obtener señales pendientes para el rol actual
 * POST /api/videollamada/[citaId]/signal  — Enviar señal (offer/answer/ice)
 * DELETE /api/videollamada/[citaId]/signal — Limpiar señales de la sala al finalizar
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { z } from 'zod';

const SignalSchema = z.object({
  tipo:    z.enum(['offer', 'answer', 'ice']),
  payload: z.record(z.unknown()),
});

async function getRol(session: { user: { id: string; rol?: string } }, citaId: string) {
  const cita = await db.cita.findUnique({
    where: { id: citaId },
    select: { usuarioId: true, psicologoId: true,
              psicologo: { select: { usuarioId: true } } },
  });
  if (!cita) return null;
  if (cita.usuarioId === session.user.id) return 'usuario';
  if (cita.psicologo.usuarioId === session.user.id) return 'psicologo';
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { citaId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const rol = await getRol(session as any, params.citaId);
  if (!rol) return Response.json({ error: 'No tienes acceso a esta cita' }, { status: 403 });

  const rolRemoto = rol === 'usuario' ? 'psicologo' : 'usuario';

  // Obtener señales no leídas del rol remoto
  const senales = await db.senalRTC.findMany({
    where: { citaId: params.citaId, desde: rolRemoto, leida: false },
    orderBy: { createdAt: 'asc' },
  });

  // Marcar como leídas
  if (senales.length > 0) {
    await db.senalRTC.updateMany({
      where: { id: { in: senales.map(s => s.id) } },
      data: { leida: true },
    });
  }

  return Response.json({ senales });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { citaId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const rol = await getRol(session as any, params.citaId);
  if (!rol) return Response.json({ error: 'No tienes acceso a esta cita' }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = SignalSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'Payload inválido' }, { status: 400 });

  await db.senalRTC.create({
    data: {
      citaId: params.citaId,
      desde:  rol,
      tipo:   parsed.data.tipo,
      payload: parsed.data.payload,
    },
  });

  // Limpiar señales leídas mayores a 10 minutos (housekeeping)
  const hace10min = new Date(Date.now() - 10 * 60 * 1000);
  await db.senalRTC.deleteMany({
    where: { citaId: params.citaId, leida: true, createdAt: { lt: hace10min } },
  });

  return Response.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { citaId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const rol = await getRol(session as any, params.citaId);
  if (!rol) return Response.json({ error: 'No tienes acceso a esta cita' }, { status: 403 });

  await db.senalRTC.deleteMany({ where: { citaId: params.citaId } });
  return Response.json({ ok: true });
}
