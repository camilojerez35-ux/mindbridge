'use client';
// src/components/videollamada/SalaVideollamada.tsx
// RUTA: Usado en /dashboard/citas/[id]/videollamada
// Instalar: npm install @daily-co/daily-js

import { useEffect, useRef, useState } from 'react';

interface Props {
  url: string;
  token: string;
  nombreUsuario: string;
  onFinalizar?: () => void;
}

export default function SalaVideollamada({ url, token, nombreUsuario, onFinalizar }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [estado, setEstado] = useState<'cargando'|'conectando'|'activo'|'finalizado'>('cargando');
  const [participantes, setParticipantes] = useState(0);
  const [duracion, setDuracion] = useState(0);
  const [audioActivo, setAudioActivo] = useState(true);
  const [videoActivo, setVideoActivo] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout|null>(null);

  useEffect(() => {
    setEstado('conectando');

    // En producción, usar Daily.co SDK
    // const DailyIframe = await import('@daily-co/daily-js');
    // const callFrame = DailyIframe.createFrame(iframeRef.current, { ... });
    // callFrame.on('joined-meeting', () => setEstado('activo'));
    // callFrame.on('participant-joined', () => setParticipantes(p => p + 1));

    // Demo: simular conexión
    const timer = setTimeout(() => {
      setEstado('activo');
      setParticipantes(1);
      intervalRef.current = setInterval(() => setDuracion(d => d + 1), 1000);
    }, 2000);

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [url, token]);

  const formatDuracion = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const finalizar = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setEstado('finalizado');
    onFinalizar?.();
  };

  if (estado === 'finalizado') return (
    <div style={{ minHeight:'100vh', background:'#0d1a12', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter,sans-serif' }}>
      <div style={{ textAlign:'center', maxWidth:'400px', padding:'40px' }}>
        <div style={{ fontSize:'56px', marginBottom:'16px' }}>✅</div>
        <h2 style={{ color:'white', fontSize:'24px', fontWeight:'900', marginBottom:'8px' }}>Sesión finalizada</h2>
        <p style={{ color:'#5a8a6a', marginBottom:'8px' }}>Duración: {formatDuracion(duracion)}</p>
        <p style={{ color:'#8aab96', fontSize:'14px', marginBottom:'28px', lineHeight:1.6 }}>
          ¡Buen trabajo! Recuerda que también puedes hablar con la IA entre sesiones para mantener tu progreso.
        </p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center' }}>
          <a href="/dashboard/citas" style={{ background:'#1a6b4a', color:'white', padding:'12px 24px', borderRadius:'8px', textDecoration:'none', fontWeight:'700', fontSize:'14px' }}>Ver mis citas</a>
          <a href="/dashboard/chat" style={{ background:'#1a2e1f', color:'#8aab96', padding:'12px 24px', borderRadius:'8px', textDecoration:'none', border:'1px solid #2a3d2e', fontSize:'14px' }}>Hablar con IA</a>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#0a1510', display:'flex', flexDirection:'column', fontFamily:'Inter,sans-serif' }}>

      {/* Barra superior */}
      <div style={{ height:'56px', background:'#0d1a12', borderBottom:'1px solid #1a2e1f', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'18px', fontWeight:'900', color:'#2dd4bf' }}>MindBridge</span>
          <span style={{ background:'rgba(45,212,191,0.1)', border:'1px solid rgba(45,212,191,0.2)', color:'#2dd4bf', fontSize:'12px', padding:'3px 10px', borderRadius:'10px' }}>
            {estado === 'conectando' ? 'Conectando...' : estado === 'activo' ? `En sesión · ${formatDuracion(duracion)}` : 'Cargando...'}
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'#5a8a6a' }}>
          <span>👥 {participantes} {participantes === 1 ? 'participante' : 'participantes'}</span>
        </div>
      </div>

      {/* Área de video */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'#0a1510', position:'relative' }}>
        {estado === 'conectando' && (
          <div style={{ textAlign:'center', color:'white' }}>
            <div style={{ width:'60px', height:'60px', border:'3px solid #2dd4bf', borderTop:'3px solid transparent', borderRadius:'50%', margin:'0 auto 16px', animation:'spin 1s linear infinite' }} />
            <p>Conectando a la videollamada...</p>
          </div>
        )}
        {estado === 'activo' && (
          <>
            {/* Video remoto (psicólogo) */}
            <div style={{ width:'100%', maxWidth:'800px', aspectRatio:'16/9', background:'#1a2e1f', borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:'#1a6b4a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', margin:'0 auto 12px' }}>👨‍⚕️</div>
                <p style={{ color:'#8aab96', fontSize:'14px' }}>Psicólogo conectado</p>
              </div>
              {/* Aquí va el iframe de Daily.co en producción */}
              {/* <iframe ref={iframeRef} src={`${url}?t=${token}`} allow="camera; microphone; fullscreen" style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none', borderRadius:'16px' }} /> */}
            </div>

            {/* Video propio (pequeño) */}
            <div style={{ position:'absolute', bottom:'80px', right:'24px', width:'160px', aspectRatio:'16/9', background:'#1a6b4a', borderRadius:'12px', border:'2px solid #2dd4bf', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:'24px' }}>👤</span>
            </div>
          </>
        )}
      </div>

      {/* Controles */}
      <div style={{ height:'72px', background:'#0d1a12', borderTop:'1px solid #1a2e1f', display:'flex', alignItems:'center', justifyContent:'center', gap:'16px' }}>
        <button onClick={() => setAudioActivo(p=>!p)} style={{ width:'48px', height:'48px', borderRadius:'50%', background:audioActivo?'#1a2e1f':'#b82020', border:`1px solid ${audioActivo?'#2a3d2e':'#b82020'}`, cursor:'pointer', fontSize:'20px', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {audioActivo ? '🎤' : '🔇'}
        </button>
        <button onClick={() => setVideoActivo(p=>!p)} style={{ width:'48px', height:'48px', borderRadius:'50%', background:videoActivo?'#1a2e1f':'#b82020', border:`1px solid ${videoActivo?'#2a3d2e':'#b82020'}`, cursor:'pointer', fontSize:'20px', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {videoActivo ? '📹' : '🚫'}
        </button>
        <button onClick={finalizar} style={{ background:'#b82020', border:'none', color:'white', padding:'12px 24px', borderRadius:'24px', fontWeight:'700', fontSize:'14px', cursor:'pointer', fontFamily:'inherit' }}>
          ✕ Finalizar sesión
        </button>
        <a href="tel:106" style={{ width:'48px', height:'48px', borderRadius:'50%', background:'rgba(184,32,32,0.2)', border:'1px solid rgba(184,32,32,0.3)', cursor:'pointer', fontSize:'18px', display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none' }} title="Crisis: Línea 106">
          🆘
        </a>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
