import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import LandingNav from '@/components/landing/LandingNav';

export const metadata: Metadata = {
  title: 'MenteBridge Colombia — Salud Mental con IA y Psicólogos Certificados',
  description: 'Acompañamiento emocional con IA clínica y psicólogos verificados por COLPSIC. Chat 24/7, videocitas, diario emocional. Cumple Ley 1581/2012.',
  keywords: 'salud mental colombia, psicólogo online colombia, terapia online, ansiedad, depresión, bienestar emocional, IA salud mental',
  openGraph: {
    title: 'MenteBridge Colombia — Salud Mental con IA',
    description: 'Acompañamiento emocional con IA y psicólogos certificados. Disponible 24/7 en Colombia.',
    url: 'https://mentebridge.com',
    siteName: 'MenteBridge Colombia',
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MenteBridge Colombia — Salud Mental con IA',
    description: 'Acompañamiento emocional con IA y psicólogos certificados en Colombia.',
  },
};

/* ─────────────── DATA ─────────────── */

const beneficios = [
  {
    icon: '🤖',
    titulo: 'Apoyo cuando más lo necesitas',
    desc: 'Chat con IA clínica disponible las 24 horas. Sin lista de espera, sin juicios. Técnicas de TCC, ACT y mindfulness aplicadas a tu situación.',
    color: 'from-teal-500/10 to-teal-600/5',
    border: 'border-teal-500/15',
    tag: '24/7',
  },
  {
    icon: '📔',
    titulo: 'Entiende tus patrones emocionales',
    desc: 'Registra cómo te sientes cada día y la IA identifica qué situaciones, horarios o personas afectan tu ánimo. Información que cambia cómo te ves.',
    color: 'from-indigo-500/10 to-indigo-600/5',
    border: 'border-indigo-500/15',
    tag: 'Diario IA',
  },
  {
    icon: '👨‍⚕️',
    titulo: 'Psicólogos verificados cuando los necesites',
    desc: 'Agenda videocitas con profesionales certificados por COLPSIC. Ve el perfil, las especialidades y reserva en minutos — sin papeleo.',
    color: 'from-rose-500/10 to-rose-600/5',
    border: 'border-rose-500/15',
    tag: 'COLPSIC',
  },
  {
    icon: '🧘',
    titulo: 'Herramientas para crisis y ansiedad',
    desc: 'Ejercicios guiados de respiración 4-7-8, grounding 5-4-3-2-1 y mindfulness para calmar la mente en tiempo real. Siempre disponibles.',
    color: 'from-amber-500/10 to-amber-600/5',
    border: 'border-amber-500/15',
    tag: 'Ejercicios',
  },
  {
    icon: '📈',
    titulo: 'Ve tu progreso semana a semana',
    desc: 'Gráficas claras de tu evolución emocional, rachas de días activos y reportes que puedes compartir con tu psicólogo.',
    color: 'from-purple-500/10 to-purple-600/5',
    border: 'border-purple-500/15',
    tag: 'Progreso',
  },
  {
    icon: '🔒',
    titulo: 'Tus datos son solo tuyos, siempre',
    desc: 'Cifrado AES-256 en todas tus conversaciones. Cumplimos Ley 1581/2012 y Resolución 2654/2019. Ni nuestro equipo puede leer tus chats.',
    color: 'from-emerald-500/10 to-emerald-600/5',
    border: 'border-emerald-500/15',
    tag: 'AES-256',
  },
];

const dolorPuntos = [
  { emoji: '😰', texto: '¿La ansiedad controla tu día y no sabes cómo parar?' },
  { emoji: '💭', texto: '¿Tienes pensamientos que no puedes silenciar?' },
  { emoji: '😔', texto: '¿Necesitas hablar, pero sientes que no tienes a quién?' },
  { emoji: '💸', texto: '¿Quieres ir al psicólogo pero el costo o la lista de espera te detiene?' },
];

const pasos = [
  {
    num: '01',
    titulo: 'Crea tu cuenta en 2 minutos',
    desc: 'Solo tu correo. Sin tarjeta de crédito. Gratis desde el primer momento.',
    detalle: 'Registro seguro con verificación de email y consentimiento informado según Ley 1581/2012.',
    color: 'text-teal-400',
    ring: 'ring-teal-500/30',
    bg: 'bg-teal-500/8',
    icon: (
      <svg className="w-8 h-8 text-teal-400" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="11" r="5" stroke="currentColor" strokeWidth="2"/>
        <path d="M6 27c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    num: '02',
    titulo: 'Cuéntale cómo te sientes',
    desc: 'La IA escucha, aplica técnicas basadas en evidencia y te da herramientas reales para ese momento.',
    detalle: 'Terapia Cognitivo-Conductual (TCC), ACT, mindfulness y más — todo adaptado a lo que describes.',
    color: 'text-emerald-400',
    ring: 'ring-emerald-500/30',
    bg: 'bg-emerald-500/8',
    icon: (
      <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 32 32" fill="none">
        <path d="M28 16c0 6.6-5.4 12-12 12S4 22.6 4 16 9.4 4 16 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M10 16h12M16 10v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="26" cy="6" r="4" fill="currentColor" opacity="0.4"/>
      </svg>
    ),
  },
  {
    num: '03',
    titulo: 'Agenda con un psicólogo cuando quieras',
    desc: 'Cuando necesites más, conecta con un profesional certificado por COLPSIC en minutos.',
    detalle: 'Videocita desde tu celular o computador. El historial de la IA ayuda al psicólogo a entenderte mejor desde el primer día.',
    color: 'text-indigo-400',
    ring: 'ring-indigo-500/30',
    bg: 'bg-indigo-500/8',
    icon: (
      <svg className="w-8 h-8 text-indigo-400" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="6" width="24" height="22" rx="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 4v4M22 4v4M4 14h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="16" cy="22" r="3" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
];

const estadisticas = [
  { num: '+2.000', label: 'Colombianos activos', sub: 'y creciendo cada semana' },
  { num: '98%', label: 'Satisfacción', sub: 'en plataforma' },
  { num: '+15', label: 'Psicólogos COLPSIC', sub: 'verificados y activos' },
  { num: '24/7', label: 'Disponibilidad', sub: 'de la IA clínica' },
];

const testimonios = [
  {
    texto: '"Bajé mis ataques de ansiedad de 5 a 1 por semana en 3 semanas. Por fin tengo herramientas reales, no solo consejos genéricos."',
    autor: 'María C.',
    profesion: 'Nutricionista',
    ciudad: 'Bogotá',
    iniciales: 'MC',
    color: 'from-teal-500 to-emerald-500',
    estrellas: 5,
  },
  {
    texto: '"Como hombre siempre me costó buscar ayuda. Con MenteBridge pude hablar sin sentir juicio. Cambió cómo veo mi salud mental."',
    autor: 'Santiago R.',
    profesion: 'Ingeniero de sistemas',
    ciudad: 'Medellín',
    iniciales: 'SR',
    color: 'from-indigo-500 to-purple-500',
    estrellas: 5,
  },
  {
    texto: '"El diario me mostró que mi mal humor siempre era los domingos. Ahora lo anticipo. Nunca lo hubiera notado sin los datos de la IA."',
    autor: 'Laura M.',
    profesion: 'Estudiante universitaria',
    ciudad: 'Cali',
    iniciales: 'LM',
    color: 'from-rose-500 to-pink-500',
    estrellas: 5,
  },
];

const planes = [
  {
    nombre: 'Gratis',
    precio: '0',
    paraQuien: 'Para explorar sin compromiso',
    desc: 'Ideal si quieres conocer la plataforma y empezar tu camino de bienestar.',
    destacado: false,
    cta: 'Empezar gratis',
    href: '/registro',
    features: [
      '20 mensajes/día con IA clínica',
      'Diario emocional básico',
      'Ejercicios de respiración y grounding',
      'Seguimiento semanal de estado de ánimo',
      'Cifrado AES-256 de tus datos',
    ],
    noFeatures: [
      'Videocitas con psicólogos',
      'IA sin límite de mensajes',
      'Reportes emocionales avanzados',
    ],
  },
  {
    nombre: 'Plus',
    precio: '25.000',
    paraQuien: 'Para quien quiere resultados reales',
    desc: 'El plan más completo. IA ilimitada + psicólogo cuando lo necesites.',
    destacado: true,
    cta: 'Comenzar con Plus',
    href: '/registro',
    features: [
      'IA clínica sin límite de mensajes',
      'Diario emocional con insights IA',
      'Ejercicios guiados ilimitados',
      'Reportes emocionales avanzados',
      'Cifrado AES-256 de tus datos',
      '2 videocitas con psicólogo/mes',
    ],
    noFeatures: [],
  },
  {
    nombre: 'Familia',
    precio: '45.000',
    paraQuien: 'Para cuidar a toda tu familia',
    desc: 'Un plan, hasta 4 perfiles. Bienestar familiar sin complicaciones.',
    destacado: false,
    cta: 'Plan Familia',
    href: '/registro',
    features: [
      'Todo lo del plan Plus',
      'Hasta 4 perfiles familiares',
      'IA clínica sin límite para todos',
      '5 videocitas con psicólogo/mes',
      'Panel familiar de bienestar',
      'Reportes comparativos familiares',
    ],
    noFeatures: [],
  },
];

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: '¿La IA reemplaza a un psicólogo?',
    a: 'No. La IA es una herramienta de acompañamiento emocional basada en evidencia (TCC, ACT, mindfulness), no un sustituto de la atención clínica. Cuando detecta señales que requieren atención profesional, te conecta directamente con un psicólogo verificado.',
  },
  {
    q: '¿Es completamente confidencial?',
    a: 'Sí. Tus conversaciones se cifran con AES-256 y nunca se comparten con terceros. Cumplimos la Ley 1581/2012 de protección de datos y la Resolución 2654/2019 del Ministerio de Salud. Ni nuestro equipo puede leer tus chats.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Siempre. Cancela desde Configuración → Suscripción en tu dashboard. Sin permanencia mínima ni penalizaciones. Conservas acceso al plan pagado hasta el final del período facturado.',
  },
  {
    q: '¿Los psicólogos están certificados?',
    a: 'Todos están verificados por COLPSIC (Colegio Colombiano de Psicólogos) y tienen tarjeta profesional vigente. Revisamos sus credenciales antes de que puedan atender en la plataforma.',
  },
  {
    q: '¿Qué pasa si estoy en crisis?',
    a: <>Si el sistema detecta señales de crisis, activa un protocolo inmediato: ejercicios de estabilización, contacto urgente con un psicólogo y acceso directo a las líneas de emergencia — <a href="tel:106" className="text-teal-400 font-bold hover:underline">106</a> (Línea de la Vida, gratuita 24h) y <a href="tel:123" className="text-red-400 font-bold hover:underline">123</a> (emergencias). Tu seguridad es la prioridad absoluta.</>,
  },
  {
    q: '¿Puedo usarlo si ya tengo psicólogo?',
    a: 'Por supuesto. Muchos usuarios usan la IA y el diario como complemento entre sesiones, para procesar lo del día a día y llegar mejor preparados a sus citas con su terapeuta.',
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Procesamos pagos con Wompi — tarjetas débito/crédito Visa, Mastercard, PSE y Nequi. Todo 100% colombiano.',
  },
];

const confianzaBadges = [
  { icon: '🏛️', titulo: 'COLPSIC', desc: 'Psicólogos verificados por el Colegio Colombiano de Psicólogos' },
  { icon: '⚖️', titulo: 'Ley 1581/2012', desc: 'Cumplimiento total en protección de datos personales y de salud' },
  { icon: '🔐', titulo: 'AES-256', desc: 'Cifrado militar en todas tus conversaciones y datos' },
  { icon: '🏥', titulo: 'Res. 2654/2019', desc: 'Conformidad con el Ministerio de Salud de Colombia' },
];

/* ─────────────── HELPERS ─────────────── */

function StarIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
      <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4 text-gray-700 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─────────────── PAGE ─────────────── */

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080f0a] text-white">

      <LandingNav />

      {/* ── HERO ── */}
      <section className="pt-28 pb-16 px-5 md:pt-36 md:pb-24 relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-teal-500 rounded-full opacity-[0.035] blur-[140px] pointer-events-none" />
        <div className="absolute top-20 right-10 w-[300px] h-[300px] bg-emerald-500 rounded-full opacity-[0.025] blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-teal-500/25 bg-teal-500/5 mb-7">
              <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
              <span className="text-xs text-teal-400 font-semibold">Plataforma de Salud Mental · Colombia 🇨🇴</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-5 leading-[1.05] tracking-tight">
              Tu bienestar mental,{' '}
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                inteligente
              </span>
            </h1>

            <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-9 leading-relaxed">
              Acompañamiento emocional con IA clínica y psicólogos certificados,
              disponible 24/7. Confidencial, accesible y diseñado para Colombia.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <Link
                href="/registro"
                className="px-7 py-3.5 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl transition-all text-base shadow-lg shadow-teal-500/20 hover:shadow-teal-500/35 hover:scale-[1.02] active:scale-[0.98]"
              >
                Empezar gratis — sin tarjeta
              </Link>
              <Link
                href="/login"
                className="px-7 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold rounded-xl transition-all text-base"
              >
                Ya tengo cuenta →
              </Link>
            </div>

            {/* Social proof strip */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['from-teal-500 to-emerald-500','from-indigo-500 to-purple-500','from-rose-500 to-pink-500','from-amber-500 to-orange-500'].map((g, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} border-2 border-[#080f0a]`} />
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => <StarIcon key={i} />)}
                  </div>
                  <p className="text-xs text-gray-400"><span className="text-white font-semibold">+2.000</span> colombianos</p>
                </div>
              </div>
              <div className="hidden sm:block w-px h-7 bg-white/10" />
              <p className="text-xs text-gray-500">
                🔒 Ley 1581/2012 · AES-256 · COLPSIC
              </p>
              <div className="hidden sm:block w-px h-7 bg-white/10" />
              <p className="text-xs text-gray-500">
                ⚡ Listo en <span className="text-gray-300 font-medium">menos de 2 minutos</span>
              </p>
            </div>
          </div>

          {/* Mock chat visual */}
          <div className="mt-14 max-w-lg mx-auto">
            <div className="bg-[#0d1a12] border border-white/8 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5 bg-[#0a1510]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-sm">🤖</div>
                <div>
                  <p className="text-xs font-semibold text-white">IA Clínica · MenteBridge</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                    <span className="text-[10px] text-teal-400">En línea</span>
                  </div>
                </div>
              </div>
              {/* Messages */}
              <div className="p-4 space-y-3.5">
                {/* User */}
                <div className="flex justify-end">
                  <div className="bg-teal-500/15 border border-teal-500/20 rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[75%]">
                    <p className="text-xs text-gray-300 leading-relaxed">Hoy me sentí muy ansioso en el trabajo, no pude concentrarme en nada.</p>
                  </div>
                </div>
                {/* AI */}
                <div className="flex justify-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-xs flex-shrink-0 mt-1">🤖</div>
                  <div className="bg-white/4 border border-white/8 rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[78%]">
                    <p className="text-xs text-gray-300 leading-relaxed">Entiendo. La ansiedad en el trabajo puede ser muy agotadora. ¿Notaste si algo específico la disparó, o fue una sensación constante desde que llegaste?</p>
                  </div>
                </div>
                {/* User */}
                <div className="flex justify-end">
                  <div className="bg-teal-500/15 border border-teal-500/20 rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[70%]">
                    <p className="text-xs text-gray-300">Creo que fue desde la reunión del lunes...</p>
                  </div>
                </div>
                {/* Typing indicator */}
                <div className="flex justify-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-xs flex-shrink-0">🤖</div>
                  <div className="bg-white/4 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1.5 items-center h-3">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 bg-teal-400 rounded-full opacity-60" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-600 mt-3">Ejemplo real de conversación con la IA</p>
          </div>
        </div>
      </section>

      {/* ── DOLOR PUNTOS ── */}
      <section className="py-14 px-5 bg-[#0a120a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-white">
              ¿Te identificas con alguna de estas situaciones?
            </h2>
            <p className="text-sm text-gray-500 mt-2">MenteBridge fue creado exactamente para esto</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {dolorPuntos.map((d) => (
              <div key={d.texto} className="flex items-start gap-3.5 p-4 bg-white/3 border border-white/6 rounded-xl hover:border-teal-500/20 transition-colors">
                <span className="text-2xl flex-shrink-0">{d.emoji}</span>
                <p className="text-sm text-gray-300 leading-relaxed">{d.texto}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-teal-400 mt-8 font-medium">
            Si dijiste que sí a alguna → <Link href="/registro" className="underline underline-offset-2 hover:text-teal-300">MenteBridge es para ti</Link>
          </p>
        </div>
      </section>

      {/* ── BENEFICIOS ── */}
      <section className="py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-teal-500 font-bold uppercase tracking-widest mb-3">Qué obtienes</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-sm text-gray-500 mt-3 max-w-lg mx-auto">
              Sin múltiples apps. Sin lista de espera. Sin sentirte juzgado.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {beneficios.map((b) => (
              <div
                key={b.titulo}
                className={`bg-gradient-to-br ${b.color} border ${b.border} rounded-2xl p-6 hover:scale-[1.02] transition-all duration-200 group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{b.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-1 rounded-md">{b.tag}</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2 leading-snug">{b.titulo}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" className="py-24 px-5 bg-[#0a120a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-teal-500 font-bold uppercase tracking-widest mb-3">Proceso</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Empieza en 3 pasos simples
            </h2>
            <p className="text-sm text-gray-500 mt-3">Desde cero hasta tu primera sesión en menos de 5 minutos</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {pasos.map((p, i) => (
              <div key={p.num} className="relative">
                {/* Conector */}
                {i < pasos.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(100%-1rem)] w-8 h-px bg-gradient-to-r from-white/10 to-white/5" />
                )}
                <div className={`flex flex-col items-start p-6 bg-white/2 border border-white/6 rounded-2xl hover:border-white/10 transition-colors`}>
                  <div className={`w-14 h-14 rounded-xl ${p.bg} ring-1 ${p.ring} flex items-center justify-center mb-5`}>
                    {p.icon}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-black ${p.color} tracking-wider`}>{p.num}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 leading-snug">{p.titulo}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-3">{p.desc}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{p.detalle}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl transition-all text-base shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:scale-[1.02]"
            >
              Crear cuenta gratis →
            </Link>
            <p className="text-xs text-gray-600 mt-3">Sin tarjeta · Cancela cuando quieras · Gratis para siempre en el plan básico</p>
          </div>
        </div>
      </section>

      {/* ── ESTADÍSTICAS ── */}
      <section className="py-16 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {estadisticas.map((e) => (
              <div key={e.label} className="text-center p-5 bg-white/2 border border-white/6 rounded-2xl">
                <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                  {e.num}
                </p>
                <p className="text-sm font-semibold text-white">{e.label}</p>
                <p className="text-xs text-gray-600 mt-0.5">{e.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section className="py-20 px-5 bg-[#0a120a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-teal-500 font-bold uppercase tracking-widest mb-3">Historias reales</p>
            <h2 className="text-3xl font-black text-white">Lo que dicen nuestros usuarios</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {testimonios.map((t) => (
              <div key={t.autor} className="bg-[#0d1a12] border border-white/6 rounded-2xl p-6 flex flex-col gap-4 hover:border-white/10 transition-colors">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.estrellas }).map((_, i) => <StarIcon key={i} />)}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed flex-1 italic">{t.texto}</p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-xs font-bold text-white">{t.iniciales}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.autor}</p>
                    <p className="text-xs text-gray-500">{t.profesion} · {t.ciudad}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="precios" className="py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-teal-500 font-bold uppercase tracking-widest mb-3">Planes</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Elige el plan que se ajusta a ti
            </h2>
            <p className="text-gray-500 mt-3 text-sm">Pago mensual en COP · Sin permanencia mínima · Cancela cuando quieras</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {planes.map((plan) => (
              <div
                key={plan.nombre}
                className={`relative rounded-2xl p-7 flex flex-col gap-5 ${
                  plan.destacado
                    ? 'bg-gradient-to-b from-teal-900/40 to-emerald-900/20 border border-teal-500/40 ring-1 ring-teal-500/20'
                    : 'bg-[#0d1a12] border border-white/8 hover:border-white/12 transition-colors'
                }`}
              >
                {plan.destacado && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg shadow-teal-500/30">
                      ★ Más popular
                    </span>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">{plan.paraQuien}</p>
                  <p className="text-lg font-black text-white mb-1">{plan.nombre}</p>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-black text-white">${plan.precio}</span>
                    <span className="text-gray-500 text-sm mb-1.5">/mes</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{plan.desc}</p>
                </div>

                <Link
                  href={plan.href}
                  className={`w-full py-3 rounded-xl font-semibold text-sm text-center transition-all ${
                    plan.destacado
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white shadow-lg shadow-teal-500/20'
                      : 'bg-white/6 hover:bg-white/10 border border-white/10 text-white'
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs text-gray-300">
                      <CheckIcon />
                      {f}
                    </li>
                  ))}
                  {plan.noFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs text-gray-600">
                      <XIcon />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-600 mt-8">
            Todos los planes incluyen cifrado AES-256 · Pagos procesados por{' '}
            <span className="text-gray-500 font-semibold">Wompi</span> (débito, crédito, PSE, Nequi)
          </p>
        </div>
      </section>

      {/* ── CONFIANZA ── */}
      <section className="py-16 px-5 bg-[#0a120a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs text-teal-500 font-bold uppercase tracking-widest mb-3">Certificaciones</p>
            <h2 className="text-2xl font-black text-white">Certificado y regulado para Colombia</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {confianzaBadges.map((b) => (
              <div key={b.titulo} className="flex flex-col items-center text-center p-5 bg-white/2 border border-white/6 rounded-2xl hover:border-teal-500/20 transition-colors">
                <span className="text-3xl mb-3">{b.icon}</span>
                <p className="text-sm font-bold text-white mb-1.5">{b.titulo}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-teal-500 font-bold uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl font-black text-white">Preguntas frecuentes</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group bg-[#0d1a12] border border-white/8 rounded-2xl overflow-hidden hover:border-white/12 transition-colors"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4.5 cursor-pointer list-none select-none" style={{ paddingTop: '1.125rem', paddingBottom: '1.125rem' }}>
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  <svg
                    className="w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 group-open:rotate-45"
                    viewBox="0 0 20 20" fill="none"
                  >
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-10">
            ¿Otra pregunta?{' '}
            <a href="mailto:soporte@mentebridge.com" className="text-teal-400 hover:underline hover:text-teal-300 transition-colors">
              soporte@mentebridge.com
            </a>
          </p>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-20 px-5 bg-[#0a120a]">
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-gradient-to-br from-teal-900/35 to-emerald-900/15 border border-teal-500/20 rounded-3xl p-10 md:p-14 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent pointer-events-none" />
            <div className="relative">
              <p className="text-xs text-teal-400 font-bold uppercase tracking-widest mb-3">Sin excusas · Sin lista de espera</p>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
                Empieza hoy.<br />Es gratis.
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed text-sm">
                Miles de colombianos ya cuidan su salud mental con MenteBridge.
                Tu primera sesión puede ser en los próximos 2 minutos.
              </p>
              <Link
                href="/registro"
                className="inline-flex px-9 py-4 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl transition-all text-base shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02]"
              >
                Crear cuenta gratis →
              </Link>
              <p className="text-xs text-gray-600 mt-4">Sin tarjeta de crédito · Cancela cuando quieras</p>
              <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-5 text-xs text-gray-600">
                <span>🔒 AES-256</span>
                <span>📋 Ley 1581</span>
                <span>🏛️ COLPSIC</span>
                <span>🇨🇴 Colombia</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-5 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg font-black bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">MenteBridge</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Plataforma de salud mental con IA y psicólogos certificados. Hecha en Colombia, para Colombia.
              </p>
              <p className="text-xs text-gray-600 mt-3">🇨🇴 Bogotá, Colombia</p>
            </div>

            {/* Producto */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Producto</p>
              <nav className="space-y-2">
                {[
                  { href: '/dashboard/chat', label: 'Chat con IA' },
                  { href: '/dashboard/diario', label: 'Diario emocional' },
                  { href: '/psicologos', label: 'Psicólogos' },
                  { href: '#precios', label: 'Precios' },
                  { href: '/aprender', label: 'Aprender' },
                ].map(l => (
                  <Link key={l.label} href={l.href} className="block text-xs text-gray-500 hover:text-gray-300 transition-colors">{l.label}</Link>
                ))}
              </nav>
            </div>

            {/* Legal */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Legal</p>
              <nav className="space-y-2">
                {[
                  { href: '/terminos-uso', label: 'Términos de uso' },
                  { href: '/politica-privacidad', label: 'Política de privacidad' },
                  { href: '/tratamiento-datos', label: 'Tratamiento de datos' },
                ].map(l => (
                  <Link key={l.label} href={l.href} className="block text-xs text-gray-500 hover:text-gray-300 transition-colors">{l.label}</Link>
                ))}
              </nav>
            </div>

            {/* Crisis */}
            <div>
              <p className="text-xs font-bold text-red-500/70 uppercase tracking-widest mb-3">🆘 Líneas de crisis</p>
              <nav className="space-y-2">
                <a href="tel:106" className="block text-xs text-teal-400 hover:text-teal-300 font-semibold transition-colors">Línea 106 — Salud Mental</a>
                <a href="tel:123" className="block text-xs text-red-400 hover:text-red-300 font-semibold transition-colors">123 — Emergencias</a>
                <a href="tel:8001225555" className="block text-xs text-gray-400 hover:text-gray-300 transition-colors">800-122-5555 — Salud Mental</a>
                <a href="tel:132" className="block text-xs text-gray-400 hover:text-gray-300 transition-colors">132 — Cruz Roja</a>
              </nav>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">© 2026 MenteBridge Colombia. Todos los derechos reservados.</p>
            <div className="flex gap-4 text-xs text-gray-600">
              <a href="mailto:soporte@mentebridge.com" className="hover:text-gray-400 transition-colors">soporte@mentebridge.com</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
