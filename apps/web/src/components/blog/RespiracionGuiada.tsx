'use client';

import { useEffect, useRef, useState } from 'react';

const INHALA_S = 4;
const EXHALA_S = 6;
const CICLO_S = INHALA_S + EXHALA_S;

type Fase = 'inhala' | 'exhala';

/** Marcapasos visual de respiración: inhala 4 s, exhala 6 s (exhalación prolongada) */
export function RespiracionGuiada() {
  const [activo, setActivo] = useState(false);
  const [segundo, setSegundo] = useState(0); // segundos transcurridos desde que empezó
  const [reducirMovimiento, setReducirMovimiento] = useState(false);
  const intervalo = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducirMovimiento(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducirMovimiento(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!activo) return;
    intervalo.current = setInterval(() => setSegundo(s => s + 1), 1000);
    return () => { if (intervalo.current) clearInterval(intervalo.current); };
  }, [activo]);

  function alternar() {
    if (activo) {
      setActivo(false);
    } else {
      setSegundo(0);
      setActivo(true);
    }
  }

  const enCiclo = segundo % CICLO_S;
  const fase: Fase = enCiclo < INHALA_S ? 'inhala' : 'exhala';
  const restante = fase === 'inhala' ? INHALA_S - enCiclo : CICLO_S - enCiclo;
  const ciclos = Math.floor(segundo / CICLO_S);
  const escala = !activo ? 0.6 : fase === 'inhala' ? 1 : 0.6;
  const duracionTransicion = fase === 'inhala' ? INHALA_S : EXHALA_S;

  return (
    <div
      role="group"
      aria-label="Ejercicio de respiración guiada"
      style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: '18px', padding: '24px', textAlign: 'center', margin: '8px 0 16px' }}
    >
      <p style={{ fontSize: '11px', fontWeight: '800', color: '#2dd4bf', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>
        Practícalo ahora
      </p>
      <p style={{ fontSize: '13px', color: '#8aab96', marginBottom: '20px' }}>
        Inhala por la nariz {INHALA_S} segundos · exhala suave por la boca {EXHALA_S} segundos
      </p>

      <div style={{ height: '190px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          aria-hidden
          style={{
            width: '180px', height: '180px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(45,212,191,0.35) 0%, rgba(45,212,191,0.08) 70%)',
            border: '2px solid rgba(45,212,191,0.5)',
            transform: `scale(${reducirMovimiento ? 0.8 : escala})`,
            transition: reducirMovimiento || !activo ? 'transform .4s ease' : `transform ${duracionTransicion}s ease-in-out`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ transform: `scale(${reducirMovimiento ? 1.25 : 1 / escala})`, transition: 'inherit', fontSize: '15px', fontWeight: '800', color: 'white' }}>
            {activo ? (fase === 'inhala' ? 'Inhala' : 'Exhala') : 'Listo'}
          </span>
        </div>
      </div>

      <p aria-live="polite" style={{ fontSize: '28px', fontWeight: '900', color: '#e5f0ea', minHeight: '38px', margin: '8px 0 4px' }}>
        {activo ? restante : ''}
      </p>
      <p style={{ fontSize: '12px', color: '#7a9e87', minHeight: '18px', marginBottom: '16px' }}>
        {activo && ciclos > 0 ? `${ciclos} ${ciclos === 1 ? 'ciclo' : 'ciclos'} · con 10 ciclos son unos 2 minutos` : ''}
      </p>

      <button
        type="button"
        onClick={alternar}
        style={{ background: activo ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#1a6b4a,#0d5438)', color: 'white', border: activo ? '1px solid rgba(255,255,255,0.15)' : 'none', padding: '11px 28px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
      >
        {activo ? 'Detener' : 'Empezar'}
      </button>
      <p style={{ fontSize: '11px', color: '#7a9e87', marginTop: '14px', lineHeight: 1.6 }}>
        Si te mareas, vuelve a respirar a tu ritmo normal. No retengas el aire.
      </p>
    </div>
  );
}
