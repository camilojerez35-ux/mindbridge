'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function StickyMobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down 250px
      setVisible(window.scrollY > 250);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-[#080f0a]/95 backdrop-blur-md border-t border-teal-500/20 md:hidden animate-in fade-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="text-left">
          <p className="text-xs font-bold text-white leading-tight">MenteBridge Colombia</p>
          <p className="text-[10px] text-teal-400">Gratis · Sin tarjeta requerida</p>
        </div>
        <Link
          href="/registro"
          className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white text-xs font-black rounded-xl shadow-lg shadow-teal-500/30 whitespace-nowrap"
        >
          Probar gratis ahora →
        </Link>
      </div>
    </div>
  );
}
