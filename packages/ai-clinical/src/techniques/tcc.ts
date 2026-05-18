/**
 * MindBridge — Técnicas de Terapia Cognitivo-Conductual (TCC)
 * Basado en Beck, A.T. (1979). Cognitive Therapy of Depression.
 */

export interface TecnicaTCC {
  nombre: string;
  descripcion: string;
  indicaciones: string[];
  contraindicaciones: string[];
  instruccionesIA: string;
  ejemploAplicacion: string;
}

export const TECNICAS_TCC: Record<string, TecnicaTCC> = {

  REESTRUCTURACION_COGNITIVA: {
    nombre: 'Reestructuración Cognitiva',
    descripcion: 'Identifica y cuestiona pensamientos automáticos negativos para generar alternativas más equilibradas.',
    indicaciones: ['ansiedad', 'depresión leve', 'rumiación', 'pensamientos catastróficos', 'baja autoestima'],
    contraindicaciones: ['crisis activa', 'psicosis', 'trauma severo reciente'],
    instruccionesIA: `Guía al usuario a través de estos pasos:
1. Identifica el pensamiento automático: "¿Qué pensamiento cruzó tu mente cuando te sentiste así?"
2. Evalúa la evidencia: "¿Qué evidencia tienes de que ese pensamiento es cierto? ¿Y en contra?"
3. Explora alternativas: "¿Hay otra forma de ver esta situación? ¿Qué le dirías a un amigo en tu lugar?"
4. Genera un pensamiento equilibrado: "¿Cómo podrías reformular ese pensamiento de forma más balanceada?"
Sé socrático — haz preguntas en vez de dar respuestas. No invalides el pensamiento original, ayuda a expandirlo.`,
    ejemploAplicacion: `Usuario: "Soy un fracasado, nada me sale bien."
IA: "Entiendo que te sientes así. Cuando dices que nada te sale bien, ¿podrías contarme qué pasó específicamente hoy que te llevó a ese pensamiento? A veces cuando estamos muy frustrados, nuestra mente generaliza situaciones puntuales a toda nuestra vida."`,
  },

  REGISTRO_PENSAMIENTOS: {
    nombre: 'Registro de Pensamientos (ABC)',
    descripcion: 'Modelo A (situación) → B (pensamiento) → C (emoción/conducta) para identificar patrones cognitivos.',
    indicaciones: ['ansiedad generalizada', 'depresión', 'problemas de conducta', 'autoconocimiento'],
    contraindicaciones: ['crisis aguda', 'estado disociativo'],
    instruccionesIA: `Explica el modelo ABC de forma simple:
A = Situación activadora ("¿Qué pasó exactamente?")
B = Creencia o pensamiento ("¿Qué pensaste en ese momento?")
C = Consecuencia emocional/conductual ("¿Cómo te sentiste? ¿Qué hiciste?")
Luego ayuda a identificar si B es un pensamiento distorsionado y cómo modificarlo.`,
    ejemploAplicacion: `"Vamos a explorar esto juntos. Cuéntame: ¿qué situación específica desencadenó esto (A)? ¿Qué pensaste en ese momento (B)? ¿Y cómo te sentiste o qué hiciste después (C)?"`,
  },

  EXPERIMENTO_CONDUCTUAL: {
    nombre: 'Experimento Conductual',
    descripcion: 'Prueba la validez de un pensamiento a través de una acción concreta y pequeña.',
    indicaciones: ['evitación', 'fobia social leve', 'ansiedad anticipatoria', 'procrastinación'],
    contraindicaciones: ['crisis activa', 'riesgo de seguridad'],
    instruccionesIA: `Ayuda al usuario a diseñar un experimento pequeño y seguro:
1. Identifica la predicción negativa: "¿Qué crees que pasará si haces X?"
2. Diseña el experimento: "¿Podrías intentar X en pequeña escala esta semana?"
3. Define cómo medirá el resultado: "¿Cómo sabrás si tu predicción fue correcta?"
4. Revisión posterior: "¿Qué pasó realmente? ¿Coincidió con lo que esperabas?"`,
    ejemploAplicacion: `"Mencionas que crees que si dices lo que piensas en el trabajo, todos te juzgarán. ¿Qué pasaría si esta semana compartes una opinión pequeña en una reunión? Podríamos explorar juntos si esa predicción se cumple."`,
  },

  ACTIVACION_CONDUCTUAL: {
    nombre: 'Activación Conductual',
    descripcion: 'Aumenta gradualmente las actividades que generan satisfacción o sentido de logro para combatir la inercia depresiva.',
    indicaciones: ['depresión leve-moderada', 'anhedonia', 'apatía', 'aislamiento social', 'procrastinación'],
    contraindicaciones: ['depresión severa sin apoyo profesional', 'crisis activa'],
    instruccionesIA: `Pasos para aplicar:
1. Explorar el estado actual: "¿Qué actividades disfrutabas antes que ahora ya no haces?"
2. Identificar pequeñas acciones posibles: "¿Qué es algo pequeño y concreto que podrías hacer hoy, aunque no tengas ganas?"
3. Planificar sin presión: "No se trata de sentirte bien primero para actuar — la acción viene antes que la motivación."
4. Celebrar logros pequeños: Valida cualquier avance, por mínimo que sea.
No exijas metas grandes. Una ducha, salir 5 minutos, llamar a alguien — todo cuenta.`,
    ejemploAplicacion: `"Cuando la depresión nos atrapa, esperamos sentir motivación para actuar, pero funciona al revés: actuar primero genera la motivación. ¿Hay una cosa muy pequeña — lo que sea — que podrías hacer hoy?"`,
  },
};

// ── Distorsiones cognitivas más comunes ──────────────────────
export const DISTORSIONES_COGNITIVAS = [
  { nombre: 'Pensamiento todo-o-nada', descripcion: 'Ver situaciones en blanco o negro, sin matices.', ejemplo: '"Si no soy perfecto, soy un fracaso."' },
  { nombre: 'Catastrofización', descripcion: 'Anticipar el peor resultado posible.', ejemplo: '"Cometí un error, me van a despedir."' },
  { nombre: 'Lectura mental', descripcion: 'Asumir que sabes lo que otros piensan.', ejemplo: '"Sé que me odian."' },
  { nombre: 'Personalización', descripcion: 'Atribuirse responsabilidad excesiva por eventos externos.', ejemplo: '"Si mis padres se divorciaron, es mi culpa."' },
  { nombre: 'Filtro mental', descripcion: 'Enfocarse solo en lo negativo ignorando lo positivo.', ejemplo: '"Tuve 9 respuestas buenas y 1 mala — fue un desastre."' },
  { nombre: 'Descalificación de lo positivo', descripcion: 'Restar importancia a los logros propios.', ejemplo: '"Me fue bien pero fue suerte."' },
  { nombre: 'Generalización excesiva', descripcion: 'Extraer conclusiones globales de eventos aislados.', ejemplo: '"Esto siempre me pasa a mí."' },
  { nombre: 'Afirmaciones "debería"', descripcion: 'Reglas rígidas sobre cómo deben ser las cosas.', ejemplo: '"Debería poder con todo sin pedir ayuda."' },
];

export function identificarDistorsion(pensamiento: string): string[] {
  const p = pensamiento.toLowerCase();
  const encontradas: string[] = [];

  if (p.includes('siempre') || p.includes('nunca') || p.includes('todo') || p.includes('nada')) {
    encontradas.push('Generalización excesiva / Pensamiento todo-o-nada');
  }
  if (p.includes('debería') || p.includes('tengo que') || p.includes('debo')) {
    encontradas.push('Afirmaciones "debería"');
  }
  if (p.includes('va a pasar') || p.includes('va a salir mal') || p.includes('será terrible')) {
    encontradas.push('Catastrofización');
  }
  if (p.includes('sé que') || p.includes('seguro que') || p.includes('me odian') || p.includes('me juzgan')) {
    encontradas.push('Lectura mental');
  }
  if (p.includes('es mi culpa') || p.includes('por mi culpa') || p.includes('yo hice que')) {
    encontradas.push('Personalización');
  }

  return encontradas;
}
