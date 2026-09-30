import Link from 'next/link';
import type { ReactNode } from 'react';

const FOOTER_LINKS = [
  { href: '/blog', label: 'Blog' },
  { href: '/psicologos', label: 'Psicólogos' },
  { href: '/terminos-uso', label: 'Términos de uso' },
  { href: '/politica-privacidad', label: 'Política de privacidad' },
];

/** Navbar + footer comunes a /blog y /blog/[slug] */
export function BlogShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: '#080f0b', minHeight: '100vh', color: 'white' }}>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-teal-400 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-on-accent">
        Saltar al contenido
      </a>
      <header
        className="flex items-center justify-between gap-3 px-4 py-3 sm:px-8 lg:px-12"
        style={{
          borderBottom: '1px solid rgba(45,212,191,0.08)',
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(8,15,11,0.85)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Link href="/" aria-label="MenteBridge — inicio" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#1a6b4a,#0d4a32)', border: '1px solid rgba(45,212,191,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }} aria-hidden>💚</div>
          <span className="hidden min-[380px]:inline" style={{ fontSize: '19px', fontWeight: '900', color: '#2dd4bf', letterSpacing: '-0.02em' }}>MenteBridge</span>
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-1 sm:gap-2">
          <Link href="/blog" className="px-2 py-2 text-sm font-semibold text-[#8aab96] hover:text-white sm:px-3">Blog</Link>
          <Link href="/login" className="hidden px-3 py-2 text-sm font-semibold text-[#8aab96] hover:text-white sm:inline">Iniciar sesión</Link>
          <Link
            href="/registro"
            className="whitespace-nowrap rounded-[10px] px-3 py-2 text-[13px] font-bold text-white sm:px-5 sm:text-sm"
            style={{ background: 'linear-gradient(135deg,#1a6b4a,#0d5438)', boxShadow: '0 2px 12px rgba(26,107,74,0.4)' }}
          >
            Empezar gratis
          </Link>
        </nav>
      </header>

      <main id="contenido">{children}</main>

      <footer className="px-4 py-8 sm:px-8 lg:px-12" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="mx-auto flex max-w-[1100px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p style={{ fontSize: '12px', color: '#8aab96', lineHeight: 1.7 }}>
            © 2026 MenteBridge Colombia · Contenido informativo, no reemplaza la atención profesional.
          </p>
          <nav aria-label="Pie de página" className="flex flex-wrap gap-x-4 gap-y-2">
            {FOOTER_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="text-xs text-[#8aab96] hover:text-teal-300">{l.label}</Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}

export { LineasCrisis } from './LineasCrisis';
