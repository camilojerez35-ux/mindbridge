import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { CATALOGO_TESTS, obtenerTestPorId } from '@/lib/tests/catalogo';
import { getAuthUser } from '@/lib/auth/get-auth-user';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const test = obtenerTestPorId(id);
    if (!test) return Response.json({ error: 'Test no encontrado' }, { status: 404 });
    return Response.json({ test });
  }

  const user = await getAuthUser(req);

  const completados = user?.id
    ? await db.resultadoTest.findMany({
        where: { usuarioId: user!.id },
        select: { testId: true, puntajeTotal: true, resultadoTitulo: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }).catch(() => [])
    : [];

  // Keep only the most recent result per test
  const completadosMap = new Map<string, typeof completados[number]>();
  for (const c of completados) {
    if (!completadosMap.has(c.testId)) completadosMap.set(c.testId, c);
  }

  const lista = CATALOGO_TESTS.map(t => ({
    id: t.id,
    categoria: t.categoria,
    titulo: t.titulo,
    descripcion: t.descripcion,
    icono: t.icono,
    color: t.color,
    duracionMin: t.duracionMin,
    numPreguntas: t.preguntas.length,
    completado: completadosMap.has(t.id),
    resultado: completadosMap.get(t.id) ?? null,
  }));

  return Response.json({
    tests: lista,
    completados: completadosMap.size,
    total: CATALOGO_TESTS.length,
  });
}
