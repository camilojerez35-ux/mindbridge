'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Loader2 } from 'lucide-react';

type ResumenData = {
  semana: string;
  contenido: string;
  animoPromedio: number | null;
  totalEntradas: number;
  totalEjercicios: number;
  totalSesiones: number;
  patronesPrincipales: string[];
};

export default function ResumenSemanal() {
  const [resumen, setResumen]     = useState<ResumenData | null>(null);
  const [cargando, setCargando]   = useState(true);
  const [expandido, setExpandido] = useState(false);
  const [sinDatos, setSinDatos]   = useState(false);

  useEffect(() => {
    fetch('/api/resumen-semanal')
      .then(r => r.json())
      .then(data => {
        if (data.sinDatos) { setSinDatos(true); }
        else if (data.resumen) { setResumen(data.resumen); }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <div className="bg-[#0d1a12] border border-white/5 rounded-xl p-4 flex items-center gap-3">
        <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
        <span className="text-sm text-gray-600">Generando resumen de tu semana...</span>
      </div>
    );
  }

  if (sinDatos || !resumen) return null;

  return (
    <div className="bg-gradient-to-br from-teal-900/20 via-[#0d1a12] to-[#0d1a12] border border-teal-500/15 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpandido(e => !e)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-500/15 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-white">Resumen de tu semana</p>
            <p className="text-xs text-gray-600 mt-0.5">
              {resumen.totalEntradas} entrada{resumen.totalEntradas !== 1 ? 's' : ''} · {resumen.totalEjercicios} ejercicio{resumen.totalEjercicios !== 1 ? 's' : ''} · {resumen.totalSesiones} sesión{resumen.totalSesiones !== 1 ? 'es' : ''}
              {resumen.animoPromedio !== null && ` · ánimo promedio ${resumen.animoPromedio}/10`}
            </p>
          </div>
        </div>
        {expandido
          ? <ChevronUp className="w-4 h-4 text-gray-600" />
          : <ChevronDown className="w-4 h-4 text-gray-600" />
        }
      </button>

      {expandido && (
        <div className="px-4 pb-4 border-t border-white/5">
          {resumen.patronesPrincipales.length > 0 && (
            <div className="flex gap-2 flex-wrap py-3">
              {resumen.patronesPrincipales.map(p => (
                <span key={p} className="text-xs px-2.5 py-1 bg-teal-500/10 text-teal-400 rounded-full border border-teal-500/20">
                  {p}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">{resumen.contenido}</p>
        </div>
      )}
    </div>
  );
}
