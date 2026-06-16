import Link from 'next/link';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-4 py-4">
        <Link href="/" className="text-blue-600 hover:underline text-sm">← Volver a MindBridge</Link>
      </header>
      {children}
      <footer className="border-t border-gray-200 px-4 py-6 text-xs text-gray-400 text-center">
        <p>MindBridge Colombia · <Link href="/politica-privacidad" className="underline">Privacidad</Link> · <Link href="/terminos-uso" className="underline">Términos</Link> · <Link href="/aviso-ia" className="underline">Aviso IA</Link></p>
      </footer>
    </div>
  );
}
