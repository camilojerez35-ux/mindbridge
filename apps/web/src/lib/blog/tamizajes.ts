/**
 * Instrumentos de tamizaje (cribado) — PHQ-9 y GAD-7
 *
 * Texto: versión oficial en español de Pfizer (Spitzer, Williams, Kroenke y colegas).
 * "No se requiere permiso para reproducir, traducir, presentar o distribuir."
 * NO modificar la redacción de los ítems: alteraría la validez del instrumento.
 *
 * Privacidad: las respuestas se calculan solo en el navegador; no se guardan ni se envían.
 */

export type TamizajeId = 'phq9' | 'gad7';

export interface Banda {
  min: number;
  max: number;
  nivel: string;
  color: string;
  mensaje: string;
}

export interface Tamizaje {
  id: TamizajeId;
  nombre: string;
  mide: string;
  instruccion: string;
  opciones: string[];
  items: string[];
  bandas: Banda[];
  /** Índice del ítem que, con cualquier valor > 0, dispara la alerta de crisis */
  itemRiesgo?: number;
  notaValidacion: string;
  fuentes: { titulo: string; url: string }[];
}

const OPCIONES = ['Ningún día', 'Varios días', 'Más de la mitad de los días', 'Casi todos los días'];

export const TAMIZAJES: Record<TamizajeId, Tamizaje> = {
  phq9: {
    id: 'phq9',
    nombre: 'PHQ-9',
    mide: 'síntomas de depresión',
    instruccion: 'Durante las últimas 2 semanas, ¿qué tan seguido ha tenido molestias debido a los siguientes problemas?',
    opciones: OPCIONES,
    items: [
      'Poco interés o placer en hacer cosas',
      'Se ha sentido decaído(a), deprimido(a) o sin esperanzas',
      'Ha tenido dificultad para quedarse o permanecer dormido(a), o ha dormido demasiado',
      'Se ha sentido cansado(a) o con poca energía',
      'Sin apetito o ha comido en exceso',
      'Se ha sentido mal con usted mismo(a) – o que es un fracaso o que ha quedado mal con usted mismo(a) o con su familia',
      'Ha tenido dificultad para concentrarse en ciertas actividades, tales como leer el periódico o ver la televisión',
      '¿Se ha movido o hablado tan lento que otras personas podrían haberlo notado? o lo contrario – muy inquieto(a) o agitado(a) que ha estado moviéndose mucho más de lo normal',
      'Pensamientos de que estaría mejor muerto(a) o de lastimarse de alguna manera',
    ],
    itemRiesgo: 8,
    bandas: [
      { min: 0,  max: 4,  nivel: 'Síntomas mínimos',             color: '#4ade80', mensaje: 'Tus respuestas no sugieren síntomas depresivos importantes en este momento. Si algo te preocupa, igual puedes consultar.' },
      { min: 5,  max: 9,  nivel: 'Síntomas leves',               color: '#fbbf24', mensaje: 'Hay algunos síntomas. En un estudio colombiano en atención primaria, un puntaje de 7 o más ya justificó una evaluación profesional. Si estás en ese rango o los síntomas persisten, vale la pena consultar.' },
      { min: 10, max: 14, nivel: 'Síntomas moderados',           color: '#fb923c', mensaje: 'Se recomienda una evaluación con un profesional de salud mental. Es un buen momento para pedir cita.' },
      { min: 15, max: 19, nivel: 'Síntomas moderadamente graves', color: '#f87171', mensaje: 'Se recomienda una evaluación profesional pronto. No tienes que esperar a sentirte peor para pedir ayuda.' },
      { min: 20, max: 27, nivel: 'Síntomas graves',              color: '#ef4444', mensaje: 'Te recomendamos buscar atención profesional lo antes posible. Si sientes que no puedes mantenerte a salvo, usa las líneas de crisis.' },
    ],
    notaValidacion:
      'El PHQ-9 fue validado en Colombia en adultos de atención primaria en Bucaramanga (Revista Colombiana de Psiquiatría, 2021), con un punto de corte óptimo de 7 o más. Los rangos de severidad corresponden al estudio original de Kroenke y colaboradores (2001).',
    fuentes: [
      { titulo: 'Validez del PHQ-9 para cribado de depresión en adultos de Atención Primaria en Bucaramanga, Colombia', url: 'https://www.elsevier.es/es-revista-revista-colombiana-psiquiatria-379-articulo-validez-del-cuestionario-salud-del-S003474501930071X' },
      { titulo: 'PHQ Screeners (Pfizer) — instrumentos oficiales', url: 'https://www.phqscreeners.com' },
    ],
  },
  gad7: {
    id: 'gad7',
    nombre: 'GAD-7',
    mide: 'síntomas de ansiedad',
    instruccion: 'Durante las últimas 2 semanas, ¿qué tan seguido ha tenido molestias debido a los siguientes problemas?',
    opciones: OPCIONES,
    items: [
      'Se ha sentido nervioso(a), ansioso(a) o con los nervios de punta',
      'No ha sido capaz de parar o controlar su preocupación',
      'Se ha preocupado demasiado por motivos diferentes',
      'Ha tenido dificultad para relajarse',
      'Se ha sentido tan inquieto(a) que no ha podido quedarse quieto(a)',
      'Se ha molestado o irritado fácilmente',
      'Ha tenido miedo de que algo terrible fuera a pasar',
    ],
    bandas: [
      { min: 0,  max: 4,  nivel: 'Ansiedad mínima',  color: '#4ade80', mensaje: 'Tus respuestas no sugieren síntomas de ansiedad importantes en este momento.' },
      { min: 5,  max: 9,  nivel: 'Ansiedad leve',    color: '#fbbf24', mensaje: 'Hay algunos síntomas. Vigila cómo evolucionan; técnicas de respiración, ejercicio y buen sueño pueden ayudar. Si persisten o aumentan, consulta.' },
      { min: 10, max: 14, nivel: 'Ansiedad moderada', color: '#fb923c', mensaje: 'Un puntaje de 10 o más es el punto de corte habitual para recomendar una evaluación profesional. Es un buen momento para pedir cita.' },
      { min: 15, max: 21, nivel: 'Ansiedad grave',   color: '#f87171', mensaje: 'Se recomienda una evaluación profesional pronto. La ansiedad tiene tratamientos eficaces, como la terapia cognitivo-conductual.' },
    ],
    notaValidacion:
      'Los rangos y el punto de corte de 10 provienen del estudio original de Spitzer y colaboradores (2006). En Colombia, el GAD-7 mostró buena validez de constructo y confiabilidad en médicos durante la pandemia (Revista Colombiana de Psiquiatría).',
    fuentes: [
      { titulo: 'Escala GAD-7 en profesionales médicos colombianos: validez de constructo y confiabilidad', url: 'http://www.scielo.org.co/scielo.php?script=sci_arttext&pid=S0034-74502023000300245' },
      { titulo: 'PHQ Screeners (Pfizer) — instrumentos oficiales', url: 'https://www.phqscreeners.com' },
    ],
  },
};

export function bandaPara(t: Tamizaje, puntaje: number): Banda {
  return t.bandas.find(b => puntaje >= b.min && puntaje <= b.max) ?? t.bandas[t.bandas.length - 1];
}
