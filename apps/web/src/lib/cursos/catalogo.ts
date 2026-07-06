export type TipoItem = 'leccion' | 'practica';

export interface ItemCurso {
  id: string;
  tipo: TipoItem;
  titulo: string;
  contenido?: string;
  promptPractica?: string;
  quiz?: { pregunta: string; opciones: string[]; correctaIndex: number }[];
}

export interface Curso {
  id: string;
  programaId: string;
  categoria: 'pensar' | 'sentir' | 'actuar';
  titulo: string;
  descripcion: string;
  icono: string;
  color: string;
  items: ItemCurso[];
}

export const CATEGORIAS_APRENDER = [
  { id: 'pensar', titulo: 'Pensar', icono: '🧠', descripcion: 'Identifica y reestructura patrones de pensamiento' },
  { id: 'sentir', titulo: 'Sentir', icono: '💛', descripcion: 'Comprende y regula tus emociones' },
  { id: 'actuar', titulo: 'Actuar', icono: '🚶', descripcion: 'Desarrolla hábitos y mecanismos de afrontamiento saludables' },
] as const;

export const CATALOGO_CURSOS: Curso[] = [
  // ═══════════════ PENSAR ═══════════════
  {
    id: 'pensamiento-irracional-ansiedad',
    programaId: 'ansiedad',
    categoria: 'pensar',
    titulo: 'Pensamiento Irracional y Ansiedad',
    descripcion: 'Aprende cómo ciertos patrones de pensamiento alimentan la ansiedad y cómo identificarlos.',
    icono: '🌀',
    color: '#818cf8',
    items: [
      {
        id: 'l1', tipo: 'leccion', titulo: 'Pensamiento Irracional y Ansiedad',
        contenido: `## ¿Qué es el pensamiento irracional?\n\nSon creencias o interpretaciones que no se basan en evidencia real, pero que sentimos como completamente ciertas. Ejemplo: "Si cometo un error en el trabajo, me van a despedir" — sin evidencia real de que eso vaya a pasar.\n\n## La relación con la ansiedad\n\nLa ansiedad no surge directamente de las situaciones, sino de cómo las interpretamos. Un pensamiento irracional puede activar una respuesta de ansiedad tan intensa como si la amenaza fuera real.\n\n## El ciclo\n\nPensamiento irracional → Emoción de ansiedad → Conducta de evitación → El pensamiento se refuerza porque nunca lo pusiste a prueba.`,
      },
      {
        id: 'p1', tipo: 'practica', titulo: 'Reflexión: Pensamiento Irracional y Ansiedad',
        promptPractica: `El usuario acaba de leer una lección sobre pensamiento irracional y ansiedad. Guía una breve conversación (3-4 intercambios) donde: 1) le pidas que identifique un pensamiento irracional reciente que haya tenido, 2) le ayudes a evaluar la evidencia real a favor y en contra de ese pensamiento, 3) le ayudes a formular un pensamiento alternativo más balanceado. Sé cálido y breve.`,
      },
      {
        id: 'l2', tipo: 'leccion', titulo: '¿Qué son las distorsiones cognitivas?',
        contenido: `## Distorsiones cognitivas\n\nSon patrones de pensamiento sistemáticamente sesgados. Las más comunes son:\n\n- **Pensamiento todo-o-nada**: ver las cosas en blanco y negro ("o soy perfecto o soy un fracaso")\n- **Catastrofización**: asumir el peor escenario posible\n- **Lectura de mente**: asumir que sabes lo que otros piensan de ti\n- **Personalización**: creer que eres responsable de cosas fuera de tu control\n- **Sobregeneralización**: una experiencia negativa = "siempre pasa esto"\n\nReconocerlas es el primer paso para cuestionarlas.`,
      },
      {
        id: 'p2', tipo: 'practica', titulo: 'Quiz: ¿Qué son las distorsiones cognitivas?',
        quiz: [
          { pregunta: '"Si no consigo el trabajo perfecto, mi vida es un fracaso" es un ejemplo de:', opciones: ['Catastrofización', 'Pensamiento todo-o-nada', 'Lectura de mente', 'Personalización'], correctaIndex: 1 },
          { pregunta: '"Sé que mi jefe piensa que soy incompetente" sin evidencia real es:', opciones: ['Sobregeneralización', 'Catastrofización', 'Lectura de mente', 'Pensamiento todo-o-nada'], correctaIndex: 2 },
          { pregunta: 'Reconocer una distorsión cognitiva sirve principalmente para:', opciones: ['Sentirte culpable', 'Cuestionar el pensamiento y buscar alternativas', 'Evitar pensar del todo', 'Confirmar que tienes razón'], correctaIndex: 1 },
        ],
      },
      {
        id: 'l3', tipo: 'leccion', titulo: 'Distorsiones Cognitivas y Falta de Límites',
        contenido: `## Cuando no poner límites alimenta distorsiones\n\nLa dificultad para poner límites suele venir acompañada de pensamientos como:\n\n- "Si digo que no, dejarán de quererme"\n- "Debo estar disponible siempre para los demás"\n- "Mis necesidades son menos importantes que las de otros"\n\nEstos pensamientos generan ansiedad anticipatoria cada vez que surge la posibilidad de poner un límite, lo que refuerza el patrón de complacencia.`,
      },
      {
        id: 'p3', tipo: 'practica', titulo: 'Reflexión: Falta de límites y distorsiones',
        promptPractica: `Guía una breve reflexión (3-4 intercambios) sobre situaciones donde al usuario le ha costado decir "no". Ayúdale a identificar el pensamiento automático detrás de esa dificultad y a evaluar si esa creencia es realista. Cierra con una validación de que poner límites es una habilidad que se entrena.`,
      },
      {
        id: 'l4', tipo: 'leccion', titulo: 'Pensamientos Negativos Automáticos',
        contenido: `## ¿Qué son?\n\nSon pensamientos que aparecen de forma espontánea, rápida y casi automática ante una situación, generalmente sin que los notemos conscientemente. Suelen ser negativos y los aceptamos como verdad sin cuestionarlos.\n\n## Ejemplo\n\nSituación: tu jefe te pide hablar.\nPensamiento automático: "Me van a regañar o despedir."\nEmoción: ansiedad intensa.\nRealidad: tal vez solo quería darte feedback sobre un proyecto.\n\nEl objetivo no es eliminar estos pensamientos — es aprender a notarlos y no actuar automáticamente según ellos.`,
      },
      {
        id: 'p4', tipo: 'practica', titulo: 'Quiz: Pensamientos Negativos Automáticos',
        quiz: [
          { pregunta: 'Los pensamientos automáticos negativos se caracterizan por ser:', opciones: ['Siempre verdaderos', 'Rápidos, espontáneos y aceptados sin cuestionar', 'Solo ocurren cuando estamos tristes', 'Fáciles de eliminar por completo'], correctaIndex: 1 },
          { pregunta: 'El objetivo principal al trabajar con estos pensamientos es:', opciones: ['Eliminarlos completamente', 'Ignorarlos siempre', 'Notarlos y no actuar automáticamente según ellos', 'Reemplazarlos por pensamientos positivos forzados'], correctaIndex: 2 },
        ],
      },
      {
        id: 'l5', tipo: 'leccion', titulo: 'Cómo Reformular un Pensamiento',
        contenido: `## La técnica de reformular\n\nReformular un pensamiento no significa "pensar positivo" de forma forzada. Significa encontrar una interpretación más realista y balanceada.\n\n**Paso 1**: Identifica el pensamiento automático.\n**Paso 2**: Pregúntate — ¿qué evidencia tengo a favor y en contra?\n**Paso 3**: ¿Cómo vería esta situación un amigo cercano?\n**Paso 4**: Formula un pensamiento alternativo que sea creíble (no falsamente optimista).\n\nEjemplo: "Soy un fracaso por este error" → "Cometí un error, como todos. Esto no define mi valor como profesional."`,
      },
    ],
  },

  // ═══════════════ SENTIR ═══════════════
  {
    id: 'rol-emociones-tcc',
    programaId: 'ansiedad',
    categoria: 'sentir',
    titulo: 'El Rol de las Emociones en la TCC',
    descripcion: 'Entiende cómo las emociones se conectan con pensamientos y conductas, y por qué importan.',
    icono: '💛',
    color: '#fbbf24',
    items: [
      {
        id: 'l1', tipo: 'leccion', titulo: 'El Rol de las Emociones en la TCC',
        contenido: `## El triángulo TCC\n\nLa Terapia Cognitivo-Conductual se basa en la idea de que pensamientos, emociones y conductas están interconectados. Un cambio en cualquiera de los tres afecta a los otros dos.\n\n## ¿Por qué importan las emociones?\n\nLas emociones no son "buenas" o "malas" — son señales. La ansiedad avisa de una amenaza percibida. La tristeza indica una pérdida. El enojo, una injusticia o límite vulnerado.\n\nEl problema no es sentir la emoción, sino cómo la interpretamos y qué hacemos con ella.`,
      },
      {
        id: 'l2', tipo: 'leccion', titulo: 'Alfabetización Emocional',
        contenido: `## ¿Qué es la alfabetización emocional?\n\nEs la capacidad de identificar, nombrar y comprender tus propias emociones (y las de otros) con precisión.\n\n## ¿Por qué es importante?\n\nMuchas personas solo distinguen entre "bien" y "mal". Pero hay una gran diferencia entre estar frustrado, decepcionado, agotado o ansioso — y cada una requiere una respuesta distinta.\n\nCuanto más preciso seas al nombrar lo que sientes, más fácil será saber qué necesitas para sentirte mejor.`,
      },
      {
        id: 'p1', tipo: 'practica', titulo: 'Reflexión: Alfabetización Emocional',
        promptPractica: `Pide al usuario que describa cómo se sintió hoy usando solo una palabra general (bien/mal/normal). Luego ayúdale, con 2-3 preguntas, a encontrar una palabra más precisa para esa emoción (ej: "agotado" en vez de "mal", o "aliviado" en vez de "bien"). Cierra explicando brevemente por qué nombrar con precisión ayuda a regular mejor.`,
      },
      {
        id: 'l3', tipo: 'leccion', titulo: 'Descubrimiento Emocional',
        contenido: `## Explorando el origen de tus emociones\n\nA veces una emoción intensa parece "salir de la nada", pero casi siempre tiene un disparador — a veces obvio, a veces sutil (un comentario, un recuerdo, una expectativa no cumplida).\n\n## Ejercicio de descubrimiento\n\nCuando notes una emoción intensa, pregúntate:\n1. ¿Qué pasó justo antes de sentir esto?\n2. ¿Esta situación me recuerda a algo del pasado?\n3. ¿Qué necesidad mía no está siendo atendida en este momento?`,
      },
      {
        id: 'p2', tipo: 'practica', titulo: 'Reflexión: Descubrimiento Emocional',
        promptPractica: `Guía al usuario a explorar una emoción intensa que haya sentido recientemente usando las 3 preguntas de descubrimiento emocional: qué pasó antes, si le recuerda a algo del pasado, y qué necesidad no atendida podría haber detrás. Sé curioso y no apresures conclusiones.`,
      },
      {
        id: 'l4', tipo: 'leccion', titulo: 'Regulación Emocional',
        contenido: `## ¿Qué es regular una emoción?\n\nNo es eliminarla ni reprimirla — es poder experimentarla sin que tome control total de tus decisiones.\n\n## Estrategias de regulación\n\n- **Pausa antes de reaccionar**: cuenta hasta 10, respira.\n- **Nombra la emoción**: "Estoy sintiendo frustración" reduce su intensidad.\n- **Movimiento físico**: caminar, estirar, ayuda a procesar la activación fisiológica.\n- **Expresión**: hablarlo o escribirlo en el diario.\n\nLa regulación se entrena — cada vez que la practicas, se vuelve más automática.`,
      },
      {
        id: 'l5', tipo: 'leccion', titulo: 'Técnicas de Relajación',
        contenido: `## Respiración 4-4-6\n\nInhala 4 segundos, sostén 4 segundos, exhala 6 segundos. Repite 4-5 veces. Activa el sistema nervioso parasimpático (calma).\n\n## Relajación muscular progresiva\n\nTensa y relaja grupos musculares de pies a cabeza, notando la diferencia entre tensión y relajación.\n\n## Grounding 5-4-3-2-1\n\n5 cosas que ves, 4 que tocas, 3 que escuchas, 2 que hueles, 1 que saboreas. Te trae al presente cuando la ansiedad te lleva a anticipaciones.`,
      },
    ],
  },

  // ═══════════════ ACTUAR ═══════════════
  {
    id: 'mecanismos-afrontamiento',
    programaId: 'autoestima',
    categoria: 'actuar',
    titulo: 'Mecanismos de Afrontamiento',
    descripcion: 'Identifica tus mecanismos actuales y aprende alternativas más saludables.',
    icono: '🛡️',
    color: '#34d399',
    items: [
      {
        id: 'l1', tipo: 'leccion', titulo: 'Mecanismos de Afrontamiento Poco Saludables',
        contenido: `## ¿Qué son?\n\nFormas de manejar el malestar que dan alivio momentáneo pero generan problemas a largo plazo:\n\n- Evitación (postergar, no enfrentar)\n- Aislamiento social\n- Uso de sustancias o pantallas como escape\n- Estallidos de ira\n- Autocrítica excesiva\n\nNo son "fallas de carácter" — son estrategias que en algún momento funcionaron para sobrevivir emocionalmente. El objetivo es reconocerlas sin juzgarte, y empezar a construir alternativas.`,
      },
      {
        id: 'p1', tipo: 'practica', titulo: 'Quiz: Afrontamiento Poco Saludable',
        quiz: [
          { pregunta: 'Los mecanismos de afrontamiento poco saludables generalmente dan:', opciones: ['Alivio a largo plazo', 'Alivio momentáneo pero problemas a largo plazo', 'Ningún efecto', 'Solo beneficios'], correctaIndex: 1 },
          { pregunta: 'La actitud correcta al identificar estos mecanismos en uno mismo es:', opciones: ['Culparse severamente', 'Ignorarlos', 'Reconocerlos sin juzgarse y buscar alternativas', 'Reforzarlos'], correctaIndex: 2 },
        ],
      },
      {
        id: 'l2', tipo: 'leccion', titulo: 'Afrontamiento y Falta de Límites',
        contenido: `## Patrones específicos\n\nCuando cuesta poner límites, suelen aparecer:\n\n- **Complacencia excesiva**: decir "sí" a todo para evitar conflicto\n- **Resentimiento silencioso**: acumular enojo no expresado\n- **Sobrecarga**: asumir más responsabilidades de las que se pueden sostener\n- **Desconexión**: aislarse después de períodos de exceso de demandas\n\nEstos patrones suelen alternarse en ciclos: complacer → agotarse → aislarse → sentir culpa → volver a complacer.`,
      },
      {
        id: 'p2', tipo: 'practica', titulo: 'Reflexión: El ciclo de la complacencia',
        promptPractica: `Pregunta al usuario si reconoce el ciclo "complacer → agotarse → aislarse → culpa" en su vida. Si lo reconoce, ayúdale a identificar en qué punto del ciclo está ahora. Sé empático, sin presionar, y valida que romper este ciclo toma tiempo.`,
      },
      {
        id: 'l3', tipo: 'leccion', titulo: 'Mecanismos de Afrontamiento Saludables',
        contenido: `## Alternativas saludables\n\n- **Procesamiento activo**: hablar o escribir sobre lo que sientes en vez de evitarlo\n- **Autocuidado programado**: bloques de tiempo no negociables para descansar\n- **Apoyo social**: pedir ayuda antes de llegar al límite\n- **Movimiento**: ejercicio como regulador emocional, no como castigo\n- **Pausas conscientes**: micro-descansos durante el día, no solo al final\n\nLa clave es la sostenibilidad: un mecanismo saludable puede repetirse sin generar más problemas.`,
      },
      {
        id: 'p3', tipo: 'practica', titulo: 'Quiz: Afrontamiento Saludable',
        quiz: [
          { pregunta: 'Un mecanismo de afrontamiento saludable se caracteriza principalmente por ser:', opciones: ['Inmediato sin importar consecuencias', 'Sostenible sin generar más problemas', 'Solitario siempre', 'Costoso económicamente'], correctaIndex: 1 },
          { pregunta: '¿Cuál de estos es un ejemplo de mecanismo saludable?', opciones: ['Evitar el problema indefinidamente', 'Pedir ayuda antes de llegar al límite', 'Aislarse completamente', 'Reprimir la emoción'], correctaIndex: 1 },
        ],
      },
      {
        id: 'l4', tipo: 'leccion', titulo: 'Construyendo Límites desde la Práctica',
        contenido: `## Estrategias concretas\n\n- **Frases preparadas**: tener respuestas ensayadas como "lo voy a pensar y te confirmo" reduce la presión de responder al instante\n- **Empezar con límites pequeños**: practicar con situaciones de bajo riesgo antes de las más difíciles\n- **Tolerar la incomodidad inicial**: poner un límite puede sentirse raro al principio — es parte del proceso\n- **Repetir el límite con calma**: si te insisten, repetirlo sin necesidad de justificarte excesivamente\n\nCada vez que sostienes un límite, refuerzas la idea de que tus necesidades también cuentan.`,
      },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export function obtenerCursoPorId(id: string): Curso | undefined {
  return CATALOGO_CURSOS.find(c => c.id === id);
}

export function obtenerCursosPorCategoria(categoria: string): Curso[] {
  return CATALOGO_CURSOS.filter(c => c.categoria === categoria);
}

export function obtenerItemDeCurso(
  cursoId: string,
  itemId: string,
): { curso: Curso; item: ItemCurso; index: number } | null {
  const curso = obtenerCursoPorId(cursoId);
  if (!curso) return null;
  const index = curso.items.findIndex(i => i.id === itemId);
  if (index === -1) return null;
  return { curso, item: curso.items[index], index };
}
