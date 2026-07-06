export interface PreguntaTest {
  id: string;
  texto: string;
  opciones?: { valor: number; texto: string }[];
}

export interface ResultadoRango {
  min: number;
  max: number;
  titulo: string;
  descripcion: string;
}

export interface TestPsicologico {
  id: string;
  categoria: 'personalidad' | 'relaciones' | 'bienestar' | 'crecimiento';
  titulo: string;
  descripcion: string;
  icono: string;
  color: string;
  duracionMin: number;
  preguntas: PreguntaTest[];
  resultados: ResultadoRango[];
  tagPerfil: string;
  // Si el puntaje % supera este umbral, sugerir cita con psicólogo
  umbralAlertaPct?: number;
}

const ESCALA_ACUERDO = [
  { valor: 1, texto: 'Totalmente en desacuerdo' },
  { valor: 2, texto: 'En desacuerdo' },
  { valor: 3, texto: 'Neutral' },
  { valor: 4, texto: 'De acuerdo' },
  { valor: 5, texto: 'Totalmente de acuerdo' },
];

const ESCALA_FRECUENCIA = [
  { valor: 1, texto: 'Nunca' },
  { valor: 2, texto: 'Rara vez' },
  { valor: 3, texto: 'A veces' },
  { valor: 4, texto: 'Frecuentemente' },
  { valor: 5, texto: 'Siempre' },
];

export const CATALOGO_TESTS: TestPsicologico[] = [
  // ═══════════════ PERSONALIDAD ═══════════════
  {
    id: 'tipo-personalidad',
    categoria: 'personalidad',
    titulo: 'Tipo de Personalidad',
    descripcion: 'Descubre tus preferencias de personalidad con esta evaluación basada en los 4 ejes clásicos (introversión/extroversión, pensamiento/sentimiento, etc.)',
    icono: '🎭',
    color: '#a78bfa',
    duracionMin: 12,
    tagPerfil: 'tipo_personalidad',
    preguntas: [
      { id: 'p1', texto: 'Prefiero pasar tiempo solo/a para recargar energía', opciones: ESCALA_ACUERDO },
      { id: 'p2', texto: 'Me siento cómodo/a iniciando conversaciones con desconocidos', opciones: ESCALA_ACUERDO },
      { id: 'p3', texto: 'Tomo decisiones basándome más en lógica que en sentimientos', opciones: ESCALA_ACUERDO },
      { id: 'p4', texto: 'Prefiero tener un plan claro antes de actuar', opciones: ESCALA_ACUERDO },
      { id: 'p5', texto: 'Me intereso más por ideas abstractas que por detalles concretos', opciones: ESCALA_ACUERDO },
      { id: 'p6', texto: 'Suelo confiar en mi intuición más que en datos', opciones: ESCALA_ACUERDO },
      { id: 'p7', texto: 'Me adapto fácilmente a cambios de planes de último momento', opciones: ESCALA_ACUERDO },
      { id: 'p8', texto: 'Disfruto reflexionar profundamente sobre mis pensamientos y emociones', opciones: ESCALA_ACUERDO },
    ],
    resultados: [
      { min: 8,  max: 18, titulo: 'Reflexivo y estructurado',  descripcion: 'Tiendes a procesar internamente, valoras la planificación y la lógica. Te recargas en soledad y prefieres profundidad sobre cantidad en tus relaciones.' },
      { min: 19, max: 29, titulo: 'Equilibrado adaptable',     descripcion: 'Combinas momentos de introspección con apertura social. Te adaptas según el contexto y balanceas lógica con intuición.' },
      { min: 30, max: 40, titulo: 'Expresivo y espontáneo',    descripcion: 'Te energizas en interacción con otros, te guías por intuición y te adaptas con facilidad a lo inesperado.' },
    ],
  },
  {
    id: 'nivel-narcisismo',
    categoria: 'personalidad',
    titulo: 'Nivel de Narcisismo',
    descripcion: 'Descubre tu nivel de narcisismo con este test rápido. Responde unas pocas preguntas sobre cómo te ves a ti mismo/a en relación con los demás.',
    icono: '🪞',
    color: '#fb7185',
    duracionMin: 9,
    tagPerfil: 'nivel_narcisismo',
    preguntas: [
      { id: 'n1', texto: 'Creo que merezco un trato especial comparado con otras personas', opciones: ESCALA_ACUERDO },
      { id: 'n2', texto: 'Me cuesta admitir cuando me equivoco', opciones: ESCALA_ACUERDO },
      { id: 'n3', texto: 'Busco que otros reconozcan mis logros frecuentemente', opciones: ESCALA_ACUERDO },
      { id: 'n4', texto: 'Me molesta cuando alguien recibe más atención que yo', opciones: ESCALA_ACUERDO },
      { id: 'n5', texto: 'Tiendo a culpar a otros cuando algo sale mal', opciones: ESCALA_ACUERDO },
      { id: 'n6', texto: 'Me cuesta sentir empatía cuando alguien me cuenta sus problemas', opciones: ESCALA_ACUERDO },
    ],
    resultados: [
      { min: 6,  max: 14, titulo: 'Baja tendencia narcisista', descripcion: 'Sueles priorizar el bienestar colectivo, aceptas tus errores con facilidad y valoras la empatía en tus relaciones.' },
      { min: 15, max: 22, titulo: 'Tendencia moderada',        descripcion: 'Tienes momentos de autoafirmación saludable, pero también espacios donde podrías trabajar en la empatía y aceptación de errores.' },
      { min: 23, max: 30, titulo: 'Tendencia elevada',         descripcion: 'Podrías beneficiarte de explorar cómo tus necesidades de validación afectan tus relaciones cercanas. Esto no es un diagnóstico clínico.' },
    ],
  },
  {
    id: 'persona-toxica',
    categoria: 'personalidad',
    titulo: 'Persona Tóxica',
    descripcion: 'Este test te ayuda a entender si tienes patrones de comportamiento que pueden afectar negativamente a las personas de tu entorno.',
    icono: '☠️',
    color: '#fbbf24',
    duracionMin: 8,
    tagPerfil: 'patrones_toxicos',
    preguntas: [
      { id: 't1', texto: 'Critico a otros con frecuencia, incluso por cosas pequeñas', opciones: ESCALA_FRECUENCIA },
      { id: 't2', texto: 'Uso el silencio o el enojo para "castigar" a otros', opciones: ESCALA_FRECUENCIA },
      { id: 't3', texto: 'Me cuesta alegrarme genuinamente por los logros de otros', opciones: ESCALA_FRECUENCIA },
      { id: 't4', texto: 'Hago comentarios sarcásticos que pueden herir a otros', opciones: ESCALA_FRECUENCIA },
      { id: 't5', texto: 'Controlo o vigilo de cerca lo que hacen las personas cercanas a mí', opciones: ESCALA_FRECUENCIA },
    ],
    resultados: [
      { min: 5,  max: 11, titulo: 'Patrones saludables',       descripcion: 'Tus relaciones parecen basarse en respeto mutuo y comunicación abierta.' },
      { min: 12, max: 18, titulo: 'Algunos patrones a revisar',descripcion: 'Hay comportamientos ocasionales que podrían generar tensión en tus relaciones. Vale la pena observarlos con curiosidad, sin juzgarte.' },
      { min: 19, max: 25, titulo: 'Patrones frecuentes',       descripcion: 'Varios comportamientos identificados podrían estar afectando tus relaciones de forma recurrente. Hablar con un psicólogo puede ayudarte a entender su origen.' },
    ],
  },

  // ═══════════════ RELACIONES ═══════════════
  {
    id: 'trauma-infantil',
    categoria: 'relaciones',
    titulo: 'Trauma Infantil',
    descripcion: 'Descubre cómo las experiencias de la infancia podrían seguir afectando tu vida adulta, tus relaciones y tu forma de regular emociones.',
    icono: '🧸',
    color: '#818cf8',
    duracionMin: 6,
    tagPerfil: 'trauma_infantil',
    preguntas: [
      { id: 'ti1', texto: 'De niño/a sentí que mis emociones no eran importantes para los adultos a mi alrededor', opciones: ESCALA_ACUERDO },
      { id: 'ti2', texto: 'Tuve que asumir responsabilidades de adulto a una edad muy temprana', opciones: ESCALA_ACUERDO },
      { id: 'ti3', texto: 'Recuerdo sentirme inseguro/a en mi propia casa de niño/a', opciones: ESCALA_ACUERDO },
      { id: 'ti4', texto: 'De adulto, me cuesta confiar plenamente en otras personas', opciones: ESCALA_ACUERDO },
      { id: 'ti5', texto: 'Siento que tuve que "crecer rápido" para sobrevivir emocionalmente', opciones: ESCALA_ACUERDO },
    ],
    resultados: [
      { min: 5,  max: 11, titulo: 'Bajo impacto identificado', descripcion: 'No identificas patrones significativos de tu infancia afectando tu presente, según tus respuestas.' },
      { min: 12, max: 18, titulo: 'Impacto moderado',          descripcion: 'Hay experiencias de tu infancia que podrían seguir influyendo en cómo te relacionas y manejas el estrés hoy.' },
      { min: 19, max: 25, titulo: 'Impacto significativo',     descripcion: 'Tus respuestas sugieren que experiencias tempranas podrían tener un peso considerable en tu bienestar actual. Hablar con un profesional puede ofrecerte herramientas valiosas.' },
    ],
  },
  {
    id: 'lenguaje-amor',
    categoria: 'relaciones',
    titulo: 'Lenguaje del Amor',
    descripcion: 'Descubre la forma en que prefieres dar y recibir amor. Este test te ayuda a entender qué te hace sentir más querido/a y valorado/a.',
    icono: '💞',
    color: '#fb7185',
    duracionMin: 9,
    tagPerfil: 'lenguaje_amor',
    preguntas: [
      { id: 'la1', texto: 'Me siento más amado/a cuando alguien me dice palabras de afirmación', opciones: ESCALA_ACUERDO },
      { id: 'la2', texto: 'Valoro mucho cuando alguien pasa tiempo de calidad conmigo, sin distracciones', opciones: ESCALA_ACUERDO },
      { id: 'la3', texto: 'Los regalos pensados me hacen sentir especialmente querido/a', opciones: ESCALA_ACUERDO },
      { id: 'la4', texto: 'Cuando alguien me ayuda con tareas o responsabilidades, siento que me ama', opciones: ESCALA_ACUERDO },
      { id: 'la5', texto: 'El contacto físico (abrazos, tomarse de la mano) es muy importante para mí', opciones: ESCALA_ACUERDO },
    ],
    resultados: [
      { min: 5,  max: 11, titulo: 'Palabras y actos de servicio', descripcion: 'Te sientes más conectado/a cuando recibes afirmaciones verbales y cuando otros se esfuerzan por aliviar tu carga con acciones concretas.' },
      { min: 12, max: 18, titulo: 'Tiempo de calidad',            descripcion: 'La atención plena y el tiempo compartido sin distracciones son tu forma principal de sentirte amado/a.' },
      { min: 19, max: 25, titulo: 'Contacto físico y detalles',   descripcion: 'El contacto físico y los gestos tangibles de cariño son centrales en cómo experimentas el amor.' },
    ],
  },
  {
    id: 'nivel-empatia',
    categoria: 'relaciones',
    titulo: 'Nivel de Empatía',
    descripcion: 'Esta prueba te ayuda a entender qué tan conectado/a estás con las emociones de los demás y cómo respondes ante ellas.',
    icono: '🤝',
    color: '#34d399',
    duracionMin: 10,
    tagPerfil: 'nivel_empatia',
    preguntas: [
      { id: 'e1', texto: 'Puedo notar cuando alguien está triste aunque no lo diga', opciones: ESCALA_ACUERDO },
      { id: 'e2', texto: 'Me afecta emocionalmente ver a alguien sufrir, incluso si no lo conozco', opciones: ESCALA_ACUERDO },
      { id: 'e3', texto: 'Trato de entender el punto de vista de otra persona antes de juzgar', opciones: ESCALA_ACUERDO },
      { id: 'e4', texto: 'Cambio mi comportamiento al notar que alguien se siente incómodo/a', opciones: ESCALA_ACUERDO },
      { id: 'e5', texto: 'Las películas o historias tristes me generan emociones intensas', opciones: ESCALA_ACUERDO },
    ],
    resultados: [
      { min: 5,  max: 11, titulo: 'Empatía cognitiva predominante', descripcion: 'Comprendes las situaciones de otros de forma racional, pero podrías beneficiarte de conectar más con tus propias respuestas emocionales.' },
      { min: 12, max: 18, titulo: 'Empatía equilibrada',            descripcion: 'Tienes una buena capacidad de conectar tanto racional como emocionalmente con los demás.' },
      { min: 19, max: 25, titulo: 'Alta sensibilidad empática',     descripcion: 'Absorbes con intensidad las emociones de quienes te rodean. Esto es una fortaleza, aunque vale la pena cuidar tu propia energía emocional.' },
    ],
  },
  {
    id: 'estilo-apego',
    categoria: 'relaciones',
    titulo: 'Estilo de Apego',
    descripcion: 'Descubre tu estilo de apego (seguro, ansioso, evitativo o desorganizado) y cómo influye en tus relaciones cercanas.',
    icono: '🔗',
    color: '#2dd4bf',
    duracionMin: 11,
    tagPerfil: 'estilo_apego',
    preguntas: [
      { id: 'ap1', texto: 'Me preocupa que las personas que quiero dejen de quererme', opciones: ESCALA_ACUERDO },
      { id: 'ap2', texto: 'Prefiero mantener cierta distancia emocional para no depender de otros', opciones: ESCALA_ACUERDO },
      { id: 'ap3', texto: 'Me siento cómodo/a expresando mis necesidades en una relación', opciones: ESCALA_ACUERDO },
      { id: 'ap4', texto: 'Necesito constante reafirmación de que la otra persona me quiere', opciones: ESCALA_ACUERDO },
      { id: 'ap5', texto: 'Me cuesta confiar completamente en una pareja o amigo cercano', opciones: ESCALA_ACUERDO },
      { id: 'ap6', texto: 'Confío en que las relaciones importantes en mi vida son estables', opciones: ESCALA_ACUERDO },
    ],
    resultados: [
      { min: 6,  max: 14, titulo: 'Apego seguro',                      descripcion: 'Te sientes cómodo/a con la cercanía y la independencia. Confías en tus relaciones y comunicas tus necesidades con relativa facilidad.' },
      { min: 15, max: 22, titulo: 'Apego ansioso-evitativo mixto',      descripcion: 'Puedes alternar entre buscar mucha cercanía y necesitar distancia, dependiendo del contexto y la relación.' },
      { min: 23, max: 30, titulo: 'Apego ansioso o evitativo marcado',  descripcion: 'Tus relaciones podrían estar influidas por miedo al abandono o necesidad de mantener distancia emocional. Explorar esto con un profesional puede ser muy útil.' },
    ],
  },

  // ═══════════════ BIENESTAR MENTAL ═══════════════
  {
    id: 'autoevaluacion-tdah',
    categoria: 'bienestar',
    umbralAlertaPct: 65,
    titulo: 'Autoevaluación de TDAH',
    descripcion: 'Esta prueba te ayuda a descubrir si tienes rasgos comunes en el TDAH. Evalúa atención, organización e impulsividad en tu día a día.',
    icono: '🧠',
    color: '#fbbf24',
    duracionMin: 9,
    tagPerfil: 'rasgos_tdah',
    preguntas: [
      { id: 'tdah1', texto: 'Me cuesta mantener la atención en tareas largas o aburridas', opciones: ESCALA_FRECUENCIA },
      { id: 'tdah2', texto: 'Pierdo objetos importantes con frecuencia (llaves, documentos)', opciones: ESCALA_FRECUENCIA },
      { id: 'tdah3', texto: 'Me distraigo fácilmente con estímulos externos', opciones: ESCALA_FRECUENCIA },
      { id: 'tdah4', texto: 'Tomo decisiones impulsivas sin pensar en las consecuencias', opciones: ESCALA_FRECUENCIA },
      { id: 'tdah5', texto: 'Postergo tareas importantes hasta el último momento', opciones: ESCALA_FRECUENCIA },
      { id: 'tdah6', texto: 'Siento inquietud física (mover piernas, manos) cuando debo estar quieto/a', opciones: ESCALA_FRECUENCIA },
    ],
    resultados: [
      { min: 6,  max: 14, titulo: 'Rasgos bajos',     descripcion: 'No identificas patrones significativos relacionados con atención o impulsividad en tu día a día.' },
      { min: 15, max: 22, titulo: 'Rasgos moderados', descripcion: 'Identificas algunos patrones de atención o impulsividad que podrían beneficiarse de estrategias de organización.' },
      { min: 23, max: 30, titulo: 'Rasgos elevados',  descripcion: 'Tus respuestas muestran varios rasgos asociados al TDAH. Esto NO es un diagnóstico — solo un profesional de salud mental puede evaluarlo formalmente.' },
    ],
  },
  {
    id: 'rasgos-autistas',
    categoria: 'bienestar',
    titulo: 'Rasgos Autistas',
    descripcion: 'Esta prueba te ayuda a comprenderte mejor a ti mismo/a y tus comportamientos, explorando rasgos asociados al espectro autista.',
    icono: '🧩',
    color: '#818cf8',
    duracionMin: 8,
    tagPerfil: 'rasgos_autistas',
    preguntas: [
      { id: 'aut1', texto: 'Prefiero rutinas predecibles sobre la espontaneidad', opciones: ESCALA_ACUERDO },
      { id: 'aut2', texto: 'Me cuesta interpretar el lenguaje corporal o tono de voz de otros', opciones: ESCALA_ACUERDO },
      { id: 'aut3', texto: 'Ciertos sonidos, texturas o luces me resultan muy incómodos', opciones: ESCALA_ACUERDO },
      { id: 'aut4', texto: 'Me concentro intensamente en temas que me interesan, por horas', opciones: ESCALA_ACUERDO },
      { id: 'aut5', texto: 'Las situaciones sociales no estructuradas me generan ansiedad', opciones: ESCALA_ACUERDO },
    ],
    resultados: [
      { min: 5,  max: 11, titulo: 'Rasgos bajos',     descripcion: 'No identificas patrones significativos asociados al espectro autista en tus respuestas.' },
      { min: 12, max: 18, titulo: 'Rasgos moderados', descripcion: 'Identificas algunos rasgos de sensibilidad sensorial o preferencia por rutinas.' },
      { min: 19, max: 25, titulo: 'Rasgos elevados',  descripcion: 'Tus respuestas muestran varios rasgos asociados al espectro autista. Esto no es un diagnóstico — una evaluación profesional puede ofrecerte mayor claridad.' },
    ],
  },
  {
    id: 'escala-ira-novaco',
    categoria: 'bienestar',
    umbralAlertaPct: 65,
    titulo: 'Escala de Ira de Novaco',
    descripcion: 'Esta prueba te ayuda a entender cómo experimentas y manejas la ira ante distintas situaciones cotidianas.',
    icono: '🔥',
    color: '#f87171',
    duracionMin: 8,
    tagPerfil: 'manejo_ira',
    preguntas: [
      { id: 'ira1', texto: 'Cuando alguien me interrumpe, siento que la rabia sube rápidamente', opciones: ESCALA_FRECUENCIA },
      { id: 'ira2', texto: 'Me cuesta calmarme después de un conflicto, incluso horas después', opciones: ESCALA_FRECUENCIA },
      { id: 'ira3', texto: 'Levanto la voz o digo cosas que luego lamento cuando me enojo', opciones: ESCALA_FRECUENCIA },
      { id: 'ira4', texto: 'Pequeñas frustraciones (tráfico, filas) me generan mucha irritación', opciones: ESCALA_FRECUENCIA },
      { id: 'ira5', texto: 'Siento tensión física (puños, mandíbula apretada) cuando me enojo', opciones: ESCALA_FRECUENCIA },
    ],
    resultados: [
      { min: 5,  max: 11, titulo: 'Manejo saludable',    descripcion: 'Sueles procesar la frustración de forma equilibrada y recuperas la calma con relativa facilidad.' },
      { min: 12, max: 18, titulo: 'Reactividad moderada', descripcion: 'Hay situaciones que disparan tu ira con intensidad considerable. Técnicas de regulación emocional podrían ayudarte.' },
      { min: 19, max: 25, titulo: 'Alta reactividad',     descripcion: 'La ira parece tener un peso importante en tu día a día. Trabajar esto con apoyo profesional puede mejorar significativamente tu bienestar y relaciones.' },
    ],
  },
  {
    id: 'problemas-imagen-corporal',
    categoria: 'bienestar',
    umbralAlertaPct: 60,
    titulo: 'Problemas con la Imagen Corporal',
    descripcion: 'Este test explora cómo te percibes y sientes respecto a tu cuerpo, y si esto afecta tu bienestar diario.',
    icono: '🪞',
    color: '#1a3d6b',
    duracionMin: 8,
    tagPerfil: 'imagen_corporal',
    preguntas: [
      { id: 'ic1', texto: 'Evito mirarme al espejo o en fotos porque me incomoda', opciones: ESCALA_FRECUENCIA },
      { id: 'ic2', texto: 'Comparo mi cuerpo con el de otras personas frecuentemente', opciones: ESCALA_FRECUENCIA },
      { id: 'ic3', texto: 'Pienso en mi peso o apariencia varias veces al día', opciones: ESCALA_FRECUENCIA },
      { id: 'ic4', texto: 'Evito actividades sociales por cómo me siento con mi cuerpo', opciones: ESCALA_FRECUENCIA },
      { id: 'ic5', texto: 'Me critico duramente por mi apariencia física', opciones: ESCALA_FRECUENCIA },
    ],
    resultados: [
      { min: 5,  max: 11, titulo: 'Relación saludable',      descripcion: 'Tu relación con tu imagen corporal parece relativamente equilibrada.' },
      { min: 12, max: 18, titulo: 'Preocupación moderada',   descripcion: 'Tu imagen corporal ocupa un espacio considerable en tu mente y podría estar afectando tu bienestar diario.' },
      { min: 19, max: 25, titulo: 'Preocupación significativa',descripcion: 'Tus respuestas sugieren que la imagen corporal tiene un impacto importante en tu vida. Hablar con un profesional puede ofrecerte apoyo valioso.' },
    ],
  },
  {
    id: 'trastorno-animo',
    categoria: 'bienestar',
    umbralAlertaPct: 60,
    titulo: 'Trastorno del Estado de Ánimo',
    descripcion: 'Esta prueba te ayuda a identificar patrones en tu estado de ánimo que podrían estar afectando tu día a día.',
    icono: '🌗',
    color: '#818cf8',
    duracionMin: 10,
    tagPerfil: 'estado_animo',
    preguntas: [
      { id: 'ta1', texto: 'He perdido interés en actividades que antes disfrutaba', opciones: ESCALA_FRECUENCIA },
      { id: 'ta2', texto: 'Mi energía ha estado considerablemente más baja de lo usual', opciones: ESCALA_FRECUENCIA },
      { id: 'ta3', texto: 'Mi apetito o sueño han cambiado notablemente en las últimas semanas', opciones: ESCALA_FRECUENCIA },
      { id: 'ta4', texto: 'Me siento triste o vacío/a sin una razón clara', opciones: ESCALA_FRECUENCIA },
      { id: 'ta5', texto: 'Me cuesta concentrarme en tareas cotidianas', opciones: ESCALA_FRECUENCIA },
      { id: 'ta6', texto: 'Siento que las cosas no van a mejorar', opciones: ESCALA_FRECUENCIA },
    ],
    resultados: [
      { min: 6,  max: 14, titulo: 'Estado de ánimo estable', descripcion: 'No identificas patrones significativos de cambio en tu ánimo, energía o motivación recientemente.' },
      { min: 15, max: 22, titulo: 'Cambios moderados',        descripcion: 'Has notado algunos cambios en tu energía, ánimo o motivación que vale la pena observar y conversar.' },
      { min: 23, max: 30, titulo: 'Cambios significativos',   descripcion: 'Tus respuestas sugieren cambios importantes en tu bienestar emocional reciente. Te recomendamos conversar con un psicólogo — no estás solo/a en esto.' },
    ],
  },

  // ═══════════════ CRECIMIENTO PERSONAL ═══════════════
  {
    id: 'orientacion-profesional',
    categoria: 'crecimiento',
    titulo: 'Orientación Profesional',
    descripcion: 'Esta prueba te ayuda a explorar opciones de carrera que se adapten a tu personalidad, valores e intereses.',
    icono: '💼',
    color: '#fb7185',
    duracionMin: 12,
    tagPerfil: 'orientacion_profesional',
    preguntas: [
      { id: 'op1', texto: 'Prefiero trabajar con datos y procesos sobre trabajar con personas', opciones: ESCALA_ACUERDO },
      { id: 'op2', texto: 'Me motiva más la estabilidad que el riesgo y la novedad', opciones: ESCALA_ACUERDO },
      { id: 'op3', texto: 'Disfruto liderar proyectos y tomar decisiones por un equipo', opciones: ESCALA_ACUERDO },
      { id: 'op4', texto: 'Prefiero un trabajo creativo sobre uno estructurado', opciones: ESCALA_ACUERDO },
      { id: 'op5', texto: 'Me importa más el propósito de mi trabajo que el salario', opciones: ESCALA_ACUERDO },
    ],
    resultados: [
      { min: 5,  max: 11, titulo: 'Perfil analítico-estructurado', descripcion: 'Te orientas hacia roles que requieren precisión, estructura y procesos claros (análisis, finanzas, operaciones, ingeniería).' },
      { min: 12, max: 18, titulo: 'Perfil versátil-colaborativo',  descripcion: 'Te adaptas bien a distintos entornos, valorando tanto el trabajo en equipo como la estructura.' },
      { min: 19, max: 25, titulo: 'Perfil creativo-relacional',    descripcion: 'Te orientas hacia roles que permiten expresión creativa, propósito y conexión con personas (diseño, educación, recursos humanos).' },
    ],
  },
  {
    id: 'estilo-procrastinacion',
    categoria: 'crecimiento',
    titulo: 'Estilo de Procrastinación',
    descripcion: 'La procrastinación puede causar estrés y hacerte sentir abrumado/a. Descubre tu estilo y por qué postergas las cosas.',
    icono: '⏳',
    color: '#fbbf24',
    duracionMin: 7,
    tagPerfil: 'estilo_procrastinacion',
    preguntas: [
      { id: 'proc1', texto: 'Postergo tareas porque me parecen abrumadoras al inicio', opciones: ESCALA_FRECUENCIA },
      { id: 'proc2', texto: 'Espero hasta el último momento porque "trabajo mejor bajo presión"', opciones: ESCALA_FRECUENCIA },
      { id: 'proc3', texto: 'Evito tareas porque temo no hacerlas perfectas', opciones: ESCALA_FRECUENCIA },
      { id: 'proc4', texto: 'Me distraigo con actividades placenteras en lugar de trabajar', opciones: ESCALA_FRECUENCIA },
      { id: 'proc5', texto: 'Siento culpa o ansiedad por las tareas que estoy postergando', opciones: ESCALA_FRECUENCIA },
    ],
    resultados: [
      { min: 5,  max: 11, titulo: 'Procrastinación ocasional',             descripcion: 'Postergas tareas de forma puntual, sin que esto genere mucho estrés en tu vida.' },
      { min: 12, max: 18, titulo: 'Procrastinación por evitación emocional',descripcion: 'Tiendes a postergar tareas que generan ansiedad o que percibes como abrumadoras, usando distracción como escape.' },
      { min: 19, max: 25, titulo: 'Procrastinación por perfeccionismo',     descripcion: 'El miedo a no hacer algo perfecto te paraliza, generando un ciclo de postergación y culpa.' },
    ],
  },
  {
    id: 'soledad',
    categoria: 'crecimiento',
    titulo: 'Soledad',
    descripcion: 'Esta prueba te ayuda a entender tu nivel de soledad percibida y cómo se relaciona con tus conexiones sociales actuales.',
    icono: '🔒',
    color: '#818cf8',
    duracionMin: 8,
    tagPerfil: 'nivel_soledad',
    preguntas: [
      { id: 'sol1', texto: 'Siento que no tengo a quién llamar cuando necesito apoyo', opciones: ESCALA_ACUERDO },
      { id: 'sol2', texto: 'Me siento desconectado/a incluso cuando estoy con otras personas', opciones: ESCALA_ACUERDO },
      { id: 'sol3', texto: 'Paso la mayoría de mi tiempo libre solo/a, y no por elección', opciones: ESCALA_ACUERDO },
      { id: 'sol4', texto: 'Siento que nadie me entiende realmente', opciones: ESCALA_ACUERDO },
      { id: 'sol5', texto: 'Me cuesta iniciar o mantener nuevas amistades', opciones: ESCALA_ACUERDO },
    ],
    resultados: [
      { min: 5,  max: 11, titulo: 'Conexión social saludable', descripcion: 'Sientes que tienes una red de apoyo a la que puedes recurrir cuando lo necesitas.' },
      { min: 12, max: 18, titulo: 'Soledad moderada',           descripcion: 'Hay momentos donde te sientes desconectado/a de los demás, aunque tienes algunas conexiones significativas.' },
      { min: 19, max: 25, titulo: 'Soledad significativa',      descripcion: 'Tus respuestas sugieren una sensación de aislamiento considerable. Esto es más común de lo que parece, y hablar con alguien puede abrir un camino hacia la conexión.' },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function obtenerTestPorId(id: string): TestPsicologico | undefined {
  return CATALOGO_TESTS.find(t => t.id === id);
}

export function obtenerResultado(test: TestPsicologico, puntajeTotal: number): ResultadoRango {
  return (
    test.resultados.find(r => puntajeTotal >= r.min && puntajeTotal <= r.max) ??
    test.resultados[test.resultados.length - 1]
  );
}

export function calcularPuntajeMaximo(test: TestPsicologico): number {
  return test.preguntas.length * 5;
}

export const CATEGORIAS_TESTS = [
  { id: 'personalidad', titulo: 'Personalidad',         icono: '🎭' },
  { id: 'relaciones',   titulo: 'Relaciones',            icono: '💞' },
  { id: 'bienestar',    titulo: 'Bienestar Mental',      icono: '🧠' },
  { id: 'crecimiento',  titulo: 'Crecimiento Personal',  icono: '🌱' },
] as const;
