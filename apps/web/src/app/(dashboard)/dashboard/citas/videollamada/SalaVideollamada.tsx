'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

const POLL_INTERVAL = 1500;

interface Props {
  citaId:        string;
  nombreUsuario: string;
  esIniciador:   boolean;
  onFinalizar?:  () => void;
}

interface MensajeChat {
  id:     string;
  de:     string;
  texto:  string;
  ts:     number;
  propio: boolean;
}

type Estado = 'lobby' | 'esperando' | 'conectando' | 'activo' | 'finalizado';

export default function SalaVideollamada({ citaId, nombreUsuario, esIniciador, onFinalizar }: Props) {
  const [estado,        setEstado]        = useState<Estado>('lobby');
  const [audioActivo,   setAudioActivo]   = useState(true);
  const [videoActivo,   setVideoActivo]   = useState(true);
  const [duracion,      setDuracion]      = useState(0);
  const [error,         setError]         = useState('');
  const [lobbyStream,   setLobbyStream]   = useState<MediaStream | null>(null);
  const [lobbyError,    setLobbyError]    = useState('');
  const lobbyVideoRef  = useRef<HTMLVideoElement>(null);
  const [chatAbierto,   setChatAbierto]   = useState(false);
  const [mensajes,      setMensajes]      = useState<MensajeChat[]>([]);
  const [inputChat,     setInputChat]     = useState('');
  const [noLeidos,      setNoLeidos]      = useState(0);

  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef     = useRef<HTMLDivElement>(null);
  const pcRef          = useRef<RTCPeerConnection | null>(null);
  const dcRef          = useRef<RTCDataChannel | null>(null);
  const streamRef      = useRef<MediaStream | null>(null);
  const pollerRef      = useRef<NodeJS.Timeout | null>(null);
  const duracionRef    = useRef<NodeJS.Timeout | null>(null);
  const ofertaEnviada    = useRef(false);
  const chatAbiertoRef   = useRef(false);
  const webrtcIniciado   = useRef(false);

  // Mantener ref sincronizada para usar dentro de callbacks sin re-crear
  useEffect(() => { chatAbiertoRef.current = chatAbierto; }, [chatAbierto]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // ── DataChannel (chat P2P) ────────────────────────────────────
  const configurarDataChannel = useCallback((dc: RTCDataChannel) => {
    dcRef.current = dc;
    dc.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as { de: string; texto: string; ts: number };
        const nuevo: MensajeChat = { id: `${msg.ts}-r`, de: msg.de, texto: msg.texto, ts: msg.ts, propio: false };
        setMensajes(prev => [...prev, nuevo]);
        if (!chatAbiertoRef.current) setNoLeidos(n => n + 1);
      } catch { /* ignorar mensajes malformados */ }
    };
  }, []);

  const enviarMensaje = () => {
    const texto = inputChat.trim();
    if (!texto || !dcRef.current || dcRef.current.readyState !== 'open') return;
    const ts = Date.now();
    dcRef.current.send(JSON.stringify({ de: nombreUsuario, texto, ts }));
    setMensajes(prev => [...prev, { id: `${ts}-l`, de: nombreUsuario, texto, ts, propio: true }]);
    setInputChat('');
  };

  // ── Señalización WebRTC ───────────────────────────────────────
  const enviarSenal = useCallback(async (tipo: string, payload: object) => {
    await fetch(`/api/videollamada/${citaId}/signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, payload }),
    });
  }, [citaId]);

  const procesarSenales = useCallback(async (pc: RTCPeerConnection) => {
    const res = await fetch(`/api/videollamada/${citaId}/signal`);
    if (!res.ok) return;
    const { senales } = await res.json();

    for (const senal of senales) {
      try {
        if (senal.tipo === 'offer' && !esIniciador) {
          await pc.setRemoteDescription(new RTCSessionDescription(senal.payload as RTCSessionDescriptionInit));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await enviarSenal('answer', answer);
          setEstado('conectando');
        } else if (senal.tipo === 'answer' && esIniciador) {
          if (pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(senal.payload as RTCSessionDescriptionInit));
          }
        } else if (senal.tipo === 'ice') {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(senal.payload as RTCIceCandidateInit));
          }
        }
      } catch (e) {
        console.warn('[WebRTC] señal', senal.tipo, e);
      }
    }
  }, [citaId, esIniciador, enviarSenal]);

  // ── Lobby: pedir permiso explícito antes de entrar ───────────
  const pedirPermiso = async () => {
    setLobbyError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLobbyStream(stream);
      if (lobbyVideoRef.current) lobbyVideoRef.current.srcObject = stream;
    } catch (e: any) {
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setLobbyError('PERMISO_DENEGADO');
      } else if (e.name === 'NotFoundError') {
        setLobbyError('No se encontró cámara o micrófono conectados.');
      } else {
        setLobbyError(`Error: ${e.message}`);
      }
    }
  };

  const entrarSala = () => {
    // Detener el preview del lobby — init() abrirá un nuevo stream
    lobbyStream?.getTracks().forEach(t => t.stop());
    setLobbyStream(null);
    setEstado('esperando');
  };

  // ── Inicializar WebRTC (solo cuando salimos del lobby) ────────
  useEffect(() => {
    if (estado === 'lobby' || estado === 'finalizado') return;
    if (webrtcIniciado.current) return; // ya inicializado — no re-crear la conexión al cambiar estado
    webrtcIniciado.current = true;
    let cancelled = false;

    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcRef.current = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // DataChannel: el iniciador lo crea, el otro lo recibe
        if (esIniciador) {
          const dc = pc.createDataChannel('chat', { ordered: true });
          configurarDataChannel(dc);
        } else {
          pc.ondatachannel = (e) => configurarDataChannel(e.channel);
        }

        pc.ontrack = (e) => {
          if (remoteVideoRef.current && e.streams[0]) {
            remoteVideoRef.current.srcObject = e.streams[0];
            setEstado('activo');
            duracionRef.current = setInterval(() => setDuracion(d => d + 1), 1000);
          }
        };

        pc.onicecandidate = (e) => {
          if (e.candidate) enviarSenal('ice', e.candidate.toJSON());
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
            setError('La conexión se interrumpió. Intenta recargar la página.');
          }
        };

        if (esIniciador && !ofertaEnviada.current) {
          ofertaEnviada.current = true;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await enviarSenal('offer', offer);
          setEstado('conectando');
        }

        pollerRef.current = setInterval(() => procesarSenales(pc), POLL_INTERVAL);

      } catch (e: any) {
        if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
          setError('PERMISO_DENEGADO');
        } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
          setError('No se encontró cámara o micrófono. Verifica que estén conectados.');
        } else if (e.name === 'NotReadableError') {
          setError('La cámara o micrófono está siendo usado por otra aplicación.');
        } else {
          setError(`Error al acceder a la cámara: ${e.message}`);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      webrtcIniciado.current = false;
      if (pollerRef.current)   clearInterval(pollerRef.current);
      if (duracionRef.current) clearInterval(duracionRef.current);
      pcRef.current?.close();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [citaId, estado, esIniciador, enviarSenal, procesarSenales, configurarDataChannel]);

  // ── Controles ─────────────────────────────────────────────────
  const toggleAudio = () => {
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setAudioActivo(p => !p);
  };

  const toggleVideo = () => {
    streamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setVideoActivo(p => !p);
  };

  const abrirChat = () => {
    setChatAbierto(true);
    setNoLeidos(0);
  };

  const finalizar = async () => {
    if (pollerRef.current)   clearInterval(pollerRef.current);
    if (duracionRef.current) clearInterval(duracionRef.current);
    dcRef.current?.close();
    pcRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    await fetch(`/api/videollamada/${citaId}/signal`, { method: 'DELETE' });
    setEstado('finalizado');
    onFinalizar?.();
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const fmtHora = (ts: number) =>
    new Date(ts).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  // ── Pantalla lobby ────────────────────────────────────────────
  if (estado === 'lobby') {
    const permisoConcedido = !!lobbyStream;
    return (
      <div style={S.page}>
        <div style={{ maxWidth: 480, width: '100%', padding: '32px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#2dd4bf' }}>MenteBridge</span>
            <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '12px 0 4px' }}>Sala de espera</h2>
            <p style={{ color: '#5a8a6a', fontSize: 14 }}>Hola, <strong style={{ color: '#8aab96' }}>{nombreUsuario}</strong></p>
          </div>

          {/* Preview de cámara */}
          <div style={{ width: '100%', aspectRatio: '16/9', background: '#1a2e1f', borderRadius: 16, overflow: 'hidden', position: 'relative', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <video ref={lobbyVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: permisoConcedido ? 'block' : 'none' }} />
            {!permisoConcedido && (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
                <p style={{ color: '#5a8a6a', fontSize: 14, margin: 0 }}>
                  {lobbyError ? '' : 'Tu cámara aparecerá aquí'}
                </p>
              </div>
            )}
            {permisoConcedido && (
              <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', background: 'rgba(13,148,136,0.85)', borderRadius: 20, padding: '4px 14px', fontSize: 12, color: 'white', fontWeight: 600 }}>
                ✅ Cámara lista
              </div>
            )}
          </div>

          {/* Error de permiso en lobby */}
          {lobbyError && lobbyError !== 'PERMISO_DENEGADO' && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{lobbyError}</p>
            </div>
          )}

          {lobbyError === 'PERMISO_DENEGADO' && (
            <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
              <p style={{ color: '#fbbf24', fontWeight: 700, fontSize: 13, margin: '0 0 8px' }}>🔒 Permiso bloqueado</p>
              <ol style={{ color: '#8aab96', fontSize: 13, lineHeight: 1.9, paddingLeft: 18, margin: 0 }}>
                <li>Haz clic en el ícono <strong style={{ color: 'white' }}>🔒</strong> o <strong style={{ color: 'white' }}>📷</strong> en la barra de dirección</li>
                <li>Cambia <strong style={{ color: 'white' }}>Cámara</strong> y <strong style={{ color: 'white' }}>Micrófono</strong> a <strong style={{ color: '#2dd4bf' }}>Permitir</strong></li>
                <li>Haz clic en <strong style={{ color: '#2dd4bf' }}>"Probar cámara"</strong> de nuevo</li>
              </ol>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!permisoConcedido ? (
              <button onClick={pedirPermiso} style={{ background: '#0d9488', border: 'none', color: 'white', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>
                📷 Probar cámara y micrófono
              </button>
            ) : (
              <button onClick={entrarSala} style={{ background: '#1a6b4a', border: 'none', color: 'white', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>
                Entrar a la sesión →
              </button>
            )}
            {permisoConcedido && (
              <button onClick={pedirPermiso} style={{ background: 'transparent', border: '1px solid #2a3d2e', color: '#5a8a6a', padding: '10px', borderRadius: 10, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cambiar dispositivos
              </button>
            )}
            <a href="/dashboard/citas" style={{ textAlign: 'center', color: '#3d5c48', fontSize: 13, textDecoration: 'none', padding: '8px 0' }}>
              Cancelar y volver a mis citas
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Pantalla finalizado ───────────────────────────────────────
  if (estado === 'finalizado') return (
    <div style={S.page}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: 40 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h2 style={{ color: 'white', fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Sesión finalizada</h2>
        <p style={{ color: '#5a8a6a', marginBottom: 8 }}>Duración: {fmt(duracion)}</p>
        <p style={{ color: '#8aab96', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
          ¡Buen trabajo! Recuerda que puedes hablar con la IA entre sesiones para mantener tu progreso.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <a href="/dashboard/citas" style={S.btnPrimary}>Ver mis citas</a>
          <a href="/dashboard/chat"  style={S.btnSecondary}>Hablar con IA</a>
        </div>
      </div>
    </div>
  );

  // ── Pantalla error ────────────────────────────────────────────
  if (error) {
    const esPermiso  = error === 'PERMISO_DENEGADO';
    const isChrome   = typeof navigator !== 'undefined' && /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);
    const isEdge     = typeof navigator !== 'undefined' && /Edg/.test(navigator.userAgent);
    const isFirefox  = typeof navigator !== 'undefined' && /Firefox/.test(navigator.userAgent);

    return (
      <div style={S.page}>
        <div style={{ maxWidth: 460, padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16, textAlign: 'center' }}>{esPermiso ? '🔒' : '⚠️'}</div>
          <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>
            {esPermiso ? 'Permiso de cámara bloqueado' : 'Error de conexión'}
          </h2>
          {esPermiso ? (
            <>
              <p style={{ color: '#fbbf24', fontSize: 14, marginBottom: 20, lineHeight: 1.7, textAlign: 'center' }}>
                El navegador bloqueó el acceso a tu cámara y micrófono.<br />Sigue estos pasos:
              </p>
              <div style={{ background: '#1a2e1f', border: '1px solid #2a3d2e', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
                {(isChrome || isEdge) && (
                  <ol style={{ color: '#8aab96', fontSize: 13, lineHeight: 2, paddingLeft: 20, margin: 0 }}>
                    <li>Haz clic en el ícono de candado <strong style={{ color: 'white' }}>🔒</strong> en la barra de dirección</li>
                    <li>Selecciona <strong style={{ color: 'white' }}>Permisos del sitio</strong></li>
                    <li>Cambia <strong style={{ color: 'white' }}>Cámara</strong> y <strong style={{ color: 'white' }}>Micrófono</strong> a <strong style={{ color: '#2dd4bf' }}>Permitir</strong></li>
                    <li>Recarga la página</li>
                  </ol>
                )}
                {isFirefox && (
                  <ol style={{ color: '#8aab96', fontSize: 13, lineHeight: 2, paddingLeft: 20, margin: 0 }}>
                    <li>Haz clic en el ícono de escudo en la barra de dirección</li>
                    <li>Selecciona <strong style={{ color: 'white' }}>Permisos</strong></li>
                    <li>Habilita <strong style={{ color: 'white' }}>Cámara</strong> y <strong style={{ color: 'white' }}>Micrófono</strong></li>
                    <li>Recarga la página</li>
                  </ol>
                )}
                {!isChrome && !isEdge && !isFirefox && (
                  <p style={{ color: '#8aab96', fontSize: 13, margin: 0 }}>
                    Busca el ícono de candado en la barra de dirección, habilita cámara y micrófono, y recarga.
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={() => window.location.reload()} style={S.btnPrimary as React.CSSProperties}>Recargar página</button>
                <a href="/dashboard/citas" style={S.btnSecondary}>Volver a citas</a>
              </div>
            </>
          ) : (
            <>
              <p style={{ color: '#f87171', fontSize: 14, marginBottom: 24, lineHeight: 1.6, textAlign: 'center' }}>{error}</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={() => window.location.reload()} style={S.btnPrimary as React.CSSProperties}>Reintentar</button>
                <a href="/dashboard/citas" style={S.btnSecondary}>Volver a citas</a>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Sala principal ────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0a1510', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ height: 56, background: '#0d1a12', borderBottom: '1px solid #1a2e1f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#2dd4bf' }}>MenteBridge</span>
          <span style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)', color: '#2dd4bf', fontSize: 12, padding: '3px 10px', borderRadius: 10 }}>
            {estado === 'esperando'  && 'Esperando conexión...'}
            {estado === 'conectando' && 'Conectando...'}
            {estado === 'activo'     && `En sesión · ${fmt(duracion)}`}
          </span>
        </div>
        <span style={{ fontSize: 13, color: '#5a8a6a' }}>{nombreUsuario}</span>
      </div>

      {/* Contenido: video + chat */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Área video */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a1510', position: 'relative', padding: 24, minWidth: 0 }}>

          {/* Video remoto */}
          <div style={{ width: '100%', maxWidth: chatAbierto ? 700 : 800, aspectRatio: '16/9', background: '#1a2e1f', borderRadius: 16, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'max-width 0.3s' }}>
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: estado === 'activo' ? 'block' : 'none' }} />
            {estado !== 'activo' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, border: '3px solid #2dd4bf', borderTop: '3px solid transparent', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#8aab96' }}>
                  {estado === 'esperando' ? (esIniciador ? 'Esperando al psicólogo...' : 'Procesando conexión...') : 'Conectando...'}
                </p>
              </div>
            )}
          </div>

          {/* Video propio */}
          <div style={{ position: 'absolute', bottom: 32, right: chatAbierto ? 340 : 32, width: 160, aspectRatio: '16/9', background: '#1a6b4a', borderRadius: 12, border: '2px solid #2dd4bf', overflow: 'hidden', transition: 'right 0.3s' }}>
            <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: videoActivo ? 'block' : 'none' }} />
            {!videoActivo && (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28 }}>🚫</div>
            )}
          </div>
        </div>

        {/* Panel de chat */}
        {chatAbierto && (
          <div style={{ width: 300, background: '#0d1a12', borderLeft: '1px solid #1a2e1f', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

            {/* Header chat */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #1a2e1f', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>💬 Chat de sesión</span>
              <button onClick={() => setChatAbierto(false)} style={{ background: 'none', border: 'none', color: '#5a8a6a', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
            </div>

            {/* Mensajes */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mensajes.length === 0 && (
                <p style={{ color: '#3d5c48', fontSize: 13, textAlign: 'center', marginTop: 24 }}>
                  El chat es privado y solo visible durante la sesión.
                </p>
              )}
              {mensajes.map(m => (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.propio ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '85%', background: m.propio ? '#1a6b4a' : '#1a2e1f', border: `1px solid ${m.propio ? '#2a8a5a' : '#2a3d2e'}`, borderRadius: m.propio ? '12px 12px 4px 12px' : '12px 12px 12px 4px', padding: '8px 12px' }}>
                    <p style={{ margin: 0, color: 'white', fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word' }}>{m.texto}</p>
                  </div>
                  <span style={{ color: '#3d5c48', fontSize: 11, marginTop: 2 }}>{fmtHora(m.ts)}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '10px 12px', borderTop: '1px solid #1a2e1f', display: 'flex', gap: 8 }}>
              <input
                value={inputChat}
                onChange={e => setInputChat(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensaje(); } }}
                placeholder="Escribe un mensaje..."
                style={{ flex: 1, background: '#1a2e1f', border: '1px solid #2a3d2e', borderRadius: 8, padding: '8px 12px', color: 'white', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
              />
              <button
                onClick={enviarMensaje}
                disabled={!inputChat.trim() || !dcRef.current || dcRef.current?.readyState !== 'open'}
                style={{ background: '#0d9488', border: 'none', color: 'white', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 16, opacity: inputChat.trim() ? 1 : 0.4 }}
              >
                ➤
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controles */}
      <div style={{ height: 72, background: '#0d1a12', borderTop: '1px solid #1a2e1f', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexShrink: 0 }}>
        <button onClick={toggleAudio} title={audioActivo ? 'Silenciar' : 'Activar micrófono'} style={{ width: 48, height: 48, borderRadius: '50%', background: audioActivo ? '#1a2e1f' : '#b82020', border: `1px solid ${audioActivo ? '#2a3d2e' : '#b82020'}`, cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {audioActivo ? '🎤' : '🔇'}
        </button>
        <button onClick={toggleVideo} title={videoActivo ? 'Apagar cámara' : 'Encender cámara'} style={{ width: 48, height: 48, borderRadius: '50%', background: videoActivo ? '#1a2e1f' : '#b82020', border: `1px solid ${videoActivo ? '#2a3d2e' : '#b82020'}`, cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {videoActivo ? '📹' : '🚫'}
        </button>

        {/* Botón chat con badge */}
        <button onClick={abrirChat} title="Chat de sesión" style={{ width: 48, height: 48, borderRadius: '50%', background: chatAbierto ? 'rgba(13,148,136,0.2)' : '#1a2e1f', border: `1px solid ${chatAbierto ? '#0d9488' : '#2a3d2e'}`, cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          💬
          {noLeidos > 0 && (
            <span style={{ position: 'absolute', top: 0, right: 0, background: '#f87171', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {noLeidos}
            </span>
          )}
        </button>

        <button onClick={finalizar} style={{ background: '#b82020', border: 'none', color: 'white', padding: '12px 24px', borderRadius: 24, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
          ✕ Finalizar sesión
        </button>
        <a href="tel:106" title="Crisis: Línea 106" style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(184,32,32,0.2)', border: '1px solid rgba(184,32,32,0.3)', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
          🆘
        </a>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const S = {
  page: {
    minHeight: '100vh' as const,
    background: '#0d1a12',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  btnPrimary: {
    background: '#1a6b4a', color: 'white', padding: '12px 24px',
    borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 14,
  } as React.CSSProperties,
  btnSecondary: {
    background: '#1a2e1f', color: '#8aab96', padding: '12px 24px',
    borderRadius: 8, textDecoration: 'none', border: '1px solid #2a3d2e', fontSize: 14,
  } as React.CSSProperties,
};
