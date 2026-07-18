'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect width="36" height="36" rx="11" fill="url(#logoGrad)" opacity="0.18" />
      {/* Cabeza / cerebro */}
      <path
        d="M18 7c-5 0-9 4-9 9 0 3.2 1.7 6 4.2 7.6V27a1 1 0 001 1h7.6a1 1 0 001-1v-3.4C25.3 22 27 19.2 27 16c0-5-4-9-9-9z"
        fill="url(#logoGrad)"
      />
      {/* Líneas cerebro */}
      <path d="M14.5 16h7M15.5 19.5h5" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const textClass = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-lg';
  const iconClass = size === 'lg' ? 'w-9 h-9' : size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';
  return (
    <span className="flex items-center gap-2">
      <LogoIcon className={iconClass} />
      <span className={`${textClass} font-black bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent`}>
        MenteBridge
      </span>
    </span>
  );
}

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'bg-[#080f0a]/95 backdrop-blur-md shadow-lg shadow-black/20 border-b border-white/5' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-5 h-15 flex items-center justify-between" style={{ height: 60 }}>
        <Link href="/" className="flex items-center gap-2 group">
          <Logo />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/psicologos" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
            Psicólogos
          </Link>
          <a href="#como-funciona" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
            Cómo funciona
          </a>
          <a href="#precios" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
            Precios
          </a>
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 ml-1">
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="ml-2 text-sm bg-teal-500 hover:bg-teal-400 text-white font-semibold px-4 py-2 rounded-lg transition-all shadow-md shadow-teal-500/20 hover:shadow-teal-500/30"
          >
            Empezar gratis
          </Link>
        </div>

        {/* Mobile: CTA pequeño + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <Link href="/registro" className="text-xs bg-teal-500 hover:bg-teal-400 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">
            Gratis →
          </Link>
          <button
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          >
            {open ? (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-[#0d1a12]/98 backdrop-blur-md">
          <div className="px-5 py-4 space-y-0.5">
            {[
              { href: '/psicologos', label: 'Psicólogos', external: false },
              { href: '#como-funciona', label: 'Cómo funciona', external: false },
              { href: '#precios', label: 'Precios', external: false },
              { href: '/login', label: 'Iniciar sesión', external: false },
            ].map(item => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center py-3 text-sm text-gray-300 hover:text-white border-b border-white/5 last:border-0"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3">
              <Link
                href="/registro"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-full py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold text-sm rounded-xl transition-colors"
              >
                Empezar gratis — sin tarjeta
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
