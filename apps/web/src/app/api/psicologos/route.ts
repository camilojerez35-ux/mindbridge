import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { rateLimits } from '@/lib/rate-limit';
import { capturarErrorApi } from '@/lib/monitoring/sentry';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'local';
    const { allowed } = await rateLimits.psicologos(ip);
    if (!allowed) {
      return Response.json({ error: 'Demasiadas solicitudes. Intenta más tarde.' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const especialidad = searchParams.get('especialidad');
    const pagina = Math.max(parseInt(searchParams.get('pagina') ?? '1'), 1);
    const limite = Math.min(parseInt(searchParams.get('limite') ?? '20'), 50);

    const psicologos = await db.psicologo.findMany({
      where: {
        activo: true,
        estado: { in: ['VERIFICADO', 'ACTIVO'] },
        ...(especialidad ? { especialidades: { has: especialidad } } : {}),
      },
      select: {
        id: true,
        nombreCompleto: true,
        especialidades: true,
        anosExperiencia: true,
        tarifaCOP: true,
        calificacionPromedio: true,
        fotoUrl: true,
        bio: true,
        idiomas: true,
        modalidad: true,
        ciudades: true,
        enfoqueTerapeutico: true,
      },
      orderBy: { calificacionPromedio: 'desc' },
      skip: (pagina - 1) * limite,
      take: limite,
    });

    const total = await db.psicologo.count({
      where: {
        activo: true,
        estado: { in: ['VERIFICADO', 'ACTIVO'] },
        ...(especialidad ? { especialidades: { has: especialidad } } : {}),
      },
    });

    return Response.json({
      psicologos,
      paginacion: { total, pagina, limite, totalPaginas: Math.ceil(total / limite) },
    });
  } catch (error) {
    capturarErrorApi(error, { ruta: '/api/psicologos', metodo: 'GET' });
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}
