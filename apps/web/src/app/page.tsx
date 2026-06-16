import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'MindBridge Colombia — Salud Mental con IA y Psicólogos Certificados',
  description: 'Plataforma de acompañamiento emocional con inteligencia artificial y psicólogos certificados en Colombia. Chat 24/7, videocitas, diario emocional y más.',
  openGraph: {
    title: 'MindBridge Colombia — Salud Mental con IA',
    description: 'Acompañamiento emocional con IA y psicólogos certificados. Disponible 24/7 en Colombia.',
    url: 'https://mindbridge.co',
    siteName: 'MindBridge Colombia',
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MindBridge Colombia — Salud Mental con IA',
    description: 'Acompañamiento emocional con IA y psicólogos certificados en Colombia.',
  },
};

const features = [
  {
    icon: '🤖',
    title: 'Chat con IA Clínica',
    desc: 'Conversaciones inteligentes basadas en TCC, ACT y mindfulness. Disponible 24/7, sin lista de espera.',
    color: 'from-teal-500/10 to-teal-600/5',
    border: 'border-teal-500/15',
  },
  {
    icon: '📔',
    title: 'Diario Emocional',
    desc: 'Registra tu estado de ánimo diario y obtén insights personalizados sobre tus patrones emocionales.',
    color: 'from-indigo-500/10 to-indigo-600/5',
    border: 'border-indigo-500/15',
  },
  {
    icon: '👨‍⚕️',
    title: 'Psicólogos Verificados',
    desc: 'Conecta con profesionales certificados por COLPSIC cuando necesites atención humana especializada.',
    color: 'from-rose-500/10 to-rose-600/5',
    border: 'border-rose-500/15',
  },
  {
    icon: '🧘',
    title: 'Ejercicios Guiados',
    desc: 'Técnicas de respiración, grounding y mindfulness para manejar la ansiedad en tiempo real.',
    color: 'from-amber-500/10 to-amber-600/5',
    border: 'border-amber-500/15',
  },
  {
    icon: '📈',
    title: 'Seguimiento de Progreso',
    desc: 'Visualiza tu evolución emocional con gráficas y reportes semanales personalizados.',
    color: 'from-purple-500/10 to-purple-600/5',
    border: 'border-purple-500/15',
  },
  {
    icon: '🔒',
    title: 'Privacidad Total',
    desc: 'Cifrado AES-256. Cumple Ley 1581/2012 y Resolución 2654/2019. Tus datos son solo tuyos.',
    color: 'from-emerald-500/10 to-emerald-600/5',
    border: 'border-emerald-500/15',
  },
];

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: '¿La IA reemplaza a un psicólogo?',
    a: 'No. La IA de MindBridge es una herramienta de acompañamiento emocional basada en evidencia (TCC, ACT, mindfulness), no un sustituto de la atención clínica. Cuando detecta señales que requieren atención profesional, te conecta directamente con un psicólogo verificado.',
  },
  {
    q: '¿Es completamente confidencial?',
    a: 'Sí. Tus conversaciones se cifran con AES-256 y nunca se comparten con terceros. Cumplimos la Ley 1581/2012 de protección de datos y la Resolución 2654/2019 del Ministerio de Salud. Ni siquiera nuestro equipo puede leer tus chats.',
  },
  {
    q: '¿Cómo cancelo mi suscripción?',
    a: 'Puedes cancelar en cualquier momento desde Configuración → Suscripción en tu dashboard. Sin permanencia mínima, sin penalizaciones. Conservas acceso al plan pagado hasta el final del período ya facturado.',
  },
  {
    q: '¿Los psicólogos están certificados?',
    a: 'Todos los psicólogos de MindBridge están verificados por COLPSIC (Colegio Colombiano de Psicólogos) y tienen tarjeta profesional vigente. Revisamos sus credenciales antes de que puedan atender pacientes en la plataforma.',
  },
  {
    q: '¿Qué pasa si estoy en crisis?',
    a: <>Si el sistema detecta señales de crisis, activa un protocolo inmediato: ejercicios de estabilización, contacto urgente con un psicólogo y acceso directo a las líneas de emergencia — <a href="tel:106" className="text-teal-400 font-bold hover:underline">106</a> (salud mental, gratuita 24h) y <a href="tel:123" className="text-red-400 font-bold hover:underline">123</a> (emergencias). Tu seguridad es la prioridad.</>,
  },
  {
    q: '¿Puedo usar MindBridge si ya tengo psicólogo?',
    a: 'Por supuesto. Muchos usuarios usan la IA y el diario emocional como complemento entre sesiones, para procesar lo que surge en el día a día y llegar mejor preparados a sus citas.',
  },
];

const pasos = [
  {
    num: '01',
    titulo: 'Crea tu cuenta gratis',
    desc: 'Regístrate en menos de 2 minutos. Solo necesitas tu correo. Sin tarjeta de crédito.',
    color: 'text-teal-400',
    ring: 'ring-teal-500/30',
    bg: 'bg-teal-500/10',
  },
  {
    num: '02',
    titulo: 'Chatea con tu IA clínica',
    desc: 'Habla de lo que sientes, cuando quieras. La IA aplica TCC y mindfulness para darte herramientas reales, no genéricas.',
    color: 'text-emerald-400',
    ring: 'ring-emerald-500/30',
    bg: 'bg-emerald-500/10',
  },
  {
    num: '03',
    titulo: 'Conecta con un psicólogo',
    desc: 'Cuando lo necesites, agenda una videocita con un psicólogo verificado por COLPSIC en minutos.',
    color: 'text-indigo-400',
    ring: 'ring-indigo-500/30',
    bg: 'bg-indigo-500/10',
  },
];

const planes = [
  {
    nombre: 'Gratis',
    precio: '0',
    desc: 'Para empezar tu camino de bienestar.',
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
    desc: 'El plan más popular. Acompañamiento completo.',
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
    desc: 'Cuida a toda tu familia en un solo plan.',
    destacado: false,
    cta: 'Comenzar Familia',
    href: '/registro',
    features: [
      'Todo lo de Plus',
      'Hasta 4 perfiles familiares',
      'IA clínica sin límite para todos',
      '5 videocitas con psicólogo/mes',
      'Panel familiar de bienestar',
      'Reportes comparativos familiares',
    ],
    noFeatures: [],
  },
];

const testimonios = [
  {
    texto: '"Después de 3 semanas usando el chat diario, siento que por fin tengo herramientas para manejar mi ansiedad."',
    autor: 'María C.',
    ciudad: 'Bogotá',
    iniciales: 'MC',
    color: 'from-teal-500 to-emerald-500',
    estrellas: 5,
  },
  {
    texto: '"Agendar con mi psicóloga fue facilísimo. La plataforma se siente segura y sin juicios."',
    autor: 'Santiago R.',
    ciudad: 'Medellín',
    iniciales: 'SR',
    color: 'from-indigo-500 to-purple-500',
    estrellas: 5,
  },
  {
    texto: '"El diario emocional me ayudó a identificar patrones que ni siquiera sabía que tenía."',
    autor: 'Laura M.',
    ciudad: 'Cali',
    iniciales: 'LM',
    color: 'from-rose-500 to-pink-500',
    estrellas: 5,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080f0a] text-white" style={{ fontFamily: 'Inter,system-ui,sans-serif' }}>

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080f0a]/80 backdrop-blur border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-black bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
            MindBridge
          </span>
          <div className="flex items-center gap-3">
            <Link href="/psicologos" className="hidden md:inline text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5">
              Psicólogos
            </Link>
            <a href="#precios" className="hidden md:inline text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5">
              Precios
            </a>
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5">
              Iniciar sesión
            </Link>
            <Link href="/registro" className="text-sm bg-teal-500 hover:bg-teal-400 text-white font-semibold px-4 py-1.5 rounded-lg transition-colors">
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500 rounded-full opacity-[0.04] blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/5 mb-8">
            <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
            <span className="text-xs text-teal-400 font-medium">Plataforma de Salud Mental con IA · Colombia</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.05] tracking-tight">
            Tu bienestar mental,{' '}
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              inteligente
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            MindBridge combina inteligencia artificial clínica con psicólogos certificados
            para ofrecerte acompañamiento personalizado, confidencial y disponible 24/7.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/registro"
              className="px-7 py-3.5 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl transition-all text-base shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30"
            >
              Empezar gratis — sin tarjeta
            </Link>
            <Link
              href="/login"
              className="px-7 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all text-base"
            >
              Ya tengo cuenta
            </Link>
          </div>

          {/* Prueba social */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              {/* Avatares apilados */}
              <div className="flex -space-x-2">
                {[
                  'from-teal-500 to-emerald-500',
                  'from-indigo-500 to-purple-500',
                  'from-rose-500 to-pink-500',
                  'from-amber-500 to-orange-500',
                ].map((g, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} border-2 border-[#080f0a]`} />
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-0.5"><span className="text-white font-semibold">+2.000</span> colombianos ya lo usan</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-white/10" />
            <p className="text-xs text-gray-500">
              🔒 Ley 1581/2012 · Resolución 2654/2019 · AES-256
            </p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-6 bg-[#0a120a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-teal-500 font-bold uppercase tracking-widest mb-3">¿Por qué MindBridge?</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Todo lo que necesitas, en un solo lugar
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className={`bg-gradient-to-br ${f.color} border ${f.border} rounded-2xl p-6 hover:scale-[1.02] transition-all duration-200`}
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-teal-500 font-bold uppercase tracking-widest mb-3">Proceso</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Empieza en 3 pasos simples
            </h2>
          </div>

          <div className="relative">
            {/* Línea conectora (solo desktop) */}
            <div className="hidden md:block absolute top-10 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-indigo-500/20" />

            <div className="grid md:grid-cols-3 gap-8">
              {pasos.map((p) => (
                <div key={p.num} className="flex flex-col items-center text-center">
                  <div className={`w-20 h-20 rounded-2xl ${p.bg} ring-1 ${p.ring} flex items-center justify-center mb-6 relative z-10`}>
                    <span className={`text-2xl font-black ${p.color}`}>{p.num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{p.titulo}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed max-w-xs">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl transition-all text-base shadow-lg shadow-teal-500/20"
            >
              Crear cuenta gratis →
            </Link>
            <p className="text-xs text-gray-600 mt-3">Sin tarjeta de crédito · Cancela cuando quieras</p>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-teal-500 font-bold uppercase tracking-widest mb-3">Testimonios</p>
            <h2 className="text-3xl font-black text-white">Lo que dicen nuestros usuarios</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {testimonios.map((t) => (
              <div key={t.autor} className="bg-[#0d1a12] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
                {/* Estrellas */}
                <div className="flex gap-0.5">
                  {Array.from({ length: t.estrellas }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed flex-1">{t.texto}</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-xs font-bold text-white">{t.iniciales}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.autor}</p>
                    <p className="text-xs text-gray-500">{t.ciudad}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="precios" className="py-24 px-6 bg-[#0a120a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-teal-500 font-bold uppercase tracking-widest mb-3">Precios</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Planes para cada etapa de tu camino
            </h2>
            <p className="text-gray-400 mt-3 text-sm">Pago mensual · Sin permanencia · Cancela cuando quieras</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {planes.map((plan) => (
              <div
                key={plan.nombre}
                className={`relative rounded-2xl p-7 flex flex-col gap-6 ${
                  plan.destacado
                    ? 'bg-gradient-to-b from-teal-900/40 to-emerald-900/20 border border-teal-500/40 ring-1 ring-teal-500/20'
                    : 'bg-[#0d1a12] border border-white/8'
                }`}
              >
                {plan.destacado && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                      Más popular
                    </span>
                  </div>
                )}

                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{plan.nombre}</p>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-black text-white">${plan.precio}</span>
                    <span className="text-gray-500 text-sm mb-1.5">COP/mes</span>
                  </div>
                  <p className="text-sm text-gray-500">{plan.desc}</p>
                </div>

                <Link
                  href={plan.href}
                  className={`w-full py-3 rounded-xl font-semibold text-sm text-center transition-all ${
                    plan.destacado
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white shadow-lg shadow-teal-500/20'
                      : 'bg-white/8 hover:bg-white/12 border border-white/10 text-white'
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <svg className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                  {plan.noFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-gray-700 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
                        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-600 mt-8">
            Todos los planes incluyen cifrado AES-256 y cumplen la Ley 1581/2012 · Pagos procesados por{' '}
            <span className="text-gray-500">Wompi</span>
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-teal-500 font-bold uppercase tracking-widest mb-3">Preguntas frecuentes</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Resolvemos tus dudas
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group bg-[#0d1a12] border border-white/8 rounded-2xl overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none select-none">
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  <svg
                    className="w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 group-open:rotate-45"
                    viewBox="0 0 20 20" fill="none"
                  >
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-10">
            ¿Otra pregunta?{' '}
            <a href="mailto:soporte@mindbridge.co" className="text-teal-400 hover:underline">
              Escríbenos a soporte@mindbridge.co
            </a>
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-[#0a120a]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-teal-900/30 to-emerald-900/10 border border-teal-500/15 rounded-3xl p-12">
            <h2 className="text-3xl font-black text-white mb-3">
              Comienza tu camino hoy
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Únete a miles de colombianos que ya cuidan su salud mental con MindBridge.
              Gratis para siempre en el plan básico.
            </p>
            <Link
              href="/registro"
              className="inline-flex px-8 py-3.5 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl transition-all text-base shadow-lg shadow-teal-500/20"
            >
              Crear cuenta gratis →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
            MindBridge Colombia
          </span>
          <div className="flex gap-6 text-xs text-gray-500">
            <Link href="/terminos-uso" className="hover:text-gray-300 transition-colors">Términos</Link>
            <Link href="/politica-privacidad" className="hover:text-gray-300 transition-colors">Privacidad</Link>
            <a href="mailto:soporte@mindbridge.co" className="hover:text-gray-300 transition-colors">Soporte</a>
          </div>
          <p className="text-xs text-gray-500">© 2026 MindBridge. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
