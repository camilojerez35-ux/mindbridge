/**
 * MindBridge — Protocolo de Crisis
 * Validado por Psicólogo Co-Fundador
 * Cumple: Ley 2460/2025, Resolución 2654/2019
 */

export type NivelCrisis = 'ninguno' | 'bajo' | 'moderado' | 'alto' | 'critico';

export interface EvaluacionCrisis {
  nivel: NivelCrisis;
  indicadores: string[];
  accionRequerida: string;
  recursos: RecursoCrisis[];
  escalarAPsicologo: boolean;
  registrarIncidente: boolean;
}

export interface RecursoCrisis {
  nombre: string;
  numero: string;
  descripcion: string;
  disponibilidad: string;
  gratuito: boolean;
}

// ────────────────────────────────────────────────────────────
// RECURSOS DE EMERGENCIA EN COLOMBIA (verificar vigencia mensualmente)
// ────────────────────────────────────────────────────────────
export const RECURSOS_CRISIS_COLOMBIA: RecursoCrisis[] = [
  {
    nombre: 'Línea 106 — Salud Mental Bogotá',
    numero: '106',
    descripcion: 'Línea de orientación en salud mental del Distrito. Profesionales disponibles.',
    disponibilidad: '24 horas, 7 días a la semana',
    gratuito: true,
  },
  {
    nombre: 'Línea Nacional de Salud Mental',
    numero: '800-1222-5555',
    descripcion: 'Línea nacional del Ministerio de Salud para orientación en salud mental.',
    disponibilidad: 'Horario extendido',
    gratuito: true,
  },
  {
    nombre: 'Emergencias Colombia',
    numero: '123',
    descripcion: 'Número único de emergencias. Para riesgo de vida inmediato.',
    disponibilidad: '24 horas, 7 días a la semana',
    gratuito: true,
  },
  {
    nombre: 'Cruz Roja Colombiana',
    numero: '132',
    descripcion: 'Atención de emergencias y apoyo psicosocial.',
    disponibilidad: '24 horas',
    gratuito: true,
  },
];

// ────────────────────────────────────────────────────────────
// INDICADORES DE CRISIS POR NIVEL
// ────────────────────────────────────────────────────────────

const INDICADORES_CRITICO = [
  'suicidio', 'quitarme la vida', 'no quiero vivir', 'no vale la pena vivir',
  'mejor muerto', 'mejor muerta', 'acabar con todo', 'hacerme daño',
  'tengo una pastillas', 'tengo un arma', 'voy a hacerlo',
  'me voy a matar', 'me quiero matar', 'pensando en el suicidio',
  'plan para morir', 'método para suicidarme', 'me corté', 'me quemé',
  'me lastimé', 'autolesión', 'me estoy haciendo daño',
];

const INDICADORES_ALTO = [
  'no puedo más', 'no aguanto más', 'todo sería mejor sin mí',
  'soy una carga', 'todos estarían mejor sin mí', 'no tiene sentido seguir',
  'quiero desaparecer', 'quisiera no despertar', 'estoy muy desesperado',
  'no veo salida', 'ya no importa nada', 'no hay esperanza',
  'pensamientos de hacerme daño', 'ideas de muerte',
];

const INDICADORES_MODERADO = [
  'estoy muy mal', 'siento que me hundo', 'no puedo dormir hace días',
  'no he comido', 'no salgo de la cama', 'lloro todo el tiempo',
  'estoy agotado emocionalmente', 'crisis de ansiedad', 'ataque de pánico',
  'disociación', 'me siento muy solo', 'nadie me entiende',
  'estoy desesperado', 'miedo constante',
];

// ────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL: Detectar nivel de crisis
// ────────────────────────────────────────────────────────────

export function detectarNivelCrisis(mensaje: string): EvaluacionCrisis {
  const msgLower = mensaje.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const indicadoresCriticosEncontrados = INDICADORES_CRITICO.filter(ind =>
    msgLower.includes(ind.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  );

  const indicadoresAltosEncontrados = INDICADORES_ALTO.filter(ind =>
    msgLower.includes(ind.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  );

  const indicadoresModeradosEncontrados = INDICADORES_MODERADO.filter(ind =>
    msgLower.includes(ind.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  );

  if (indicadoresCriticosEncontrados.length > 0) {
    return {
      nivel: 'critico',
      indicadores: indicadoresCriticosEncontrados,
      accionRequerida: 'ACTIVAR_PROTOCOLO_INMEDIATO',
      recursos: RECURSOS_CRISIS_COLOMBIA,
      escalarAPsicologo: true,
      registrarIncidente: true,
    };
  }

  // Cualquier indicador alto (ideación suicida, desesperanza severa) = nivel alto mínimo
  if (indicadoresAltosEncontrados.length > 0) {
    return {
      nivel: 'alto',
      indicadores: indicadoresAltosEncontrados,
      accionRequerida: 'MOSTRAR_RECURSOS_SUGERIR_PSICOLOGO',
      recursos: RECURSOS_CRISIS_COLOMBIA,
      escalarAPsicologo: true,
      registrarIncidente: true,
    };
  }

  if (indicadoresModeradosEncontrados.length >= 2) {
    return {
      nivel: 'moderado',
      indicadores: indicadoresModeradosEncontrados,
      accionRequerida: 'APOYO_REFORZADO_PROPONER_CITA',
      recursos: [RECURSOS_CRISIS_COLOMBIA[0]],
      escalarAPsicologo: false,
      registrarIncidente: false,
    };
  }

  if (indicadoresModeradosEncontrados.length === 1) {
    return {
      nivel: 'bajo',
      indicadores: indicadoresModeradosEncontrados,
      accionRequerida: 'APOYO_ESTANDAR',
      recursos: [],
      escalarAPsicologo: false,
      registrarIncidente: false,
    };
  }

  return {
    nivel: 'ninguno',
    indicadores: [],
    accionRequerida: 'SESION_NORMAL',
    recursos: [],
    escalarAPsicologo: false,
    registrarIncidente: false,
  };
}

// ────────────────────────────────────────────────────────────
// MENSAJE DE CRISIS ESTRUCTURADO
// ────────────────────────────────────────────────────────────

export function generarMensajeCrisis(nivel: NivelCrisis): string {
  if (nivel === 'critico') {
    return `Gracias por confiar en mí con algo tan importante. Lo que describes me preocupa profundamente, y quiero asegurarme de que estés seguro/a ahora mismo.

Por favor comunícate de inmediato con:
📞 **Línea 106** — Línea de Salud Mental de Bogotá (gratuita, 24 horas)
📞 **800-1222-5555** — Línea Nacional de Salud Mental (gratuita)
📞 **123** — Emergencias (si estás en peligro inmediato)

También puedes agendar ahora mismo una cita urgente con uno de nuestros psicólogos.

¿Puedes contarme si estás en un lugar seguro en este momento?`;
  }

  if (nivel === 'alto') {
    return `Lo que estás viviendo suena muy difícil, y me alegra que lo estés expresando. Quiero que sepas que no estás solo/a en esto.

Cuando las cosas se sienten tan pesadas, hablar con un profesional puede marcar una gran diferencia. Te invito a agendar una cita con uno de nuestros psicólogos hoy.

Si en algún momento sientes que necesitas apoyo inmediato, la **Línea 106** está disponible las 24 horas, de forma gratuita y confidencial.

¿Hay algo específico que te esté agobiando más ahora mismo?`;
  }

  return '';
}

// ────────────────────────────────────────────────────────────
// REGISTRO DE INCIDENTES (estructura para base de datos)
// ────────────────────────────────────────────────────────────

export interface IncidenteCrisis {
  usuarioId: string;
  sesionId: string;
  nivel: NivelCrisis;
  indicadoresDetectados: string[];
  fragmentoAnonimizado: string; // NUNCA el mensaje completo — ver anonimizarMensaje()
  timestampDeteccion: Date;
  protocoloActivado: boolean;
  psicologoNotificado: boolean;
  resolucion?: string;
}

// ────────────────────────────────────────────────────────────
// ANONIMIZACIÓN — Ley 1581/2012 (datos sensibles de salud)
// ────────────────────────────────────────────────────────────

const PATRON_EMAIL = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const PATRON_TELEFONO = /(\+57|57)?[\s\-]?3\d{2}[\s\-]?\d{3}[\s\-]?\d{4}/g;
const PATRON_CEDULA = /\b\d{8,10}\b/g;
const PATRON_NOMBRE_PROPIO = /\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}\b/g;

/**
 * Anonimiza un mensaje antes de guardarlo como incidente de crisis.
 * Elimina datos personales identificables según Ley 1581/2012.
 * Solo guarda los primeros 200 caracteres para análisis clínico agregado.
 */
export function anonimizarMensaje(mensaje: string): string {
  return mensaje
    .replace(PATRON_EMAIL, '[EMAIL]')
    .replace(PATRON_TELEFONO, '[TELEFONO]')
    .replace(PATRON_CEDULA, '[ID]')
    .replace(PATRON_NOMBRE_PROPIO, '[NOMBRE]')
    .slice(0, 200); // Limitar tamaño para análisis agregado
}
