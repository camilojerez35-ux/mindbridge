import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const usuarioId = session.user.id;
  const semana = getISOWeek(new Date());

  // Retornar resumen cacheado si existe
  const existente = await db.resumenSemanal.findUnique({
    where: { usuarioId_semana: { usuarioId, semana } },
  });
  if (existente) return Response.json({ resumen: existente });

  // Recolectar datos de la semana
  const ahora = new Date();
  const inicioSemana = new Date(ahora);
  inicioSemana.setDate(ahora.getDate() - 6);
  inicioSemana.setHours(0, 0, 0, 0);

  const [entradas, registrosAnimo, ejercicios, sesiones] = await Promise.all([
    db.entradaDiario.findMany({
      where: { usuarioId, createdAt: { gte: inicioSemana } },
      select: { estadoAnimo: true, emociones: true, sentimientos: true, analisisIA: true, createdAt: true },
    }),
    db.registroAnimo.findMany({
      where: { usuarioId, fecha: { gte: inicioSemana } },
      select: { valor: true, emociones: true, fecha: true },
    }),
    db.ejercicioCompletado.findMany({
      where: { usuarioId, completadoEn: { gte: inicioSemana } },
      select: { titulo: true, categoria: true, duracionSeg: true },
    }),
    db.sesionChat.count({ where: { usuarioId, createdAt: { gte: inicioSemana } } }),
  ]);

  const todosAnimo = [
    ...entradas.map(e => e.estadoAnimo),
    ...registrosAnimo.map(r => r.valor),
  ];
  const animoPromedio = todosAnimo.length
    ? parseFloat((todosAnimo.reduce((a, v) => a + v, 0) / todosAnimo.length).toFixed(1))
    : null;

  const todasEmociones = [
    ...entradas.flatMap(e => [...e.emociones, ...e.sentimientos]),
    ...registrosAnimo.flatMap(r => r.emociones),
  ];
  const conteoEmociones: Record<string, number> = {};
  todasEmociones.forEach(e => { conteoEmociones[e] = (conteoEmociones[e] ?? 0) + 1; });
  const patronesPrincipales = Object.entries(conteoEmociones)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([e]) => e);

  // Si no hay datos, no generar resumen
  if (entradas.length === 0 && registrosAnimo.length === 0 && ejercicios.length === 0) {
    return Response.json({ resumen: null, sinDatos: true });
  }

  // Generar resumen con IA
  let contenido = 'Esta semana registraste actividad en la plataforma. Sigue así.';

  if (anthropic) {
    try {
      const prompt = `Eres un asistente de bienestar emocional. Genera un resumen semanal personalizado, cálido y motivador para el usuario basado en sus datos de esta semana.

DATOS DE LA SEMANA:
- Entradas en el diario: ${entradas.length}
- Registros de ánimo: ${registrosAnimo.length}
- Ánimo promedio: ${animoPromedio ?? 'sin datos'}/10
- Ejercicios completados: ${ejercicios.length} (${ejercicios.map(e => e.titulo).join(', ') || 'ninguno'})
- Sesiones de chat con IA: ${sesiones}
- Emociones más frecuentes: ${patronesPrincipales.join(', ') || 'no registradas'}

El resumen debe:
1. Reconocer el esfuerzo de la semana (sin importar cuánto sea)
2. Destacar un patrón o logro específico
3. Dar una sugerencia concreta y accionable para la próxima semana
4. Ser en español colombiano, cálido pero directo
5. Máximo 3 párrafos cortos

NO uses asteriscos para negrita. NO uses emojis en exceso. Sé honesto/a pero siempre con perspectiva esperanzadora.`;

      const resp = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      });
      contenido = resp.content[0].type === 'text' ? resp.content[0].text : contenido;
    } catch {
      // Fallback sin IA
    }
  }

  // Guardar y retornar
  const resumen = await db.resumenSemanal.upsert({
    where: { usuarioId_semana: { usuarioId, semana } },
    create: {
      usuarioId,
      semana,
      contenido,
      animoPromedio,
      totalEntradas:   entradas.length,
      totalEjercicios: ejercicios.length,
      totalSesiones:   sesiones,
      patronesPrincipales,
    },
    update: { contenido, animoPromedio, totalEntradas: entradas.length, totalEjercicios: ejercicios.length, totalSesiones: sesiones, patronesPrincipales },
  });

  return Response.json({ resumen });
}
