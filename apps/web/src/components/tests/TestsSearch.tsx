'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Clock, CheckCircle2 } from 'lucide-react';
import { CATEGORIAS_TESTS } from '@/lib/tests/catalogo';

interface TestItem {
  id: string;
  categoria: string;
  titulo: string;
  descripcion: string;
  icono: string;
  color: string;
  duracionMin: number;
  numPreguntas: number;
  hecho: boolean;
  resultadoTitulo?: string;
}

export default function TestsSearch({ tests }: { tests: TestItem[] }) {
  const [busqueda, setBusqueda] = useState('');

  const filtrados = busqueda.trim()
    ? tests.filter(t => t.titulo.toLowerCase().includes(busqueda.toLowerCase()))
    : tests;

  const porCategoria = CATEGORIAS_TESTS.map(cat => ({
    ...cat,
    items: filtrados.filter(t => t.categoria === cat.id),
  })).filter(cat => cat.items.length > 0);

  return (
    <>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar tests..."
          className="w-full bg-[#0d1117] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-700 outline-none focus:border-teal-500/30 transition-colors"
        />
      </div>

      {/* Categories + cards */}
      {porCategoria.map(cat => (
        <div key={cat.id}>
          <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span>{cat.icono}</span>{cat.titulo}
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {cat.items.map(test => (
              <Link
                key={test.id}
                href={`/tests/${test.id}`}
                className="group flex items-center gap-4 bg-[#0d1117] border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/3 hover:scale-[1.005]"
              >
                <div className={`text-3xl flex-shrink-0 ${test.hecho ? '' : 'grayscale opacity-60'}`}>
                  {test.icono}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-bold text-white">{test.titulo}</h3>
                    {test.hecho && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-1">{test.descripcion}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-[10px] text-gray-700">
                      <Clock className="w-3 h-3" />{test.duracionMin} min
                    </span>
                    <span className="text-[10px] text-gray-700">{test.numPreguntas} preg.</span>
                    {test.resultadoTitulo && (
                      <span className="text-[10px] text-teal-500 font-medium">{test.resultadoTitulo}</span>
                    )}
                  </div>
                </div>
                <span className="text-gray-700 group-hover:text-gray-500 transition-colors flex-shrink-0">→</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
