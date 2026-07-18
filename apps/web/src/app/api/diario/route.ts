import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { detectarNivelCrisis } from '@mindbridge/ai-clinical/protocols/crisis-protocol';
import { registrarIncidente, registrarIncidenteAsync } from '@/lib/crisis/incident-logger';
import { notificarPsicologoAsignado } from '@/lib/crisis/notificar-psicologo';
import { encryption } from '@/lib/encryption';
import { getAuthUser } from '@/lib/auth/get-auth-user';
import crypto from 'crypto';

const EntradaSchema = z.object({
  contenido:    z.string().min(1).max(5000),
  titulo:       z.string().max(100).optional(),
  animo:        z.number().int().min(1).max(10).default(5),
  sentimientos: z.array(z.string()).max(5).default([]),
  influidoPor:  z.array(z.string()).max(5).default([]),
  emociones:    z.array(z.string()).max(5).default([]),
  etiquetas:    z.array(z.string()).max(5).default([]),
});

/** Elimina patrones de PII antes de guardar el fragmento clínico. */
function anonimizarFragmento(texto: string): string {
  return texto
    .slice(0, 200)
    .replace(/\b[A-Z][a-záéíóúüñ]+(?:\s+[A-Z][a-záéíóúüñ]+){1,3}\b/g, '[NOMBRE]')
    .replace(/\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/gi, '[EMAIL]')
    .replace(/\b(?:\+57[\s-]?)?\d{7,10}\b/g, '[TELEFONO]')
    .replace(/\b\d{6,11}\b/g, '[ID]');
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return Response.json({ error: 'No autorizado. Inicie sesión.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limite = Math.min(parseInt(searchParams.get('limite') || '10'), 50);
  const pagina = Math.max(parseInt(searchParams.get('pagina') || '1'), 1);

  try {
    const [entradas, total] = await Promise.all([
      db.entradaDiario.findMany({
        where: { usuarioId: user.id },
        orderBy: { createdAt: 'desc' },
        skip: (pagina - 1) * limite,
        take: limite,
        select: {
          id: true,
          estadoAnimo: true,
          emociones: true,
          etiquetas: true,
          sentimientos: true,
          influidoPor: true,
          analisisIA: true,
          esFavorito: true,
          createdAt: true,
        },
      }),
      db.entradaDiario.count({ where: { usuarioId: user.id } }),
    ]);

    return Response.json({
      entradas: entradas.map(e => ({
        id: e.id,
        animo: e.estadoAnimo,
        emociones: e.emociones,
        etiquetas: e.etiquetas,
        analisisIA: e.analisisIA,
        esFavorita: e.esFavorito,
        esPrivada: false,
        contenido: '',
        creadaEn: e.createdAt,
      })),
      paginacion: { total, pagina, limite, totalPaginas: Math.ceil(total / limite) },
    });
  } catch {
    return Response.json({
      entradas: [],
      paginacion: { total: 0, pagina, limite, totalPaginas: 0 },
    });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return Response.json({ error: 'No autorizado. Inicie sesión.' }, { status: 401 });
  }

  try {
    const parsed = EntradaSchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: 'Datos inválidos', detalles: parsed.error.issues }, { status: 400 });
    }
    const { contenido, animo, titulo, sentimientos, influidoPor, emociones, etiquetas } = parsed.data;

    // Límite plan GRATIS: 1 entrada por día
    if (user.plan === 'GRATIS') {
      const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
      const entradasHoy = await db.entradaDiario.count({
        where: { usuarioId: user.id, createdAt: { gte: hoy } },
      });
      if (entradasHoy >= 1) {
        return Response.json({ error: 'Límite diario alcanzado en el plan gratuito. Mejora a Plus para entradas ilimitadas.' }, { status: 403 });
      }
    }

    // Detección de crisis en el contenido del diario
    const evaluacionCrisis = detectarNivelCrisis(contenido);
    const nivelCrisis = evaluacionCrisis.nivel;

    if (nivelCrisis === 'critico' || nivelCrisis === 'alto') {
      const tokenConfirmacion = crypto.randomBytes(32).toString('hex');
      const fragmento = anonimizarFragmento(contenido);
      await registrarIncidente({
        usuarioId: user.id,
        sesionId:  `diario-${user.id}-${Date.now()}`,
        nivel:     nivelCrisis.toUpperCase(),
        indicadoresDetectados: evaluacionCrisis.indicadores,
        fragmentoAnonimizado:  fragmento,
        timestampDeteccion:    new Date(),
        protocoloActivado:     true,
        psicologoNotificado:   true,
        tokenConfirmacion,
      });
      const nivelNotificacion = nivelCrisis === 'critico' ? 'CRITICO' : 'ALTO';
      await notificarPsicologoAsignado(user.id, nivelNotificacion, fragmento, 'diario', tokenConfirmacion);
    } else if (nivelCrisis === 'moderado') {
      registrarIncidenteAsync({
        usuarioId: user.id,
        sesionId:  `diario-${user.id}-${Date.now()}`,
        nivel:     'MODERADO',
        indicadoresDetectados: evaluacionCrisis.indicadores,
        fragmentoAnonimizado:  anonimizarFragmento(contenido),
        timestampDeteccion:    new Date(),
        protocoloActivado:     true,
        psicologoNotificado:   false,
      });
    }

    let analisisIA = 'Entrada registrada. ';
    if (animo >= 7) analisisIA += 'Tu ánimo está en un rango positivo hoy. ¡Sigue así!';
    else if (animo >= 4) analisisIA += 'Día regular. Considera hacer un ejercicio de respiración.';
    else analisisIA += 'Parece un día difícil. ¿Has considerado hablar con un psicólogo?';

    const entrada = await db.entradaDiario.create({
      data: {
        usuarioId: user.id,
        contenido: encryption.encrypt(contenido),
        estadoAnimo: animo,
        emociones,
        etiquetas,
        sentimientos,
        influidoPor,
        analisisIA,
      },
      select: { id: true, estadoAnimo: true, emociones: true, etiquetas: true, analisisIA: true, createdAt: true },
    });

    return Response.json({ exito: true, entrada }, { status: 201 });
  } catch (error) {
    console.error('[DIARIO ERROR]', error);
    return Response.json({ error: 'Error al guardar la entrada' }, { status: 500 });
  }
}
