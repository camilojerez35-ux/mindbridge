export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-4 py-4">
        <a href="/" className="text-blue-600 hover:underline text-sm">← Volver a MindBridge</a>
      </header>
      {children}
      <footer className="border-t border-gray-200 px-4 py-6 text-xs text-gray-400 text-center">
        <p>MindBridge Colombia · <a href="/politica-privacidad" className="underline">Privacidad</a> · <a href="/terminos-uso" className="underline">Términos</a> · <a href="/aviso-ia" className="underline">Aviso IA</a></p>
      </footer>
    </div>
  );
}
