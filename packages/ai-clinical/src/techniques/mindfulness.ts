/**
 * MindBridge — Técnicas de Mindfulness y Regulación
 * Basado en Kabat-Zinn, J. (1990). Full Catastrophe Living. y MBSR/MBCT.
 */

export interface TecnicaMindfulness {
  nombre: string;
  duracion: string;
  nivel: 'principiante' | 'intermedio' | 'avanzado';
  indicaciones: string[];
  contraindicaciones: string[];
  instruccionesIA: string;
}

export const TECNICAS_MINDFULNESS: Record<string, TecnicaMindfulness> = {

  RESPIRACION_DIAFRAGMATICA: {
    nombre: 'Respiración Diafragmática 4-4-6',
    duracion: '2-5 minutos',
    nivel: 'principiante',
    indicaciones: ['ansiedad aguda', 'estrés', 'ataques de pánico', 'antes de dormir', 'antes de situaciones difíciles'],
    contraindicaciones: ['hiperventilación activa — en ese caso solo exhalar lentamente'],
    instruccionesIA: `Guía la respiración paso a paso en tiempo real:

"Vamos a hacer una respiración juntos. Puedes hacerlo donde estés.

Primero, pon una mano en tu abdomen — si puedes.

Ahora:
🫁 Inhala por la nariz contando 1... 2... 3... 4...
⏸️ Sostén suavemente: 1... 2... 3... 4...
💨 Exhala lentamente por la boca: 1... 2... 3... 4... 5... 6...

La exhalación más larga activa el sistema nervioso parasimpático — tu freno natural del estrés.

¿Hacemos 3 ciclos juntos?"

Adapta el ritmo si el usuario siente mareo — reduce a 3-3-5.`,
  },

  GROUNDING_54321: {
    nombre: 'Grounding 5-4-3-2-1 (Anclaje Sensorial)',
    duracion: '3-5 minutos',
    nivel: 'principiante',
    indicaciones: ['ataques de pánico', 'disociación leve', 'flashbacks leves', 'ansiedad intensa', 'desconexión de la realidad'],
    contraindicaciones: ['trauma severo en procesamiento activo sin guía profesional'],
    instruccionesIA: `Guía al usuario a través de los 5 sentidos para anclarse al presente:

"Vamos a usar tus sentidos para traerte al momento presente. Tómate tu tiempo con cada uno.

👁️ 5 cosas que puedes VER ahora mismo — dímelas (o nómbralas mentalmente).
✋ 4 cosas que puedes TOCAR — siente la textura, temperatura, peso.
👂 3 cosas que puedes ESCUCHAR — incluso sonidos que normalmente ignoras.
👃 2 cosas que puedes OLER — si no hay olor claro, recuerda uno que te guste.
👅 1 cosa que puedes SABOREAR — o el sabor que tengas en la boca ahora.

Después de cada sentido, pregunta: ¿Cómo te sientes ahora comparado con hace un momento?"`,
  },

  ESCANEO_CORPORAL: {
    nombre: 'Escaneo Corporal',
    duracion: '5-10 minutos',
    nivel: 'principiante',
    indicaciones: ['estrés crónico', 'tensión física', 'desconexión mente-cuerpo', 'insomnio', 'ansiedad sostenida'],
    contraindicaciones: ['trauma somático severo sin apoyo profesional'],
    instruccionesIA: `Guía un recorrido de atención por el cuerpo de pies a cabeza:

"Vamos a hacer un recorrido por tu cuerpo, prestando atención sin juzgar. Solo observar.

Cierra los ojos si puedes, o baja la mirada.

Empieza por los pies: ¿qué sensaciones notas? Temperatura, tensión, contacto con el suelo...
Sube por las pantorrillas y rodillas... muslos... abdomen (¿cómo es tu respiración ahora?)... pecho... hombros... cuello... y finalmente la cara.

En cada área: si notas tensión, no luches contra ella. Simplemente obsérvala y al exhalar, imagina que le das un poco más de espacio.

¿Hay alguna zona donde notes más tensión o incomodidad?"`,
  },

  ATENCION_PLENA_ACTIVIDAD: {
    nombre: 'Mindfulness en Actividad Cotidiana',
    duracion: '5-20 minutos',
    nivel: 'principiante',
    indicaciones: ['estrés por multitarea', 'mente dispersa', 'dificultad para disfrutar el presente', 'inicio de práctica mindfulness'],
    contraindicaciones: [],
    instruccionesIA: `Enseña mindfulness informal — en actividades diarias:

"No necesitas meditar formalmente para practicar mindfulness. Puedes hacerlo en cualquier actividad.

Por ejemplo, lavando los platos: siente el agua, la temperatura, el jabón, el peso de cada plato.
Comiendo: mastica despacio, nota los sabores, texturas, olores antes de tragar.
Caminando: siente cada paso, el contacto del pie con el suelo, el movimiento de los brazos.

El objetivo no es sentirse bien — es estar presente. La mente vagará (siempre lo hace). Cada vez que notes que se fue y la traes de vuelta, eso ES la práctica."`,
  },

  RESPIRACION_CAJA: {
    nombre: 'Respiración en Caja (Box Breathing)',
    duracion: '2-4 minutos',
    nivel: 'principiante',
    indicaciones: ['estrés agudo', 'antes de presentaciones o eventos', 'regulación rápida del sistema nervioso'],
    contraindicaciones: [],
    instruccionesIA: `Técnica usada por equipos de fuerzas especiales para regular el sistema nervioso:

"4 lados de una caja, 4 segundos cada uno:

📦 Inhala: 1... 2... 3... 4
📦 Sostén: 1... 2... 3... 4
📦 Exhala: 1... 2... 3... 4
📦 Sostén vacío: 1... 2... 3... 4

Repite 4 veces. Simple, pero muy efectivo para recuperar el control en momentos de estrés intenso."`,
  },

  OBSERVACION_PENSAMIENTOS: {
    nombre: 'Meditación de Observación de Pensamientos',
    duracion: '5-10 minutos',
    nivel: 'intermedio',
    indicaciones: ['rumiación', 'pensamientos intrusivos', 'ansiedad cognitiva', 'práctica contemplativa'],
    contraindicaciones: ['pensamientos suicidas activos — usar grounding primero'],
    instruccionesIA: `Introduce la observación de pensamientos sin engancharse:

"Siéntate cómodamente. Cierra los ojos.

Imagina que tu mente es el cielo y tus pensamientos son nubes que pasan.
No tienes que seguirlas, ni empujarlas, ni analizarlas.
Solo observa cómo aparecen y desaparecen.

Cuando notes que te has enganchado a un pensamiento (lo sabrás porque dejaste de observar y empezaste a pensar EN él), simplemente nota: 'me enganche' y vuelve a la posición de observador.

No es un fracaso engancharse — es parte del ejercicio. Engancharse y volver ES la práctica."`,
  },
};

// ── Selector de técnica según estado emocional ──────────────
export function seleccionarTecnica(estadoEmocional: string): string[] {
  const estado = estadoEmocional.toLowerCase();
  const recomendadas: string[] = [];

  if (estado.includes('pánico') || estado.includes('panico') || estado.includes('crisis')) {
    recomendadas.push('GROUNDING_54321', 'RESPIRACION_DIAFRAGMATICA');
  } else if (estado.includes('ansios') || estado.includes('nervios') || estado.includes('estres') || estado.includes('estrés')) {
    recomendadas.push('RESPIRACION_DIAFRAGMATICA', 'RESPIRACION_CAJA', 'GROUNDING_54321');
  } else if (estado.includes('triste') || estado.includes('deprim') || estado.includes('vací') || estado.includes('vacio')) {
    recomendadas.push('ESCANEO_CORPORAL', 'ATENCION_PLENA_ACTIVIDAD');
  } else if (estado.includes('rumia') || estado.includes('pensamiento') || estado.includes('no puedo parar de pensar')) {
    recomendadas.push('OBSERVACION_PENSAMIENTOS', 'RESPIRACION_DIAFRAGMATICA');
  } else if (estado.includes('tenso') || estado.includes('tension') || estado.includes('tensión')) {
    recomendadas.push('ESCANEO_CORPORAL', 'RESPIRACION_DIAFRAGMATICA');
  } else {
    recomendadas.push('RESPIRACION_DIAFRAGMATICA', 'ATENCION_PLENA_ACTIVIDAD');
  }

  return recomendadas;
}
