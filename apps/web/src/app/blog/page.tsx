import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — Salud Mental y Bienestar',
  description: 'Artículos sobre salud mental, técnicas de bienestar emocional, TCC, mindfulness y más. Escrito por psicólogos verificados en Colombia.',
};

const articulos = [
  {
    id: 'tecnica-respiracion-4-4-6',
    categoria: 'Ejercicios',
    categoriaColor: '#2dd4bf',
    categoriaBg: 'rgba(45,212,191,0.08)',
    emoji: '🧘',
    titulo: 'La respiración 4-4-6: cómo activar tu sistema nervioso parasimpático en 3 minutos',
    resumen: 'La respiración diafragmática con ritmo 4-4-6 es una de las técnicas más respaldadas científicamente para reducir el cortisol y calmar la respuesta de estrés en minutos. Te explicamos cómo hacerlo correctamente.',
    lectura: '5 min',
    beneficios: ['Reduce el cortisol', 'Calma la ansiedad aguda', 'Mejora la concentración', 'Sin efectos secundarios'],
    contenido: [
      { titulo: '¿Qué es la respiración 4-4-6?', texto: 'Es una técnica de respiración controlada donde inhalas durante 4 segundos, mantienes el aire 4 segundos y exhalas lentamente durante 6 segundos. El ciclo completo dura 14 segundos y activa el nervio vago, el principal regulador del sistema nervioso autónomo.' },
      { titulo: '¿Por qué funciona?', texto: 'Cuando exhalas más lento de lo que inhalas, estimulas el nervio vago y activas el sistema parasimpático — el "freno" natural del cuerpo ante el estrés. Estudios de la Universidad de Stanford muestran que 3 minutos de esta práctica reducen el cortisol en un 15% en personas con ansiedad moderada.' },
      { titulo: 'Cómo practicarla', texto: '1. Siéntate cómodamente con la columna recta.\n2. Cierra los ojos si puedes.\n3. Inhala por la nariz contando mentalmente hasta 4.\n4. Retén el aire contando hasta 4.\n5. Exhala suavemente por la boca contando hasta 6.\n6. Repite 10 veces (≈ 3 minutos).' },
      { titulo: 'Cuándo usarla', texto: 'Antes de una reunión importante, en momentos de ansiedad aguda, antes de dormir o al despertar. Con práctica diaria de 2 semanas, el cuerpo aprende a activar este estado con mayor facilidad.' },
    ],
    autor: 'Dra. Laura Martínez',
    autorRol: 'Psicóloga Clínica · COLPSIC',
    fecha: '15 de mayo, 2026',
  },
  {
    id: 'grounding-5-4-3-2-1',
    categoria: 'Ansiedad',
    categoriaColor: '#818cf8',
    categoriaBg: 'rgba(129,140,248,0.08)',
    emoji: '🌱',
    titulo: 'Técnica grounding 5-4-3-2-1: interrumpe los ciclos de ansiedad en segundos',
    resumen: 'El grounding sensorial es una intervención de primera línea para los ataques de pánico y la disociación. Aprende a usar tus cinco sentidos como ancla al momento presente.',
    lectura: '6 min',
    beneficios: ['Interrumpe ataques de pánico', 'Reduce disociación', 'Funciona en cualquier lugar', 'Sin materiales necesarios'],
    contenido: [
      { titulo: 'El problema: la mente que se va', texto: 'La ansiedad vive en el futuro. Cuando tu mente anticipa amenazas que aún no ocurren, tu cuerpo responde como si fueran reales. El grounding interrumpe ese ciclo llevando la atención al único momento donde tienes control real: ahora.' },
      { titulo: 'La técnica paso a paso', texto: '👁 5 cosas que VES: nombra 5 objetos frente a ti con detalle.\n✋ 4 cosas que TOCAS: siente texturas, temperatura, peso.\n👂 3 cosas que ESCUCHAS: identifica sonidos en capas.\n👃 2 cosas que HUELES: reales o recordadas.\n👅 1 cosa que SABOREAS: lo que tienes en la boca ahora.' },
      { titulo: 'Por qué funciona neurológicamente', texto: 'Al activar múltiples vías sensoriales simultáneamente, la corteza prefrontal (pensamiento racional) recupera el control sobre la amígdala (respuesta de miedo). Es imposible mantener un pensamiento catastrófico mientras nombras activamente lo que percibes.' },
      { titulo: 'Úsala preventivamente', texto: 'No esperes a estar en pánico. Practica la técnica en momentos tranquilos para que se vuelva automática. Con repetición, tu cerebro la usará como respuesta por defecto ante el estrés.' },
    ],
    autor: 'Ps. Carlos Herrera',
    autorRol: 'Psicólogo Clínico · Especialista en TCC',
    fecha: '10 de mayo, 2026',
  },
  {
    id: 'diario-emocional-beneficios',
    categoria: 'Hábitos',
    categoriaColor: '#fbbf24',
    categoriaBg: 'rgba(251,191,36,0.08)',
    emoji: '📔',
    titulo: 'Por qué escribir un diario emocional cambia tu cerebro (y cómo empezar hoy)',
    resumen: 'La escritura expresiva reduce los síntomas de depresión y ansiedad en un 20% según estudios de meta-análisis. No necesitas escribir bien ni mucho — solo honestamente.',
    lectura: '7 min',
    beneficios: ['Procesa emociones difíciles', 'Detecta patrones de pensamiento', 'Mejora la autoconciencia', 'Reduce rumiación'],
    contenido: [
      { titulo: 'La ciencia detrás de la escritura expresiva', texto: 'El psicólogo James Pennebaker demostró en 1986 que escribir sobre experiencias emocionalmente significativas durante 15-20 minutos al día reduce las visitas al médico, mejora el sistema inmune y disminuye los síntomas de ansiedad. La investigación posterior confirma que el efecto se mantiene hasta 6 meses después.' },
      { titulo: 'Cómo funciona en el cerebro', texto: 'Escribir sobre emociones activa la corteza prefrontal ventrolateral, que regula la respuesta emocional de la amígdala. Es como darle un nombre a lo que sientes — el proceso de nombrar reduce la intensidad de la emoción y crea distancia psicológica útil.' },
      { titulo: '3 formas de empezar', texto: '1. Diario libre: escribe sin filtro durante 10 minutos sobre lo que piensas y sientes.\n2. Prompts estructurados: responde preguntas como "¿Qué me pesó hoy?" o "¿Qué salió bien?".\n3. Registro de ánimo: califica tu estado 1-10 y escribe 2 líneas del contexto.' },
      { titulo: 'Lo que NO debes hacer', texto: 'No te preocupes por la gramática, no releas lo que escribiste inmediatamente, no te juzgues. El diario no es para ser correcto — es para ser honesto.' },
    ],
    autor: 'Ps. Andrea Gómez',
    autorRol: 'Psicóloga · Especialista en Bienestar Emocional',
    fecha: '5 de mayo, 2026',
  },
  {
    id: 'tcc-pensamientos-automaticos',
    categoria: 'TCC',
    categoriaColor: '#4ade80',
    categoriaBg: 'rgba(74,222,128,0.08)',
    emoji: '🧠',
    titulo: 'Cómo identificar y reestructurar pensamientos automáticos negativos (TCC)',
    resumen: 'La Terapia Cognitivo-Conductual es el tratamiento con más evidencia para la ansiedad y la depresión. Aprende el ejercicio central: el registro de pensamientos automáticos.',
    lectura: '8 min',
    beneficios: ['Rompe ciclos depresivos', 'Reduce pensamientos intrusivos', 'Mejora la autoestima', 'Cambio duradero'],
    contenido: [
      { titulo: '¿Qué son los pensamientos automáticos?', texto: 'Son interpretaciones instantáneas que tu mente hace de las situaciones, a menudo sin que te des cuenta. "Cometí un error → soy un fracaso", "No me respondió → le caigo mal". Son rápidos, involuntarios y con frecuencia distorsionados.' },
      { titulo: 'Las 10 distorsiones cognitivas más comunes', texto: '1. Todo o nada: "Si no es perfecto, es un fracaso"\n2. Catastrofización: "Esto va a terminar en desastre"\n3. Lectura mental: "Sé lo que están pensando"\n4. Filtraje negativo: Solo veo lo malo\n5. Personalización: "Es mi culpa"\n6. Debe-ismo: "Debería ser diferente"\n7. Etiquetado: "Soy un perdedor"\n8. Magnificación: Exagerar lo negativo\n9. Minimización: Quitar importancia a lo positivo\n10. Razonamiento emocional: "Lo siento, entonces es verdad"' },
      { titulo: 'El registro de pensamientos — paso a paso', texto: 'Cuando notes malestar emocional:\n1. SITUACIÓN: ¿Qué pasó? (hechos objetivos)\n2. EMOCIÓN: ¿Qué siento? ¿Con qué intensidad (0-10)?\n3. PENSAMIENTO: ¿Qué me dije exactamente?\n4. DISTORSIÓN: ¿Cuál de las 10 es?\n5. RESPUESTA ALTERNATIVA: ¿Qué diría alguien objetivo?\n6. RESULTADO: ¿Cómo me siento ahora (0-10)?' },
    ],
    autor: 'Ps. Miguel Ángel Torres',
    autorRol: 'Psicólogo · Especialista TCC',
    fecha: '28 de abril, 2026',
  },
  {
    id: 'sueno-salud-mental',
    categoria: 'Hábitos',
    categoriaColor: '#fbbf24',
    categoriaBg: 'rgba(251,191,36,0.08)',
    emoji: '😴',
    titulo: 'El sueño es terapia: cómo el descanso recalibra tu salud mental',
    resumen: 'Dormir menos de 7 horas aumenta 60% el riesgo de ansiedad. La privación del sueño deteriora la regulación emocional más que cualquier otro factor de estilo de vida.',
    lectura: '6 min',
    beneficios: ['Regula las emociones', 'Consolida la memoria', 'Reduce el cortisol', 'Fortalece el sistema inmune'],
    contenido: [
      { titulo: 'Lo que pasa en tu cerebro mientras duermes', texto: 'Durante el sueño REM, el cerebro procesa y archiva las experiencias emocionales del día. La amígdala, centro del miedo, se "recalibra". Sin este proceso, las emociones del día siguiente parten de una línea base más alta — eres literalmente más reactivo, más irritable, más ansioso.' },
      { titulo: 'La higiene del sueño que realmente funciona', texto: '• Misma hora de acostarse y despertar cada día (incluidos fines de semana)\n• Sin pantallas 60 minutos antes de dormir (la luz azul suprime la melatonina)\n• Temperatura del cuarto entre 18-20°C\n• Sin cafeína después de las 2pm\n• Exposición a luz natural en los primeros 30 min del día' },
      { titulo: 'Si tienes insomnio: la restricción de sueño', texto: 'Paradójicamente, el tratamiento más efectivo para el insomnio crónico (más efectivo que los medicamentos) es la restricción temporal del sueño: acostarte más tarde y levantarte a la misma hora hasta consolidar el sueño. Consulta con un psicólogo antes de implementarla.' },
    ],
    autor: 'Dra. Laura Martínez',
    autorRol: 'Psicóloga Clínica · COLPSIC',
    fecha: '20 de abril, 2026',
  },
  {
    id: 'autocuidado-no-es-egoismo',
    categoria: 'Bienestar',
    categoriaColor: '#f472b6',
    categoriaBg: 'rgba(244,114,182,0.08)',
    emoji: '💚',
    titulo: 'El autocuidado no es egoísmo: por qué cuidarte a ti primero es cuidar a los demás',
    resumen: 'La culpa de cuidarse es uno de los obstáculos más comunes para el bienestar. La psicología positiva y la neurociencia explican por qué el autocuidado es una responsabilidad, no un lujo.',
    lectura: '5 min',
    beneficios: ['Previene el burnout', 'Mejora relaciones', 'Aumenta la resiliencia', 'Reduce la culpa'],
    contenido: [
      { titulo: 'El mito del autocuidado egoísta', texto: 'Culturalmente, especialmente en Latinoamérica, cuidarse a uno mismo se asocia con egoísmo o pereza. Esta creencia es no solo falsa sino contraproducente: las personas que se cuidan tienen más energía emocional disponible para los demás, no menos.' },
      { titulo: 'La metáfora del oxígeno en el avión', texto: 'La instrucción de seguridad aérea no es una metáfora vaga — es neurociencia. Cuando estás en modo supervivencia (agotamiento, estrés crónico), tu corteza prefrontal — la sede de la empatía y la toma de decisiones — trabaja con capacidad reducida. No puedes dar lo que no tienes.' },
      { titulo: '5 formas de autocuidado respaldadas por evidencia', texto: '1. Movimiento físico: 30 minutos diarios reduce la depresión equivalente a un antidepresivo\n2. Conexión social de calidad (no cantidad)\n3. Tiempo en naturaleza: 20 min reduce el cortisol significativamente\n4. Establecer límites: decir "no" sin culpa\n5. Hacer algo por el placer de hacerlo' },
    ],
    autor: 'Ps. Andrea Gómez',
    autorRol: 'Psicóloga · Especialista en Bienestar Emocional',
    fecha: '12 de abril, 2026',
  },
];

const categorias = ['Todos', 'Ejercicios', 'Ansiedad', 'Hábitos', 'TCC', 'Bienestar'];

export default function BlogPage() {
  const destacado = articulos[0];
  const resto = articulos.slice(1);

  return (
    <div suppressHydrationWarning style={{ background: '#080f0b', minHeight: '100vh', color: 'white' }}>

      {/* ── NAVBAR ── */}
      <nav suppressHydrationWarning style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 48px',
        borderBottom: '1px solid rgba(45,212,191,0.08)',
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,15,11,0.85)',
        backdropFilter: 'blur(20px)',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#1a6b4a,#0d4a32)', border: '1px solid rgba(45,212,191,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>💚</div>
          <span style={{ fontSize: '19px', fontWeight: '900', color: '#2dd4bf', letterSpacing: '-0.02em' }}>MenteBridge</span>
        </Link>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/login" style={{ color: '#5a8a6a', textDecoration: 'none', fontSize: '14px', fontWeight: '500', padding: '8px 16px', borderRadius: '8px' }}>Iniciar sesión</Link>
          <Link href="/registro" style={{ background: 'linear-gradient(135deg,#1a6b4a,#0d5438)', color: 'white', padding: '10px 22px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '700', boxShadow: '0 2px 12px rgba(26,107,74,0.4)' }}>
            Comenzar gratis
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', padding: '72px 48px 56px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,212,191,0.05) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: '20px', padding: '7px 18px', fontSize: '11px', color: '#2dd4bf', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
            📖 Blog MenteBridge
          </div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '14px', lineHeight: 1.1 }}>
            Salud mental con<br /><span style={{ background: 'linear-gradient(90deg,#2dd4bf,#4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>evidencia científica</span>
          </h1>
          <p style={{ color: '#5a8a6a', fontSize: '16px', maxWidth: '520px', lineHeight: 1.7 }}>
            Artículos escritos y revisados por psicólogos verificados COLPSIC. Técnicas, hábitos y ejercicios respaldados por la investigación.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 48px 80px' }}>

        {/* ── ARTÍCULO DESTACADO ── */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(45,212,191,0.12)',
          borderRadius: '24px',
          padding: '40px',
          marginBottom: '48px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg,transparent,${destacado.categoriaColor},transparent)` }} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ background: destacado.categoriaBg, color: destacado.categoriaColor, fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {destacado.categoria}
              </span>
              <span style={{ fontSize: '11px', color: '#3d5c48' }}>⏱ {destacado.lectura} lectura</span>
              <span style={{ fontSize: '11px', color: '#2a3d2e', background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', padding: '3px 8px', borderRadius: '8px' }}>Destacado</span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', lineHeight: 1.3, marginBottom: '14px', letterSpacing: '-0.01em' }}>
              {destacado.titulo}
            </h2>
            <p style={{ fontSize: '14px', color: '#5a8a6a', lineHeight: 1.75, marginBottom: '24px' }}>{destacado.resumen}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
              {destacado.beneficios.map(b => (
                <span key={b} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '5px 12px', fontSize: '12px', color: '#8aab96', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: destacado.categoriaColor, fontSize: '10px' }}>✓</span> {b}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `rgba(45,212,191,0.15)`, border: '1px solid rgba(45,212,191,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', color: '#2dd4bf' }}>
                {destacado.autor[0]}
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>{destacado.autor}</p>
                <p style={{ fontSize: '11px', color: '#3d5c48' }}>{destacado.autorRol} · {destacado.fecha}</p>
              </div>
            </div>
          </div>

          {/* Preview del contenido */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '11px', color: '#3d5c48', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>Contenido del artículo</p>
            {destacado.contenido.map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: `${destacado.categoriaColor}18`, border: `1px solid ${destacado.categoriaColor}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: destacado.categoriaColor, fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>{i + 1}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: 'white', marginBottom: '3px' }}>{s.titulo}</p>
                  <p style={{ fontSize: '12px', color: '#3d5c48', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{s.texto}</p>
                </div>
              </div>
            ))}
            <Link href={`/blog/${destacado.id}`} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: `linear-gradient(135deg,${destacado.categoriaColor}22,${destacado.categoriaColor}11)`,
              border: `1px solid ${destacado.categoriaColor}33`,
              color: destacado.categoriaColor, padding: '13px',
              borderRadius: '12px', textDecoration: 'none',
              fontWeight: '700', fontSize: '14px',
              transition: 'all .15s',
              marginTop: '4px',
            }}>
              Leer artículo completo →
            </Link>
          </div>
        </div>

        {/* ── GRID DE ARTÍCULOS ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.01em' }}>Más artículos</h2>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {categorias.map(c => (
              <span key={c} style={{ background: c === 'Todos' ? 'rgba(45,212,191,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${c === 'Todos' ? 'rgba(45,212,191,0.3)' : 'rgba(255,255,255,0.07)'}`, color: c === 'Todos' ? '#2dd4bf' : '#5a8a6a', fontSize: '12px', fontWeight: '600', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', transition: 'all .15s' }}>
                {c}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '16px' }}>
          {resto.map(a => (
            <Link key={a.id} href={`/blog/${a.id}`} style={{ textDecoration: 'none' }}>
              <article style={{
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px',
                padding: '28px',
                height: '100%',
                display: 'flex', flexDirection: 'column', gap: '14px',
                transition: 'border-color .2s, background .2s',
                position: 'relative', overflow: 'hidden',
                cursor: 'pointer',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${a.categoriaColor}55,transparent)` }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ background: a.categoriaBg, color: a.categoriaColor, fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {a.categoria}
                  </span>
                  <span style={{ fontSize: '11px', color: '#3d5c48' }}>⏱ {a.lectura}</span>
                </div>

                <div style={{ fontSize: '28px' }}>{a.emoji}</div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', lineHeight: 1.35, marginBottom: '10px', letterSpacing: '-0.01em', color: 'white' }}>{a.titulo}</h3>
                  <p style={{ fontSize: '13px', color: '#5a8a6a', lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{a.resumen}</p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {a.beneficios.slice(0, 2).map(b => (
                    <span key={b} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '4px 10px', fontSize: '11px', color: '#5a8a6a' }}>
                      ✓ {b}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#8aab96' }}>{a.autor}</p>
                    <p style={{ fontSize: '10px', color: '#2a3d2e' }}>{a.fecha}</p>
                  </div>
                  <span style={{ color: a.categoriaColor, fontSize: '18px' }}>›</span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* ── CTA ── */}
        <div style={{ marginTop: '64px', background: 'rgba(26,107,74,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(45,212,191,0.12)', borderRadius: '20px', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>💚</div>
          <h3 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '10px', letterSpacing: '-0.01em' }}>¿Listo para practicar lo que aprendiste?</h3>
          <p style={{ color: '#5a8a6a', fontSize: '14px', marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px', lineHeight: 1.7 }}>
            MenteBridge te guía en estos ejercicios con IA clínica disponible 24/7.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/registro" style={{ background: 'linear-gradient(135deg,#1a6b4a,#0d5438)', color: 'white', padding: '13px 32px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '14px', boxShadow: '0 2px 12px rgba(26,107,74,0.4)' }}>
              Empezar gratis →
            </Link>
            <Link href="/dashboard/ejercicios" style={{ background: 'rgba(255,255,255,0.04)', color: '#8aab96', border: '1px solid rgba(255,255,255,0.08)', padding: '13px 32px', borderRadius: '10px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
              Ver ejercicios
            </Link>
          </div>
        </div>
      </div>

      {/* Footer mínimo */}
      <footer style={{ padding: '24px 48px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <p style={{ fontSize: '12px', color: '#2a3d2e' }}>
          © 2026 MenteBridge Colombia · Crisis:{' '}
          <a href="tel:106" style={{ color: '#2dd4bf', fontWeight: 700, textDecoration: 'none' }}>106</a>
          {' · '}
          <a href="tel:8001225555" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>800-112-5555</a>
          {' · '}
          <a href="tel:123" style={{ color: '#f87171', fontWeight: 700, textDecoration: 'none' }}>123</a>
        </p>
        <Link href="/" style={{ fontSize: '12px', color: '#3d5c48', textDecoration: 'none' }}>← Volver al inicio</Link>
      </footer>
    </div>
  );
}
