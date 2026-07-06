'use client';

import { useState, useEffect } from 'react';
import ModalNuevaEntrada from '@/components/diario/ModalNuevaEntrada';
import { TAGS_SENTIMIENTOS, TAGS_INFLUIDO_POR } from '@/lib/diario/tags';

interface Entrada {
  id: string;
  estadoAnimo: number;
  emociones: string[];
  etiquetas: string[];
  sentimientos: string[];
  influidoPor: string[];
  analisisIA: string | null;
  esFavorito: boolean;
  createdAt: string;
}

function obtenerTagS(id: string) { return TAGS_SENTIMIENTOS.find(t => t.id === id); }
function obtenerTagI(id: string) { return TAGS_INFLUIDO_POR.find(t => t.id === id); }

const ANIMO_EMOJI: Record<number, string> = {
  1:'😭', 2:'😢', 3:'😞', 4:'😔', 5:'😐', 6:'🙂', 7:'😊', 8:'😄', 9:'🥰', 10:'🤩',
};

export default function DiarioPage() {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargarEntradas = () => {
    setCargando(true);
    fetch('/api/diario')
      .then(r => r.json())
      .then(data => { setEntradas(data.entradas ?? []); })
      .catch(() => {})
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargarEntradas(); }, []);

  const formatearFecha = (iso: string) =>
    new Date(iso).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">📓 Diario</h1>
          <p className="text-sm text-gray-500">Tu espacio seguro para reflexionar</p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold rounded-full transition-colors"
        >
          + Nueva entrada
        </button>
      </div>

      {/* Contenido */}
      {cargando ? (
        <div className="text-center py-16 text-gray-600">Cargando...</div>
      ) : entradas.length === 0 ? (
        <div className="text-center py-16 px-5 bg-[#0d1a12] border border-white/5 rounded-2xl">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-sm text-gray-500 mb-5">Aún no tienes entradas. Empieza a escribir hoy.</p>
          <button
            onClick={() => setModalAbierto(true)}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold rounded-full transition-colors"
          >
            + Crear primera entrada
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entradas.map(entrada => {
            const emoji = ANIMO_EMOJI[Math.round(entrada.estadoAnimo)] ?? '😐';
            const tags = [...(entrada.sentimientos ?? []), ...(entrada.emociones ?? [])];
            const influencias = [...(entrada.influidoPor ?? []), ...(entrada.etiquetas ?? [])];
            return (
              <div key={entrada.id} className="bg-[#0d1a12] border border-white/5 rounded-2xl p-5">
                <div className="flex justify-between items-start mb-2 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{emoji}</span>
                    <span className="text-sm font-bold text-white">{entrada.estadoAnimo}/10</span>
                  </div>
                  <span className="text-[11px] text-gray-600 capitalize whitespace-nowrap">
                    {formatearFecha(entrada.createdAt)}
                  </span>
                </div>
                {entrada.analisisIA && (
                  <p className="text-[13px] text-gray-500 leading-relaxed mb-3 line-clamp-2">
                    {entrada.analisisIA}
                  </p>
                )}
                {(tags.length > 0 || influencias.length > 0) && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(id => {
                      const t = obtenerTagS(id);
                      return t ? (
                        <span key={id} className="text-[11px] bg-teal-500/10 text-teal-400 px-2.5 py-0.5 rounded-full">
                          {t.emoji} {t.texto}
                        </span>
                      ) : null;
                    })}
                    {influencias.map(id => {
                      const t = obtenerTagI(id);
                      return t ? (
                        <span key={id} className="text-[11px] bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full">
                          {t.emoji} {t.texto}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modalAbierto && (
        <ModalNuevaEntrada
          onCerrar={() => setModalAbierto(false)}
          onGuardado={() => { setModalAbierto(false); cargarEntradas(); }}
        />
      )}
    </div>
  );
}
