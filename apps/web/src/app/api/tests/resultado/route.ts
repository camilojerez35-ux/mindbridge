import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { obtenerTestPorId, obtenerResultado, calcularPuntajeMaximo } from '@/lib/tests/catalogo';
import { getAuthUser } from '@/lib/auth/get-auth-user';

const ResultadoSchema = z.object({
  testId: z.string(),
  respuestas: z.record(z.string(), z.number().min(1).max(5)),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ResultadoSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const { testId, respuestas } = parsed.data;
    const test = obtenerTestPorId(testId);
    if (!test) return Response.json({ error: 'Test no encontrado' }, { status: 404 });

    const faltantes = test.preguntas.map(p => p.id).filter(id => !(id in respuestas));
    if (faltantes.length > 0) {
      return Response.json({ error: 'Faltan respuestas', faltantes }, { status: 400 });
    }

    const puntajeTotal = Object.values(respuestas).reduce((sum, v) => sum + v, 0);
    const puntajeMaximo = calcularPuntajeMaximo(test);
    const resultadoFinal = obtenerResultado(test, puntajeTotal);

    await db.resultadoTest.create({
      data: {
        usuarioId:            user.id,
        testId,
        respuestas,
        puntajeTotal,
        resultadoTitulo:      resultadoFinal.titulo,
        resultadoDescripcion: resultadoFinal.descripcion,
      },
    });

    // Merge tag into AI personalisation profile (datos JSON field)
    const perfilExistente = await db.perfilPersonalizacion.findUnique({
      where: { usuarioId: user.id },
      select: { datos: true },
    });

    const datosActuales = (perfilExistente?.datos ?? {}) as Record<string, string>;
    const nuevosDatos: Record<string, string> = { ...datosActuales, [test.tagPerfil]: resultadoFinal.titulo };

    await db.perfilPersonalizacion.upsert({
      where:  { usuarioId: user.id },
      update: { datos: nuevosDatos as object },
      create: { usuarioId: user.id, tagPerfil: test.tagPerfil, datos: nuevosDatos as object },
    });

    return Response.json({
      exito: true,
      resultado: {
        titulo:       resultadoFinal.titulo,
        descripcion:  resultadoFinal.descripcion,
        puntajeTotal,
        puntajeMaximo,
        porcentaje:   Math.round((puntajeTotal / puntajeMaximo) * 100),
      },
    });

  } catch (error) {
    console.error('[TEST RESULTADO ERROR]', error);
    return Response.json({ error: 'Error guardando resultado' }, { status: 500 });
  }
}
