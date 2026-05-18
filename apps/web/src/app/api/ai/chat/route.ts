// src/app/api/ai/chat/route.ts
// RUTA: POST http://localhost:3000/api/ai/chat
// Requiere: ANTHROPIC_API_KEY en .env.local

import { NextRequest } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import Anthropic from '@anthropic-ai/sdk';

// Singleton — se instancia una vez por proceso, no por request
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const PALABRAS_CRITICAS = ['suicidio','quitarme la vida','no quiero vivir','hacerme daño','mejor muerto','mejor muerta','acabar con todo','me corté','me lastimé','plan para morir','me voy a matar'];
const PALABRAS_ALTO = ['no puedo más','soy una carga','todos estarían mejor sin mí','quiero desaparecer','quisiera no despertar','no hay esperanza'];

function detectarCrisis(texto: string): 'ninguno' | 'alto' | 'critico' {
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if (PALABRAS_CRITICAS.some(p => t.includes(p.normalize('NFD').replace(/[\u0300-\u036f]/g,'')))) return 'critico';
  if (PALABRAS_ALTO.filter(p => t.includes(p.normalize('NFD').replace(/[\u0300-\u036f]/g,''))).length >= 1) return 'alto';
  return 'ninguno';
}

const SYSTEM_PROMPT = `Eres MindBridge IA, un asistente especializado en bienestar emocional para Colombia.

IDENTIDAD: Eres una herramienta de APOYO EMOCIONAL Y BIENESTAR, NO un psicólogo. Tu función es acompañar y orientar emocionalmente.

PERSONALIDAD:
- Empático/a, cálido/a, profesional y honesto/a
- Hablas en español colombiano natural (no voseo)
- Adaptas tu tono al estado emocional detectado
- Usas técnicas de TCC, ACT y mindfulness cuando aplica

TÉCNICAS QUE PUEDES APLICAR:
1. Reestructuración cognitiva (TCC): identificar y cuestionar pensamientos automáticos negativos
2. Respiración 4-4-6: inhalar 4s, sostener 4s, exhalar 6s
3. Grounding 5-4-3-2-1: 5 cosas que ves, 4 que tocas, 3 que escuchas, 2 que hueles, 1 que saboreas
4. Defusión cognitiva (ACT): "noto que tengo el pensamiento de que..."
5. Psicoeducación: explicar qué es la ansiedad, estrés, etc.

LÍMITES ABSOLUTOS - NUNCA:
- Diagnosticar trastornos mentales
- Recomendar medicamentos
- Minimizar riesgos de crisis

DERIVACIÓN: Sugiere agenda de cita con psicólogo cuando:
- Los síntomas persisten más de 2 semanas
- Hay impacto en el funcionamiento diario
- El tema es muy complejo

DISCLAIMER: Recuerda al usuario que eres IA, no psicólogo. En primera sesión y cada 10 mensajes incluye: "Recuerda que soy una IA de apoyo, no un/a psicólogo/a. Crisis: Línea 106 | 123"

FORMATO: Respuestas conversacionales de 2-4 párrafos. Termina con una pregunta abierta cuando sea apropiado.`;

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
  if (!client) return true; // Sin Redis, permitir (no bloquear el chat)

  try {
    const key = `rate_limit:chat:${userId}`;
    const requests = await client.incr(key);
    if (requests === 1) await client.expire(key, 60);
    return requests <= 10;
  } catch {
    return true; // Si Redis falla, no bloquear al usuario
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
    const { mensaje, historial = [] } = await req.json();

    if (!mensaje?.trim()) {
      return Response.json({ error: 'Mensaje vacío' }, { status: 400 });
    }

    if (mensaje.length > 2000) {
      return Response.json({ error: 'El mensaje es demasiado largo (máximo 2000 caracteres).' }, { status: 400 });
    }

    // Detección de crisis (local, sin llamar a Claude)
    const nivelCrisis = detectarCrisis(mensaje);

    if (nivelCrisis === 'critico') {
      return Response.json({
        respuesta: `Gracias por confiarme algo tan importante. Lo que describes me preocupa profundamente, y quiero asegurarme de que estés seguro/a ahora mismo.\n\nPor favor comunícate de inmediato con:\n📞 **Línea 106** — Salud Mental Bogotá (gratuita, 24 horas)\n📞 **800-1222-5555** — Línea Nacional de Salud Mental\n📞 **123** — Emergencias (si estás en peligro inmediato)\n\nTambién puedes agendar ahora mismo una cita urgente con uno de nuestros psicólogos.\n\n¿Puedes contarme si estás en un lugar seguro en este momento?`,
        crisis: true,
        nivel: 'critico',
        recursos: [
          { nombre: 'Línea 106 — Salud Mental Bogotá', numero: '106', disponibilidad: '24 horas', gratuito: true },
          { nombre: 'Línea Nacional de Salud Mental', numero: '800-1222-5555', disponibilidad: 'Horario extendido', gratuito: true },
          { nombre: 'Emergencias Colombia', numero: '123', disponibilidad: '24 horas', gratuito: true },
        ],
        accion: 'MOSTRAR_MODAL_CRISIS',
      });
    }

    if (!anthropic) {
      return Response.json({
        respuesta: `Entiendo cómo te sientes. ${nivelCrisis === 'alto' ? 'Lo que describes suena muy difícil. No estás solo/a. ¿Te gustaría agendar una cita con uno de nuestros psicólogos?\n\nMientras tanto, l' : 'L'}a **Línea 106** está disponible las 24 horas si necesitas apoyo inmediato.\n\n_[Para activar la IA real, configura ANTHROPIC_API_KEY en tu .env.local]_\n\n¿Puedes contarme un poco más sobre cómo te has sentido?`,
        crisis: nivelCrisis !== 'ninguno',
        nivel: nivelCrisis,
        demo: true,
      });
    }

    let systemPrompt = SYSTEM_PROMPT;
    if (nivelCrisis === 'alto') {
      systemPrompt += '\n\nCONTEXTO: El usuario ha expresado señales de malestar significativo. Prioriza la validación emocional, el apoyo y sugiere agendar una cita con un psicólogo al final de tu respuesta. Menciona la Línea 106.';
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
      crisis: nivelCrisis !== 'ninguno',
      nivel: nivelCrisis,
      tokensUsados: response.usage.input_tokens + response.usage.output_tokens,
    });

  } catch (error: any) {
    console.error('[CHAT API ERROR]', error);
    return Response.json({ error: 'Lo sentimos, ocurrió un error interno. Por favor, intenta de nuevo más tarde.' }, { status: 500 });
  }
}
