'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Phone, AlertTriangle, Sparkles, RefreshCw, Mic, MicOff } from 'lucide-react';

interface Mensaje {
  id: string;
  rol: 'user' | 'assistant';
  contenido: string;
  timestamp: Date;
  esCrisis?: boolean;
  nivelCrisis?: string;
}

interface RecursoCrisis {
  nombre: string;
  numero: string;
  descripcion?: string;
  disponibilidad?: string;
  gratuito?: boolean;
}

interface ChatIAProps {
  sesionId?: string;
  practica?: string;
  contextoPractica?: string;
}

const BIENVENIDA = `¡Hola! Soy MindBridge AI, tu asistente de bienestar emocional. 💚

Estoy aquí para escucharte y acompañarte. Puedes hablarme con total confianza sobre lo que estés viviendo.

_Soy una IA de apoyo emocional, no una psicóloga. En emergencias: **Línea 106** · **123**._

¿Cómo te encuentras hoy?`;

const SUGERENCIAS = [
  'Me siento ansioso/a últimamente',
  'Necesito hablar de algo que me preocupa',
  'Quiero aprender a manejar el estrés',
  'Me cuesta dormir bien',
];

export default function ChatIA({ sesionId, practica, contextoPractica }: ChatIAProps) {
  const bienvenidaInicial = practica
    ? `¡Hola! Vamos a practicar juntos: **${practica}**. 🎯\n\nEsta es una práctica guiada basada en lo que aprendiste. Haré algunas preguntas para que puedas aplicarlo. ¡Empecemos!\n\n_Soy una IA de apoyo — en emergencias: **Línea 106** · **123**._`
    : BIENVENIDA;

  const [mensajes, setMensajes] = useState<Mensaje[]>([{
    id: 'bienvenida',
    rol: 'assistant',
    contenido: bienvenidaInicial,
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalCrisis, setModalCrisis] = useState<RecursoCrisis[]>([]);
  const [sesionActualId, setSesionActualId] = useState(sesionId);

  const [escuchando, setEscuchando] = useState(false);
  const reconRef = useRef<any>(null);

  const endRef   = useRef<HTMLDivElement>(null);
  const taRef    = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  useEffect(() => {
    const ta = taRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const enviar = useCallback(async (texto?: string) => {
    const msg = (texto ?? input).trim();
    if (!msg || cargando) return;

    setInput('');
    setError(null);

    const msgUsuario: Mensaje = {
      id: `u-${Date.now()}`,
      rol: 'user',
      contenido: msg,
      timestamp: new Date(),
    };

    const placeholderId = `a-${Date.now()}`;
    setMensajes(prev => [...prev, msgUsuario, {
      id: placeholderId,
      rol: 'assistant',
      contenido: '',
      timestamp: new Date(),
    }]);
    setCargando(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: msg, sesionId: sesionActualId, contextoPractica }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error al conectar');
      }

      const data = await res.json();

      setMensajes(prev => prev.map(m =>
        m.id === placeholderId ? {
          ...m,
          contenido: data.respuesta,
          esCrisis: data.crisis,
          nivelCrisis: data.nivel,
        } : m
      ));

      if (data.accion === 'MOSTRAR_MODAL_CRISIS') {
        setModalCrisis(data.recursos ?? []);
      }

    } catch (e) {
      setError('No se pudo conectar. Intenta de nuevo.');
      setMensajes(prev => prev.filter(m => m.id !== placeholderId));
    } finally {
      setCargando(false);
    }
  }, [input, cargando, sesionActualId]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); }
  };

  const toggleMic = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.'); return; }

    if (escuchando && reconRef.current) {
      reconRef.current.stop();
      return;
    }

    const rec = new SR();
    rec.lang = 'es-CO';
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = () => setEscuchando(true);
    rec.onend   = () => setEscuchando(false);
    rec.onerror = () => setEscuchando(false);

    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('');
      setInput(transcript);
    };

    reconRef.current = rec;
    rec.start();
  }, [escuchando]);

  const muestraSugerencias = mensajes.length === 1;

  // Cuenta cuántos mensajes de la IA ha habido hasta cada índice — para el recordatorio periódico
  const contadorIA = (index: number) =>
    mensajes.slice(0, index + 1).filter(m => m.rol === 'assistant' && m.contenido !== '').length;

  return (
    <div className="flex flex-col h-full bg-[#0a1510] rounded-2xl border border-white/5 overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-[#0d1a12] border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">MindBridge AI</h2>
            <span className="flex items-center gap-1 text-[10px] text-teal-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              En línea
            </span>
          </div>
          <p className="text-xs text-gray-600">Apoyo emocional basado en TCC · ACT · Mindfulness</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full">
          <Sparkles className="w-3 h-3 text-teal-400" />
          <span className="text-xs text-teal-400 font-medium">IA Clínica</span>
        </div>
      </div>

      {/* Práctica banner */}
      {practica && (
        <div className="px-4 py-2 bg-teal-950/40 border-b border-teal-800/30 flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-teal-400 flex-shrink-0" />
          <p className="text-[11px] text-teal-300">
            <strong>Práctica:</strong> {practica}
          </p>
        </div>
      )}

      {/* Aviso legal */}
      <div className="px-4 py-2 bg-amber-950/30 border-b border-amber-900/20 flex items-center gap-2">
        <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
        <p className="text-[11px] text-amber-600">
          IA de apoyo emocional — no sustituye atención profesional.
          <strong className="text-amber-400 ml-1">Crisis: 106 · 123</strong>
        </p>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {mensajes.map((msg, index) => (
          <div key={msg.id}>
          {/* Recordatorio periódico cada 10 respuestas de la IA */}
          {msg.rol === 'assistant' && msg.contenido !== '' && contadorIA(index) % 10 === 0 && contadorIA(index) > 0 && (
            <div className="flex justify-center mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/20 border border-amber-900/20 rounded-full">
                <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                <span className="text-[10px] text-amber-600/80">
                  Recuerda: soy IA de apoyo, no un profesional de salud mental · Crisis: 106 · 123
                </span>
              </div>
            </div>
          )}
          <div
            className={`flex gap-3 ${msg.rol === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.rol === 'assistant'
                ? 'bg-gradient-to-br from-teal-500 to-emerald-600'
                : 'bg-white/10'
            }`}>
              {msg.rol === 'assistant'
                ? <Bot className="w-4 h-4 text-white" />
                : <User className="w-4 h-4 text-gray-300" />
              }
            </div>

            {/* Burbuja */}
            <div className={`max-w-[78%] flex flex-col gap-1 ${msg.rol === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.rol === 'user'
                  ? 'bg-teal-600 text-white rounded-tr-sm'
                  : msg.esCrisis
                  ? 'bg-red-950/50 border border-red-800/30 text-gray-200 rounded-tl-sm'
                  : 'bg-[#0d1a12] border border-white/5 text-gray-300 rounded-tl-sm'
              }`}>
                {msg.contenido === '' ? (
                  <span className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                ) : (
                  <MarkdownSimple texto={msg.contenido} />
                )}
              </div>
              <span className="text-[10px] text-gray-700 px-1">
                {msg.timestamp.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {/* Mini-disclaimer por mensaje IA — refuerzo continuo Res. 2654/2019 */}
              {msg.rol === 'assistant' && msg.contenido !== '' && !msg.esCrisis && (
                <span className="text-[9px] text-gray-700 px-1 leading-tight">
                  IA · No reemplaza terapia · Crisis: 106
                </span>
              )}
            </div>
          </div>
          </div>
        ))}

        {/* Sugerencias iniciales */}
        {muestraSugerencias && !cargando && (
          <div className="flex flex-wrap gap-2 mt-2">
            {SUGERENCIAS.map(s => (
              <button
                key={s}
                onClick={() => enviar(s)}
                className="text-xs px-3 py-1.5 bg-white/5 border border-white/10 text-gray-400 rounded-full hover:bg-teal-500/10 hover:border-teal-500/30 hover:text-teal-300 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 px-3 py-2 bg-red-950/50 border border-red-800/30 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span className="text-xs text-red-400 flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-400 text-xs">✕</button>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-3 border-t border-white/5">
        <div className="flex gap-2 items-end bg-[#0d1a12] border border-white/10 rounded-2xl px-4 py-2.5 focus-within:border-teal-500/40 focus-within:ring-1 focus-within:ring-teal-500/10 transition-all">
          <textarea
            ref={taRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Cuéntame cómo te sientes hoy..."
            rows={1}
            disabled={cargando}
            aria-label="Mensaje para el asistente de MindBridge"
            className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-200 placeholder-gray-600 py-0.5 max-h-[120px]"
          />
          <button
            onClick={toggleMic}
            disabled={cargando}
            aria-label={escuchando ? 'Detener micrófono' : 'Hablar'}
            title={escuchando ? 'Detener' : 'Hablar'}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0 mb-0.5 ${
              escuchando
                ? 'bg-red-500 hover:bg-red-400 animate-pulse'
                : 'bg-white/5 hover:bg-white/10 disabled:cursor-not-allowed'
            }`}
          >
            {escuchando
              ? <MicOff className="w-3.5 h-3.5 text-white" />
              : <Mic className="w-3.5 h-3.5 text-gray-400" />
            }
          </button>
          <button
            onClick={() => enviar()}
            disabled={!input.trim() || cargando}
            aria-label={cargando ? 'Enviando…' : 'Enviar mensaje'}
            className="w-8 h-8 bg-teal-500 hover:bg-teal-400 disabled:bg-white/5 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all flex-shrink-0 mb-0.5"
          >
            {cargando
              ? <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
              : <Send className="w-3.5 h-3.5 text-white" />
            }
          </button>
        </div>
        <p className="text-center text-[11px] text-gray-700 mt-2">
          Enter para enviar · Shift+Enter para nueva línea
        </p>
        {cargando && <p role="status" aria-live="polite" className="sr-only">El asistente está respondiendo…</p>}
      </div>

      {/* Modal crisis */}
      {modalCrisis.length > 0 && (
        <div className="absolute inset-0 bg-black/70 flex items-end justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#0d1a12] border border-red-800/30 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="bg-red-950/60 border-b border-red-800/30 px-5 py-4">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-400" />
                Líneas de Ayuda — Colombia
              </h3>
              <p className="text-xs text-gray-400 mt-1">Profesionales disponibles ahora para apoyarte</p>
            </div>
            <div className="p-4 space-y-3">
              {modalCrisis.map((r, i) => (
                <a
                  key={i}
                  href={`tel:${r.numero}`}
                  className="flex items-center gap-3 p-3 bg-red-950/30 hover:bg-red-950/50 rounded-xl border border-red-800/20 transition-colors"
                >
                  <div className="w-10 h-10 bg-red-600/80 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-red-300 text-sm">{r.numero}</p>
                    <p className="text-xs text-gray-400">{r.nombre}</p>
                    {r.disponibilidad && <p className="text-[10px] text-gray-600">{r.disponibilidad}</p>}
                  </div>
                </a>
              ))}
            </div>
            <div className="px-4 pb-4">
              <button
                onClick={() => setModalCrisis([])}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl text-sm font-medium transition-colors border border-white/5"
              >
                Volver al chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MarkdownSimple({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*|_[^_]+_|\n)/g);
  return (
    <span>
      {partes.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} className="text-white">{p.slice(2, -2)}</strong>;
        if (p.startsWith('_') && p.endsWith('_')) return <em key={i} className="text-xs text-gray-500">{p.slice(1, -1)}</em>;
        if (p === '\n') return <br key={i} />;
        return <span key={i}>{p}</span>;
      })}
    </span>
  );
}
