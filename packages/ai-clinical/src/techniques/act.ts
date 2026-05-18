/**
 * MindBridge — Técnicas de Terapia de Aceptación y Compromiso (ACT)
 * Basado en Hayes, S.C., Strosahl, K.D., & Wilson, K.G. (1999). Acceptance and Commitment Therapy.
 */

export interface TecnicaACT {
  nombre: string;
  proceso: string; // Proceso psicológico de flexibilidad que trabaja
  descripcion: string;
  indicaciones: string[];
  instruccionesIA: string;
  ejercicio: string;
}

// Los 6 procesos del hexaflex de ACT
export const PROCESOS_ACT = {
  DEFUSION: 'Defusión cognitiva',
  ACEPTACION: 'Aceptación',
  CONTACTO_PRESENTE: 'Contacto con el momento presente',
  YO_CONTEXTO: 'Yo como contexto',
  VALORES: 'Clarificación de valores',
  ACCION_COMPROMETIDA: 'Acción comprometida',
} as const;

export const TECNICAS_ACT: Record<string, TecnicaACT> = {

  DEFUSION_COGNITIVA: {
    nombre: 'Defusión Cognitiva',
    proceso: PROCESOS_ACT.DEFUSION,
    descripcion: 'Crear distancia entre el observador y sus pensamientos. Los pensamientos son eventos mentales, no hechos.',
    indicaciones: ['pensamientos intrusivos', 'autocrítica severa', 'rumiación', 'ansiedad por pensamientos'],
    instruccionesIA: `Enseña al usuario a observar sus pensamientos sin fusionarse con ellos:

Técnicas de defusión:
1. Prefijo "Estoy teniendo el pensamiento de que...": En vez de "Soy un fracasado", "Estoy teniendo el pensamiento de que soy un fracasado."
2. Nombrar el proceso: "Ahí va mi mente haciendo lo que llamo 'catastrofizar'."
3. Técnica del río: Imagina que estás sentado en la orilla de un río, y los pensamientos son hojas que flotan pasando. No tienes que agarrarlas.
4. Voz de caricatura: Repite el pensamiento negativo con voz de personaje de caricatura — reduce su poder emocional.

NO le pidas al usuario que elimine el pensamiento. ACT no lucha contra los pensamientos, los observa.`,
    ejercicio: `"Vamos a probar algo. Toma ese pensamiento que te está molestando y en vez de decirlo como si fuera verdad, dilo así: 'Estoy teniendo el pensamiento de que...' ¿Lo notas diferente? No más verdadero ni más falso — solo un pensamiento que tu mente está produciendo."`,
  },

  ACEPTACION_EMOCIONAL: {
    nombre: 'Aceptación y Apertura Emocional',
    proceso: PROCESOS_ACT.ACEPTACION,
    descripcion: 'Abrir espacio para las emociones difíciles en vez de luchar contra ellas. Aceptar no es resignarse.',
    indicaciones: ['evitación emocional', 'lucha contra la ansiedad', 'supresión emocional', 'duelo'],
    instruccionesIA: `Guía al usuario hacia una relación diferente con sus emociones:

1. Normalizar: "Las emociones dolorosas son parte de una vida humana plena, no una señal de que algo está mal contigo."
2. Observar sin juzgar: "¿Dónde sientes esa emoción en tu cuerpo? ¿Qué forma tendría? ¿Qué temperatura?"
3. Crear espacio: "En vez de luchar contra esa ansiedad, ¿qué pasaría si le dijeras: 'ya te veo, puedes estar aquí'?"
4. Paradoja del control: "Cuando más intentamos no sentir algo, más lo sentimos. La lucha es lo que lo amplifica."

Diferencia clave: aceptación ≠ resignación. Aceptar la tristeza no significa quedarse triste para siempre.`,
    ejercicio: `"Vamos a hacer algo diferente con esa emoción. En vez de tratar de que se vaya, imagina que le haces un poco de espacio. Ponle un nombre, una forma, un color si quieres. No tienes que que te guste — solo observarla sin empujarla. ¿Cómo se siente eso?"`,
  },

  CLARIFICACION_VALORES: {
    nombre: 'Clarificación de Valores',
    proceso: PROCESOS_ACT.VALORES,
    descripcion: 'Identificar lo que realmente importa al usuario para que guíe sus acciones más allá del dolor.',
    indicaciones: ['pérdida de sentido', 'depresión', 'crisis de identidad', 'decisiones importantes', 'burnout'],
    instruccionesIA: `Ayuda al usuario a conectar con sus valores profundos:

1. Distinción valores vs. metas: Los valores son una dirección (como "ser buen padre"), no un destino.
2. Preguntas de clarificación:
   - "¿Qué quieres que represente tu vida? Si nadie te viera, ¿qué tipo de persona quieres ser?"
   - "¿Qué te importa tanto que vale la pena el dolor que conlleva?"
   - "Imagina que ya no tienes este problema — ¿qué estarías haciendo diferente?"
3. Áreas de vida: familia, amistades, pareja, trabajo, salud, crecimiento personal, comunidad, espiritualidad.
4. Brújula: Una vez identificado un valor, pregunta "¿Tus acciones de hoy te acercan o alejan de ese valor?"`,
    ejercicio: `"Quiero preguntarte algo importante. Si dentro de 10 años miraras hacia atrás, ¿qué querría que hubiera sido lo más importante de esta etapa de tu vida? No lo que deberías querer — lo que realmente te importa a ti."`,
  },

  ACCION_COMPROMETIDA: {
    nombre: 'Acción Comprometida',
    proceso: PROCESOS_ACT.ACCION_COMPROMETIDA,
    descripcion: 'Tomar acciones alineadas con los valores propios, aunque el dolor o la incomodidad estén presentes.',
    indicaciones: ['procrastinación', 'evitación', 'ansiedad que paraliza', 'pérdida de motivación'],
    instruccionesIA: `El objetivo es actuar desde los valores, no desde el estado de ánimo:

1. Vincular acción a valor: "¿Qué acción pequeña hoy estaría alineada con lo que te importa, aunque no tengas ganas?"
2. Voluntad de incomodidad: "ACT no promete que se sentirá bien. Promete que será significativo."
3. Acciones SMART alineadas con valores: específica, medible, alcanzable, relevante al valor, con tiempo definido.
4. No esperar motivación: "La acción comprometida no espera sentirse bien para actuar — actúa desde el valor."`,
    ejercicio: `"Pensando en lo que dijiste que te importa, ¿hay una acción concreta y pequeña que podrías hacer esta semana que vaya en esa dirección? No tiene que ser perfecta ni cómoda. Solo alineada."`,
  },

  YO_OBSERVADOR: {
    nombre: 'Yo Observador (Yo como Contexto)',
    proceso: PROCESOS_ACT.YO_CONTEXTO,
    descripcion: 'Conectar con el "yo" que observa pensamientos y emociones, diferente del contenido de la mente.',
    indicaciones: ['fusión con la identidad negativa', '"soy ansioso/depresivo"', 'crisis de identidad'],
    instruccionesIA: `Ayuda al usuario a distinguir entre el observador y lo observado:

Ejercicio del cielo y las nubes:
"Imagina que tu mente es el cielo. Los pensamientos, emociones y sensaciones son las nubes — a veces oscuras, a veces luminosas. Las nubes pasan. El cielo siempre está ahí, detrás de ellas. Tú eres el cielo, no las nubes."

Pregunta clave: "¿Quién está notando ese pensamiento? Ese que nota — ¿puede ser lastimado por lo que observa?"`,
    ejercicio: `"Cuando dices 'soy ansioso', hay algo interesante ahí: ¿quién lo está diciendo? Hay una parte de ti que observa la ansiedad — eso significa que tú no eres la ansiedad. Eres quien la nota. ¿Puedes sentir esa diferencia?"`,
  },
};

export const METAFORAS_ACT = {
  PASAJEROS_DEL_BUS: `Imagina que eres el conductor de un bus. Los pasajeros son tus pensamientos y emociones — algunos gritan, algunos son amenazantes. Pero tú eres el conductor. Puedes dejarlos subir sin que ellos decidan a dónde vas.`,
  ARENA_MOVEDIZA: `Cuando caes en arena movediza, luchar te hunde más. Lo que funciona es extenderte, crear más superficie de contacto — aceptar. Lo mismo con las emociones dolorosas.`,
  JARDINERO: `No puedes controlar qué semillas caen en tu jardín mental. Pero puedes decidir cuáles riegas con tu atención.`,
};
