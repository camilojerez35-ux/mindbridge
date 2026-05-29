import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { detectarNivelCrisis } from '@mindbridge/ai-clinical/protocols/crisis-protocol';
import { registrarIncidente, registrarIncidenteAsync } from '@/lib/crisis/incident-logger';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'No autorizado. Inicie sesión.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dias = Math.min(parseInt(searchParams.get('dias') || '30'), 365);
  const desde = new Date(Date.now() - dias * 86400000);

  const registros = await db.registroAnimo.findMany({
    where: {
      usuarioId: session.user.id,
      fecha: { gte: desde },
    },
    orderBy: { fecha: 'desc' },
    select: { id: true, valor: true, emociones: true, nota: true, contexto: true, fecha: true },
  });

  const valores = registros.map(r => r.valor);
  const promedio = valores.length
    ? parseFloat((valores.reduce((a, v) => a + v, 0) / valores.length).toFixed(1))
    : 0;

  return Response.json({
    registros,
    estadisticas: {
      promedio,
      total: registros.length,
      mejor: valores.length ? Math.max(...valores) : 0,
      peor: valores.length ? Math.min(...valores) : 0,
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'No autorizado. Inicie sesión.' }, { status: 401 });
  }

  try {
    const { valor, emociones = [], nota, contexto } = await req.json();

    if (!valor || valor < 1 || valor > 10) {
      return Response.json({ error: 'Valor debe estar entre 1 y 10' }, { status: 400 });
    }

    // Detección de crisis por valor de ánimo bajo
    // valor=1 → ALTO, valor=2 → MODERADO
    let nivelCrisisAnimo: 'ALTO' | 'MODERADO' | null = null;
    if (valor === 1) nivelCrisisAnimo = 'ALTO';
    else if (valor === 2) nivelCrisisAnimo = 'MODERADO';

    // Si hay nota de texto, también analizarla
    if (!nivelCrisisAnimo && nota) {
      const evaluacion = detectarNivelCrisis(nota);
      if (evaluacion.nivel === 'critico' || evaluacion.nivel === 'alto') nivelCrisisAnimo = 'ALTO';
      else if (evaluacion.nivel === 'moderado') nivelCrisisAnimo = 'MODERADO';
    }

    if (nivelCrisisAnimo === 'ALTO') {
      await registrarIncidente({
        usuarioId: session.user.id,
        sesionId:  `animo-${session.user.id}-${Date.now()}`,
        nivel:     nivelCrisisAnimo,
        indicadoresDetectados: [`valor_animo=${valor}`],
        fragmentoAnonimizado:  nota ? nota.slice(0, 200) : `Ánimo registrado: ${valor}/10`,
        timestampDeteccion:    new Date(),
        protocoloActivado:     true,
        psicologoNotificado:   false,
      });
    } else if (nivelCrisisAnimo === 'MODERADO') {
      registrarIncidenteAsync({
        usuarioId: session.user.id,
        sesionId:  `animo-${session.user.id}-${Date.now()}`,
        nivel:     nivelCrisisAnimo,
        indicadoresDetectados: [`valor_animo=${valor}`],
        fragmentoAnonimizado:  nota ? nota.slice(0, 200) : `Ánimo registrado: ${valor}/10`,
        timestampDeteccion:    new Date(),
        protocoloActivado:     true,
        psicologoNotificado:   false,
      });
    }

    const registro = await db.registroAnimo.create({
      data: {
        usuarioId: session.user.id,
        valor,
        emociones,
        nota: nota ?? null,
        contexto: contexto ?? null,
      },
      select: { id: true, valor: true, emociones: true, nota: true, fecha: true },
    });

    return Response.json({ exito: true, registro }, { status: 201 });
  } catch (error) {
    console.error('[ANIMO ERROR]', error);
    return Response.json({ error: 'Error al registrar el ánimo' }, { status: 500 });
  }
}
