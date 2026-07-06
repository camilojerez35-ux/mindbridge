import { db } from '@/lib/db/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const usuarioId = session.user.id;
  const ahora = new Date();

  const [ultimaDiario, ultimoAnimo, ultimoEjercicio, proximaCita] = await Promise.all([
    db.entradaDiario.findFirst({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
    db.registroAnimo.findFirst({
      where: { usuarioId },
      orderBy: { fecha: 'desc' },
      select: { fecha: true },
    }),
    db.ejercicioCompletado.findFirst({
      where: { usuarioId },
      orderBy: { completadoEn: 'desc' },
      select: { completadoEn: true },
    }),
    db.cita.findFirst({
      where: {
        usuarioId,
        estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
        fechaHora: { gte: ahora },
      },
      orderBy: { fechaHora: 'asc' },
      select: { fechaHora: true, modalidad: true },
    }),
  ]);

  const diasSinDiario = ultimaDiario
    ? Math.floor((ahora.getTime() - ultimaDiario.createdAt.getTime()) / 86_400_000)
    : null;
  const diasSinAnimo = ultimoAnimo
    ? Math.floor((ahora.getTime() - ultimoAnimo.fecha.getTime()) / 86_400_000)
    : null;
  const diasSinEjercicio = ultimoEjercicio
    ? Math.floor((ahora.getTime() - ultimoEjercicio.completadoEn.getTime()) / 86_400_000)
    : null;
  const horasParaCita = proximaCita
    ? Math.round((proximaCita.fechaHora.getTime() - ahora.getTime()) / 3_600_000)
    : null;

  return Response.json({
    diasSinDiario,
    diasSinAnimo,
    diasSinEjercicio,
    proximaCita: proximaCita ? { fechaHora: proximaCita.fechaHora, horasRestantes: horasParaCita } : null,
  });
}
