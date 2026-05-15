import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1a12] via-[#0d1a12] to-[#1a3a2a] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2dd4bf] rounded-full opacity-5 blur-[120px]" />
        
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#2dd4bf]/20 bg-[#2dd4bf]/5 mb-8">
            <span className="w-2 h-2 bg-[#2dd4bf] rounded-full animate-pulse" />
            <span className="text-sm text-[#2dd4bf] font-medium">Plataforma de Salud Mental con IA</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Tu bienestar{' '}
            <span className="gradient-text">inteligente</span>
          </h1>
          
          <p className="text-xl text-[#8aab96] max-w-2xl mx-auto mb-12 leading-relaxed">
            MindBridge combina inteligencia artificial con psicología profesional para ofrecerte 
            un acompañamiento personalizado, confidencial y disponible 24/7.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/login"
              className="btn-primary text-lg"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/register"
              className="btn-secondary text-lg"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#0d1a12]/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="section-label">
              <span className="glow-dot" />
              ¿Por qué MindBridge?
            </span>
            <h2 className="section-title text-white">
              Todo lo que necesitas para tu bienestar
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="glass-card p-8 rounded-2xl">
              <div className="w-14 h-14 bg-[#2dd4bf]/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-[#2dd4bf]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Chat con IA</h3>
              <p className="text-[#8aab96] leading-relaxed">
                Conversaciones inteligentes que te ayudan a procesar emociones, 
                identificar patrones y encontrar claridad en tus pensamientos.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-8 rounded-2xl">
              <div className="w-14 h-14 bg-[#2dd4bf]/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-[#2dd4bf]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Diario Emocional</h3>
              <p className="text-[#8aab96] leading-relaxed">
                Registra tu estado de ánimo diario y obtén insights personalizados 
                sobre tus patrones emocionales con análisis inteligente.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-8 rounded-2xl">
              <div className="w-14 h-14 bg-[#2dd4bf]/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-[#2dd4bf]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Conexión Profesional</h3>
              <p className="text-[#8aab96] leading-relaxed">
                Agenda sesiones con psicólogos certificados cuando lo necesites. 
                El puente perfecto entre IA y atención humana.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="glass-card max-w-3xl mx-auto p-12 rounded-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Comienza tu camino hacia el bienestar
            </h2>
            <p className="text-[#8aab96] text-lg mb-8 max-w-xl mx-auto">
              Únete a miles de personas que ya están transformando su salud mental con MindBridge.
            </p>
            <Link
              href="/auth/register"
              className="btn-primary text-lg inline-flex"
            >
              Empezar ahora — es gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#2dd4bf]/10">
        <div className="container mx-auto px-4 text-center text-[#4a7a5a] text-sm">
          <p>© 2026 MindBridge. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
