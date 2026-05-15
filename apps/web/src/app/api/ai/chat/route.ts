/**
 * MindBridge — API Route: Chat con IA Clínica
 * POST /api/ai/chat
 *
 * Flujo:
 * 1. Validar autenticación y suscripción
 * 2. Detectar nivel de crisis en el mensaje
 * 3. Si hay crisis crítica → activar protocolo y no llamar a Claude
 * 4. Si no hay crisis → llamar a Claude API con system prompt clínico
 * 5. Guardar mensaje en base de datos (cumplimiento legal)
 * 6. Retornar respuesta con streaming
 */

import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { detectarNivelCrisis, generarMensajeCrisis, RECURSOS_CRISIS_COLOMBIA } from '@mindbridge/ai-clinical/protocols/crisis-protocol';
import { SYSTEM_PROMPT_CLINICAL, DISCLAIMER_IA } from '@mindbridge/ai-clinical/prompts/system-prompt';
import { verificarLimiteSesiones } from '@/lib/auth/subscription';
import { registrarIncidente } from '@/lib/crisis/incident-logger';
import { z } from 'zod';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Esquema de validación del request
const ChatRequestSchema = z.object({
  mensaje: z.string().min(1).max(2000),
  sesionId: z.string().uuid().optional(),
  historial: z.array(z.object({
    rol: z.enum(['user', 'assistant']),
    contenido: z.string().max(4000),
  })).max(20).optional().default([]),
});

export async function POST(req: NextRequest) {
  try {
    // ── 1. Autenticación ──────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const usuarioId = session.user.id;

    // ── 2. Validar body ───────────────────────────────────────────
    const body = await req.json();
    const parseResult = ChatRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json({ error: 'Datos inválidos', detalles: parseResult.error.issues }, { status: 400 });
    }

    const { mensaje, historial, sesionId } = parseResult.data;

    // ── 3. Verificar límite de sesiones según plan ────────────────
    const limitOk = await verificarLimiteSesiones(usuarioId);
    if (!limitOk) {
      return Response.json({
        error: 'Límite de sesiones alcanzado',
        mensaje: 'Has alcanzado el límite de tu plan actual. Actualiza a Plus para sesiones ilimitadas.',
        accion: 'UPGRADE_PLAN',
      }, { status: 429 });
    }

    // ── 4. Detectar crisis ANTES de llamar a Claude ───────────────
    const evaluacionCrisis = detectarNivelCrisis(mensaje);

    // Registrar incidente si aplica
    if (evaluacionCrisis.registrarIncidente) {
      await registrarIncidente({
        usuarioId,
        sesionId: sesionId || 'nueva-sesion',
        nivel: evaluacionCrisis.nivel,
        indicadoresDetectados: evaluacionCrisis.indicadores,
        mensajeUsuario: mensaje.substring(0, 100) + '...', // Solo fragmento por privacidad
        timestampDeteccion: new Date(),
        protocoloActivado: evaluacionCrisis.nivel === 'critico',
        psicologoNotificado: evaluacionCrisis.escalarAPsicologo,
      });
    }

    // Crisis crítica: responder directamente sin Claude
    if (evaluacionCrisis.nivel === 'critico') {
      const mensajeCrisis = generarMensajeCrisis('critico');

      // Guardar en base de datos
      await db.mensajeChat.create({
        data: {
          usuarioId,
          sesionId: sesionId || null,
          rol: 'assistant',
          contenido: mensajeCrisis,
          esCrisis: true,
          nivelCrisis: 'CRITICO',
          createdAt: new Date(),
        },
      });

      return Response.json({
        respuesta: mensajeCrisis,
        crisis: true,
        nivel: 'critico',
        recursos: RECURSOS_CRISIS_COLOMBIA,
        accion: 'MOSTRAR_MODAL_CRISIS',
      });
    }

    // ── 5. Construir mensajes para Claude ─────────────────────────
    const mensajesParaClaude: Anthropic.MessageParam[] = [
      // Historial previo de la sesión
      ...historial.map(msg => ({
        role: msg.rol as 'user' | 'assistant',
        content: msg.contenido,
      })),
      // Mensaje actual del usuario
      { role: 'user', content: mensaje },
    ];

    // Agregar contexto de crisis moderada/alta al system prompt si aplica
    let systemPrompt = SYSTEM_PROMPT_CLINICAL;
    if (evaluacionCrisis.nivel === 'alto' || evaluacionCrisis.nivel === 'moderado') {
      systemPrompt += `\n\nCONTEXTO ADICIONAL PARA ESTA RESPUESTA: El usuario ha expresado indicadores de malestar significativo (${evaluacionCrisis.indicadores.join(', ')}). Prioriza la validación emocional, el apoyo y sugiere agendar una cita con un psicólogo al final de tu respuesta.`;
    }

    // Incluir disclaimer cada 10 mensajes (calcular por sesionId)
    const contadorSesion = historial.length;
    const incluirDisclaimer = contadorSesion === 0 || contadorSesion % 10 === 0;

    // ── 6. Llamada a Claude API con streaming ─────────────────────
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: mensajesParaClaude,
    });

    // ── 7. Streaming response ─────────────────────────────────────
    const encoder = new TextEncoder();
    let respuestaCompleta = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const chunk = event.delta.text;
              respuestaCompleta += chunk;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
            }
          }

          // Agregar disclaimer si corresponde
          if (incluirDisclaimer) {
            const disclaimerChunk = `\n\n---\n_${DISCLAIMER_IA}_`;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: disclaimerChunk })}\n\n`));
            respuestaCompleta += disclaimerChunk;
          }

          // Señal de fin
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, crisis: evaluacionCrisis.nivel !== 'ninguno', nivelCrisis: evaluacionCrisis.nivel })}\n\n`));

          // Guardar respuesta completa en DB (async, no bloquear)
          db.mensajeChat.create({
            data: {
              usuarioId,
              sesionId: sesionId || null,
              rol: 'assistant',
              contenido: respuestaCompleta,
              esCrisis: evaluacionCrisis.nivel !== 'ninguno',
              nivelCrisis: evaluacionCrisis.nivel.toUpperCase(),
              modeloIA: 'claude-sonnet-4-20250514',
              tokensUsados: respuestaCompleta.length,
              createdAt: new Date(),
            },
          }).catch(console.error);

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('[CHAT API ERROR]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
