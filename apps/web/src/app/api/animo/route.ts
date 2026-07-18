import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { detectarNivelCrisis } from '@mindbridge/ai-clinical/protocols/crisis-protocol';
import { registrarIncidente, registrarIncidenteAsync } from '@/lib/crisis/incident-logger';
import { notificarPsicologoAsignado } from '@/lib/crisis/notificar-psicologo';
import { getAuthUser } from '@/lib/auth/get-auth-user';
import crypto from 'crypto';

const AnimoSchema = z.object({
  valor:    z.number().int().min(1).max(10),
  fecha:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  nota:     z.string().max(280).optional(),
  contexto: z.string().max(50).optional(),
  emociones: z.array(z.string()).max(10).default([]),
});

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return Response.json({ error: 'No autorizado. Inicie sesión.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dias = Math.min(parseInt(searchParams.get('dias') || '30'), 365);
  const desde = new Date(Date.now() - dias * 86400000);

  try {
    const registros = await db.registroAnimo.findMany({
      where: {
        usuarioId: user.id,
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
  } catch {
    return Response.json({
      registros: [],
      estadisticas: { promedio: 0, total: 0, mejor: 0, peor: 0 },
    });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return Response.json({ error: 'No autorizado. Inicie sesión.' }, { status: 401 });
  }

  try {
    const parsed = AnimoSchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: 'Datos inválidos', detalles: parsed.error.issues }, { status: 400 });
    }
    const { valor, fecha, nota, contexto, emociones } = parsed.data;

    let nivelCrisisAnimo: 'ALTO' | 'MODERADO' | null = null;
    if (valor === 1) nivelCrisisAnimo = 'ALTO';
    else if (valor === 2) nivelCrisisAnimo = 'MODERADO';

    if (!nivelCrisisAnimo && nota) {
      const evaluacion = detectarNivelCrisis(nota);
      if (evaluacion.nivel === 'critico' || evaluacion.nivel === 'alto') nivelCrisisAnimo = 'ALTO';
      else if (evaluacion.nivel === 'moderado') nivelCrisisAnimo = 'MODERADO';
    }

    if (nivelCrisisAnimo === 'ALTO') {
      const tokenConfirmacion = crypto.randomBytes(32).toString('hex');
      const fragmento = nota ? nota.slice(0, 200) : `Ánimo registrado: ${valor}/10`;
      await registrarIncidente({
        usuarioId: user.id,
        sesionId:  `animo-${user.id}-${Date.now()}`,
        nivel:     nivelCrisisAnimo,
        indicadoresDetectados: [`valor_animo=${valor}`],
        fragmentoAnonimizado:  fragmento,
        timestampDeteccion:    new Date(),
        protocoloActivado:     true,
        psicologoNotificado:   true,
        tokenConfirmacion,
      });
      await notificarPsicologoAsignado(user.id, 'ALTO', fragmento, 'animo', tokenConfirmacion);
    } else if (nivelCrisisAnimo === 'MODERADO') {
      registrarIncidenteAsync({
        usuarioId: user.id,
        sesionId:  `animo-${user.id}-${Date.now()}`,
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
        usuarioId: user.id,
        valor,
        emociones,
        nota:     nota ?? null,
        contexto: contexto ?? null,
        ...(fecha ? { fecha: new Date(fecha + 'T12:00:00') } : {}),
      },
      select: { id: true, valor: true, emociones: true, nota: true, fecha: true },
    });

    return Response.json({ exito: true, registro }, { status: 201 });
  } catch (error) {
    console.error('[ANIMO ERROR]', error);
    return Response.json({ error: 'Error al registrar el ánimo' }, { status: 500 });
  }
}
