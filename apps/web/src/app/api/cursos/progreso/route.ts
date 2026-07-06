import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { CATALOGO_CURSOS } from '@/lib/cursos/catalogo';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  const progreso = await db.progresoCurso.findMany({
    where: { usuarioId: session.user.id },
    select: { cursoId: true, itemsCompletados: true },
  }).catch(() => []);

  const progresoMap: Record<string, string[]> = {};
  for (const p of progreso) progresoMap[p.cursoId] = p.itemsCompletados;

  const cursos = CATALOGO_CURSOS.map(curso => {
    const completados = progresoMap[curso.id] ?? [];
    return {
      id:              curso.id,
      categoria:       curso.categoria,
      titulo:          curso.titulo,
      descripcion:     curso.descripcion,
      icono:           curso.icono,
      color:           curso.color,
      totalItems:      curso.items.length,
      itemsCompletados: completados,
      porcentaje:      Math.round((completados.length / curso.items.length) * 100),
    };
  });

  return Response.json({ cursos });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { cursoId, itemId } = await req.json();
    if (!cursoId || !itemId) {
      return Response.json({ error: 'cursoId e itemId son requeridos' }, { status: 400 });
    }

    // Fetch current state to avoid duplicates (String[] doesn't deduplicate on push)
    const existente = await db.progresoCurso.findUnique({
      where: { usuarioId_cursoId: { usuarioId: session.user.id, cursoId } },
      select: { itemsCompletados: true },
    });

    if (existente?.itemsCompletados.includes(itemId)) {
      return Response.json({ exito: true, nuevo: false });
    }

    await db.progresoCurso.upsert({
      where:  { usuarioId_cursoId: { usuarioId: session.user.id, cursoId } },
      update: { itemsCompletados: { push: itemId } },
      create: { usuarioId: session.user.id, cursoId, itemsCompletados: [itemId] },
    });

    return Response.json({ exito: true, nuevo: true });
  } catch (error) {
    console.error('[CURSO PROGRESO ERROR]', error);
    return Response.json({ error: 'Error guardando progreso' }, { status: 500 });
  }
}
