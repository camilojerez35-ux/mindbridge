'use client';

/**
 * MindBridge — Componente ChatIA
 * Interfaz principal de conversación con la IA clínica
 * Incluye: streaming, detección de crisis, historial de sesión
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, AlertTriangle, Phone, Bot, User, RefreshCw } from 'lucide-react';

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
  descripcion: string;
  disponibilidad: string;
}

interface ChatIAProps {
  sesionId?: string;
  onSesionCreada?: (id: string) => void;
}

export default function ChatIA({ sesionId, onSesionCreada }: ChatIAProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [inputUsuario, setInputUsuario] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarModalCrisis, setMostrarModalCrisis] = useState(false);
  const [recursosCrisis, setRecursosCrisis] = useState<RecursoCrisis[]>([]);
  const [sesionActualId, setSesionActualId] = useState(sesionId);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mensaje de bienvenida inicial
  useEffect(() => {
    setMensajes([{
      id: 'bienvenida',
      rol: 'assistant',
      contenido: `¡Hola! Soy MindBridge AI, tu asistente de bienestar emocional. 💚

Estoy aquí para acompañarte y apoyarte con lo que estés viviendo. Puedes hablarme con confianza sobre cómo te sientes.

_Recuerda: soy una IA de apoyo emocional, no una psicóloga. En caso de emergencia: **Línea 106** (Bogotá) o **123** (emergencias)._

¿Cómo te encuentras hoy?`,
      timestamp: new Date(),
    }]);
  }, []);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  }, [inputUsuario]);

  const enviarMensaje = useCallback(async () => {
    const texto = inputUsuario.trim();
    if (!texto || cargando) return;

    setInputUsuario('');
    setError(null);

    // Agregar mensaje del usuario
    const msgUsuario: Mensaje = {
      id: `usr-${Date.now()}`,
      rol: 'user',
      contenido: texto,
      timestamp: new Date(),
    };
    setMensajes(prev => [...prev, msgUsuario]);
    setCargando(true);

    // Placeholder de la IA mientras responde
    const placeholderId = `ai-${Date.now()}`;
    setMensajes(prev => [...prev, {
      id: placeholderId,
      rol: 'assistant',
      contenido: '',
      timestamp: new Date(),
    }]);

    try {
      // Construir historial (últimos 10 mensajes, excluyendo bienvenida y placeholder)
      const historial = mensajes
        .filter(m => m.id !== 'bienvenida' && m.contenido.length > 0)
        .slice(-10)
        .map(m => ({ rol: m.rol, contenido: m.contenido }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: texto,
          sesionId: sesionActualId,
          historial,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 429) {
          // Límite de plan alcanzado
          setMensajes(prev => prev.map(m =>
            m.id === placeholderId ? {
              ...m,
              contenido: '⚠️ Has alcanzado el límite de sesiones de tu plan gratuito esta semana. Actualiza a Plus para sesiones ilimitadas.',
            } : m
          ));
          return;
        }
        throw new Error(err.error || 'Error al conectar con la IA');
      }

      // Verificar si es respuesta de crisis (JSON directo, no stream)
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await res.json();
        setMensajes(prev => prev.map(m =>
          m.id === placeholderId ? {
            ...m,
            contenido: data.respuesta,
            esCrisis: true,
            nivelCrisis: data.nivel,
          } : m
        ));

        if (data.accion === 'MOSTRAR_MODAL_CRISIS') {
          setRecursosCrisis(data.recursos || []);
          setMostrarModalCrisis(true);
        }
        return;
      }

      // Leer stream SSE
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let respuestaCompleta = '';

      if (!reader) throw new Error('No se pudo leer la respuesta');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.chunk) {
              respuestaCompleta += data.chunk;
              setMensajes(prev => prev.map(m =>
                m.id === placeholderId ? { ...m, contenido: respuestaCompleta } : m
              ));
            }
            if (data.done && data.crisis) {
              setMensajes(prev => prev.map(m =>
                m.id === placeholderId ? { ...m, esCrisis: true, nivelCrisis: data.nivelCrisis } : m
              ));
            }
          } catch {}
        }
      }

    } catch (err) {
      setError('Hubo un error al conectar. Por favor intenta de nuevo.');
      setMensajes(prev => prev.filter(m => m.id !== placeholderId));
    } finally {
      setCargando(false);
    }
  }, [inputUsuario, cargando, mensajes, sesionActualId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-green-700 to-green-600 text-white">
        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
          <Bot size={20} />
        </div>
        <div>
          <h2 className="font-semibold text-sm">MindBridge IA</h2>
          <p className="text-xs text-green-100">Apoyo emocional · Disponible 24/7</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
          <span className="text-xs text-green-100">En línea</span>
        </div>
      </div>

      {/* Aviso legal obligatorio — Res. 2654/2019 */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2">
        <AlertTriangle size={13} className="text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          IA de apoyo emocional. No sustituye atención profesional.
          <strong className="ml-1">Crisis: 106 · 123</strong>
        </p>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {mensajes.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.rol === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.rol === 'assistant' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {msg.rol === 'assistant' ? <Bot size={16} /> : <User size={16} />}
            </div>

            {/* Burbuja */}
            <div className={`max-w-[78%] ${msg.rol === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.rol === 'user'
                  ? 'bg-green-700 text-white rounded-tr-sm'
                  : msg.esCrisis
                  ? 'bg-red-50 border border-red-200 text-gray-800 rounded-tl-sm'
                  : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm'
              }`}>
                {msg.contenido === '' && msg.rol === 'assistant' ? (
                  <span className="flex gap-1 items-center text-gray-400">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                ) : (
                  <MarkdownSimple contenido={msg.contenido} />
                )}
              </div>
              <span className="text-xs text-gray-400 px-1">
                {msg.timestamp.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-500" />
          <span className="text-xs text-red-600">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100">
        <div className="flex gap-2 items-end bg-gray-50 rounded-2xl border border-gray-200 px-3 py-2 focus-within:border-green-400 focus-within:ring-1 focus-within:ring-green-100 transition-all">
          <textarea
            ref={textareaRef}
            value={inputUsuario}
            onChange={e => setInputUsuario(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cuéntame cómo te sientes hoy..."
            rows={1}
            disabled={cargando}
            className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-700 placeholder-gray-400 py-1 max-h-[120px]"
            style={{ lineHeight: '1.5' }}
          />
          <button
            onClick={enviarMensaje}
            disabled={!inputUsuario.trim() || cargando}
            className="w-8 h-8 bg-green-700 hover:bg-green-600 disabled:bg-gray-200 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
          >
            {cargando
              ? <RefreshCw size={14} className="text-white animate-spin" />
              : <Send size={14} className="text-white" />
            }
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Shift+Enter para nueva línea · Enter para enviar
        </p>
      </div>

      {/* Modal de Crisis */}
      {mostrarModalCrisis && (
        <ModalCrisis
          recursos={recursosCrisis}
          onCerrar={() => setMostrarModalCrisis(false)}
        />
      )}
    </div>
  );
}

// ── Componente Markdown Simple ──────────────────────────────────
function MarkdownSimple({ contenido }: { contenido: string }) {
  const partes = contenido.split(/(\*\*[^*]+\*\*|_[^_]+_|\n)/g);
  return (
    <span>
      {partes.map((parte, i) => {
        if (parte.startsWith('**') && parte.endsWith('**')) {
          return <strong key={i}>{parte.slice(2, -2)}</strong>;
        }
        if (parte.startsWith('_') && parte.endsWith('_')) {
          return <em key={i} className="text-xs text-gray-500">{parte.slice(1, -1)}</em>;
        }
        if (parte === '\n') return <br key={i} />;
        return <span key={i}>{parte}</span>;
      })}
    </span>
  );
}

// ── Modal de Crisis ─────────────────────────────────────────────
function ModalCrisis({ recursos, onCerrar }: { recursos: RecursoCrisis[]; onCerrar: () => void }) {
  return (
    <div className="absolute inset-0 bg-black/60 flex items-end justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-red-600 px-5 py-4 text-white">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Phone size={18} /> Líneas de Ayuda — Colombia
          </h3>
          <p className="text-sm text-red-100 mt-1">Profesionales disponibles ahora para apoyarte</p>
        </div>
        <div className="p-4 space-y-3">
          {recursos.map((r, i) => (
            <a
              key={i}
              href={`tel:${r.numero}`}
              className="flex items-center gap-3 p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100"
            >
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone size={16} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-red-700 text-sm">{r.numero}</p>
                <p className="text-xs text-gray-600">{r.nombre}</p>
                <p className="text-xs text-gray-400">{r.disponibilidad} · {r.gratuito ? 'Gratuito' : ''}</p>
              </div>
            </a>
          ))}
        </div>
        <div className="px-4 pb-4">
          <button
            onClick={onCerrar}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            Volver al chat
          </button>
        </div>
      </div>
    </div>
  );
}
