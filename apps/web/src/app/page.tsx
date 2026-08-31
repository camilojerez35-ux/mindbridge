import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import LandingNav from '@/components/landing/LandingNav';
import ChequeoEmocionalInteractivo from '@/components/landing/ChequeoEmocionalInteractivo';
import StickyMobileCta from '@/components/landing/StickyMobileCta';

export const metadata: Metadata = {
  title: 'MenteBridge Colombia — Salud Mental con IA y Psicólogos Certificados',
  description: 'Acompañamiento emocional con IA clínica y psicólogos verificados por COLPSIC. Chat 24/7, videocitas, diario emocional. Cumple Ley 1581/2012.',
  keywords: 'salud mental colombia, psicólogo online colombia, terapia online, ansiedad, depresión, bienestar emocional, IA salud mental, colpsic',
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
    titulo: 'Apoyo cuando más lo necesitas (24/7)',
    desc: 'Un chat clínico disponible a cualquier hora, incluso a las 2:00 AM. Sin lista de espera, sin juicios. Técnicas de TCC, ACT y mindfulness aplicadas a tu situación.',
    color: 'from-teal-500/10 to-teal-600/5',
    border: 'border-teal-500/20',
    tag: '24/7 Sin Esperas',
  },
  {
    icon: '📔',
    titulo: 'Entiende tus patrones emocionales',
    desc: 'Registra cómo te sientes cada día y la IA identifica qué situaciones, horarios o personas afectan tu ánimo. Claridad que transforma tu día a día.',
    color: 'from-indigo-500/10 to-indigo-600/5',
    border: 'border-indigo-500/20',
    tag: 'Diario Inteligente',
  },
  {
    icon: '👨‍⚕️',
    titulo: 'Psicólogos verificados (Pago por sesión)',
    desc: 'Agenda videoconsultas individuales con profesionales colegiados por COLPSIC cuando lo necesites. Recibe 20% de descuento en tu primera consulta.',
    color: 'from-rose-500/10 to-rose-600/5',
    border: 'border-rose-500/20',
    tag: '20% OFF 1ra Cita',
  },
  {
    icon: '🧘',
    titulo: 'Herramientas inmediatas para la ansiedad',
    desc: 'Ejercicios guiados de respiración 4-7-8, grounding 5-4-3-2-1 y mindfulness para calmar tu mente en momentos de pánico o sobrecarga.',
    color: 'from-amber-500/10 to-amber-600/5',
    border: 'border-amber-500/20',
    tag: 'Alivio Inmediato',
  },
  {
    icon: '📈',
    titulo: 'Ve tu progreso semana a semana',
    desc: 'Gráficas de evolución emocional, rachas de bienestar y resúmenes clínicos que puedes llevar a tu terapeuta.',
    color: 'from-purple-500/10 to-purple-600/5',
    border: 'border-purple-500/20',
    tag: 'Seguimiento',
  },
  {
    icon: '🔒',
    titulo: '100% Anónimo y Confidencial',
    desc: 'Cifrado militar AES-256 en todas tus conversaciones. Cumplimos Ley 1581/2012 y Res. 2654/2019. Ni nuestro equipo puede leer tus chats.',
    color: 'from-emerald-500/10 to-emerald-600/5',
    border: 'border-emerald-500/20',
    tag: 'AES-256 Cifrado',
  },
];

const dolorPuntos = [
  { emoji: '😰', texto: '¿La ansiedad o la rumiación mental no te dejan concentrarte ni descansar?' },
  { emoji: '😔', texto: '¿Te sientes abrumado/a pero te da vergüenza o miedo hablarlo por temor al juicio?' },
  { emoji: '💸', texto: '¿Quieres ir a terapia pero el costo de $100.000+ por sesión no te alcanza cada semana?' },
  { emoji: '⏳', texto: '¿Tu EPS tarda meses en darte una cita con psicología cuando necesitas ayuda hoy?' },
];

const pasos = [
  {
    num: '01',
    titulo: 'Crea tu cuenta en 1 minuto',
    desc: 'Solo con tu correo electrónico. Sin tarjeta de crédito y 100% gratis.',
    detalle: 'Registro seguro con verificación de email y consentimiento informado según Ley 1581/2012.',
    color: 'text-teal-400',
    ring: 'ring-teal-500/30',
    bg: 'bg-teal-500/10',
    icon: (
      <svg className="w-8 h-8 text-teal-400" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="11" r="5" stroke="currentColor" strokeWidth="2"/>
        <path d="M6 27c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    num: '02',
    titulo: 'Desahógate y encuentra calma',
    desc: 'La IA escucha con empatía clínica y te brinda técnicas de TCC y respiración en el momento exacto.',
    detalle: 'Acompañamiento basado en evidencia (TCC, ACT, Mindfulness) adaptado a lo que vives.',
    color: 'text-emerald-400',
    ring: 'ring-emerald-500/30',
    bg: 'bg-emerald-500/10',
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
    desc: 'Paga únicamente por la sesión que tomes, con 20% de descuento de bienvenida en tu primera cita.',
    detalle: 'Videoconsulta confidencial WebRTC. El profesional recibe tu contexto para no empezar desde cero.',
    color: 'text-indigo-400',
    ring: 'ring-indigo-500/30',
    bg: 'bg-indigo-500/10',
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
  { num: '+2.000', label: 'Colombianos activos', sub: 'encontrando calma cada semana' },
  { num: '98%', label: 'Satisfacción', sub: 'en el acompañamiento' },
  { num: '+15', label: 'Psicólogos COLPSIC', sub: 'verificados y activos' },
  { num: '24/7', label: 'Disponibilidad', sub: 'de tu asistente clínico' },
];

const testimonios = [
  {
    texto: '"Poder hablar a las 11 de la noche cuando me entra el ataque de pánico y recibir un ejercicio que me baja la taquicardia no tiene precio. Me cambió la vida."',
    autor: 'María C.',
    profesion: 'Nutricionista',
    ciudad: 'Bogotá',
    iniciales: 'MC',
    color: 'from-teal-500 to-emerald-500',
    estrellas: 5,
  },
  {
    texto: '"Como hombre siempre me costó buscar ayuda o admitir que estaba agotado. Con MenteBridge pude desahogarme sin juicio y luego agendar con la psicóloga para mi primera cita."',
    autor: 'Santiago R.',
    profesion: 'Ingeniero de sistemas',
    ciudad: 'Medellín',
    iniciales: 'SR',
    color: 'from-indigo-500 to-purple-500',
    estrellas: 5,
  },
  {
    texto: '"El diario me mostró que mi mal humor siempre era los domingos por la tarde. Ahora lo anticipo. Nunca lo hubiera notado sin los datos de la IA."',
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
    desc: 'Ideal para probar el chat y empezar a entender tus emociones.',
    destacado: false,
    cta: 'Empezar gratis',
    href: '/registro',
    features: [
      '5 chats con IA clínica/mes',
      '1 test PHQ-9 de depresión',
      'Diario emocional básico',
      'Cifrado AES-256 de tus datos',
      '20% dto en tu 1ra cita con psicólogo',
    ],
    noFeatures: [
      'Chat IA ilimitado',
      'Resúmenes semanales profundos',
      'Ejercicios guiados avanzados',
    ],
  },
  {
    nombre: 'Básico',
    precio: '14.900',
    paraQuien: 'Para construir un hábito diario',
    desc: 'Chat IA ilimitado y diario completo al precio más accesible.',
    destacado: false,
    cta: 'Comenzar con Básico',
    href: '/registro',
    features: [
      'IA clínica sin límite de mensajes',
      'Diario emocional completo',
      'Todos los tests psicológicos (PHQ-9, GAD-7, DASS)',
      'Cifrado AES-256 de tus datos',
      '20% dto en tu 1ra cita con psicólogo',
    ],
    noFeatures: ['Resumen IA semanal', 'Ejercicios personalizados'],
  },
  {
    nombre: 'Plus',
    precio: '25.900',
    paraQuien: 'Para resultados reales y profundos',
    desc: 'El plan más completo con resúmenes de evolución y ejercicios personalizados.',
    destacado: true,
    cta: 'Comenzar con Plus',
    href: '/registro',
    features: [
      'Todo lo del plan Básico',
      'Resumen IA semanal con insights',
      'Ejercicios personalizados de TCC/Mindfulness',
      'Prioridad en respuestas de IA',
      'Reportes emocionales avanzados',
      '20% dto en tu 1ra cita con psicólogo',
    ],
    noFeatures: [],
  },
  {
    nombre: 'Familia',
    precio: '44.900',
    paraQuien: 'Para cuidar a toda tu familia',
    desc: 'Un solo plan con hasta 5 perfiles independientes y privados.',
    destacado: false,
    cta: 'Plan Familia',
    href: '/registro',
    features: [
      'Todo lo del plan Plus',
      'Hasta 5 perfiles individuales',
      'IA clínica sin límite para todos',
      'Panel familiar de bienestar',
      'Privacidad total entre perfiles',
      '20% dto en 1ra cita para cada miembro',
    ],
    noFeatures: [],
  },
];

const tablaComparativa = [
  {
    caracteristica: 'Disponibilidad de atención',
    tradicional: 'Cita previa (esperas de 1 a 3 semanas)',
    extranjeras: '24/7 (en inglés o neutro internacional)',
    mentebridge: '24/7 al instante (incluso a las 2 AM) 🇨🇴',
  },
  {
    caracteristica: 'Costo mensual estimado',
    tradicional: '$360.000 - $600.000 COP (4 sesiones)',
    extranjeras: '$60.000 - $280.000 COP (en dólares)',
    mentebridge: 'Desde $14.900 COP / mes (o Gratis)',
  },
  {
    caracteristica: 'Citas con Psicólogo',
    tradicional: 'Cobro fijo por consulta presencial',
    extranjeras: 'Psicólogo asignado aleatorio en EE.UU.',
    mentebridge: 'Pago por sesión + 20% OFF de bienvenida',
  },
  {
    caracteristica: 'Métodos de pago aceptados',
    tradicional: 'Efectivo o transferencia bancaria',
    extranjeras: 'Solo tarjeta de crédito en USD',
    mentebridge: 'Nequi, PSE, Tarjetas y Daviplata (Wompi)',
  },
  {
    caracteristica: 'Privacidad y confidencialidad',
    tradicional: 'Historia clínica en consultorio',
    extranjeras: 'Regulaciones extranjeras (HIPAA/GDPR)',
    mentebridge: 'Cifrado AES-256 + Ley 1581/2012 Colombia',
  },
];

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: '¿Cómo funcionan las citas con psicólogos y el descuento de bienvenida?',
    a: 'Las videoconsultas con psicólogos se pagan por sesión individual (generalmente entre $80.000 y $120.000 COP según el especialista). No están atadas a la suscripción para que solo pagues cuando decidas consultar. Como usuario de MenteBridge, recibes un 20% de descuento de bienvenida en tu primera cita.',
  },
  {
    q: '¿La IA reemplaza a un psicólogo?',
    a: 'No. La IA es una herramienta de acompañamiento emocional basada en evidencia (TCC, ACT, mindfulness), no un sustituto de la atención clínica. Cuando detecta señales que requieren atención profesional, te conecta directamente con un psicólogo verificado por COLPSIC.',
  },
  {
    q: '¿Es completamente confidencial? ¿Alguien lee mis chats?',
    a: 'Es 100% confidencial. Tus conversaciones se cifran con tecnología militar AES-256 y nunca se comparten con terceros ni con empleadores. Cumplimos la Ley 1581/2012 de protección de datos personales y la Resolución 2654/2019 de Telesalud. Ni nuestro propio equipo técnico puede leer tus conversaciones.',
  },
  {
    q: '¿Puedo cancelar mi suscripción cuando quiera?',
    a: 'Sí, en cualquier momento con un solo clic desde tu perfil. Sin cláusulas de permanencia, sin penalizaciones y sin letras pequeñas.',
  },
  {
    q: '¿Los psicólogos están certificados en Colombia?',
    a: 'Sí. Todos los psicólogos de nuestra red cuentan con tarjeta profesional vigente y verificación ante COLPSIC (Colegio Colombiano de Psicólogos).',
  },
  {
    q: '¿Qué pasa si estoy en crisis o emergencia?',
    a: <>Si el sistema detecta señales de riesgo crítico, activa un protocolo inmediato: ejercicios de contención, enlace urgente y acceso directo a las líneas nacionales de emergencia — <a href="tel:106" className="text-teal-400 font-bold hover:underline">Línea 106</a> (gratuita 24h) y <a href="tel:123" className="text-red-400 font-bold hover:underline">123</a>. Tu seguridad es la prioridad absoluta.</>,
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Procesamos los pagos mediante Wompi (Bancolombia) — aceptamos Nequi, PSE, tarjetas débito y crédito Visa y Mastercard.',
  },
];

const confianzaBadges = [
  { icon: '🏛️', titulo: 'COLPSIC', desc: 'Psicólogos con tarjeta profesional verificada' },
  { icon: '⚖️', titulo: 'Ley 1581/2012', desc: 'Protección estricta de datos personales y salud' },
  { icon: '🔐', titulo: 'Cifrado AES-256', desc: 'Tus conversaciones están blindadas y privadas' },
  { icon: '🇨🇴', titulo: 'Res. 2654/2019', desc: 'Cumplimiento normativo de Telesalud en Colombia' },
];

/* ─────────────── HELPERS ─────────────── */

function StarIcon() {
  return (
    <svg className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
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
    <svg className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─────────────── PAGE ─────────────── */

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080f0a] text-white selection:bg-teal-500/30 selection:text-teal-200">

      <LandingNav />

      {/* ── HERO ── */}
      <section className="pt-28 pb-16 px-5 md:pt-36 md:pb-24 relative overflow-hidden">
        {/* Glows de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-teal-500 rounded-full opacity-[0.04] blur-[140px] pointer-events-none" />
        <div className="absolute top-20 right-10 w-[300px] h-[300px] bg-emerald-500 rounded-full opacity-[0.03] blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 mb-7 shadow-sm">
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
              <span className="text-xs text-teal-300 font-semibold tracking-wide">Salud Mental Privada y Accesible · Colombia 🇨🇴</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-5 leading-[1.1] tracking-tight">
              Un espacio seguro para desahogarte, entender lo que sientes y{' '}
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                recuperar la calma
              </span>
            </h1>

            <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-9 leading-relaxed">
              Acompañamiento emocional con IA clínica basada en TCC y psicólogos colegiados por COLPSIC.
              Disponible 24/7, 100% privado y al alcance de tu bolsillo.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 justify-center mb-10">
              <Link
                href="/registro"
                className="px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold rounded-xl transition-all text-base shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                Empezar gratis — sin tarjeta de crédito →
              </Link>
              <Link
                href="/psicologos"
                className="px-7 py-4 bg-white/5 hover:bg-white/10 border border-white/12 hover:border-teal-500/30 text-white font-semibold rounded-xl transition-all text-base flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                Ver Psicólogos (20% OFF 1ra cita)
              </Link>
            </div>

            {/* Social proof strip */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['from-teal-500 to-emerald-500','from-indigo-500 to-purple-500','from-rose-500 to-pink-500','from-amber-500 to-orange-500'].map((g, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} border-2 border-[#080f0a] shadow-sm`} />
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => <StarIcon key={i} />)}
                  </div>
                  <p className="text-xs text-gray-300"><span className="text-white font-bold">+2.000</span> personas activas</p>
                </div>
              </div>
              <div className="hidden sm:block w-px h-7 bg-white/10" />
              <p className="text-xs text-gray-300 flex items-center gap-1.5">
                <span>🔒 Cifrado militar AES-256</span> · <span>100% Anónimo</span>
              </p>
              <div className="hidden sm:block w-px h-7 bg-white/10" />
              <p className="text-xs text-gray-300">
                ⚡ Listo en <span className="text-teal-400 font-bold">menos de 1 minuto</span>
              </p>
            </div>
          </div>

          {/* ── WIDGET INTERACTIVO DE CHEQUEO EMOCIONAL ── */}
          <div className="mt-14 max-w-3xl mx-auto">
            <ChequeoEmocionalInteractivo />
          </div>
        </div>
      </section>

      {/* ── DOLOR PUNTOS ── */}
      <section className="py-16 px-5 bg-[#0a120a] border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs text-teal-400 font-bold uppercase tracking-widest bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
              No tienes que pasar por esto solo/a
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white mt-3">
              ¿Te identificas con alguna de estas situaciones?
            </h2>
            <p className="text-sm text-gray-400 mt-2">MenteBridge fue diseñado para darte alivio inmediato en tu momento de mayor necesidad</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3.5">
            {dolorPuntos.map((d) => (
              <div key={d.texto} className="flex items-start gap-3.5 p-4.5 bg-white/3 border border-white/8 rounded-2xl hover:border-teal-500/30 hover:bg-white/5 transition-all">
                <span className="text-2xl flex-shrink-0 mt-0.5">{d.emoji}</span>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{d.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DISIPADORES DE MIEDO Y GARANTÍAS DE CONFIANZA ── */}
      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-5">
            <div className="p-6 bg-gradient-to-b from-teal-950/40 to-transparent border border-teal-500/30 rounded-2xl hover:border-teal-500/50 transition-all">
              <span className="text-3xl mb-3 block">🔒</span>
              <h3 className="text-base font-bold text-white mb-2">100% Anónimo y Privado</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Tus conversaciones están protegidas con cifrado militar AES-256. Ni nuestro equipo de desarrollo ni terceros pueden leer lo que escribes.
              </p>
            </div>
            <div className="p-6 bg-gradient-to-b from-emerald-950/40 to-transparent border border-emerald-500/30 rounded-2xl hover:border-emerald-500/50 transition-all">
              <span className="text-3xl mb-3 block">💳</span>
              <h3 className="text-base font-bold text-white mb-2">Cero Riesgo: Empieza Gratis</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                No te pediremos tarjeta de crédito para registrarte ni para usar el plan gratuito. Si decides suscribirte, cancelas cuando quieras en 1 clic.
              </p>
            </div>
            <div className="p-6 bg-gradient-to-b from-indigo-950/40 to-transparent border border-indigo-500/30 rounded-2xl hover:border-indigo-500/50 transition-all">
              <span className="text-3xl mb-3 block">🇨🇴</span>
              <h3 className="text-base font-bold text-white mb-2">Respaldo COLPSIC Colombia</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Toda la metodología se basa en protocolos clínicos validados (TCC y ACT) y nuestra red de psicólogos cuenta con tarjeta profesional activa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFICIOS ── */}
      <section id="beneficios" className="py-20 px-5 bg-[#0a120a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-teal-500 font-bold uppercase tracking-widest mb-3">Qué hace MenteBridge por ti</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Herramientas clínicas reales en la palma de tu mano
            </h2>
            <p className="text-gray-400 mt-3 text-sm max-w-xl mx-auto">
              Diseñado junto a psicólogos clínicos para darte apoyo constante entre sesiones.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {beneficios.map((b) => (
              <div
                key={b.titulo}
                className={`p-6 rounded-2xl bg-gradient-to-br ${b.color} border ${b.border} flex flex-col justify-between hover:scale-[1.01] transition-transform`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{b.icon}</span>
                    <span className="text-[11px] font-bold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2.5 py-0.5 rounded-full">
                      {b.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{b.titulo}</h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECCIÓN DESTACADA: CITAS CON PSICÓLOGOS + DESCUENTO ── */}
      <section id="psicologos" className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-teal-950/60 via-[#0d1f17] to-emerald-950/60 border border-teal-500/30 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-4">
                🎁 Bono de Bienvenida
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white mb-4 leading-tight">
                Teleconsultas con Psicólogos COLPSIC:<br />
                <span className="text-teal-400">Paga solo por sesión individual</span>
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                En MenteBridge no te obligamos a pagar planes costosos de terapia que no sabes si vas a usar.
                Las videoconsultas se pagan de forma independiente cuando tú lo decidas, y para que des el primer paso sin miedo, te damos un{' '}
                <strong className="text-white font-bold underline decoration-teal-400">20% de descuento en tu primera cita</strong> con cualquier profesional de la red.
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <Link
                  href="/psicologos"
                  className="px-7 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-teal-500/25 hover:scale-[1.02]"
                >
                  Explorar Psicólogos Verificados →
                </Link>
                <span className="text-xs text-gray-400 font-medium">
                  Tarifas transparentes desde $64.000 COP con descuento aplicado
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TABLA COMPARATIVA ── */}
      <section className="py-16 px-5 bg-[#0a120a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs text-teal-400 font-bold uppercase tracking-widest bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
              Comparativa transparente
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
              ¿Por qué MenteBridge es diferente?
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Compara tu bienestar con las alternativas tradicionales en Colombia
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
                  <th className="py-4 px-4">Criterio</th>
                  <th className="py-4 px-4 text-gray-400">Terapia Privada Tradicional</th>
                  <th className="py-4 px-4 text-gray-400">Apps Extranjeras en USD</th>
                  <th className="py-4 px-4 text-teal-300 font-bold bg-teal-500/10 rounded-t-xl">MenteBridge Colombia 🇨🇴</th>
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm divide-y divide-white/5">
                {tablaComparativa.map((fila, idx) => (
                  <tr key={idx} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-4 font-semibold text-white">{fila.caracteristica}</td>
                    <td className="py-4 px-4 text-gray-300">{fila.tradicional}</td>
                    <td className="py-4 px-4 text-gray-300">{fila.extranjeras}</td>
                    <td className="py-4 px-4 font-bold text-teal-300 bg-teal-500/5">{fila.mentebridge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-teal-500 font-bold uppercase tracking-widest mb-3">Paso a paso</p>
            <h2 className="text-3xl font-black text-white">¿Cómo funciona MenteBridge?</h2>
            <p className="text-gray-400 mt-3 text-sm">Empieza en minutos, a tu propio ritmo.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {pasos.map((p, i) => (
              <div key={p.num} className="relative">
                {/* Conector */}
                {i < pasos.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(100%-1rem)] w-8 h-px bg-gradient-to-r from-white/15 to-white/5" />
                )}
                <div className="flex flex-col items-start p-6 bg-white/3 border border-white/8 rounded-2xl hover:border-teal-500/25 transition-colors">
                  <div className={`w-14 h-14 rounded-xl ${p.bg} ring-1 ${p.ring} flex items-center justify-center mb-5`}>
                    {p.icon}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-black ${p.color} tracking-wider`}>{p.num}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 leading-snug">{p.titulo}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed mb-3">{p.desc}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{p.detalle}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold rounded-xl transition-all text-base shadow-lg shadow-teal-500/25 hover:scale-[1.02]"
            >
              Crear cuenta gratis →
            </Link>
            <p className="text-xs text-gray-400 mt-3">Sin tarjeta · Cancela cuando quieras · Gratis para siempre en el plan básico</p>
          </div>
        </div>
      </section>

      {/* ── ESTADÍSTICAS ── */}
      <section className="py-16 px-5 bg-[#0a120a]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {estadisticas.map((e) => (
              <div key={e.label} className="text-center p-5 bg-white/3 border border-white/8 rounded-2xl">
                <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                  {e.num}
                </p>
                <p className="text-sm font-semibold text-white">{e.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{e.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-teal-500 font-bold uppercase tracking-widest mb-3">Historias reales</p>
            <h2 className="text-3xl font-black text-white">Lo que dicen nuestros usuarios</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {testimonios.map((t) => (
              <div key={t.autor} className="bg-[#0d1a12] border border-white/8 rounded-2xl p-6 flex flex-col gap-4 hover:border-teal-500/20 transition-colors">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.estrellas }).map((_, i) => <StarIcon key={i} />)}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed flex-1 italic">{t.texto}</p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0 ring-1 ring-white/10`}>
                    <span className="text-xs font-bold text-white">{t.iniciales}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.autor}</p>
                    <p className="text-xs text-gray-400">{t.profesion} · {t.ciudad}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="precios" className="py-24 px-5 bg-[#0a120a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-teal-500 font-bold uppercase tracking-widest mb-3">Suscripciones de IA y Herramientas</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Elige el plan que se ajusta a ti
            </h2>
            <p className="text-gray-400 mt-3 text-sm max-w-xl mx-auto">
              Precios transparentes en COP. Las citas con psicólogos se agendan de forma individual cuando las necesites (con 20% OFF de bienvenida).
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {planes.map((plan) => (
              <div
                key={plan.nombre}
                className={`relative rounded-2xl p-7 flex flex-col gap-5 ${
                  plan.destacado
                    ? 'bg-gradient-to-b from-teal-900/40 to-emerald-900/20 border border-teal-500/40 ring-1 ring-teal-500/20'
                    : 'bg-[#0d1a12] border border-white/8 hover:border-white/15 transition-colors'
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
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{plan.paraQuien}</p>
                  <p className="text-lg font-black text-white mb-1">{plan.nombre}</p>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-black text-white">${plan.precio}</span>
                    <span className="text-gray-400 text-sm mb-1.5">/mes</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{plan.desc}</p>
                </div>

                <Link
                  href={plan.href}
                  className={`w-full py-3 rounded-xl font-semibold text-sm text-center transition-all ${
                    plan.destacado
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white shadow-lg shadow-teal-500/20 hover:scale-[1.01]'
                      : 'bg-white/6 hover:bg-white/12 border border-white/12 text-white hover:scale-[1.01]'
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs text-gray-200">
                      <CheckIcon />
                      {f}
                    </li>
                  ))}
                  {plan.noFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs text-gray-500">
                      <XIcon />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            Todos los planes incluyen cifrado AES-256 · Pagos procesados por{' '}
            <span className="text-teal-400 font-semibold">Wompi (Bancolombia)</span> mediante Nequi, PSE y Tarjetas
          </p>
        </div>
      </section>

      {/* ── CONFIANZA ── */}
      <section className="py-16 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs text-teal-500 font-bold uppercase tracking-widest mb-3">Certificaciones</p>
            <h2 className="text-2xl font-black text-white">Certificado y regulado para Colombia</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {confianzaBadges.map((b) => (
              <div key={b.titulo} className="flex flex-col items-center text-center p-5 bg-white/3 border border-white/8 rounded-2xl hover:border-teal-500/30 transition-colors">
                <span className="text-3xl mb-3">{b.icon}</span>
                <p className="text-sm font-bold text-white mb-1.5">{b.titulo}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-5 bg-[#0a120a]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-teal-500 font-bold uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl font-black text-white">Preguntas frecuentes</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group bg-[#0d1a12] border border-white/8 rounded-2xl overflow-hidden hover:border-teal-500/25 transition-colors"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4.5 cursor-pointer list-none select-none" style={{ paddingTop: '1.125rem', paddingBottom: '1.125rem' }}>
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 group-open:rotate-45"
                    viewBox="0 0 20 20" fill="none"
                  >
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-sm text-gray-300 leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-10">
            ¿Tienes otra pregunta? Escríbenos a{' '}
            <a href="mailto:soporte@mentebridge.com" className="text-teal-400 hover:underline hover:text-teal-300 font-semibold transition-colors">
              soporte@mentebridge.com
            </a>
          </p>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-20 px-5">
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-gradient-to-br from-teal-900/40 via-[#0a1a12] to-emerald-900/20 border border-teal-500/30 rounded-3xl p-10 md:p-14 text-center overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent pointer-events-none" />
            <div className="relative">
              <p className="text-xs text-teal-300 font-bold uppercase tracking-widest mb-3">Sin excusas · Sin lista de espera</p>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
                Empieza hoy.<br />Es completamente gratis.
              </h2>
              <p className="text-gray-300 mb-8 leading-relaxed text-sm">
                Miles de colombianos ya cuidan su salud mental con MenteBridge.
                Tu primera conversación puede ser en los próximos 2 minutos.
              </p>
              <Link
                href="/registro"
                className="inline-flex px-9 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold rounded-xl transition-all text-base shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02]"
              >
                Crear cuenta gratis →
              </Link>
              <p className="text-xs text-gray-400 mt-4">Sin tarjeta de crédito · Cancela cuando quieras</p>
              <div className="mt-6 pt-5 border-t border-white/8 flex flex-wrap items-center justify-center gap-5 text-xs text-gray-400">
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
      <footer className="py-12 px-5 border-t border-white/8 bg-[#060c08]">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg font-black bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">MenteBridge</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Plataforma de salud mental con IA clínica y psicólogos certificados. Hecha en Colombia, para Colombia.
              </p>
              <p className="text-xs text-gray-400 mt-3">🇨🇴 Bogotá, Colombia</p>
            </div>

            {/* Producto */}
            <div>
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-3">Producto</p>
              <nav className="space-y-2">
                {[
                  { href: '/dashboard/chat', label: 'Chat con IA' },
                  { href: '/dashboard/diario', label: 'Diario emocional' },
                  { href: '/psicologos', label: 'Psicólogos' },
                  { href: '#precios', label: 'Precios' },
                  { href: '/aprender', label: 'Aprender' },
                ].map(l => (
                  <Link key={l.label} href={l.href} className="block text-xs text-gray-400 hover:text-teal-300 transition-colors">{l.label}</Link>
                ))}
              </nav>
            </div>

            {/* Legal */}
            <div>
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-3">Legal</p>
              <nav className="space-y-2">
                {[
                  { href: '/terminos-uso', label: 'Términos de uso' },
                  { href: '/politica-privacidad', label: 'Política de privacidad' },
                  { href: '/tratamiento-datos', label: 'Tratamiento de datos' },
                ].map(l => (
                  <Link key={l.label} href={l.href} className="block text-xs text-gray-400 hover:text-teal-300 transition-colors">{l.label}</Link>
                ))}
              </nav>
            </div>

            {/* Crisis */}
            <div>
              <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-3">🆘 Líneas de crisis 24h</p>
              <nav className="space-y-2">
                <a href="tel:106" className="block text-xs text-teal-300 hover:text-teal-200 font-semibold transition-colors">Línea 106 — Salud Mental (Gratis)</a>
                <a href="tel:123" className="block text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors">123 — Emergencias</a>
                <a href="tel:8001225555" className="block text-xs text-gray-400 hover:text-gray-200 transition-colors">800-122-5555 — Salud Mental</a>
                <a href="tel:132" className="block text-xs text-gray-400 hover:text-gray-200 transition-colors">132 — Cruz Roja</a>
              </nav>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">© 2026 MenteBridge Colombia. Todos los derechos reservados.</p>
            <div className="flex gap-4 text-xs text-gray-400">
              <a href="mailto:soporte@mentebridge.com" className="hover:text-teal-300 transition-colors">soporte@mentebridge.com</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Barra flotante en móviles */}
      <StickyMobileCta />
    </div>
  );
}
