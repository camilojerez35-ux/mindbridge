import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { capturarErrorApi } from '@/lib/monitoring/sentry';

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const usuarioId = session.user.id;

    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    const [sesionesTotal, entradasTotal, entradasMes, estadosAnimo, usuario] = await Promise.all([
      db.sesionChat.count({ where: { usuarioId } }),
      db.entradaDiario.count({ where: { usuarioId } }),
      db.entradaDiario.count({ where: { usuarioId, createdAt: { gte: inicioMes } } }),
      db.entradaDiario.findMany({
        where: { usuarioId },
        select: { estadoAnimo: true },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      db.usuario.findUnique({
        where: { id: usuarioId },
        select: { createdAt: true },
      }),
    ]);

    const diasActivo = usuario
      ? Math.max(1, Math.ceil((ahora.getTime() - usuario.createdAt.getTime()) / (1000 * 60 * 60 * 24)))
      : 1;

    const animoPromedio = estadosAnimo.length > 0
      ? (estadosAnimo.reduce((acc, e) => acc + e.estadoAnimo, 0) / estadosAnimo.length).toFixed(1)
      : null;

    return Response.json({
      diasActivo,
      sesionesIA: sesionesTotal,
      entradasDiario: entradasTotal,
      entradasMes,
      animoPromedio,
    });

  } catch (error) {
    capturarErrorApi(error, { ruta: '/api/stats', metodo: 'GET' });
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}
