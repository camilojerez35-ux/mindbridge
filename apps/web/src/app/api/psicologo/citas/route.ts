/**
 * GET /api/psicologo/citas
 * Lista las citas del psicólogo autenticado.
 * Query params: estado, desde (ISO date), hasta (ISO date)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (session.user.rol !== 'PSICOLOGO') {
    return Response.json({ error: 'Acceso restringido a psicólogos' }, { status: 403 });
  }

  const psicologo = await db.psicologo.findUnique({
    where: { usuarioId: session.user.id },
    select: { id: true },
  });
  if (!psicologo) {
    return Response.json({ error: 'Perfil de psicólogo no encontrado' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const estado = searchParams.get('estado');
  const desde  = searchParams.get('desde');
  const hasta  = searchParams.get('hasta');

  const where: any = { psicologoId: psicologo.id };
  if (estado) where.estado = estado;
  if (desde || hasta) {
    where.fechaHora = {};
    if (desde) where.fechaHora.gte = new Date(desde);
    if (hasta) where.fechaHora.lte = new Date(hasta);
  }

  const citas = await db.cita.findMany({
    where,
    orderBy: { fechaHora: 'asc' },
    select: {
      id: true,
      fechaHora: true,
      duracionMinutos: true,
      estado: true,
      tipo: true,
      modalidad: true,
      montoPsicologoCOP: true,
      estadoPago: true,
      salaVideollamada: true,
      usuario: {
        select: { id: true, nombre: true, apellido: true, imagen: true },
      },
    },
  });

  return Response.json({ citas });
}
