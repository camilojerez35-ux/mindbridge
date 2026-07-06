import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth/get-auth-user';
import Anthropic from '@anthropic-ai/sdk';
import {
  detectarNivelCrisis,
  generarMensajeCrisis,
  RECURSOS_CRISIS_COLOMBIA,
  anonimizarMensaje,
} from '@mindbridge/ai-clinical/protocols/crisis-protocol';
import { SYSTEM_PROMPT_LITE } from '@mindbridge/ai-clinical/prompts/system-prompt';
import {
  registrarIncidente,
  registrarIncidenteAsync,
  type DatosIncidente,
} from '@/lib/crisis/incident-logger';

// Singleton — instanciado una vez por proceso, no por request
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// Rate limiter con Redis lazy
let redis: import('ioredis').Redis | null = null;

function getRedis(): import('ioredis').Redis | null {
  if (!process.env.REDIS_URL) return null;
  if (!redis) {
    const Redis = require('ioredis');
    redis = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    });
    redis!.on('error', () => { redis = null; });
  }
  return redis;
}

async function checkRateLimit(userId: string): Promise<boolean> {
  const client = getRedis();
  if (!client) return true;
  try {
    const key = `rate_limit:chat:${userId}`;
    const requests = await client.incr(key);
    if (requests === 1) await client.expire(key, 60);
    return requests <= 10;
  } catch {
    return true;
  }
}

/**
 * Carga el historial de mensajes desde BD — nunca desde el cliente.
 * El filtro doble (sesionId + usuarioId) garantiza propiedad y previene
 * inyección de prompts a través de mensajes de otras sesiones.
 */
async function cargarHistorialBD(
  sesionId: string | undefined,
  usuarioId: string,
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  if (!sesionId) return [];
  const { db } = await import('@/lib/db/client');
  const mensajes = await db.mensajeChat.findMany({
    where: {
      sesionId,
      usuarioId,
      rol: { in: ['user', 'assistant'] },
    },
    orderBy: { createdAt: 'desc' },
    take: 12,
    select: { rol: true, contenido: true },
  });
  return mensajes
    .reverse()
    .map(m => ({
      role: m.rol as 'user' | 'assistant',
      content: m.contenido.slice(0, 600),
    }));
}

async function cargarContextoUsuario(usuarioId: string): Promise<string> {
  try {
    const { db } = await import('@/lib/db/client');
    const hace7Dias = new Date(Date.now() - 7 * 86_400_000);

    const [usuario, animosRecientes, entradasRecientes] = await Promise.all([
      db.usuario.findUnique({
        where: { id: usuarioId },
        select: { nombre: true, motivoConsulta: true },
      }),
      db.registroAnimo.findMany({
        where: { usuarioId, fecha: { gte: hace7Dias } },
        orderBy: { fecha: 'desc' },
        take: 5,
        select: { valor: true, fecha: true },
      }),
      db.entradaDiario.findMany({
        where: { usuarioId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { emociones: true, sentimientos: true, createdAt: true },
      }),
    ]);

    const partes: string[] = [];

    if (usuario?.nombre) {
      partes.push(`Nombre del usuario: ${usuario.nombre}`);
    }
    if (usuario?.motivoConsulta) {
      partes.push(`Motivo de consulta inicial: ${usuario.motivoConsulta}`);
    }
    if (animosRecientes.length > 0) {
      const prom = (animosRecientes.reduce((a, r) => a + r.valor, 0) / animosRecientes.length).toFixed(1);
      const ultimo = animosRecientes[0].valor;
      partes.push(`Ánimo últimos 7 días: promedio ${prom}/10. Último registro: ${ultimo}/10.`);
    }
    if (entradasRecientes.length > 0) {
      const emociones = entradasRecientes
        .flatMap(e => [...((e.emociones as string[]) ?? []), ...((e.sentimientos as string[]) ?? [])])
        .filter(Boolean)
        .slice(0, 8);
      if (emociones.length > 0) {
        partes.push(`Emociones recientes registradas: ${emociones.join(', ')}.`);
      }
    }

    if (partes.length === 0) return '';
    return '\n\nCONTEXTO DEL USUARIO (usa esto para personalizar, no lo menciones directamente):\n' + partes.join('\n');
  } catch {
    return '';
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return Response.json({ error: 'No autorizado. Inicie sesión.' }, { status: 401 });
  }

  const dentroDelLimite = await checkRateLimit(user.id);
  if (!dentroDelLimite) {
    return Response.json(
      { error: 'Límite de mensajes alcanzado. Intenta de nuevo en un minuto.' },
      { status: 429 },
    );
  }

  try {
    // No se acepta historial del cliente — se carga desde BD (fix: prompt injection)
    const { mensaje, sesionId, contextoPractica } = await req.json();

    if (!mensaje?.trim()) {
      return Response.json({ error: 'Mensaje vacío' }, { status: 400 });
    }
    if (mensaje.length > 2000) {
      return Response.json(
        { error: 'El mensaje es demasiado largo (máximo 2000 caracteres).' },
        { status: 400 },
      );
    }

    const evaluacion = mensaje === '[INICIO_PRACTICA]'
      ? { nivel: 'ninguno' as const, indicadores: [], registrarIncidente: false, escalarAPsicologo: false }
      : detectarNivelCrisis(mensaje);

    const datosIncidente: DatosIncidente = {
      usuarioId: user.id,
      sesionId: sesionId ?? 'sin-sesion',
      nivel: evaluacion.nivel,
      indicadoresDetectados: evaluacion.indicadores,
      fragmentoAnonimizado: anonimizarMensaje(mensaje),
      timestampDeteccion: new Date(),
      protocoloActivado: evaluacion.nivel === 'critico' || evaluacion.nivel === 'alto',
      psicologoNotificado: evaluacion.escalarAPsicologo,
    };

    // CRITICO y ALTO: logging síncrono antes de responder — audit trail garantizado
    // MODERADO/BAJO: async, no bloquea la respuesta
    if (evaluacion.nivel === 'critico' || evaluacion.nivel === 'alto') {
      if (evaluacion.registrarIncidente) {
        await registrarIncidente(datosIncidente);
      }
    } else if (evaluacion.registrarIncidente) {
      registrarIncidenteAsync(datosIncidente);
    }

    // CRITICO: respuesta inmediata sin llamar a Claude
    if (evaluacion.nivel === 'critico') {
      return Response.json({
        respuesta: generarMensajeCrisis('critico'),
        crisis: true,
        nivel: 'critico',
        recursos: RECURSOS_CRISIS_COLOMBIA,
        accion: 'MOSTRAR_MODAL_CRISIS',
      });
    }

    // ALTO: respuesta hardcodeada sin llamar a Claude.
    // Ideación suicida o desesperanza severa no debe depender de un modelo externo.
    if (evaluacion.nivel === 'alto') {
      return Response.json({
        respuesta: generarMensajeCrisis('alto'),
        crisis: true,
        nivel: 'alto',
        recursos: RECURSOS_CRISIS_COLOMBIA.slice(0, 2),
        accion: 'MOSTRAR_RECURSOS',
      });
    }

    if (!anthropic) {
      return Response.json({
        respuesta: `Entiendo cómo te sientes. ${evaluacion.nivel === 'moderado'
          ? 'Lo que describes suena muy difícil. No estás solo/a. ¿Te gustaría agendar una cita con uno de nuestros psicólogos?\n\nMientras tanto, l'
          : 'L'}a **Línea 106** está disponible las 24 horas si necesitas apoyo inmediato.\n\n_[Para activar la IA real, configura ANTHROPIC_API_KEY en tu .env.local]_\n\n¿Puedes contarme un poco más sobre cómo te has sentido?`,
        crisis: evaluacion.nivel !== 'ninguno',
        nivel: evaluacion.nivel,
        demo: true,
      });
    }

    // Historial y contexto cargados desde BD — nunca desde el cliente
    const [mensajesHistorial, contextoUsuario] = await Promise.all([
      cargarHistorialBD(sesionId, user.id),
      cargarContextoUsuario(user.id),
    ]);

    let systemPrompt = SYSTEM_PROMPT_LITE + contextoUsuario;

    if (evaluacion.nivel === 'moderado') {
      systemPrompt += '\n\nALERTA CLÍNICA: El usuario muestra malestar moderado en este mensaje. Aplica escucha activa profunda. Valida primero, sin apresurarte a soluciones. Si el momento es oportuno, ofrece una técnica de regulación concreta paso a paso.';
    }
    if (evaluacion.nivel === 'bajo') {
      systemPrompt += '\n\nNOTA: Hay indicadores leves de malestar. Profundiza con curiosidad genuina antes de ofrecer recursos.';
    }
    if (contextoPractica) {
      const esInicioPractica = mensaje === '[INICIO_PRACTICA]';
      systemPrompt += `\n\nCONTEXTO DE PRÁCTICA GUIADA: ${contextoPractica}\n\n${
        esInicioPractica
          ? 'El usuario acaba de terminar la lección y quiere practicar. Salúdalo brevemente y haz la primera pregunta de práctica de forma directa y cálida.'
          : 'Adapta tu respuesta para acompañar esta práctica específica.'
      }`;
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
      system: systemPrompt,
      messages: [
        ...mensajesHistorial,
        { role: 'user', content: mensaje },
      ],
    });

    const respuesta = response.content[0].type === 'text' ? response.content[0].text : '';

    return Response.json({
      respuesta,
      crisis: evaluacion.nivel !== 'ninguno',
      nivel: evaluacion.nivel,
      recursos: evaluacion.nivel === 'moderado' ? RECURSOS_CRISIS_COLOMBIA.slice(0, 1) : [],
      tokensUsados: response.usage.input_tokens + response.usage.output_tokens,
    });

  } catch (error: any) {
    console.error('[CHAT API ERROR]', error);
    return Response.json(
      { error: 'Lo sentimos, ocurrió un error interno. Por favor, intenta de nuevo más tarde.' },
      { status: 500 },
    );
  }
}
