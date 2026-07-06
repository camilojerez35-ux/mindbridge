'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CATALOGO_TESTS } from '@/lib/tests/catalogo';

export default function EstanteriaTests() {
  const [completados, setCompletados] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch('/api/tests')
      .then(r => r.json())
      .then(data => {
        const ids = new Set<string>(
          (data.tests ?? []).filter((t: { completado: boolean }) => t.completado).map((t: { id: string }) => t.id)
        );
        setCompletados(ids);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return <div className="text-center py-10 text-gray-600 text-sm">Cargando...</div>;
  }

  const porcentaje = Math.round((completados.size / CATALOGO_TESTS.length) * 100);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Has completado{' '}
          <strong className="text-teal-400">{completados.size}</strong>
          {' '}de {CATALOGO_TESTS.length} autoevaluaciones
        </p>
        <Link href="/tests" className="text-xs text-teal-400 hover:text-teal-300 font-bold transition-colors">
          Ver todos →
        </Link>
      </div>

      {/* Grid of tests */}
      <div className="grid grid-cols-5 gap-2">
        {CATALOGO_TESTS.map(test => {
          const hecho = completados.has(test.id);
          return (
            <Link key={test.id} href={`/tests/${test.id}`}>
              <div
                className={`aspect-square rounded-xl flex items-center justify-center text-2xl border transition-all ${
                  hecho
                    ? 'opacity-100 hover:scale-105'
                    : 'opacity-30 grayscale hover:opacity-50'
                }`}
                style={hecho ? {
                  background: `${test.color}1a`,
                  borderColor: `${test.color}40`,
                } : {
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.06)',
                }}
              >
                {test.icono}
              </div>
            </Link>
          );
        })}
      </div>

      {/* AI personalisation progress */}
      <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">🤖</span>
          <p className="text-sm font-bold text-white">Tu perfil de personalización</p>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed mb-3">
          Cada test que completas ayuda a la IA a entenderte mejor y personalizar tu Consejo del día y tus conversaciones.
        </p>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-700 mt-1.5 text-right">{porcentaje}% completado</p>
      </div>
    </div>
  );
}
