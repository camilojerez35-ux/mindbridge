/**
 * MenteBridge — Contenido del blog
 *
 * Reglas editoriales (no negociables):
 * 1. Todo dato numérico o afirmación clínica debe tener una fuente en `fuentes`.
 * 2. Los títulos son preguntas que empiezan por Cuándo / Cómo / Cuánto (intención de búsqueda).
 * 3. Nunca se hardcodean números de líneas de crisis: el componente de crisis los toma de
 *    `@mindbridge/ai-clinical/config/lineas-emergencia` (fuente canónica auditada).
 * 4. `revisadoPor` solo se llena cuando un psicólogo con tarjeta profesional COLPSIC
 *    haya revisado el artículo. No inventar autores ni credenciales.
 */

export type TipoPregunta = 'Cuándo' | 'Cómo' | 'Cuánto';

export type Herramienta = 'respiracion' | 'phq9' | 'gad7';

export interface Seccion {
  titulo: string;
  parrafos?: string[];
  lista?: string[];
  pasos?: string[];
  /** Componente interactivo que se muestra al final de la sección */
  herramienta?: Herramienta;
}

export interface Fuente {
  titulo: string;
  entidad: string;
  anio: string;
  url: string;
}

export interface Articulo {
  slug: string;
  tipo: TipoPregunta;
  titulo: string;
  descripcion: string;
  /** Respuesta directa de 2-3 frases — aparece arriba del artículo (y como snippet en Google) */
  respuestaCorta: string;
  categoria: string;
  emoji: string;
  lectura: string;
  publicado: string; // YYYY-MM-DD
  actualizado: string; // YYYY-MM-DD
  secciones: Seccion[];
  faq: { pregunta: string; respuesta: string }[];
  fuentes: Fuente[];
  /** Muestra el bloque de líneas de crisis al inicio del artículo */
  crisisDestacada?: boolean;
  revisadoPor?: { nombre: string; tarjetaProfesional: string };
}

// ─── Fuentes compartidas ─────────────────────────────────────
const F = {
  omsDepresion: {
    titulo: 'Trastorno depresivo (depresión) — Datos y cifras',
    entidad: 'Organización Mundial de la Salud (OMS)',
    anio: '2025',
    url: 'https://www.who.int/es/news-room/fact-sheets/detail/depression',
  },
  omsSuicidio: {
    titulo: 'Suicidio — Datos y cifras',
    entidad: 'Organización Mundial de la Salud (OMS)',
    anio: '2025',
    url: 'https://www.who.int/es/news-room/fact-sheets/detail/suicide',
  },
  nimhAyuda: {
    titulo: 'My Mental Health: Do I Need Help?',
    entidad: 'National Institute of Mental Health (NIMH, EE. UU.)',
    anio: '2024',
    url: 'https://www.nimh.nih.gov/health/publications/my-mental-health-do-i-need-help',
  },
  ley1616: {
    titulo: 'Ley 1616 de 2013 — Ley de Salud Mental',
    entidad: 'Congreso de la República de Colombia',
    anio: '2013',
    url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=51292',
  },
  linea106: {
    titulo: 'Línea 106 — Orientación en salud mental',
    entidad: 'Ministerio de Salud y Protección Social de Colombia',
    anio: '2026',
    url: 'https://www.minsalud.gov.co/salud/publica/salud-mental/Paginas/linea-106.aspx',
  },
  ensm2015: {
    titulo: 'Trastornos depresivos y de ansiedad y factores asociados en la población adulta colombiana, ENSM 2015',
    entidad: 'Revista Colombiana de Psiquiatría',
    anio: '2016',
    url: 'https://dialnet.unirioja.es/servlet/articulo?codigo=9893580',
  },
} satisfies Record<string, Fuente>;

// ─── Artículos ───────────────────────────────────────────────
export const ARTICULOS: Articulo[] = [
  // ═══════════════════════ CUÁNDO ═══════════════════════
  {
    slug: 'cuando-ir-al-psicologo',
    tipo: 'Cuándo',
    titulo: '¿Cuándo ir al psicólogo? Señales de que es momento de pedir ayuda',
    descripcion:
      'Las señales concretas que indican que conviene consultar a un psicólogo, según el NIMH y la OMS. No necesitas estar "muy mal" para pedir ayuda.',
    respuestaCorta:
      'Es buen momento para consultar si llevas 2 semanas o más con síntomas que te generan malestar o te impiden funcionar como siempre: dormir mal, perder interés en lo que disfrutabas, irritabilidad constante o dificultad para concentrarte. Si tienes pensamientos de hacerte daño, pide ayuda de inmediato, sin esperar.',
    categoria: 'Primeros pasos',
    emoji: '🧭',
    lectura: '6 min',
    publicado: '2026-09-30',
    actualizado: '2026-09-30',
    secciones: [
      {
        titulo: 'La regla de las dos semanas',
        parrafos: [
          'Todos tenemos días malos. La diferencia entre un mal momento y algo que merece atención profesional suele estar en tres factores: cuánto dura, qué tan intenso es y cuánto interfiere con tu vida.',
          'El Instituto Nacional de Salud Mental de EE. UU. (NIMH) recomienda buscar ayuda profesional cuando los síntomas son intensos o angustiantes y duran 2 semanas o más.',
        ],
      },
      {
        titulo: 'Señales que el NIMH identifica',
        lista: [
          'Dificultad para dormir, o dormir mucho más de lo habitual.',
          'Cambios en el apetito o cambios de peso no planeados.',
          'Dificultad para levantarte de la cama por cómo te sientes.',
          'Problemas para concentrarte o tomar decisiones simples.',
          'Pérdida de interés en cosas que normalmente disfrutas.',
          'No poder cumplir con tus tareas o actividades habituales.',
          'Irritabilidad, frustración o inquietud la mayor parte del tiempo.',
          'Sentirte triste, sin esperanza, sin valor o con culpa excesiva.',
        ],
      },
      {
        titulo: 'Otras razones válidas para consultar (aunque no tengas un "trastorno")',
        parrafos: [
          'La psicoterapia no es solo para diagnósticos. También es útil ante un duelo, una ruptura, un cambio grande (trabajo, ciudad, maternidad o paternidad), conflictos de pareja o familia que se repiten, estrés laboral sostenido, o cuando notas que usas el alcohol, la comida o el celular para "apagar" lo que sientes.',
          'Consultar temprano suele hacer que el proceso sea más corto. No tienes que esperar a tocar fondo.',
        ],
      },
      {
        titulo: '¿No sabes si lo tuyo "cuenta"? Haz una autoevaluación',
        parrafos: [
          'El PHQ-9 (depresión) y el GAD-7 (ansiedad) son cuestionarios breves que usan médicos y psicólogos en todo el mundo para identificar síntomas. No dan un diagnóstico, pero te ayudan a poner en palabras lo que sientes y a decidir si consultar. Son anónimos: tus respuestas no se guardan.',
        ],
        herramienta: 'phq9',
      },
      {
        titulo: 'Autoevaluación de ansiedad (GAD-7)',
        herramienta: 'gad7',
      },
      {
        titulo: 'Cuándo NO esperar: señales de urgencia',
        parrafos: [
          'Si tienes pensamientos de quitarte la vida, has pensado cómo hacerlo, te estás haciendo daño o sientes que no puedes mantenerte a salvo, no es momento de pedir cita: es momento de llamar a una línea de crisis o ir a urgencias. Las líneas están al final de este artículo.',
        ],
      },
      {
        titulo: 'En Colombia la salud mental es un derecho',
        parrafos: [
          'La Ley 1616 de 2013 establece el derecho a recibir atención integral, integrada y humanizada en salud mental dentro del sistema de salud, y el derecho a no ser discriminado o estigmatizado por consultar. Puedes acceder a través de tu EPS o de forma particular.',
        ],
      },
    ],
    faq: [
      {
        pregunta: '¿Tengo que estar muy mal para ir al psicólogo?',
        respuesta:
          'No. Basta con que algo te genere malestar sostenido o te impida vivir como quieres. Consultar temprano suele facilitar el proceso.',
      },
      {
        pregunta: '¿Psicólogo o psiquiatra?',
        respuesta:
          'El psicólogo trabaja con psicoterapia; el psiquiatra es médico y puede formular medicamentos. Muchas personas empiezan con psicología y, si hace falta, el profesional las remite a psiquiatría.',
      },
    ],
    fuentes: [F.nimhAyuda, F.omsDepresion, F.ley1616],
  },
  {
    slug: 'cuando-la-tristeza-se-convierte-en-depresion',
    tipo: 'Cuándo',
    titulo: '¿Cuándo la tristeza se convierte en depresión? Diferencias claras',
    descripcion:
      'La tristeza es una emoción normal; la depresión es una condición tratable. Te explicamos la diferencia según los criterios de la OMS.',
    respuestaCorta:
      'La tristeza pasa y suele tener una causa clara. Se habla de depresión cuando el ánimo bajo o la pérdida de interés duran la mayor parte del día, casi todos los días, durante al menos dos semanas, y se acompañan de otros síntomas como alteraciones del sueño, cansancio, culpa o falta de esperanza.',
    categoria: 'Depresión',
    emoji: '🌧️',
    lectura: '7 min',
    publicado: '2026-09-30',
    actualizado: '2026-09-30',
    secciones: [
      {
        titulo: 'Tristeza: una emoción necesaria',
        parrafos: [
          'La tristeza aparece ante pérdidas, decepciones o cambios. Es incómoda, pero cumple una función: nos hace detenernos, procesar y pedir apoyo. Normalmente fluctúa (hay momentos buenos dentro de días malos) y disminuye con el tiempo.',
        ],
      },
      {
        titulo: 'Depresión: cuando el ánimo bajo se instala',
        parrafos: [
          'Según la OMS, en un episodio depresivo la persona experimenta un estado de ánimo deprimido o pérdida del placer o interés en actividades durante la mayor parte del día, casi todos los días, durante al menos dos semanas. Además aparecen otros síntomas como:',
        ],
        lista: [
          'Dificultad para concentrarse.',
          'Sentimientos de culpa excesiva o baja autoestima.',
          'Falta de esperanza en el futuro.',
          'Pensamientos sobre la muerte o el suicidio.',
          'Alteraciones del sueño (insomnio o dormir de más).',
          'Cambios en el apetito o el peso.',
          'Cansancio intenso o falta de energía.',
        ],
      },
      {
        titulo: 'Revisa tus síntomas con el PHQ-9',
        parrafos: [
          'El PHQ-9 recorre justamente estos síntomas. Fue validado en Colombia en adultos de atención primaria. Es anónimo y no reemplaza una evaluación profesional.',
        ],
        herramienta: 'phq9',
      },
      {
        titulo: 'Qué tan común es',
        parrafos: [
          'La OMS estima que alrededor del 5 % de los adultos del mundo vive con depresión, y que es más frecuente en mujeres que en hombres. En Colombia, la Encuesta Nacional de Salud Mental 2015 identificó los trastornos depresivos y de ansiedad como una carga importante de enfermedad en la población adulta.',
          'Es común, no es debilidad de carácter y, sobre todo, tiene tratamiento.',
        ],
      },
      {
        titulo: 'Qué funciona según la evidencia',
        parrafos: [
          'La OMS señala como tratamientos psicológicos eficaces la activación conductual, la terapia cognitivo-conductual (TCC), la psicoterapia interpersonal y la terapia de resolución de problemas. En casos moderados o graves pueden sumarse antidepresivos, siempre formulados por un médico.',
        ],
      },
      {
        titulo: 'Lo que puedes hacer desde hoy (recomendaciones de la OMS)',
        lista: [
          'Mantener actividades que antes disfrutabas, aunque no tengas ganas: la motivación suele llegar después de la acción, no antes.',
          'Seguir en contacto con amigos y familia.',
          'Hacer ejercicio con regularidad, aunque sea caminar.',
          'Mantener horarios regulares de sueño y comida.',
          'Evitar el alcohol y las drogas, que empeoran la depresión.',
          'Contarle a alguien de confianza cómo te sientes.',
        ],
      },
    ],
    faq: [
      {
        pregunta: '¿La depresión se quita sola?',
        respuesta:
          'A veces los síntomas leves mejoran, pero la depresión no tratada tiende a durar más y a repetirse. Consultar acorta el camino.',
      },
      {
        pregunta: '¿Puedo tener depresión si "no tengo motivos"?',
        respuesta:
          'Sí. La depresión no siempre tiene un detonante evidente; influyen factores biológicos, psicológicos y sociales.',
      },
    ],
    fuentes: [F.omsDepresion, F.ensm2015, F.nimhAyuda],
  },
  {
    slug: 'cuando-es-una-emergencia-de-salud-mental',
    tipo: 'Cuándo',
    titulo: '¿Cuándo es una emergencia de salud mental? Qué hacer y a dónde llamar en Colombia',
    descripcion:
      'Señales de que una situación de salud mental requiere ayuda inmediata y cómo actuar en Colombia: líneas gratuitas, urgencias y primeros pasos.',
    respuestaCorta:
      'Es una emergencia cuando hay riesgo inmediato para la vida o la integridad: alguien habla de quitarse la vida y tiene un plan, se está haciendo daño, está desconectado de la realidad o no puede mantenerse a salvo. En ese caso llama al 123 o ve a urgencias; no esperes una cita.',
    categoria: 'Crisis',
    emoji: '🚨',
    lectura: '5 min',
    publicado: '2026-09-30',
    actualizado: '2026-09-30',
    crisisDestacada: true,
    secciones: [
      {
        titulo: 'Señales de emergencia',
        lista: [
          'Habla de querer morir o de quitarse la vida, especialmente si menciona cómo o cuándo.',
          'Busca medios para hacerse daño (medicamentos, armas, venenos).',
          'Se está autolesionando o acaba de hacerlo.',
          'Se despide, regala sus cosas o deja todo "en orden" de forma inusual.',
          'Oye o ve cosas que otros no perciben, o está muy desorientado.',
          'Está muy agitado o agresivo y puede lastimarse o lastimar a otros.',
          'Consumió alcohol o sustancias en una cantidad que pone en riesgo su vida.',
        ],
      },
      {
        titulo: 'Qué hacer en los primeros minutos',
        pasos: [
          'Si hay riesgo para la vida, llama al 123 o ve al servicio de urgencias más cercano. Las urgencias no requieren cita ni remisión.',
          'No dejes sola a la persona. Si no puedes estar físicamente, mantente en línea mientras llega ayuda.',
          'Retira o aleja los medios con los que podría hacerse daño. La OMS señala que restringir el acceso a los medios es una de las intervenciones de prevención del suicidio más eficaces.',
          'Habla con calma y sin juzgar. Pregunta directamente si está pensando en quitarse la vida: preguntar no aumenta el riesgo.',
        ],
      },
      {
        titulo: 'Líneas gratuitas en Colombia',
        parrafos: [
          'La Línea 106 es la línea nacional de salud mental del Ministerio de Salud: es gratuita, confidencial, funciona 24 horas y se marca desde cualquier celular o teléfono fijo del país. Ofrece escucha, primeros auxilios psicológicos, intervención en crisis y orientación hacia servicios especializados. En ciudades como Bogotá, Medellín o Cali la atiende la secretaría de salud local.',
          'En el recuadro de este artículo puedes elegir tu ciudad para ver también la línea local.',
        ],
      },
      {
        titulo: 'Por qué importa actuar',
        parrafos: [
          'Según la OMS, más de 720.000 personas mueren por suicidio cada año, y es la tercera causa de muerte entre personas de 15 a 29 años. Muchas de esas muertes son prevenibles con una respuesta a tiempo.',
        ],
      },
    ],
    faq: [
      {
        pregunta: '¿Puedo ir a urgencias por una crisis emocional?',
        respuesta:
          'Sí. Una crisis de salud mental con riesgo para la vida es una urgencia médica. La Ley 1616 de 2013 incluye la atención de urgencias y la atención prehospitalaria en salud mental.',
      },
      {
        pregunta: '¿Y si no estoy seguro de que sea una emergencia?',
        respuesta:
          'Llama igual a una línea de orientación: los profesionales te ayudarán a evaluar la situación. Es mejor preguntar que esperar.',
      },
    ],
    fuentes: [F.omsSuicidio, F.linea106, F.ley1616],
  },

  // ═══════════════════════ CÓMO ═══════════════════════
  {
    slug: 'como-calmar-un-ataque-de-panico',
    tipo: 'Cómo',
    titulo: '¿Cómo calmar un ataque de pánico? Pasos que puedes hacer ahora',
    descripcion:
      'Qué es un ataque de pánico, cuánto dura y qué hacer paso a paso para atravesarlo, según el NHS del Reino Unido.',
    respuestaCorta:
      'Respira lento (exhalando más largo de lo que inhalas), recuérdate que es un ataque de pánico y que pasará, y ancla tu atención en lo que ves, oyes y tocas. Según el NHS, un ataque de pánico suele durar entre 5 y 20 minutos. Si es la primera vez o tienes dolor en el pecho, consulta a urgencias para descartar otra causa.',
    categoria: 'Ansiedad',
    emoji: '🌬️',
    lectura: '6 min',
    publicado: '2026-09-30',
    actualizado: '2026-09-30',
    secciones: [
      {
        titulo: 'Qué es un ataque de pánico',
        parrafos: [
          'Es una oleada repentina de miedo intenso con síntomas físicos muy fuertes. El NHS describe, entre otros: corazón acelerado, respiración rápida o sensación de falta de aire, temblor, sudoración, mareo, hormigueo en dedos o labios, náuseas y sensación de perder el control.',
          'Se sienten peligrosos, pero un ataque de pánico en sí mismo no daña el corazón ni hace que "te vuelvas loco". Es la respuesta de alarma del cuerpo activándose cuando no hay un peligro real.',
        ],
      },
      {
        titulo: 'Paso a paso durante el ataque',
        pasos: [
          'Nómbralo: "Esto es un ataque de pánico. Es muy incómodo, pero va a pasar." Pelear contra las sensaciones suele intensificarlas.',
          'Respira lento: inhala por la nariz contando hasta 4 y exhala suavemente por la boca contando hasta 6. El NHS advierte que la respiración rápida o irregular empeora síntomas como el mareo; controlarla ayuda a romper el ciclo.',
          'Si puedes, quédate donde estás. Huir enseña al cerebro que el lugar era peligroso.',
          'Ancla tus sentidos: nombra 5 cosas que ves, 4 que puedes tocar, 3 que escuchas, 2 que hueles y 1 que saboreas.',
          'Cuando baje la intensidad, retoma poco a poco lo que estabas haciendo.',
        ],
        herramienta: 'respiracion',
      },
      {
        titulo: 'Cuándo buscar atención médica',
        lista: [
          'Es la primera vez que te pasa.',
          'Tienes dolor en el pecho, dificultad para respirar que no mejora o te desmayas.',
          'Tienes una condición cardiaca o respiratoria conocida.',
        ],
        parrafos: [
          'En esos casos ve a urgencias: es importante descartar otras causas antes de asumir que es ansiedad.',
        ],
      },
      {
        titulo: 'Si los ataques se repiten',
        parrafos: [
          'Cuando los ataques son recurrentes y empiezas a evitar lugares o situaciones por miedo a que ocurran, puede tratarse de un trastorno de pánico. La terapia cognitivo-conductual es un tratamiento de primera línea para este trastorno y tiene muy buenos resultados. Vale la pena consultar.',
        ],
      },
    ],
    faq: [
      {
        pregunta: '¿Puedo morir por un ataque de pánico?',
        respuesta:
          'El ataque de pánico en sí no es mortal, aunque se sienta así. Pero si es la primera vez o hay dolor en el pecho, consulta para descartar causas médicas.',
      },
      {
        pregunta: '¿Respirar en una bolsa de papel sirve?',
        respuesta:
          'No se recomienda. Es más seguro practicar respiración lenta con exhalación prolongada.',
      },
    ],
    fuentes: [
      {
        titulo: 'Get help with anxiety, fear or panic',
        entidad: 'NHS (Servicio Nacional de Salud del Reino Unido)',
        anio: '2024',
        url: 'https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/anxiety-fear-panic/',
      },
      {
        titulo: 'How to deal with panic and anxiety',
        entidad: 'NHS inform (Escocia)',
        anio: '2024',
        url: 'https://www.nhsinform.scot/healthy-living/mental-wellbeing/anxiety-and-panic/how-to-deal-with-panic-and-anxiety/',
      },
      {
        titulo: 'Panic Attacks & Panic Disorder',
        entidad: 'Cleveland Clinic',
        anio: '2024',
        url: 'https://my.clevelandclinic.org/health/diseases/4451-panic-attack-panic-disorder',
      },
    ],
  },
  {
    slug: 'como-ayudar-a-alguien-que-piensa-en-el-suicidio',
    tipo: 'Cómo',
    titulo: '¿Cómo ayudar a alguien que piensa en el suicidio? Qué decir y qué evitar',
    descripcion:
      'Guía práctica basada en evidencia para acompañar a un familiar o amigo con pensamientos suicidas: preguntar, escuchar, proteger y conectar con ayuda.',
    respuestaCorta:
      'Pregúntale directamente si está pensando en quitarse la vida; la evidencia muestra que preguntar no aumenta el riesgo. Escucha sin juzgar, no prometas guardar el secreto, aleja los medios con los que podría hacerse daño y acompáñalo a buscar ayuda profesional. Si el riesgo es inmediato, llama al 123.',
    categoria: 'Crisis',
    emoji: '🤝',
    lectura: '7 min',
    publicado: '2026-09-30',
    actualizado: '2026-09-30',
    crisisDestacada: true,
    secciones: [
      {
        titulo: 'El mito que más daño hace',
        parrafos: [
          'Mucha gente evita preguntar por miedo a "meterle la idea en la cabeza". Una revisión de investigadores del King\'s College de Londres (Dazzi et al., 2014) analizó 13 estudios y no encontró aumento de la ideación suicida por preguntar. Hablar del tema puede incluso reducirla.',
        ],
      },
      {
        titulo: 'Qué hacer: 5 pasos',
        pasos: [
          'Pregunta directamente: "¿Estás pensando en quitarte la vida?". Usa palabras claras; los rodeos transmiten que el tema es prohibido.',
          'Escucha sin juzgar ni minimizar. Evita frases como "no digas eso" o "tienes todo para ser feliz". Mejor: "Gracias por contármelo. Quiero entender lo que estás viviendo."',
          'Protege: pregunta si tiene un plan o acceso a medios, y ayuda a alejarlos (medicamentos, armas, venenos). La OMS identifica la restricción del acceso a los medios como una intervención eficaz.',
          'Conecta con ayuda: acompáñale a llamar a una línea, a pedir cita o a urgencias. Ofrece ir con la persona.',
          'Haz seguimiento: escríbele o llámale en los días siguientes. Sentirse acompañado es un factor protector.',
        ],
      },
      {
        titulo: 'Qué evitar',
        lista: [
          'Prometer que guardarás el secreto: su vida es más importante.',
          'Retarle, sermonear o hablar de culpa o de "egoísmo".',
          'Dejarle sola si el riesgo es alto.',
          'Intentar ser su único apoyo: tú también necesitas ayuda para acompañar.',
        ],
      },
      {
        titulo: 'Cuídate tú también',
        parrafos: [
          'Acompañar a alguien en crisis es emocionalmente exigente. Habla con alguien de confianza o con un profesional sobre lo que estás viviendo.',
        ],
      },
    ],
    faq: [
      {
        pregunta: '¿Y si lo dice "para llamar la atención"?',
        respuesta:
          'Toda mención del suicidio debe tomarse en serio. Si alguien necesita llamar la atención de esa manera, es porque necesita ayuda.',
      },
      {
        pregunta: '¿Qué hago si se niega a buscar ayuda?',
        respuesta:
          'Mantén el vínculo, insiste con cariño y, si el riesgo es inmediato, llama al 123 aunque no esté de acuerdo.',
      },
    ],
    fuentes: [
      {
        titulo: 'Does asking about suicide and related behaviours induce suicidal ideation? What is the evidence?',
        entidad: 'Psychological Medicine, 44(16) — Dazzi, Gribble, Wessely y Fear',
        anio: '2014',
        url: 'https://www.cambridge.org/core/journals/psychological-medicine/article/does-asking-about-suicide-and-related-behaviours-induce-suicidal-ideation-what-is-the-evidence/FCAEE9E5BC840D76CF10AEBECD921AC9',
      },
      F.omsSuicidio,
      F.linea106,
    ],
  },
  {
    slug: 'como-pedir-cita-con-psicologo-por-eps-en-colombia',
    tipo: 'Cómo',
    titulo: '¿Cómo pedir cita con psicología por tu EPS en Colombia? Paso a paso',
    descripcion:
      'La ruta para acceder a psicología a través de tu EPS en Colombia, tus derechos según la Ley 1616 de 2013 y qué hacer si te niegan la atención.',
    respuestaCorta:
      'En la mayoría de EPS el camino es: pedir cita de medicina general, contarle al médico lo que sientes y solicitar la remisión a psicología. Con la remisión, la EPS te asigna la cita en su red. La atención en salud mental es un derecho garantizado por la Ley 1616 de 2013; si te la niegan o demoran sin justificación, puedes radicar una PQRS y escalar a la Superintendencia Nacional de Salud.',
    categoria: 'Acceso',
    emoji: '🏥',
    lectura: '6 min',
    publicado: '2026-09-30',
    actualizado: '2026-09-30',
    secciones: [
      {
        titulo: 'La ruta habitual',
        pasos: [
          'Pide una cita de medicina general por la app, la línea o la página de tu EPS.',
          'En la consulta, sé concreto: qué sientes, desde cuándo, y cómo afecta tu sueño, trabajo, estudio o relaciones. Si tienes pensamientos de hacerte daño, dilo: eso cambia la prioridad.',
          'Solicita explícitamente la remisión a psicología (y a psiquiatría si el médico lo considera).',
          'Con la orden, sigue el proceso de autorización de tu EPS y agenda con la IPS asignada.',
          'Guarda copia de todas las órdenes y números de radicado.',
        ],
      },
      {
        titulo: 'Tus derechos (Ley 1616 de 2013)',
        lista: [
          'Recibir atención integral, integrada y humanizada por equipos de salud mental.',
          'Recibir información y psicoeducación sobre tu condición y el autocuidado.',
          'No ser discriminado ni estigmatizado por consultar.',
          'Acceder a modalidades como consulta externa, atención domiciliaria, centros comunitarios y atención de urgencias.',
        ],
      },
      {
        titulo: 'Si hay una urgencia, no necesitas remisión',
        parrafos: [
          'Si hay riesgo para tu vida o la de otra persona, ve directamente a urgencias o llama al 123. La atención de urgencias no requiere autorización previa.',
        ],
      },
      {
        titulo: 'Si te niegan o demoran la cita',
        pasos: [
          'Radica una PQRS (petición, queja, reclamo o sugerencia) ante tu EPS y guarda el número de radicado.',
          'Si no responde o la respuesta no resuelve, presenta una queja ante la Superintendencia Nacional de Salud (Supersalud).',
          'Si la negación pone en riesgo tu salud, puedes interponer una acción de tutela para proteger tu derecho fundamental a la salud.',
        ],
      },
      {
        titulo: 'Mientras esperas',
        parrafos: [
          'Los tiempos de espera pueden ser largos. Mientras tanto, puedes usar líneas de orientación gratuitas, herramientas de autocuidado y, si tus recursos lo permiten, consulta particular o en línea con psicólogos con tarjeta profesional vigente.',
        ],
      },
    ],
    faq: [
      {
        pregunta: '¿Todas las EPS exigen remisión para psicología?',
        respuesta:
          'La mayoría la solicitan a través de medicina general, pero el proceso varía. Consulta la guía de tu EPS o pregunta en su línea de atención.',
      },
      {
        pregunta: '¿Cómo verifico que un psicólogo está habilitado?',
        respuesta:
          'En Colombia los psicólogos deben tener tarjeta profesional expedida por el Colegio Colombiano de Psicólogos (COLPSIC). Puedes pedírsela o consultarla.',
      },
    ],
    fuentes: [
      F.ley1616,
      {
        titulo: 'Superintendencia Nacional de Salud — Atención al ciudadano',
        entidad: 'Supersalud',
        anio: '2026',
        url: 'https://www.supersalud.gov.co',
      },
      {
        titulo: 'Colegio Colombiano de Psicólogos',
        entidad: 'COLPSIC',
        anio: '2026',
        url: 'https://www.colpsic.org.co',
      },
    ],
  },
  {
    slug: 'como-dormir-mejor-si-tienes-insomnio',
    tipo: 'Cómo',
    titulo: '¿Cómo dormir mejor si tienes insomnio? Lo que recomienda la ciencia',
    descripcion:
      'Cuántas horas necesitas dormir, por qué el sueño afecta tu salud mental y las técnicas de la terapia cognitivo-conductual para el insomnio (TCC-I).',
    respuestaCorta:
      'Los adultos necesitan 7 horas o más de sueño de forma regular (Academia Americana de Medicina del Sueño). Para el insomnio crónico, el tratamiento inicial recomendado es la terapia cognitivo-conductual para el insomnio (TCC-I), que incluye horarios fijos, usar la cama solo para dormir y levantarse si no concilias el sueño.',
    categoria: 'Hábitos',
    emoji: '😴',
    lectura: '7 min',
    publicado: '2026-09-30',
    actualizado: '2026-09-30',
    secciones: [
      {
        titulo: 'Cuánto necesitas dormir',
        parrafos: [
          'Un panel de 15 expertos de la Academia Americana de Medicina del Sueño (AASM) y la Sleep Research Society concluyó que los adultos deben dormir 7 horas o más por noche de forma regular. Dormir menos de forma habitual se asocia con más riesgo de depresión, accidentes, obesidad, diabetes tipo 2 y enfermedad cardiaca.',
        ],
      },
      {
        titulo: 'El tratamiento que más funciona: TCC-I',
        parrafos: [
          'El Colegio Americano de Médicos (ACP) recomienda, con recomendación fuerte, que todos los adultos con insomnio crónico reciban terapia cognitivo-conductual para el insomnio como tratamiento inicial, antes que los medicamentos.',
          'La TCC-I combina técnicas conductuales, cognitivas y de higiene del sueño. Algunas de sus bases:',
        ],
        pasos: [
          'Levántate a la misma hora todos los días, incluidos fines de semana. Es la ancla de tu reloj biológico.',
          'Usa la cama solo para dormir (y la intimidad). Nada de celular, series o trabajo en la cama.',
          'Si no te duermes en un rato (unos 20 minutos, sin mirar el reloj), levántate, haz algo tranquilo con luz tenue y vuelve cuando tengas sueño.',
          'Ve a la cama solo cuando tengas sueño, no solo cansancio.',
          'Evita siestas largas durante el día.',
          'Cuestiona los pensamientos catastróficos sobre el sueño ("si no duermo 8 horas mañana será un desastre"): aumentan la activación y empeoran el insomnio.',
        ],
      },
      {
        titulo: 'Higiene del sueño: útil, pero no suficiente sola',
        lista: [
          'Limita la cafeína en la tarde y la noche.',
          'Evita el alcohol cerca de la hora de dormir: fragmenta el sueño.',
          'Mantén el cuarto oscuro, silencioso y fresco.',
          'Exponte a luz natural en la mañana.',
        ],
      },
      {
        titulo: 'Para soltar la activación antes de dormir',
        parrafos: [
          'Si te acuestas con la mente acelerada, unos minutos de respiración lenta con exhalación prolongada pueden ayudarte a bajar la activación. No es un tratamiento del insomnio por sí sola, pero es un buen complemento de la rutina previa al sueño.',
        ],
        herramienta: 'respiracion',
      },
      {
        titulo: 'Cuándo consultar',
        parrafos: [
          'Consulta si tienes dificultad para dormir al menos 3 noches por semana durante 3 meses o más, si el insomnio afecta tu funcionamiento en el día, o si roncas fuerte o haces pausas al respirar mientras duermes (puede ser apnea del sueño).',
        ],
      },
    ],
    faq: [
      {
        pregunta: '¿Las pastillas para dormir son mala idea?',
        respuesta:
          'No siempre, pero la ACP recomienda empezar por la TCC-I y decidir los medicamentos con tu médico si la terapia no fue suficiente. No te automediques.',
      },
      {
        pregunta: '¿Por qué la TCC-I me pide pasar menos tiempo en la cama?',
        respuesta:
          'La restricción de sueño concentra el sueño y lo hace más profundo. Debe aplicarse con guía profesional, sobre todo si tienes trastorno bipolar o epilepsia.',
      },
    ],
    fuentes: [
      {
        titulo: 'Seven or more hours of sleep per night: A health necessity for adults',
        entidad: 'American Academy of Sleep Medicine (AASM)',
        anio: '2015',
        url: 'https://aasm.org/seven-or-more-hours-of-sleep-per-night-a-health-necessity-for-adults/',
      },
      {
        titulo: 'Management of Chronic Insomnia Disorder in Adults: A Clinical Practice Guideline',
        entidad: 'American College of Physicians — Annals of Internal Medicine',
        anio: '2016',
        url: 'https://www.acpjournals.org/doi/10.7326/M15-2175',
      },
    ],
  },

  // ═══════════════════════ CUÁNTO ═══════════════════════
  {
    slug: 'cuanto-dura-una-terapia-psicologica',
    tipo: 'Cuánto',
    titulo: '¿Cuánto dura una terapia psicológica? Lo que dice la investigación',
    descripcion:
      'Cuántas sesiones de psicoterapia se necesitan para notar mejoría y para recuperarse, según los estudios de dosis-respuesta y las guías clínicas.',
    respuestaCorta:
      'Depende del motivo de consulta, pero la investigación da una referencia: cerca de la mitad de las personas muestran una mejoría confiable hacia la sesión 8, y alrededor del 50 % alcanza una recuperación clínica entre las sesiones 13 y 18. Para la depresión, la guía británica NICE de 2009 planteaba entre 16 y 20 sesiones de TCC en 3 a 4 meses.',
    categoria: 'Terapia',
    emoji: '⏳',
    lectura: '6 min',
    publicado: '2026-09-30',
    actualizado: '2026-09-30',
    secciones: [
      {
        titulo: 'El efecto dosis-respuesta',
        parrafos: [
          'Los investigadores Hansen, Lambert y Forman (2002) revisaron datos de miles de pacientes en atención real y describieron la relación entre número de sesiones y mejoría. Sus hallazgos, repetidos en estudios posteriores:',
        ],
        lista: [
          'Alrededor de 8 sesiones para que el 50 % muestre una mejoría confiable.',
          'Entre 13 y 18 sesiones para que el 50 % alcance una recuperación clínicamente significativa.',
          'Las personas con problemas más complejos o de larga duración suelen necesitar más.',
        ],
      },
      {
        titulo: 'Referencias de las guías clínicas',
        parrafos: [
          'Para la depresión, la guía NICE CG90 (2009) del Reino Unido indicaba entre 16 y 20 sesiones de TCC o de psicoterapia interpersonal durante 3 a 4 meses, más 3 o 4 sesiones de seguimiento en los meses siguientes. La guía se actualizó en 2022, pero esta referencia sigue siendo útil para dimensionar un proceso.',
        ],
      },
      {
        titulo: 'La frecuencia importa',
        parrafos: [
          'Al inicio lo habitual son sesiones semanales. A medida que mejoras, pueden espaciarse. Un proceso muy intermitente (una sesión al mes desde el principio) suele avanzar más lento.',
        ],
      },
      {
        titulo: 'Cómo saber si estás avanzando',
        lista: [
          'Tu terapeuta y tú definieron objetivos concretos.',
          'Revisan el progreso cada cierto número de sesiones (idealmente con cuestionarios).',
          'Notas cambios en tu vida diaria, no solo en la sesión.',
          'Si tras varias sesiones no notas ningún cambio, dilo: ajustar el enfoque o cambiar de profesional es válido.',
        ],
      },
    ],
    faq: [
      {
        pregunta: '¿La terapia es para toda la vida?',
        respuesta:
          'No necesariamente. Muchos procesos tienen objetivos y un final claro; algunas personas vuelven después para "sesiones de refuerzo".',
      },
      {
        pregunta: '¿Por qué a veces me siento peor al principio?',
        respuesta:
          'Hablar de temas difíciles puede remover emociones. Coméntalo con tu terapeuta; es parte del proceso, pero no debe ser permanente.',
      },
    ],
    fuentes: [
      {
        titulo: 'The Psychotherapy Dose-Response Effect and Its Implications for Treatment Delivery Services',
        entidad: 'Clinical Psychology: Science and Practice — Hansen, Lambert y Forman',
        anio: '2002',
        url: 'https://onlinelibrary.wiley.com/doi/10.1093/clipsy.9.3.329',
      },
      {
        titulo: 'Depression in adults: recognition and management (CG90)',
        entidad: 'National Institute for Health and Care Excellence (NICE)',
        anio: '2009',
        url: 'https://data.parliament.uk/DepositedPapers/Files/DEP2012-0120/DEP2012-0120.pdf',
      },
    ],
  },
  {
    slug: 'cuanto-ejercicio-necesitas-para-tu-salud-mental',
    tipo: 'Cuánto',
    titulo: '¿Cuánto ejercicio necesitas para cuidar tu salud mental?',
    descripcion:
      'La recomendación de la OMS y lo que encontró la revisión más grande hasta la fecha sobre ejercicio, depresión y ansiedad (BJSM, 2023).',
    respuestaCorta:
      'La OMS recomienda a los adultos entre 150 y 300 minutos semanales de actividad aeróbica moderada (por ejemplo, caminar a paso rápido), o entre 75 y 150 minutos de actividad intensa. Una revisión de 1.039 ensayos con más de 128.000 personas encontró que el ejercicio reduce de forma importante los síntomas de depresión y ansiedad.',
    categoria: 'Hábitos',
    emoji: '🏃',
    lectura: '6 min',
    publicado: '2026-09-30',
    actualizado: '2026-09-30',
    secciones: [
      {
        titulo: 'La recomendación oficial',
        parrafos: [
          'Las guías de la OMS de 2020 recomiendan a los adultos de 18 a 64 años hacer entre 150 y 300 minutos a la semana de actividad aeróbica moderada, o entre 75 y 150 minutos de actividad intensa, o una combinación equivalente. También recomiendan fortalecer los músculos al menos 2 días por semana y reducir el tiempo sentado.',
          'En la práctica: 30 minutos de caminata rápida 5 días a la semana ya te ubican en el rango.',
        ],
      },
      {
        titulo: 'Lo que dice la evidencia sobre salud mental',
        parrafos: [
          'En 2023, Singh y colaboradores publicaron en el British Journal of Sports Medicine una revisión que integró 97 revisiones sistemáticas, 1.039 ensayos y 128.119 participantes. Encontraron que la actividad física mejora los síntomas de depresión, ansiedad y malestar psicológico en adultos.',
        ],
        lista: [
          'Todos los tipos de ejercicio ayudaron: caminar, entrenamiento de fuerza, pilates y yoga.',
          'La mayor intensidad se asoció con mayores mejorías.',
          'Las intervenciones de 12 semanas o menos fueron las más efectivas: los beneficios no tardan meses en aparecer.',
          'Los beneficios fueron notables en personas con depresión, en mujeres embarazadas y en posparto, y en personas sanas.',
        ],
      },
      {
        titulo: 'Una advertencia honesta',
        parrafos: [
          'Los autores proponen que el ejercicio sea un pilar del tratamiento de la depresión y la ansiedad. Eso no significa que reemplace la terapia o la medicación: si estás en tratamiento, el ejercicio se suma a él. No suspendas medicamentos sin hablar con tu médico.',
        ],
      },
      {
        titulo: 'Cómo empezar si hoy no te mueves',
        pasos: [
          'Empieza con 10 minutos de caminata al día. Algo es mejor que nada, según la propia OMS.',
          'Súbelo 5 minutos cada semana.',
          'Elige algo que disfrutes: bailar, montar bicicleta o nadar cuentan.',
          'Agenda el ejercicio como una cita. Con depresión, las ganas suelen llegar después de empezar, no antes.',
        ],
      },
    ],
    faq: [
      {
        pregunta: '¿Sirve si hago todo el fin de semana?',
        respuesta:
          'Para la salud física, acumular los minutos cuenta. Para el ánimo, la regularidad (varios días por semana) suele ayudar más.',
      },
      {
        pregunta: '¿El yoga cuenta?',
        respuesta: 'Sí. La revisión de 2023 encontró beneficios también con yoga y ejercicios de mente-cuerpo.',
      },
    ],
    fuentes: [
      {
        titulo: 'Directrices de la OMS sobre actividad física y comportamientos sedentarios',
        entidad: 'Organización Mundial de la Salud — British Journal of Sports Medicine',
        anio: '2020',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7719906/',
      },
      {
        titulo: 'Effectiveness of physical activity interventions for improving depression, anxiety and distress: an overview of systematic reviews',
        entidad: 'British Journal of Sports Medicine — Singh et al.',
        anio: '2023',
        url: 'https://doi.org/10.1136/bjsports-2022-106195',
      },
    ],
  },
  {
    slug: 'cuanto-tiempo-en-redes-sociales-es-saludable',
    tipo: 'Cuánto',
    titulo: '¿Cuánto tiempo en redes sociales es saludable para tu mente?',
    descripcion:
      'Un experimento de la Universidad de Pensilvania limitó las redes a 30 minutos diarios. Esto fue lo que pasó con la soledad y la depresión.',
    respuestaCorta:
      'No hay una cifra universal, pero un experimento de la Universidad de Pensilvania (Hunt et al., 2018) encontró que limitar Facebook, Instagram y Snapchat a unos 30 minutos diarios en total durante 3 semanas redujo significativamente la soledad y la depresión, sobre todo en quienes empezaron con más síntomas.',
    categoria: 'Hábitos',
    emoji: '📱',
    lectura: '5 min',
    publicado: '2026-09-30',
    actualizado: '2026-09-30',
    secciones: [
      {
        titulo: 'El experimento',
        parrafos: [
          'En el estudio "No More FOMO", 143 estudiantes universitarios fueron asignados al azar a dos grupos. Uno siguió usando redes como siempre; el otro limitó su uso a 10 minutos por plataforma al día en Facebook, Instagram y Snapchat (30 minutos en total) durante 3 semanas.',
        ],
      },
      {
        titulo: 'Los resultados',
        lista: [
          'El grupo que limitó el uso mostró reducciones significativas en soledad y depresión frente al grupo control.',
          'El efecto fue más marcado en quienes llegaron al estudio con más síntomas de depresión.',
          'Ambos grupos redujeron ansiedad y FOMO (miedo a perderse algo), posiblemente por el solo hecho de medir su propio uso.',
        ],
      },
      {
        titulo: 'Límites del estudio',
        parrafos: [
          'Fue una muestra pequeña de jóvenes universitarios de 18 a 22 años, con tres plataformas. No sabemos si los resultados aplican igual a otras edades o a redes como TikTok. Aun así, es de los pocos estudios experimentales (no solo de correlación) sobre el tema.',
        ],
      },
      {
        titulo: 'Cómo aplicarlo',
        pasos: [
          'Mide primero: revisa el tiempo de pantalla de tu celular durante una semana. Medir ya ayuda.',
          'Pon límites por app desde la configuración del teléfono.',
          'Quita las notificaciones que no sean de personas.',
          'Deja el celular fuera del cuarto por la noche.',
          'Observa cómo te sientes después de usar cada red: deja de seguir las cuentas que te hacen compararte o sentirte peor.',
        ],
      },
    ],
    faq: [
      {
        pregunta: '¿Debo borrar mis redes?',
        respuesta:
          'No es necesario. El estudio mostró beneficios limitando, no eliminando. Lo importante es el cómo y el cuánto.',
      },
      {
        pregunta: '¿Hablar por WhatsApp cuenta?',
        respuesta:
          'El estudio no lo midió. La conversación con personas cercanas suele ser distinta del desplazamiento pasivo por contenido.',
      },
    ],
    fuentes: [
      {
        titulo: 'No More FOMO: Limiting Social Media Decreases Loneliness and Depression',
        entidad: 'Journal of Social and Clinical Psychology, 37(10) — Hunt, Marx, Lipson y Young',
        anio: '2018',
        url: 'https://guilfordjournals.com/doi/10.1521/jscp.2018.37.10.751',
      },
      {
        titulo: 'Social media use increases depression and loneliness, study finds',
        entidad: 'University of Pennsylvania (vía ScienceDaily)',
        anio: '2018',
        url: 'https://www.sciencedaily.com/releases/2018/11/181108164316.htm',
      },
    ],
  },
  {
    slug: 'cuanto-tarda-en-hacer-efecto-un-antidepresivo',
    tipo: 'Cuánto',
    titulo: '¿Cuánto tarda en hacer efecto un antidepresivo? Lo que debes saber',
    descripcion:
      'Cuándo empiezan a funcionar los antidepresivos, cuánto tiempo se toman y por qué no se deben suspender de golpe, según el NHS.',
    respuestaCorta:
      'Según el NHS, los antidepresivos suelen empezar a notarse en 1 a 2 semanas, pero pueden tardar de 4 hasta 8 semanas en dar su efecto completo. Se recomienda tomarlos al menos 6 meses después de sentirte mejor y nunca suspenderlos de golpe sin indicación médica.',
    categoria: 'Tratamiento',
    emoji: '💊',
    lectura: '5 min',
    publicado: '2026-09-30',
    actualizado: '2026-09-30',
    secciones: [
      {
        titulo: 'Los tiempos reales',
        lista: [
          '1 a 2 semanas: pueden aparecer los primeros cambios (a veces en el sueño o la energía, antes que en el ánimo).',
          'Hasta 4 a 8 semanas: tiempo para ver el efecto completo.',
          'Primeras semanas: pueden aparecer efectos secundarios, que con frecuencia disminuyen en pocas semanas.',
        ],
      },
      {
        titulo: 'Cuánto tiempo se toman',
        parrafos: [
          'El NHS recomienda continuar el tratamiento al menos 6 meses después de sentirte mejor, para reducir el riesgo de recaída. Si has tenido 2 o más episodios de depresión, el médico puede recomendar mantenerlo por más tiempo, incluso hasta 2 años.',
        ],
      },
      {
        titulo: 'Por qué no suspenderlo por tu cuenta',
        parrafos: [
          'Dejar un antidepresivo de golpe puede causar síntomas de discontinuación (mareo, irritabilidad, alteraciones del sueño, sensaciones como "corrientazos") y aumenta el riesgo de recaída. Cuando llegue el momento, tu médico te indicará cómo reducir la dosis de forma gradual.',
        ],
      },
      {
        titulo: 'Señales para consultar pronto',
        lista: [
          'No notas ninguna mejoría después de 4 a 6 semanas.',
          'Los efectos secundarios son muy molestos o no disminuyen.',
          'Aparecen o empeoran los pensamientos de hacerte daño, especialmente al inicio del tratamiento o al cambiar la dosis. En ese caso busca ayuda de inmediato.',
        ],
      },
      {
        titulo: 'Medicación y terapia: mejor juntas',
        parrafos: [
          'Para la depresión moderada o grave, combinar medicamentos con psicoterapia suele dar mejores resultados que cada uno por separado. En Colombia, los antidepresivos solo pueden ser formulados por un médico; el psicólogo acompaña con la terapia.',
        ],
      },
    ],
    faq: [
      {
        pregunta: '¿Los antidepresivos crean adicción?',
        respuesta:
          'No generan adicción como otras sustancias, pero el cuerpo se adapta a ellos; por eso se retiran de forma gradual y con indicación médica.',
      },
      {
        pregunta: '¿Puedo tomar alcohol?',
        respuesta:
          'No se recomienda: el alcohol empeora la depresión y puede interactuar con el medicamento. Pregúntale a tu médico por tu caso.',
      },
    ],
    fuentes: [
      {
        titulo: 'Antidepressants',
        entidad: 'NHS (Servicio Nacional de Salud del Reino Unido)',
        anio: '2024',
        url: 'https://www.nhs.uk/medicines/antidepressants/',
      },
      {
        titulo: 'How and when to take antidepressants',
        entidad: 'HSE (Servicio de Salud de Irlanda)',
        anio: '2024',
        url: 'https://www2.hse.ie/medicines/antidepressants/how-and-when-to-take-antidepressants/',
      },
      F.omsDepresion,
    ],
  },

  // ═══════════════════ FASE EDITORIAL 2 ═══════════════════
  {
    slug: 'como-diferenciar-el-estres-laboral-del-burnout',
    tipo: 'Cómo',
    titulo: '¿Cómo diferenciar el estrés laboral del síndrome de burnout?',
    descripcion:
      'Qué dice la OMS (CIE-11) sobre el burnout, en qué se diferencia del estrés y de la depresión, y qué obligaciones tienen las empresas en Colombia.',
    respuestaCorta:
      'El estrés laboral es una respuesta a exigencias concretas y suele bajar cuando la presión cede. El burnout, según la CIE-11 de la OMS, es el resultado del estrés crónico en el trabajo que no se ha manejado con éxito, y tiene tres dimensiones: agotamiento, distancia mental o cinismo hacia el trabajo y sensación de ineficacia. La OMS lo clasifica como un fenómeno ocupacional, no como una enfermedad.',
    categoria: 'Trabajo',
    emoji: '🔥',
    lectura: '7 min',
    publicado: '2026-09-30',
    actualizado: '2026-09-30',
    secciones: [
      {
        titulo: 'Estrés: exceso de exigencia',
        parrafos: [
          'El estrés aparece cuando las demandas (plazos, carga, conflictos) superan por un tiempo los recursos que tienes. Es activación: urgencia, tensión, dificultad para desconectarte. Suele tener un "después": cuando pasa el cierre de mes o se entrega el proyecto, el cuerpo se recupera.',
        ],
      },
      {
        titulo: 'Burnout: la definición de la OMS',
        parrafos: [
          'Desde la CIE-11 (código QD85), la OMS define el burnout como un síndrome resultado del estrés crónico en el lugar de trabajo que no se ha manejado con éxito. Tiene tres dimensiones:',
        ],
        lista: [
          'Sentimientos de falta de energía o agotamiento.',
          'Aumento de la distancia mental con respecto al trabajo, o sentimientos negativos o cínicos hacia él.',
          'Sensación de ineficacia y falta de realización profesional.',
        ],
      },
      {
        titulo: 'Tres diferencias prácticas',
        lista: [
          'Energía: en el estrés hay exceso de activación ("no paro"); en el burnout predomina el vaciamiento ("ya no puedo más").',
          'Relación con el trabajo: con estrés todavía te importa hacerlo bien; con burnout aparece el cinismo y el desapego ("me da igual").',
          'Recuperación: el estrés mejora con descanso; el burnout suele persistir después de un fin de semana o unas vacaciones cortas.',
        ],
      },
      {
        titulo: 'Burnout no es lo mismo que depresión',
        parrafos: [
          'La OMS aclara que el burnout se refiere solo al contexto laboral y no debe usarse para describir experiencias en otras áreas de la vida. Si el desánimo, la falta de placer o la desesperanza aparecen también fuera del trabajo (con tu familia, tus aficiones, los fines de semana), podría tratarse de depresión, que sí es una condición de salud y tiene tratamiento. El PHQ-9 puede ayudarte a revisarlo.',
        ],
        herramienta: 'phq9',
      },
      {
        titulo: 'En Colombia, tu empresa tiene obligaciones',
        parrafos: [
          'La Resolución 2646 de 2008 obliga a los empleadores a identificar, evaluar e intervenir los factores de riesgo psicosocial. La Resolución 2764 de 2022 del Ministerio del Trabajo adoptó la batería de instrumentos para evaluarlos, una guía técnica de intervención y protocolos específicos, entre ellos uno para el síndrome de agotamiento laboral (burnout).',
          'Puedes solicitar información sobre la evaluación de riesgo psicosocial al área de Seguridad y Salud en el Trabajo (SG-SST) de tu empresa o a tu ARL.',
        ],
      },
      {
        titulo: 'Qué hacer',
        pasos: [
          'Nombra lo que pasa: identifica si es un pico de estrés o un desgaste sostenido con las tres dimensiones.',
          'Protege la recuperación: sueño, pausas reales, límites de horario y desconexión del celular laboral.',
          'Habla con tu jefe o con SG-SST sobre la carga, el control sobre tu trabajo y el apoyo que recibes.',
          'Consulta a un profesional si hay agotamiento persistente, síntomas físicos o señales de depresión.',
        ],
      },
    ],
    faq: [
      {
        pregunta: '¿Me pueden dar incapacidad por burnout?',
        respuesta:
          'La incapacidad la determina un médico según tu estado de salud. Como el burnout no es una enfermedad en la CIE-11, el médico evaluará los diagnósticos asociados (por ejemplo, ansiedad o depresión).',
      },
      {
        pregunta: '¿Solo le pasa a quien trabaja mucho?',
        respuesta:
          'No solo depende de las horas: influyen también la falta de control, el poco reconocimiento, los conflictos y la falta de apoyo.',
      },
    ],
    fuentes: [
      {
        titulo: 'Burn-out an "occupational phenomenon": International Classification of Diseases',
        entidad: 'Organización Mundial de la Salud (OMS)',
        anio: '2019',
        url: 'https://www.who.int/news/item/28-05-2019-burn-out-an-occupational-phenomenon-international-classification-of-diseases',
      },
      {
        titulo: 'Resolución 2764 de 2022 — Batería de riesgo psicosocial y protocolos de intervención',
        entidad: 'Ministerio del Trabajo de Colombia',
        anio: '2022',
        url: 'https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=127124',
      },
      F.omsDepresion,
    ],
  },
  {
    slug: 'como-acompanar-a-un-hijo-adolescente-que-se-autolesiona',
    tipo: 'Cómo',
    titulo: '¿Cómo acompañar a un hijo adolescente que se autolesiona?',
    descripcion:
      'Guía para madres, padres y cuidadores ante las autolesiones no suicidas en adolescentes: cómo reaccionar, qué decir, qué evitar y cuándo es urgencia.',
    respuestaCorta:
      'Mantén la calma, escucha sin juzgar y hazle saber que le quieres y que buscarán ayuda juntos. Pregúntale directamente si ha pensado en quitarse la vida: preguntar no aumenta el riesgo. Atiende las heridas, busca evaluación profesional y, si hay una herida grave o tomó medicamentos o sustancias, ve a urgencias de inmediato.',
    categoria: 'Familia',
    emoji: '🫶',
    lectura: '8 min',
    publicado: '2026-09-30',
    actualizado: '2026-09-30',
    crisisDestacada: true,
    secciones: [
      {
        titulo: 'Es más común de lo que se cree',
        parrafos: [
          'Un metaanálisis con más de 686.000 niños y adolescentes de todo el mundo (Lim et al., 2019) estimó que cerca del 22 % ha tenido alguna autolesión no suicida en su vida. No es un capricho ni "llamar la atención": casi siempre es una forma de manejar emociones que se sienten insoportables.',
          'Que la autolesión no tenga intención suicida no significa que no haya riesgo. Por eso siempre hay que evaluarlo.',
        ],
      },
      {
        titulo: 'Cuándo es una urgencia',
        lista: [
          'La herida es profunda, sangra mucho o podría necesitar puntos.',
          'Tomó medicamentos, venenos o sustancias en cualquier cantidad, aunque ahora se vea bien: algunos efectos aparecen horas después.',
          'Dice que quiere morir o tiene un plan.',
        ],
        parrafos: ['En cualquiera de estos casos, ve a urgencias o llama al 123.'],
      },
      {
        titulo: 'Cómo tener la conversación',
        pasos: [
          'Elige un momento tranquilo; a veces ayuda hablar mientras caminan o van en el carro, sin mirarse de frente.',
          'Empieza por cómo se siente, no por la herida: "Te he notado mal y me importa lo que te pasa."',
          'Escucha más de lo que hablas. Si no quiere hablar, ofrécele escribirte un mensaje o una nota.',
          'Dile que no le juzgas y que tu amor no cambia.',
          'Pregunta directamente: "¿Has pensado en quitarte la vida?". La evidencia muestra que preguntar ayuda y no aumenta el riesgo.',
        ],
      },
      {
        titulo: 'Qué evitar',
        lista: [
          'Gritar, castigar o reaccionar con asco o pánico: aumentan la vergüenza y el ocultamiento.',
          'Exigir que prometa que no lo volverá a hacer: dejarlo suele tomar tiempo y recaer no es fracaso.',
          'Quitarle el celular o aislarle como castigo.',
          'Hablar del tema con otras personas sin su conocimiento, salvo que haya riesgo para su vida.',
        ],
      },
      {
        titulo: 'Qué sí ayuda',
        lista: [
          'Buscar juntos una evaluación con psicología o psiquiatría infantil y juvenil (por EPS o de forma particular).',
          'Identificar juntos los momentos y emociones que la disparan.',
          'Explorar alternativas para las emociones intensas: dibujar, escribir, escuchar música, moverse, hablar con alguien.',
          'Guardar bajo llave medicamentos y objetos cortantes, sin convertirlo en castigo.',
          'Cuidarte tú también: acompañar a un hijo que se autolesiona es muy duro y también mereces apoyo.',
        ],
      },
      {
        titulo: 'Tratamientos con evidencia',
        parrafos: [
          'La guía NICE sobre autolesiones (2022) recomienda que las personas que se autolesionan reciban una evaluación psicosocial y considera, para adolescentes con autolesiones frecuentes y dificultades importantes para regular las emociones, la terapia dialéctico-conductual adaptada para adolescentes (DBT-A).',
        ],
      },
    ],
    faq: [
      {
        pregunta: '¿Si le pregunto por el suicidio le doy la idea?',
        respuesta:
          'No. Una revisión de estudios (Dazzi et al., 2014) no encontró aumento de la ideación suicida por preguntar. Preguntar abre la puerta a pedir ayuda.',
      },
      {
        pregunta: '¿Debo contarle al colegio?',
        respuesta:
          'Puede ser útil para que haya apoyo allí, pero idealmente decídanlo juntos. Si hay riesgo para su vida, prima su seguridad.',
      },
    ],
    fuentes: [
      {
        titulo: 'Global Lifetime and 12-Month Prevalence of Suicidal Behavior, Deliberate Self-Harm and Non-Suicidal Self-Injury in Children and Adolescents between 1989 and 2018',
        entidad: 'International Journal of Environmental Research and Public Health — Lim et al.',
        anio: '2019',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6888476/',
      },
      {
        titulo: 'Self-harm in children and young people',
        entidad: 'Royal College of Psychiatrists (Reino Unido)',
        anio: '2024',
        url: 'https://www.rcpsych.ac.uk/mental-health/children-and-young-people/self-harm-in-children-and-young-people',
      },
      {
        titulo: 'Self-harm: A guide for parents and carers',
        entidad: 'Cambridgeshire and Peterborough NHS Foundation Trust',
        anio: '2024',
        url: 'https://www.cpft.nhs.uk/self-harm-/',
      },
      {
        titulo: 'Self-harm: assessment, management and preventing recurrence (NG225)',
        entidad: 'National Institute for Health and Care Excellence (NICE)',
        anio: '2022',
        url: 'https://www.nice.org.uk/guidance/ng225',
      },
      {
        titulo: 'Does asking about suicide and related behaviours induce suicidal ideation? What is the evidence?',
        entidad: 'Psychological Medicine — Dazzi, Gribble, Wessely y Fear',
        anio: '2014',
        url: 'https://www.cambridge.org/core/journals/psychological-medicine/article/does-asking-about-suicide-and-related-behaviours-induce-suicidal-ideation-what-is-the-evidence/FCAEE9E5BC840D76CF10AEBECD921AC9',
      },
    ],
  },
  {
    slug: 'cuando-el-duelo-se-convierte-en-duelo-prolongado',
    tipo: 'Cuándo',
    titulo: '¿Cuándo el duelo deja de ser normal y se convierte en duelo prolongado?',
    descripcion:
      'El duelo no tiene un calendario fijo, pero la CIE-11 y el DSM-5-TR definen cuándo se vuelve un trastorno. Señales, tiempos y tratamientos con evidencia.',
    respuestaCorta:
      'El dolor por una pérdida puede durar mucho y seguir siendo normal. Se habla de trastorno de duelo prolongado cuando el anhelo o la preocupación intensa por la persona fallecida persisten, con otros síntomas que afectan la vida diaria, al menos 6 meses después de la pérdida según la CIE-11 (OMS) o 12 meses según el DSM-5-TR, y más allá de lo esperado en tu cultura. Afecta a cerca de 1 de cada 10 personas en duelo.',
    categoria: 'Duelo',
    emoji: '🕯️',
    lectura: '7 min',
    publicado: '2026-09-30',
    actualizado: '2026-09-30',
    secciones: [
      {
        titulo: 'El duelo normal no es una línea recta',
        parrafos: [
          'En el duelo es normal sentir tristeza profunda, rabia, culpa, incredulidad o alivio, y que todo vaya en oleadas: días en que parece que avanzas y otros en que el dolor vuelve con fuerza, sobre todo en fechas importantes. Con el tiempo, la mayoría de las personas logra convivir con la pérdida y volver a interesarse por la vida, aunque la persona siga haciendo falta.',
        ],
      },
      {
        titulo: 'Qué es el trastorno de duelo prolongado',
        parrafos: [
          'Tanto la CIE-11 de la OMS como el DSM-5-TR de la Asociación Americana de Psiquiatría lo reconocen como diagnóstico. Su núcleo es el anhelo persistente de la persona fallecida o una preocupación constante por ella, acompañados de otros síntomas como:',
        ],
        lista: [
          'Dolor emocional intenso (tristeza, culpa, rabia).',
          'Dificultad para aceptar la muerte o incredulidad persistente.',
          'Sentir que una parte de ti murió o no saber quién eres sin esa persona.',
          'Evitar todo lo que recuerde que la persona murió.',
          'Entumecimiento emocional o dificultad para volver a conectar con otros.',
          'Sentir que la vida no tiene sentido o soledad intensa.',
        ],
      },
      {
        titulo: 'Los tiempos: 6 o 12 meses',
        lista: [
          'CIE-11 (OMS): al menos 6 meses desde la pérdida, y más tiempo del esperado según las normas culturales, sociales o religiosas de la persona.',
          'DSM-5-TR: al menos 12 meses desde la pérdida en adultos, con síntomas casi todos los días durante al menos el último mes.',
          'En ambos casos el duelo debe superar claramente lo esperado según las normas sociales, culturales o religiosas, y afectar de forma importante la vida personal, familiar, laboral o social.',
        ],
        parrafos: [
          'Estos plazos sirven para el diagnóstico, no para esperar: puedes pedir apoyo en cualquier momento del duelo.',
        ],
      },
      {
        titulo: '¿Qué tan frecuente es?',
        parrafos: [
          'Un metaanálisis de 14 estudios con más de 8.000 adultos en duelo (Lundorff et al., 2017) estimó que cerca del 9,8 % desarrolla un duelo prolongado tras muertes no violentas. El riesgo suele ser mayor tras muertes repentinas o violentas, como las ocurridas por el conflicto armado, la violencia o el suicidio.',
        ],
      },
      {
        titulo: 'Qué ayuda',
        parrafos: [
          'Existen tratamientos psicológicos específicos para el duelo prolongado, como la terapia cognitivo-conductual centrada en el duelo y la terapia para el trastorno de duelo prolongado (PGDT), que han mostrado buenos resultados en ensayos clínicos. Si además hay síntomas de depresión o pensamientos de muerte, es importante consultar pronto.',
        ],
        herramienta: 'phq9',
      },
    ],
    faq: [
      {
        pregunta: '¿Si sigo llorando después de un año tengo un trastorno?',
        respuesta:
          'No necesariamente. Llorar o extrañar a alguien por años es humano. El problema es cuando el duelo te impide funcionar y retomar tu vida.',
      },
      {
        pregunta: '¿El duelo prolongado es lo mismo que la depresión?',
        respuesta:
          'No. Pueden coexistir, pero en el duelo prolongado el dolor gira en torno a la persona perdida; en la depresión el ánimo bajo es más generalizado.',
      },
    ],
    fuentes: [
      {
        titulo: 'Prolonged grief disorder in ICD-11 and DSM-5-TR: differences in prevalence and diagnostic criteria',
        entidad: 'Frontiers in Psychiatry — Treml et al.',
        anio: '2024',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10881750/',
      },
      {
        titulo: 'Prevalence of prolonged grief disorder in adult bereavement: A systematic review and meta-analysis',
        entidad: 'Journal of Affective Disorders — Lundorff et al.',
        anio: '2017',
        url: 'https://pure.au.dk/portal/en/publications/prevalence-of-prolonged-grief-disorder-in-adult-bereavement-a-sys/',
      },
      {
        titulo: 'Prolonged Grief Disorder: Course, Diagnosis, Assessment, and Treatment',
        entidad: 'FOCUS — American Psychiatric Association Publishing',
        anio: '2021',
        url: 'https://psychiatryonline.org/doi/full/10.1176/appi.focus.20200052',
      },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────
export const TIPOS: TipoPregunta[] = ['Cuándo', 'Cómo', 'Cuánto'];

export const TIPO_INFO: Record<TipoPregunta, { color: string; bg: string; param: string; descripcion: string }> = {
  Cuándo: { color: '#818cf8', bg: 'rgba(129,140,248,0.10)', param: 'cuando', descripcion: 'Señales para saber en qué momento actuar' },
  Cómo:   { color: '#2dd4bf', bg: 'rgba(45,212,191,0.10)',  param: 'como',   descripcion: 'Pasos prácticos que puedes aplicar hoy' },
  Cuánto: { color: '#fbbf24', bg: 'rgba(251,191,36,0.10)',  param: 'cuanto', descripcion: 'Tiempos, dosis y cifras con respaldo científico' },
};

export function tipoDesdeParam(param?: string): TipoPregunta | undefined {
  return TIPOS.find(t => TIPO_INFO[t].param === param);
}

export function getArticulo(slug: string): Articulo | undefined {
  return ARTICULOS.find(a => a.slug === slug);
}

export function articulosRelacionados(actual: Articulo, n = 3): Articulo[] {
  const mismaCategoria = ARTICULOS.filter(a => a.slug !== actual.slug && a.categoria === actual.categoria);
  const resto = ARTICULOS.filter(a => a.slug !== actual.slug && a.categoria !== actual.categoria);
  return [...mismaCategoria, ...resto].slice(0, n);
}

export function formatearFecha(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}
