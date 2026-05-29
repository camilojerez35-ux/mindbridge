'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

const POLL_INTERVAL = 1500; // ms

interface Props {
  citaId:        string;
  nombreUsuario: string;
  esIniciador:   boolean; // paciente=true, psicólogo=false
  onFinalizar?:  () => void;
}

type Estado = 'esperando' | 'conectando' | 'activo' | 'finalizado';

export default function SalaVideollamada({ citaId, nombreUsuario, esIniciador, onFinalizar }: Props) {
  const [estado,       setEstado]       = useState<Estado>('esperando');
  const [audioActivo,  setAudioActivo]  = useState(true);
  const [videoActivo,  setVideoActivo]  = useState(true);
  const [duracion,     setDuracion]     = useState(0);
  const [error,        setError]        = useState('');

  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef          = useRef<RTCPeerConnection | null>(null);
  const streamRef      = useRef<MediaStream | null>(null);
  const pollerRef      = useRef<NodeJS.Timeout | null>(null);
  const duracionRef    = useRef<NodeJS.Timeout | null>(null);
  const ofertaEnviada  = useRef(false);

  // ── Señalización ─────────────────────────────────────────────
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
        console.warn('[WebRTC] error procesando señal', senal.tipo, e);
      }
    }
  }, [citaId, esIniciador, enviarSenal]);

  // ── Inicializar ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcRef.current = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.ontrack = (e) => {
          if (remoteVideoRef.current && e.streams[0]) {
            remoteVideoRef.current.srcObject = e.streams[0];
            setEstado('activo');
            duracionRef.current = setInterval(() => setDuracion(d => d + 1), 1000);
          }
        };

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            enviarSenal('ice', e.candidate.toJSON());
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
            setError('La conexión se interrumpió. Intenta recargar la página.');
          }
        };

        // El iniciador (paciente) envía la oferta
        if (esIniciador && !ofertaEnviada.current) {
          ofertaEnviada.current = true;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await enviarSenal('offer', offer);
          setEstado('conectando');
        }

        // Polling de señales
        pollerRef.current = setInterval(() => procesarSenales(pc), POLL_INTERVAL);

      } catch (e: any) {
        if (e.name === 'NotAllowedError') {
          setError('Permiso de cámara/micrófono denegado. Habilítalos en la configuración del navegador.');
        } else {
          setError(`Error al acceder a la cámara: ${e.message}`);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      if (pollerRef.current)  clearInterval(pollerRef.current);
      if (duracionRef.current) clearInterval(duracionRef.current);
      pcRef.current?.close();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [citaId, esIniciador, enviarSenal, procesarSenales]);

  // ── Controles ─────────────────────────────────────────────────
  const toggleAudio = () => {
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setAudioActivo(p => !p);
  };

  const toggleVideo = () => {
    streamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setVideoActivo(p => !p);
  };

  const finalizar = async () => {
    if (pollerRef.current)  clearInterval(pollerRef.current);
    if (duracionRef.current) clearInterval(duracionRef.current);
    pcRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    await fetch(`/api/videollamada/${citaId}/signal`, { method: 'DELETE' });
    setEstado('finalizado');
    onFinalizar?.();
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

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

  // ── Error ─────────────────────────────────────────────────────
  if (error) return (
    <div style={S.page}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Error de conexión</h2>
        <p style={{ color: '#f87171', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>{error}</p>
        <button onClick={() => window.location.reload()} style={S.btnPrimary}>Reintentar</button>
      </div>
    </div>
  );

  // ── Sala principal ────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0a1510', display: 'flex', flexDirection: 'column', fontFamily: 'Inter,sans-serif' }}>

      {/* Top bar */}
      <div style={{ height: 56, background: '#0d1a12', borderBottom: '1px solid #1a2e1f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#2dd4bf' }}>MindBridge</span>
          <span style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)', color: '#2dd4bf', fontSize: 12, padding: '3px 10px', borderRadius: 10 }}>
            {estado === 'esperando'   && 'Esperando conexión...'}
            {estado === 'conectando'  && 'Conectando...'}
            {estado === 'activo'      && `En sesión · ${fmt(duracion)}`}
          </span>
        </div>
        <span style={{ fontSize: 13, color: '#5a8a6a' }}>{nombreUsuario}</span>
      </div>

      {/* Área video */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a1510', position: 'relative', padding: 24 }}>

        {/* Video remoto */}
        <div style={{ width: '100%', maxWidth: 800, aspectRatio: '16/9', background: '#1a2e1f', borderRadius: 16, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: estado === 'activo' ? 'block' : 'none' }} />
          {estado !== 'activo' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, border: '3px solid #2dd4bf', borderTop: '3px solid transparent', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: '#8aab96' }}>
                {estado === 'esperando' ? (esIniciador ? 'Esperando que se conecte el psicólogo...' : 'Procesando conexión...') : 'Conectando...'}
              </p>
            </div>
          )}
        </div>

        {/* Video propio */}
        <div style={{ position: 'absolute', bottom: 32, right: 32, width: 160, aspectRatio: '16/9', background: '#1a6b4a', borderRadius: 12, border: '2px solid #2dd4bf', overflow: 'hidden' }}>
          <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: videoActivo ? 'block' : 'none' }} />
          {!videoActivo && (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28 }}>🚫</div>
          )}
        </div>
      </div>

      {/* Controles */}
      <div style={{ height: 72, background: '#0d1a12', borderTop: '1px solid #1a2e1f', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <button onClick={toggleAudio} title={audioActivo ? 'Silenciar' : 'Activar micrófono'} style={{ width: 48, height: 48, borderRadius: '50%', background: audioActivo ? '#1a2e1f' : '#b82020', border: `1px solid ${audioActivo ? '#2a3d2e' : '#b82020'}`, cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {audioActivo ? '🎤' : '🔇'}
        </button>
        <button onClick={toggleVideo} title={videoActivo ? 'Apagar cámara' : 'Encender cámara'} style={{ width: 48, height: 48, borderRadius: '50%', background: videoActivo ? '#1a2e1f' : '#b82020', border: `1px solid ${videoActivo ? '#2a3d2e' : '#b82020'}`, cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {videoActivo ? '📹' : '🚫'}
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
    fontFamily: 'Inter,sans-serif',
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
