export interface ContextoUsuario {
  nombre: string;
  perfilPersonalidad: Record<string, string>;
  entradasRecientes: { sentimientos: string[]; influidoPor: string[]; fecha: string }[];
  animoPromedio7Dias: number | null;
  temasChatRecientes: string[];
}

export interface ConsejoDelDia {
  categoria: string;
  icono: string;
  titulo: string;
  contenido: string;
  fecha: string;
}

const CATEGORIAS_CONSEJO = [
  { nombre: 'Equilibrio emocional', icono: '🎯' },
  { nombre: 'Autoconocimiento',     icono: '🪞' },
  { nombre: 'Salud en las relaciones', icono: '💗' },
  { nombre: 'Manejo del estrés',    icono: '🌿' },
  { nombre: 'Crecimiento personal', icono: '🌱' },
];

export function construirPromptConsejo(ctx: ContextoUsuario): string {
  const partes: string[] = [];

  partes.push(`Genera un "Consejo del día" personalizado para ${ctx.nombre}, un usuario de MindBridge (app de bienestar emocional en Colombia).`);

  if (Object.keys(ctx.perfilPersonalidad).length > 0) {
    partes.push(`\nPerfil de personalidad basado en autoevaluaciones completadas:`);
    Object.entries(ctx.perfilPersonalidad).forEach(([tag, resultado]) => {
      partes.push(`- ${tag}: ${resultado}`);
    });
  }

  if (ctx.entradasRecientes.length > 0) {
    partes.push(`\nEntradas recientes del diario:`);
    ctx.entradasRecientes.slice(0, 5).forEach(e => {
      partes.push(`- ${e.fecha}: sentimientos [${e.sentimientos.join(', ')}], influido por [${e.influidoPor.join(', ')}]`);
    });
  }

  if (ctx.animoPromedio7Dias !== null) {
    partes.push(`\nÁnimo promedio últimos 7 días: ${ctx.animoPromedio7Dias}/10`);
  }

  if (ctx.temasChatRecientes.length > 0) {
    partes.push(`\nTemas recurrentes en conversaciones recientes: ${ctx.temasChatRecientes.join(', ')}`);
  }

  partes.push(`
INSTRUCCIONES:
1. Elige UNA categoría de esta lista que mejor se ajuste al contexto: ${CATEGORIAS_CONSEJO.map(c => c.nombre).join(', ')}.
2. Crea un título corto y cálido (máximo 8 palabras) para el consejo.
3. Escribe 2-3 párrafos (150-250 palabras totales) dirigidos directamente a ${ctx.nombre} por su nombre, con tono cálido, validante y profesional.
4. Conecta el consejo con los datos disponibles del usuario de forma específica, no genérica.
5. Si no hay suficientes datos, da un consejo general de bienestar emocional cálido y útil.
6. Termina con una pequeña invitación a la acción (escribir en el diario, hacer un ejercicio, hablar con la IA).
7. NUNCA diagnostiques trastornos ni recomiendes medicamentos.

Responde ÚNICAMENTE en este formato JSON, sin texto adicional ni markdown:
{"categoria": "nombre de la categoría elegida", "titulo": "título del consejo", "contenido": "el texto del consejo en 2-3 párrafos"}`);

  return partes.join('\n');
}

export async function generarConsejoConIA(ctx: ContextoUsuario): Promise<ConsejoDelDia> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const hoy = new Date().toISOString().split('T')[0];

  if (!apiKey) return consejoDemo(ctx, hoy);

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{ role: 'user', content: construirPromptConsejo(ctx) }],
    });

    const texto = response.content[0].type === 'text' ? response.content[0].text : '';
    const limpio = texto.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(limpio);

    const categoriaInfo = CATEGORIAS_CONSEJO.find(c => c.nombre === parsed.categoria) ?? CATEGORIAS_CONSEJO[0];

    return {
      categoria: categoriaInfo.nombre,
      icono: categoriaInfo.icono,
      titulo: parsed.titulo,
      contenido: parsed.contenido,
      fecha: hoy,
    };
  } catch (error) {
    console.error('[CONSEJO IA ERROR]', error);
    return consejoDemo(ctx, hoy);
  }
}

function consejoDemo(ctx: ContextoUsuario, fecha: string): ConsejoDelDia {
  return {
    categoria: 'Equilibrio emocional',
    icono: '🎯',
    titulo: `Un momento para ti, ${ctx.nombre}`,
    contenido: `Hola ${ctx.nombre}, hoy es un buen día para hacer una pausa y preguntarte cómo te sientes realmente, sin prisa por responder.\n\nA veces avanzamos tanto en automático que perdemos contacto con nuestras propias emociones. Tomarte 5 minutos para escribir en tu diario o conversar con la IA sobre lo que tienes en mente puede ayudarte a procesar mejor tu día.\n\n¿Qué te parece si hoy le dedicas un momento a esto? No tiene que ser perfecto, solo honesto.`,
    fecha,
  };
}
