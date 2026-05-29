/**
 * PATCH /api/psicologo/citas/[id]
 * El psicólogo confirma o cancela una cita propia.
 * Body: { accion: 'CONFIRMAR' | 'CANCELAR' }
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { z } from 'zod';

const Schema = z.object({
  accion: z.enum(['CONFIRMAR', 'CANCELAR']),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (session.user.rol !== 'PSICOLOGO') {
    return Response.json({ error: 'Acceso restringido a psicólogos' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Acción inválida. Usa CONFIRMAR o CANCELAR.' }, { status: 400 });
  }

  const psicologo = await db.psicologo.findUnique({
    where: { usuarioId: session.user.id },
    select: { id: true },
  });
  if (!psicologo) {
    return Response.json({ error: 'Perfil de psicólogo no encontrado' }, { status: 404 });
  }

  const cita = await db.cita.findUnique({
    where: { id: params.id },
    select: { id: true, psicologoId: true, estado: true, fechaHora: true,
              usuario: { select: { nombre: true, apellido: true } } },
  });

  if (!cita) {
    return Response.json({ error: 'Cita no encontrada' }, { status: 404 });
  }
  if (cita.psicologoId !== psicologo.id) {
    return Response.json({ error: 'Esta cita no pertenece a tu perfil' }, { status: 403 });
  }
  if (cita.estado !== 'PENDIENTE') {
    return Response.json({ error: `No se puede modificar una cita en estado ${cita.estado}` }, { status: 409 });
  }

  const nuevoEstado = parsed.data.accion === 'CONFIRMAR' ? 'CONFIRMADA' : 'CANCELADA_PSICOLOGO';

  const citaActualizada = await db.cita.update({
    where: { id: params.id },
    data: { estado: nuevoEstado },
    select: { id: true, estado: true, fechaHora: true },
  });

  return Response.json({ cita: citaActualizada, mensaje: parsed.data.accion === 'CONFIRMAR' ? 'Cita confirmada' : 'Cita cancelada' });
}
