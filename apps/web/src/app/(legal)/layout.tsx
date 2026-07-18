import Link from 'next/link';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080f0a] text-white">
      <header className="border-b border-white/5 px-5 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Volver a MenteBridge
        </Link>
        <span className="text-xs text-gray-600">🔒 Ley 1581/2012</span>
      </header>

      {children}

      <footer className="border-t border-white/5 px-5 py-6 text-xs text-gray-600 text-center max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-5 flex-wrap">
          <Link href="/politica-privacidad" className="hover:text-gray-400 transition-colors">Política de Privacidad</Link>
          <Link href="/terminos-uso" className="hover:text-gray-400 transition-colors">Términos de Uso</Link>
          <Link href="/aviso-ia" className="hover:text-gray-400 transition-colors">Aviso IA</Link>
          <Link href="/tratamiento-datos" className="hover:text-gray-400 transition-colors">Tratamiento de Datos</Link>
        </div>
        <p className="mt-3">MenteBridge Colombia · <a href="mailto:legal@mentebridge.com" className="hover:text-gray-400 transition-colors">legal@mentebridge.com</a></p>
      </footer>
    </div>
  );
}
