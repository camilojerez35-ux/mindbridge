import Link from 'next/link';

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

const testimonios = [
  { texto: '"Después de 3 semanas usando el chat diario, siento que por fin tengo herramientas para manejar mi ansiedad."', autor: 'María C.', ciudad: 'Bogotá' },
  { texto: '"Agendar con mi psicóloga fue facilísimo. La plataforma se siente segura y sin juicios."', autor: 'Santiago R.', ciudad: 'Medellín' },
  { texto: '"El diario emocional me ayudó a identificar patrones que ni siquiera sabía que tenía."', autor: 'Laura M.', ciudad: 'Cali' },
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

          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
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

          <p className="text-xs text-gray-700 mt-5">
            🔒 Cumple Ley 1581/2012 · Resolución 2654/2019 · Cifrado AES-256
          </p>
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
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
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
              <div key={t.autor} className="bg-[#0d1a12] border border-white/5 rounded-2xl p-6">
                <p className="text-sm text-gray-400 leading-relaxed mb-4 italic">{t.texto}</p>
                <div>
                  <p className="text-sm font-semibold text-white">{t.autor}</p>
                  <p className="text-xs text-gray-600">{t.ciudad}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-[#0a120a]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-teal-900/30 to-emerald-900/10 border border-teal-500/15 rounded-3xl p-12">
            <h2 className="text-3xl font-black text-white mb-3">
              Comienza tu camino hoy
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
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
          <div className="flex gap-6 text-xs text-gray-600">
            <Link href="/terminos" className="hover:text-gray-400 transition-colors">Términos</Link>
            <Link href="/privacidad" className="hover:text-gray-400 transition-colors">Privacidad</Link>
            <a href="mailto:soporte@mindbridge.co" className="hover:text-gray-400 transition-colors">Soporte</a>
          </div>
          <p className="text-xs text-gray-700">© 2026 MindBridge. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
