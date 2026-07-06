'use client';

import { useState } from 'react';
import CalendarioAnimo from '@/components/perfil/CalendarioAnimo';
import EstanteriaTests from '@/components/perfil/EstanteriaTests';

export default function PerfilPage() {
  const [tab, setTab] = useState<'animo' | 'personalidad'>('animo');

  return (
    <div className="space-y-5 max-w-3xl">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-teal-900/60 border border-teal-500/30 flex items-center justify-center text-xl font-black text-teal-400">
          C
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Camilo</h1>
          <p className="text-xs text-teal-700">Plan Plus · Miembro desde Mayo 2026</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-white/5">
        <button
          onClick={() => setTab('animo')}
          className={`pb-2.5 text-sm font-bold transition-colors border-b-2 ${
            tab === 'animo'
              ? 'text-white border-teal-400'
              : 'text-gray-600 border-transparent hover:text-gray-400'
          }`}
        >
          📊 Seguimiento del ánimo
        </button>
        <button
          onClick={() => setTab('personalidad')}
          className={`pb-2.5 text-sm font-bold transition-colors border-b-2 ${
            tab === 'personalidad'
              ? 'text-white border-teal-400'
              : 'text-gray-600 border-transparent hover:text-gray-400'
          }`}
        >
          🎭 Personalidad
        </button>
      </div>

      {tab === 'animo' ? <CalendarioAnimo /> : <EstanteriaTests />}
    </div>
  );
}
