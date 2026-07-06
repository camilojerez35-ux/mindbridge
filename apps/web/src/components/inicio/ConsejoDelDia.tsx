'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, Sparkles } from 'lucide-react';

interface Consejo {
  id?: string;
  categoria: string;
  icono: string;
  titulo: string;
  texto: string;
}

const CATEGORIA_STYLES: Record<string, { ring: string; text: string }> = {
  'Equilibrio emocional':    { ring: 'border-teal-500/30',    text: 'text-teal-400'    },
  'Autoconocimiento':        { ring: 'border-violet-500/30',  text: 'text-violet-400'  },
  'Salud en las relaciones': { ring: 'border-rose-500/30',    text: 'text-rose-400'    },
  'Manejo del estrés':       { ring: 'border-emerald-500/30', text: 'text-emerald-400' },
  'Crecimiento personal':    { ring: 'border-amber-500/30',   text: 'text-amber-400'   },
};

const DEFAULT_STYLE = { ring: 'border-teal-500/30', text: 'text-teal-400' };

export default function ConsejoDelDia() {
  const [consejo, setConsejo] = useState<Consejo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [expandido, setExpandido] = useState(false);
  const [calificado, setCalificado] = useState<number | null>(null);

  async function cargar() {
    setCargando(true);
    setCalificado(null);
    setExpandido(false);
    try {
      const res = await fetch('/api/consejo-dia');
      if (!res.ok) return;
      const data = await res.json();
      setConsejo(data);
    } catch {
      // silently fail
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function calificar(valor: number) {
    setCalificado(valor);
    if (consejo?.id) {
      await fetch('/api/consejo-dia', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consejoId: consejo.id, calificacion: valor }),
      });
    }
  }

  if (cargando) {
    return (
      <div className="bg-[#0d1a12] border border-white/5 rounded-2xl p-6 h-36 flex items-center justify-center">
        <RefreshCw className="w-5 h-5 text-teal-400 animate-spin" />
      </div>
    );
  }

  if (!consejo) return null;

  const style = CATEGORIA_STYLES[consejo.categoria] ?? DEFAULT_STYLE;
  const parrafos = consejo.texto.split('\n').filter(p => p.trim());
  const primerParrafo = parrafos[0];
  const restoParrafos = parrafos.slice(1);

  return (
    <div className={`bg-[#0d1a12] border ${style.ring} rounded-2xl p-5`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{consejo.icono}</span>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${style.text}`}>
          {consejo.categoria}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-gray-700" />
          <span className="text-[10px] text-gray-700">Consejo del día</span>
        </div>
      </div>

      <h3 className="text-base font-black text-white mb-2 leading-snug">{consejo.titulo}</h3>

      <p className="text-sm text-gray-400 leading-relaxed">{primerParrafo}</p>

      {expandido && restoParrafos.map((p, i) => (
        <p key={i} className="text-sm text-gray-400 leading-relaxed mt-3">{p}</p>
      ))}

      {restoParrafos.length > 0 && (
        <button
          onClick={() => setExpandido(v => !v)}
          className={`flex items-center gap-1 mt-3 text-xs font-semibold ${style.text} hover:opacity-80 transition-opacity`}
        >
          {expandido
            ? <><ChevronUp className="w-3.5 h-3.5" />Leer menos</>
            : <><ChevronDown className="w-3.5 h-3.5" />Leer más</>
          }
        </button>
      )}

      {expandido && (
        <div className={`flex items-center justify-between mt-4 pt-3 border-t ${style.ring} flex-wrap gap-2`}>
          <span className="text-xs text-gray-600">¿Te resultó útil?</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => calificar(n)}
                className={`text-lg transition-all ${
                  calificado !== null && n <= calificado
                    ? 'opacity-100'
                    : 'opacity-30 grayscale hover:opacity-70'
                }`}
              >
                ⭐
              </button>
            ))}
          </div>
          <button
            onClick={cargar}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />Nuevo consejo
          </button>
        </div>
      )}
    </div>
  );
}
