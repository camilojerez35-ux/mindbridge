/**
 * GET /api/psicologo/notificaciones
 * Devuelve citas PENDIENTE de las próximas 48 h que el psicólogo aún no ha confirmado.
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (session.user.rol !== 'PSICOLOGO') {
    return Response.json({ notificaciones: [] });
  }

  const psicologo = await db.psicologo.findUnique({
    where: { usuarioId: session.user.id },
    select: { id: true },
  });
  if (!psicologo) return Response.json({ notificaciones: [] });

  const ahora  = new Date();
  const limite = new Date(ahora.getTime() + 48 * 60 * 60 * 1000);

  const citas = await db.cita.findMany({
    where: {
      psicologoId: psicologo.id,
      estado: 'PENDIENTE',
      fechaHora: { gte: ahora, lte: limite },
    },
    orderBy: { fechaHora: 'asc' },
    select: {
      id: true,
      fechaHora: true,
      tipo: true,
      usuario: { select: { nombre: true, apellido: true } },
    },
  });

  const notificaciones = citas.map(c => ({
    id: c.id,
    tipo: 'CITA_PENDIENTE' as const,
    mensaje: `Cita con ${c.usuario.nombre ?? ''} ${c.usuario.apellido ?? ''} — ${new Date(c.fechaHora).toLocaleString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`,
    citaId: c.id,
    fechaHora: c.fechaHora,
    tipoCita: c.tipo,
  }));

  return Response.json({ notificaciones });
}
