'use client';

import { useState, useMemo } from 'react';
import { X, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { TAGS_SENTIMIENTOS, TAGS_INFLUIDO_POR } from '@/lib/diario/tags';

const PREGUNTAS_REFLEXION = [
  ['¿Qué fue lo más significativo de hoy para ti?', '¿Hubo algo que te generó incomodidad? ¿Cómo lo manejaste?', '¿Qué emoción predominó hoy y por qué crees que fue así?'],
  ['¿Qué momento de hoy recordarás más adelante?', '¿Hay algo que quisiste decir y no dijiste hoy?', '¿Qué aprendiste de ti mismo/a hoy?'],
  ['¿Cómo describirías el ritmo de tu día en una sola palabra?', '¿Hubo alguien que influyó positiva o negativamente en tu estado hoy?', '¿Qué harías diferente si pudieras repetir el día?'],
];

interface Props {
  onCerrar: () => void;
  onGuardado: () => void;
}

export default function ModalNuevaEntrada({ onCerrar, onGuardado }: Props) {
  const preguntasHoy = useMemo(() => {
    const idx = new Date().getDate() % PREGUNTAS_REFLEXION.length;
    return PREGUNTAS_REFLEXION[idx];
  }, []);

  const [paso, setPaso] = useState<'reflexion' | 'tags' | 'escribir'>('reflexion');
  const [respuestasReflexion, setRespuestasReflexion] = useState<string[]>(['', '', '']);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [sentimientosSel, setSentimientosSel] = useState<string[]>([]);
  const [influidoSel, setInfluidoSel] = useState<string[]>([]);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [guardando, setGuardando] = useState(false);

  function avanzarReflexion() {
    if (preguntaActual < preguntasHoy.length - 1) {
      setPreguntaActual(p => p + 1);
    } else {
      // Armar el contenido inicial con las reflexiones respondidas
      const reflexionesConRespuesta = preguntasHoy
        .map((q, i) => respuestasReflexion[i].trim() ? `**${q}**\n${respuestasReflexion[i].trim()}` : null)
        .filter(Boolean);
      if (reflexionesConRespuesta.length > 0) {
        setContenido(reflexionesConRespuesta.join('\n\n') + '\n\n');
      }
      setPaso('tags');
    }
  }

  function toggleTag(lista: string[], setLista: (v: string[]) => void, id: string) {
    if (lista.includes(id)) setLista(lista.filter(t => t !== id));
    else if (lista.length < 5) setLista([...lista, id]);
  }

  async function guardar() {
    if (!contenido.trim()) return;
    setGuardando(true);
    try {
      await fetch('/api/diario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, contenido, sentimientos: sentimientosSel, influidoPor: influidoSel }),
      });
      onGuardado();
    } catch (e) {
      console.error(e);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50">
      <div className="bg-[#0d1a12] rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col gap-5 p-6">

        {/* ── Paso: reflexión ── */}
        {paso === 'reflexion' && (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <h2 className="text-base font-black text-white">Reflexión guiada</h2>
              </div>
              <button onClick={onCerrar} className="p-1.5 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-all flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progreso */}
            <div className="flex gap-1.5">
              {preguntasHoy.map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-1 rounded-full transition-colors"
                  style={{ background: i <= preguntaActual ? '#2dd4bf' : 'rgba(255,255,255,0.06)' }}
                />
              ))}
            </div>

            <p className="text-xs text-gray-600 uppercase tracking-widest">
              Pregunta {preguntaActual + 1} de {preguntasHoy.length}
            </p>

            <div className="bg-white/3 border border-white/6 rounded-2xl p-5">
              <p className="text-sm font-semibold text-white leading-relaxed mb-4">
                {preguntasHoy[preguntaActual]}
              </p>
              <textarea
                value={respuestasReflexion[preguntaActual]}
                onChange={e => {
                  const nuevas = [...respuestasReflexion];
                  nuevas[preguntaActual] = e.target.value;
                  setRespuestasReflexion(nuevas);
                }}
                placeholder="Escribe lo que te venga a la mente..."
                rows={4}
                autoFocus
                className="w-full bg-transparent text-sm text-gray-300 placeholder:text-gray-700 outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setPaso('tags'); }}
                className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-400 transition-colors"
              >
                Saltar reflexión
              </button>
              <button
                onClick={avanzarReflexion}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-colors text-sm"
              >
                {preguntaActual < preguntasHoy.length - 1 ? 'Siguiente pregunta →' : 'Continuar al diario →'}
              </button>
            </div>
          </>
        )}

        {paso === 'tags' ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-black text-white leading-snug">Tu espacio seguro para reflexionar</h2>
              <button onClick={onCerrar} className="p-1.5 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-all flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed -mt-2">
              Antes de escribir, cuéntanos un poco sobre cómo te sientes hoy.
            </p>

            {/* Sentimientos */}
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">
                Sentimientos <span className="normal-case font-normal text-gray-700">(máx 5)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {TAGS_SENTIMIENTOS.map(tag => {
                  const sel = sentimientosSel.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(sentimientosSel, setSentimientosSel, tag.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm border transition-all ${
                        sel
                          ? 'bg-teal-500/15 border-teal-500/50 text-teal-300'
                          : 'bg-white/3 border-white/8 text-gray-500 hover:bg-white/6 hover:text-gray-300'
                      }`}
                    >
                      <span>{tag.emoji}</span>{tag.texto}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Influido por */}
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">
                Influido por <span className="normal-case font-normal text-gray-700">(máx 5)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {TAGS_INFLUIDO_POR.map(tag => {
                  const sel = influidoSel.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(influidoSel, setInfluidoSel, tag.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm border transition-all ${
                        sel
                          ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300'
                          : 'bg-white/3 border-white/8 text-gray-500 hover:bg-white/6 hover:text-gray-300'
                      }`}
                    >
                      <span>{tag.emoji}</span>{tag.texto}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPaso('reflexion')}
                className="px-4 py-3 text-sm text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />Volver
              </button>
              <button
                onClick={() => setPaso('escribir')}
                disabled={sentimientosSel.length === 0}
                className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-500 disabled:bg-white/5 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
              >
                Continuar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPaso('tags')}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />Atrás
              </button>
              <button onClick={onCerrar} className="p-1.5 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tags resumen */}
            <div className="flex flex-wrap gap-1.5">
              {sentimientosSel.map(id => {
                const t = TAGS_SENTIMIENTOS.find(x => x.id === id);
                return t ? (
                  <span key={id} className="text-xs bg-teal-500/10 text-teal-400 px-2.5 py-1 rounded-full">
                    {t.emoji} {t.texto}
                  </span>
                ) : null;
              })}
              {influidoSel.map(id => {
                const t = TAGS_INFLUIDO_POR.find(x => x.id === id);
                return t ? (
                  <span key={id} className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full">
                    {t.emoji} {t.texto}
                  </span>
                ) : null;
              })}
            </div>

            <input
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Título de tu entrada..."
              className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder:text-gray-700 outline-none focus:border-teal-500/40 transition-colors"
            />

            <textarea
              value={contenido}
              onChange={e => setContenido(e.target.value)}
              placeholder="Escribe libremente sobre tu día, tus pensamientos o lo que quieras explorar..."
              rows={8}
              autoFocus
              className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-sm text-gray-300 placeholder:text-gray-700 outline-none focus:border-teal-500/40 resize-none leading-relaxed transition-colors"
            />

            <button
              onClick={guardar}
              disabled={!contenido.trim() || guardando}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-teal-600 hover:bg-teal-500 disabled:bg-white/5 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
            >
              {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
              {guardando ? 'Guardando...' : 'Guardar entrada'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
