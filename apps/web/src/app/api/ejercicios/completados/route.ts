import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dias = Math.min(parseInt(searchParams.get('dias') || '30'), 365);
  const desde = new Date(Date.now() - dias * 86400000);

  const completados = await db.ejercicioCompletado.findMany({
    where: { usuarioId: session.user.id, completadoEn: { gte: desde } },
    orderBy: { completadoEn: 'desc' },
    select: { id: true, ejercicioId: true, titulo: true, categoria: true, duracionSeg: true, completadoEn: true },
  });

  // Conteo por ejercicio para los badges
  const conteo = completados.reduce<Record<string, number>>((acc, c) => {
    acc[c.ejercicioId] = (acc[c.ejercicioId] ?? 0) + 1;
    return acc;
  }, {});

  const totalMinutos = Math.round(completados.reduce((a, c) => a + c.duracionSeg, 0) / 60);

  return Response.json({ completados, conteo, totalMinutos, total: completados.length });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { ejercicioId, titulo, categoria, duracionSeg } = await req.json();

    if (!ejercicioId || !titulo || !categoria) {
      return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const registro = await db.ejercicioCompletado.create({
      data: {
        usuarioId: session.user.id,
        ejercicioId,
        titulo,
        categoria,
        duracionSeg: duracionSeg ?? 0,
      },
      select: { id: true, ejercicioId: true, completadoEn: true },
    });

    return Response.json({ exito: true, registro }, { status: 201 });
  } catch (error) {
    console.error('[EJERCICIOS ERROR]', error);
    return Response.json({ error: 'Error al registrar' }, { status: 500 });
  }
}
