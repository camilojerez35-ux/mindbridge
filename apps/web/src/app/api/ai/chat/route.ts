import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import Anthropic from '@anthropic-ai/sdk';
import {
  detectarNivelCrisis,
  generarMensajeCrisis,
  RECURSOS_CRISIS_COLOMBIA,
  anonimizarMensaje,
} from '@mindbridge/ai-clinical/protocols/crisis-protocol';
import { SYSTEM_PROMPT_CLINICAL } from '@mindbridge/ai-clinical/prompts/system-prompt';

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

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'No autorizado. Inicie sesión.' }, { status: 401 });
  }

  const dentroDelLimite = await checkRateLimit(session.user.id);
  if (!dentroDelLimite) {
    return Response.json(
      { error: 'Límite de mensajes alcanzado. Intenta de nuevo en un minuto.' },
      { status: 429 }
    );
  }

  try {
    const { mensaje, historial = [], sesionId } = await req.json();

    if (!mensaje?.trim()) {
      return Response.json({ error: 'Mensaje vacío' }, { status: 400 });
    }
    if (mensaje.length > 2000) {
      return Response.json({ error: 'El mensaje es demasiado largo (máximo 2000 caracteres).' }, { status: 400 });
    }

    // Detección de crisis usando el paquete clínico validado
    const evaluacion = detectarNivelCrisis(mensaje);

    // Registrar incidente si corresponde (async, no bloquea la respuesta)
    if (evaluacion.registrarIncidente) {
      registrarIncidenteAsync({
        usuarioId: session.user.id,
        sesionId: sesionId ?? 'sin-sesion',
        nivel: evaluacion.nivel,
        indicadoresDetectados: evaluacion.indicadores,
        fragmentoAnonimizado: anonimizarMensaje(mensaje),
        timestampDeteccion: new Date(),
        protocoloActivado: evaluacion.nivel === 'critico',
        psicologoNotificado: evaluacion.escalarAPsicologo,
      });
    }

    // Respuesta inmediata para crisis crítica — sin llamar a Claude
    if (evaluacion.nivel === 'critico') {
      return Response.json({
        respuesta: generarMensajeCrisis('critico'),
        crisis: true,
        nivel: 'critico',
        recursos: RECURSOS_CRISIS_COLOMBIA,
        accion: 'MOSTRAR_MODAL_CRISIS',
      });
    }

    if (!anthropic) {
      return Response.json({
        respuesta: `Entiendo cómo te sientes. ${evaluacion.nivel === 'alto' || evaluacion.nivel === 'moderado'
          ? 'Lo que describes suena muy difícil. No estás solo/a. ¿Te gustaría agendar una cita con uno de nuestros psicólogos?\n\nMientras tanto, l'
          : 'L'}a **Línea 106** está disponible las 24 horas si necesitas apoyo inmediato.\n\n_[Para activar la IA real, configura ANTHROPIC_API_KEY en tu .env.local]_\n\n¿Puedes contarme un poco más sobre cómo te has sentido?`,
        crisis: evaluacion.nivel !== 'ninguno',
        nivel: evaluacion.nivel,
        demo: true,
      });
    }

    // Enriquecer system prompt según nivel de malestar detectado
    let systemPrompt = SYSTEM_PROMPT_CLINICAL;
    if (evaluacion.nivel === 'alto') {
      systemPrompt += '\n\nCONTEXTO CLÍNICO: El usuario ha expresado señales de malestar significativo (nivel alto). Prioriza la validación emocional profunda, el apoyo contenedor y sugiere agendar una cita con un psicólogo al final de tu respuesta. Menciona la Línea 106 de forma natural.';
    } else if (evaluacion.nivel === 'moderado') {
      systemPrompt += '\n\nCONTEXTO CLÍNICO: El usuario muestra señales de malestar moderado. Aplica escucha activa y considera sugerir una técnica de regulación si es apropiado.';
    }

    const mensajesHistorial = historial
      .slice(-6)
      .map((m: any) => ({
        role: m.rol as 'user' | 'assistant',
        content: String(m.contenido).slice(0, 500),
      }));

    const mensajes = [
      ...mensajesHistorial,
      { role: 'user' as const, content: mensaje },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: mensajes,
    });

    const respuesta = response.content[0].type === 'text' ? response.content[0].text : '';

    return Response.json({
      respuesta,
      crisis: evaluacion.nivel !== 'ninguno',
      nivel: evaluacion.nivel,
      recursos: evaluacion.nivel === 'alto' ? RECURSOS_CRISIS_COLOMBIA.slice(0, 2) : [],
      tokensUsados: response.usage.input_tokens + response.usage.output_tokens,
    });

  } catch (error: any) {
    console.error('[CHAT API ERROR]', error);
    return Response.json({ error: 'Lo sentimos, ocurrió un error interno. Por favor, intenta de nuevo más tarde.' }, { status: 500 });
  }
}

// Registro async de incidentes — no bloquea la respuesta al usuario
async function registrarIncidenteAsync(incidente: {
  usuarioId: string;
  sesionId: string;
  nivel: string;
  indicadoresDetectados: string[];
  fragmentoAnonimizado: string;
  timestampDeteccion: Date;
  protocoloActivado: boolean;
  psicologoNotificado: boolean;
}) {
  try {
    const { db } = await import('@/lib/db/client');
    await db.incidenteCrisis.create({ data: incidente });
  } catch (error) {
    console.error('[INCIDENTE CRISIS] Error al registrar:', error);
  }
}
