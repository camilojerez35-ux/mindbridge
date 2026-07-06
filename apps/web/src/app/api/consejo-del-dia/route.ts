import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const CATEGORIAS = ['Respiración', 'Gratitud', 'Movimiento', 'Autocuidado', 'Ansiedad', 'Sueño', 'Conexión', 'Mindfulness', 'Emociones', 'Hábitos'];

export async function POST() {
  try {
    const categoria = CATEGORIAS[new Date().getDate() % CATEGORIAS.length];
    const dia = new Date().toLocaleDateString('es-CO', { weekday: 'long' });

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: `Genera UN consejo de bienestar mental breve para hoy ${dia}. Categoría: ${categoria}.
El consejo debe ser:
- Práctico y accionable (algo que se pueda hacer hoy)
- Entre 1-2 oraciones (máximo 40 palabras)
- Basado en evidencia (TCC, mindfulness o neurociencia)
- En español colombiano natural
- Sin emojis ni asteriscos

Responde SOLO con JSON: {"texto": "...", "categoria": "${categoria}"}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Respuesta inesperada');

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('JSON no encontrado');

    const data = JSON.parse(jsonMatch[0]);

    // Persistir en BD si hay sesión activa
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await db.consejoDiario.create({
        data: {
          usuarioId: session.user.id,
          categoria: data.categoria ?? categoria,
          contenido: data.texto,
        },
      }).catch(() => null); // no bloquear la respuesta si falla la persistencia
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'No se pudo generar el consejo' },
      { status: 500 }
    );
  }
}

// Calificar un consejo
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { consejoId, calificacion } = await req.json();
  if (!consejoId || typeof calificacion !== 'number' || calificacion < 1 || calificacion > 5) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const consejo = await db.consejoDiario.updateMany({
    where: { id: consejoId, usuarioId: session.user.id },
    data: { calificacion },
  });

  return NextResponse.json({ ok: true, updated: consejo.count });
}
