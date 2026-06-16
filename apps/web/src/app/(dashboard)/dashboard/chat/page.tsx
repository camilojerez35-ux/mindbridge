'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Mensaje {
  id: string;
  rol: 'user' | 'assistant';
  contenido: string;
  timestamp: Date;
  esCrisis?: boolean;
}

interface SesionResumen {
  id: string;
  titulo: string;
  fecha: Date;
  mensajes: number;
}

const BIENVENIDA_CONTENIDO = `¡Hola! Soy MindBridge IA, tu asistente de bienestar emocional. 💚

Estoy aquí para acompañarte con empatía y apoyo basado en técnicas clínicas como TCC y mindfulness.

Puedes contarme cómo te sientes, qué está pasando en tu vida, o pedirme que te guíe en un ejercicio de respiración o relajación.

⚠️ _Soy una IA de apoyo emocional, no un psicólogo. En caso de crisis: Línea 106 · 123_

¿Cómo te encuentras hoy?`;

const PALABRAS_CRITICAS = ['suicidio', 'quitarme la vida', 'no quiero vivir', 'hacerme daño', 'mejor muerto', 'acabar con todo', 'me corté', 'me lastimé'];
const PALABRAS_ALTO = ['no puedo más', 'soy una carga', 'todos estarían mejor sin mí', 'quiero desaparecer', 'quisiera no despertar'];

function detectarCrisisLocal(texto: string): 'ninguno' | 'alto' | 'critico' {
  const t = texto.toLowerCase();
  if (PALABRAS_CRITICAS.some(p => t.includes(p))) return 'critico';
  if (PALABRAS_ALTO.some(p => t.includes(p))) return 'alto';
  return 'ninguno';
}

export default function ChatPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>(() => [{
    id: 'bienvenida',
    rol: 'assistant',
    contenido: BIENVENIDA_CONTENIDO,
    timestamp: new Date(),
  }]);
  const [sesiones, setSesiones] = useState<SesionResumen[]>([]);
  const [sesionActual, setSesionActual] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoSesion, setCargandoSesion] = useState(false);
  const [modalCrisis, setModalCrisis] = useState(false);
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [escuchando, setEscuchando] = useState(false);
  const reconRef = useRef<any>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { cargarSesiones(); }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  async function cargarSesiones() {
    try {
      const res = await fetch('/api/chat/sesiones');
      if (res.ok) {
        const data = await res.json();
        setSesiones(data.map((s: any) => ({ ...s, fecha: new Date(s.fecha) })));
      }
    } catch { /* el chat funciona sin historial */ }
  }

  async function seleccionarSesion(id: string) {
    if (id === sesionActual || cargandoSesion) return;
    setCargandoSesion(true);
    try {
      const res = await fetch(`/api/chat/sesiones/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSesionActual(id);
      setMensajes(
        data.mensajes.length > 0
          ? data.mensajes.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
          : [{ id: 'bienvenida', rol: 'assistant', contenido: BIENVENIDA_CONTENIDO, timestamp: new Date() }]
      );
    } catch {
      alert('No se pudo cargar la sesión.');
    } finally {
      setCargandoSesion(false);
    }
  }

  async function nuevaSesion() {
    try {
      const res = await fetch('/api/chat/sesiones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSesionActual(data.id);
      setMensajes([{ id: 'bienvenida', rol: 'assistant', contenido: BIENVENIDA_CONTENIDO, timestamp: new Date() }]);
      setSesiones(prev => [{ id: data.id, titulo: 'Nueva sesión', fecha: new Date(data.createdAt), mensajes: 0 }, ...prev]);
    } catch {
      setSesionActual(null);
      setMensajes([{ id: 'bienvenida', rol: 'assistant', contenido: BIENVENIDA_CONTENIDO, timestamp: new Date() }]);
    }
  }

  const enviar = useCallback(async () => {
    const texto = input.trim();
    if (!texto || cargando) return;
    setInput('');

    let idSesion = sesionActual;
    if (!idSesion) {
      try {
        const res = await fetch('/api/chat/sesiones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo: texto.slice(0, 50) }),
        });
        if (res.ok) {
          const data = await res.json();
          idSesion = data.id;
          setSesionActual(data.id);
          setSesiones(prev => [{ id: data.id, titulo: texto.slice(0, 50), fecha: new Date(), mensajes: 0 }, ...prev]);
        }
      } catch { /* continúa sin persistencia */ }
    }

    const nivelLocal = detectarCrisisLocal(texto);
    const msgUser: Mensaje = { id: `u-${Date.now()}`, rol: 'user', contenido: texto, timestamp: new Date() };
    setMensajes(p => [...p, msgUser]);
    setCargando(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: texto,
          historial: mensajes.filter(m => m.id !== 'bienvenida').map(m => ({ rol: m.rol, contenido: m.contenido })),
          sesionId: idSesion,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Error ${res.status}`);
      }

      const data = await res.json();
      setMensajes(p => [...p, {
        id: `a-${Date.now()}`,
        rol: 'assistant',
        contenido: data.respuesta,
        timestamp: new Date(),
        esCrisis: data.crisis,
      }]);

      if (data.accion === 'MOSTRAR_MODAL_CRISIS' || nivelLocal === 'critico') {
        setModalCrisis(true);
      }

      if (idSesion) {
        setSesiones(prev => prev.map(s => s.id === idSesion ? { ...s, mensajes: s.mensajes + 2 } : s));
      }
    } catch (error: any) {
      setMensajes(p => [...p, {
        id: `err-${Date.now()}`,
        rol: 'assistant',
        contenido: `Lo sentimos, ocurrió un error. Por favor intenta de nuevo.\n\n_${error.message ?? 'Error desconocido'}_`,
        timestamp: new Date(),
      }]);
    } finally {
      setCargando(false);
    }
  }, [input, cargando, sesionActual, mensajes]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); }
  };

  const toggleMic = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Tu navegador no soporta voz. Usa Chrome o Edge.'); return; }
    if (escuchando && reconRef.current) { reconRef.current.stop(); return; }
    const rec = new SR();
    rec.lang = 'es-CO';
    rec.continuous = false;
    rec.interimResults = true;
    rec.onstart = () => setEscuchando(true);
    rec.onend = () => setEscuchando(false);
    rec.onerror = (e: any) => {
      setEscuchando(false);
      if (e.error === 'not-allowed') alert('Permiso de micrófono denegado. Permite el acceso en la barra del navegador.');
      else if (e.error === 'no-speech') { /* silencioso, el usuario simplemente no habló */ }
      else alert(`Error de micrófono: ${e.error}`);
    };
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join('');
      setInput(transcript);
    };
    reconRef.current = rec;
    try { rec.start(); } catch (e: any) { alert(`No se pudo iniciar el micrófono: ${e.message}`); }
  }, [escuchando]);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 112px)', gap: '14px' }}>

      {/* ── Sidebar sesiones ── */}
      {sidebarAbierto && (
        <aside style={{
          width: '230px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          background: 'rgba(13,26,18,0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(45,212,191,0.08)',
          borderRadius: '18px',
          padding: '14px',
        }}>
          <button
            onClick={nuevaSesion}
            style={{
              background: 'linear-gradient(135deg,rgba(45,212,191,0.15),rgba(26,107,74,0.2))',
              border: '1px solid rgba(45,212,191,0.25)',
              color: '#2dd4bf',
              padding: '10px 14px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all .15s',
            }}
          >
            <span style={{ fontSize: '16px' }}>✦</span> Nueva sesión
          </button>

          <p style={{ fontSize: '10px', color: '#3d5c48', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '6px 4px 2px' }}>
            Historial
          </p>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {sesiones.length === 0 && (
              <p style={{ fontSize: '12px', color: '#2a3d2e', textAlign: 'center', padding: '20px 8px', lineHeight: 1.5 }}>
                Tus conversaciones<br />aparecerán aquí
              </p>
            )}
            {sesiones.map(s => {
              const activa = sesionActual === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => seleccionarSesion(s.id)}
                  disabled={cargandoSesion}
                  style={{
                    background: activa ? 'rgba(45,212,191,0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${activa ? 'rgba(45,212,191,0.3)' : 'rgba(255,255,255,0.05)'}`,
                    borderRadius: '10px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    opacity: cargandoSesion ? 0.5 : 1,
                    transition: 'all .12s',
                    position: 'relative',
                  }}
                >
                  {activa && (
                    <span style={{ position: 'absolute', left: 0, top: '6px', bottom: '6px', width: '3px', borderRadius: '0 3px 3px 0', background: '#2dd4bf' }} />
                  )}
                  <p style={{ fontSize: '12.5px', color: activa ? 'white' : '#8aab96', fontWeight: activa ? '600' : '400', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.titulo}
                  </p>
                  <p style={{ fontSize: '10px', color: '#3d5c48' }}>
                    {new Date(s.fecha).toLocaleDateString('es-CO')} · {s.mensajes} msgs
                  </p>
                </button>
              );
            })}
          </div>
        </aside>
      )}

      {/* ── Chat principal ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(13,26,18,0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(45,212,191,0.1)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}>

        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(45,212,191,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'linear-gradient(90deg, rgba(26,107,74,0.4), rgba(13,74,50,0.3))',
          backdropFilter: 'blur(8px)',
        }}>
          <button
            onClick={() => setSidebarAbierto(p => !p)}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#5a8a6a', cursor: 'pointer', fontSize: '14px', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}
            title={sidebarAbierto ? 'Ocultar historial' : 'Ver historial'}
          >
            ☰
          </button>

          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(45,212,191,0.2),rgba(26,107,74,0.3))', border: '1px solid rgba(45,212,191,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
            🤖
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: '800', fontSize: '15px', color: 'white', lineHeight: 1 }}>MindBridge IA</p>
            <p style={{ fontSize: '11px', color: 'rgba(45,212,191,0.6)', marginTop: '3px' }}>Apoyo emocional · TCC · ACT · Mindfulness</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: '20px', padding: '5px 10px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2dd4bf', boxShadow: '0 0 6px #2dd4bf', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
            <span style={{ fontSize: '11px', color: '#2dd4bf', fontWeight: '600' }}>En línea</span>
          </div>
        </div>

        {/* Aviso IA */}
        <div style={{ padding: '8px 20px', background: 'rgba(184,92,0,0.06)', borderBottom: '1px solid rgba(184,92,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', flexShrink: 0 }}>⚠️</span>
          <p style={{ fontSize: '11px', color: '#a16207', lineHeight: 1.4 }}>
            IA de bienestar — No sustituye atención profesional · Crisis:{' '}
            <a href="tel:106" style={{ color: '#2dd4bf', fontWeight: 700, textDecoration: 'none' }}>106</a>
            {' · '}
            <a href="tel:8001225555" style={{ color: '#d97706', fontWeight: 700, textDecoration: 'none' }}>800-112-5555</a>
            {' · '}
            <a href="tel:123" style={{ color: '#f87171', fontWeight: 700, textDecoration: 'none' }}>123</a>
          </p>
        </div>

        {/* Mensajes */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cargandoSesion ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '12px' }}>
              <div style={{ width: '24px', height: '24px', border: '2px solid rgba(45,212,191,0.2)', borderTopColor: '#2dd4bf', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              <p style={{ color: '#3d5c48', fontSize: '14px' }}>Cargando sesión...</p>
            </div>
          ) : (
            mensajes.map(msg => (
              <div key={msg.id} style={{ display: 'flex', gap: '12px', flexDirection: msg.rol === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>

                {/* Avatar */}
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px',
                  background: msg.rol === 'assistant'
                    ? 'linear-gradient(135deg,rgba(45,212,191,0.2),rgba(26,107,74,0.3))'
                    : 'rgba(255,255,255,0.08)',
                  border: `1px solid ${msg.rol === 'assistant' ? 'rgba(45,212,191,0.25)' : 'rgba(255,255,255,0.1)'}`,
                }}>
                  {msg.rol === 'assistant' ? '🤖' : '👤'}
                </div>

                {/* Burbuja */}
                <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: '5px', alignItems: msg.rol === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    padding: '13px 17px',
                    borderRadius: msg.rol === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    fontSize: '14px', color: 'white', lineHeight: 1.7,
                    ...(msg.rol === 'user' ? {
                      background: 'linear-gradient(135deg,#1a6b4a,#0d5438)',
                      boxShadow: '0 4px 16px rgba(26,107,74,0.25)',
                    } : msg.esCrisis ? {
                      background: 'rgba(184,32,32,0.12)',
                      border: '1px solid rgba(248,113,113,0.2)',
                      backdropFilter: 'blur(8px)',
                    } : {
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      backdropFilter: 'blur(8px)',
                    }),
                  }}>
                    <MdSimple texto={msg.contenido} />
                  </div>
                  <span style={{ fontSize: '10px', color: '#2a3d2e', padding: '0 4px' }}>
                    {msg.timestamp.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}

          {/* Indicador de escritura */}
          {cargando && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(45,212,191,0.2),rgba(26,107,74,0.3))', border: '1px solid rgba(45,212,191,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 }}>🤖</div>
              <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px 20px 20px 4px', backdropFilter: 'blur(8px)', display: 'flex', gap: '5px', alignItems: 'center' }}>
                {[0, 160, 320].map(d => (
                  <span key={d} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2dd4bf', display: 'inline-block', animation: `bounce-dot 0.9s ${d}ms ease-in-out infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '14px 16px 16px', borderTop: '1px solid rgba(45,212,191,0.08)', background: 'rgba(8,15,11,0.4)' }}>
          <div style={{
            display: 'flex', gap: '10px', alignItems: 'flex-end',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(45,212,191,0.15)',
            borderRadius: '16px', padding: '10px 12px',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
          }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Cuéntame cómo te sientes hoy..."
              rows={1}
              disabled={cargando || cargandoSesion}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'white', fontSize: '14px', resize: 'none', fontFamily: 'inherit',
                lineHeight: 1.55, maxHeight: '120px',
              }}
            />
            <button
              onClick={toggleMic}
              disabled={cargando || cargandoSesion}
              title={escuchando ? 'Detener micrófono' : 'Hablar'}
              style={{
                width: '38px', height: '38px', borderRadius: '50%', border: 'none',
                cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .2s',
                background: escuchando ? '#ef4444' : 'rgba(255,255,255,0.06)',
                boxShadow: escuchando ? '0 0 12px rgba(239,68,68,0.5)' : 'none',
                animation: escuchando ? 'mic-pulse 1.2s ease-in-out infinite' : 'none',
              }}
            >
              <span style={{ fontSize: '16px' }}>{escuchando ? '🔴' : '🎤'}</span>
            </button>
            <button
              onClick={enviar}
              disabled={!input.trim() || cargando || cargandoSesion}
              style={{
                width: '38px', height: '38px', borderRadius: '50%', border: 'none',
                cursor: input.trim() && !cargando ? 'pointer' : 'default',
                background: input.trim() && !cargando
                  ? 'linear-gradient(135deg,#2dd4bf,#1a6b4a)'
                  : 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'all .2s',
                boxShadow: input.trim() && !cargando ? '0 2px 12px rgba(45,212,191,0.3)' : 'none',
              }}
            >
              <span style={{ fontSize: '16px', filter: input.trim() && !cargando ? 'none' : 'opacity(0.3)' }}>➤</span>
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: '10px', color: '#1e3228', marginTop: '7px', letterSpacing: '0.03em' }}>
            Enter para enviar · Shift+Enter para nueva línea
          </p>
        </div>
      </div>

      {/* ── Modal Crisis ── */}
      {modalCrisis && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 999, padding: '20px',
        }}>
          <div style={{
            background: 'rgba(13,26,18,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: '24px',
            width: '100%', maxWidth: '430px',
            overflow: 'hidden',
            boxShadow: '0 0 60px rgba(184,32,32,0.25)',
          }}>
            <div style={{ background: 'linear-gradient(135deg,#b82020,#7f1d1d)', padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '22px' }}>📞</span>
                <h3 style={{ fontWeight: '900', fontSize: '18px', color: 'white' }}>Líneas de ayuda — Colombia</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Profesionales disponibles ahora para apoyarte</p>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { num: '106', nom: 'Línea de Salud Mental Bogotá', desc: '24 horas · Gratuita', color: '#2dd4bf' },
                { num: '800-112-5555', nom: 'Línea Nacional de Salud Mental', desc: 'Gratuita', color: '#818cf8' },
                { num: '123', nom: 'Emergencias Colombia', desc: '24 horas · Para riesgo inmediato', color: '#f87171' },
              ].map(({ num, nom, desc, color }) => (
                <a
                  key={num}
                  href={`tel:${num.replace(/-/g, '')}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${color}22`,
                    borderRadius: '14px', textDecoration: 'none',
                    transition: 'background .15s',
                  }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `${color}22`, border: `2px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>📞</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '900', color, fontSize: '20px', lineHeight: 1, marginBottom: '3px' }}>{num}</p>
                    <p style={{ fontSize: '13px', color: 'white', fontWeight: '600', marginBottom: '2px' }}>{nom}</p>
                    <p style={{ fontSize: '11px', color: '#5a8a6a' }}>{desc}</p>
                  </div>
                  <span style={{ color, fontSize: '18px', opacity: 0.7 }}>›</span>
                </a>
              ))}
              <button
                onClick={() => setModalCrisis(false)}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', color: '#8aab96', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', marginTop: '4px', transition: 'all .15s' }}
              >
                Volver al chat
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-dot { 0%,100% { opacity:1; box-shadow:0 0 6px #2dd4bf; } 50% { opacity:0.5; box-shadow:0 0 3px #2dd4bf; } }
        @keyframes bounce-dot { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-5px); } }
        @keyframes mic-pulse { 0%,100% { box-shadow:0 0 12px rgba(239,68,68,0.5); } 50% { box-shadow:0 0 22px rgba(239,68,68,0.9); } }
      `}</style>
    </div>
  );
}

function MdSimple({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*|_[^_]+_|\n)/g);
  return (
    <span>
      {partes.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith('_') && p.endsWith('_')) return <em key={i} style={{ fontSize: '12px', opacity: 0.6 }}>{p.slice(1, -1)}</em>;
        if (p === '\n') return <br key={i} />;
        return <span key={i}>{p}</span>;
      })}
    </span>
  );
}
