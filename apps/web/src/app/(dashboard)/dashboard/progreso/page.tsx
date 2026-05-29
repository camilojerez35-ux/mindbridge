'use client';

import { useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';

type RegistroAnimo = { dia: string; animo: number; emoji: string };

export default function ProgresoPage() {
  const [modalAnimo, setModalAnimo] = useState(false);
  const [animoHoy, setAnimoHoy] = useState(7);
  const [emocionHoy, setEmocionHoy] = useState('');
  const [registros, setRegistros] = useState<RegistroAnimo[]>([]);

  const tieneRegistros = registros.length > 0;
  const promedio = tieneRegistros ? registros.reduce((a, d) => a + d.animo, 0) / registros.length : 0;
  const max = tieneRegistros ? Math.max(...registros.map(d => d.animo)) : 10;

  const animoColor = (v: number) => v >= 7 ? '#2dd4bf' : v >= 4 ? '#fbbf24' : '#f87171';
  const animoEmoji = (v: number) => v >= 8 ? '😄' : v >= 6 ? '🙂' : v >= 4 ? '😐' : '😔';

  const registrarAnimo = () => {
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const hoy = diasSemana[new Date().getDay()];
    setRegistros(prev => [
      ...prev.filter(r => r.dia !== hoy),
      { dia: hoy, animo: animoHoy, emoji: animoEmoji(animoHoy) },
    ]);
    setModalAnimo(false);
    setEmocionHoy('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'white' }}>📈 Seguimiento de Progreso</h1>
          <p style={{ fontSize: '13px', color: '#5a8a6a', marginTop: '4px' }}>Monitorea tu bienestar emocional en el tiempo</p>
        </div>
        <button
          onClick={() => setModalAnimo(true)}
          style={{ background: '#1a6b4a', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          + Registrar ánimo
        </button>
      </div>

      {/* Estado vacío */}
      {!tieneRegistros && (
        <EmptyState
          icon="📊"
          titulo="Aún no hay datos de progreso"
          descripcion="Registra tu ánimo diariamente para ver tendencias, patrones y recibir insights personalizados. Solo toma 30 segundos."
          accionLabel="+ Registrar mi primer ánimo"
          onAccion={() => setModalAnimo(true)}
          secundarioLabel="Ir al diario"
          onSecundario={() => { window.location.href = '/dashboard/diario'; }}
        />
      )}

      {/* Contenido cuando hay datos */}
      {tieneRegistros && (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '12px' }}>
            {[
              { label: 'Ánimo promedio', val: promedio.toFixed(1) + '/10', icon: '📊', color: animoColor(promedio) },
              { label: 'Mejor registro', val: `${max}/10`, icon: '🌟', color: '#fbbf24' },
              { label: 'Días registrados', val: registros.length, icon: '🔥', color: '#fb7185' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '12px', padding: '18px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>{s.icon}</div>
                <div style={{ fontSize: '22px', fontWeight: '900', color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '11px', color: '#3d5c48', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Gráfica de barras */}
          <div style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '20px' }}>Tendencia de ánimo</h2>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', marginBottom: '8px' }}>
              {registros.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div
                    title={`${d.dia}: ${d.animo}/10`}
                    style={{
                      width: '100%', borderRadius: '4px 4px 0 0',
                      background: `linear-gradient(to top, ${animoColor(d.animo)}, ${animoColor(d.animo)}88)`,
                      height: `${(d.animo / max) * 100}%`, minHeight: '4px', transition: 'height .3s',
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {registros.map((d, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: '#3d5c48' }}>{d.dia}</div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {([['#2dd4bf', '7-10 Bien'], ['#fbbf24', '4-6 Regular'], ['#f87171', '1-3 Difícil']] as [string, string][]).map(([c, l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: c }} />
                  <span style={{ fontSize: '11px', color: '#3d5c48' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sugerencia para más datos */}
          {registros.length < 5 && (
            <div style={{ padding: '16px 20px', background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px' }}>💡</span>
              <p style={{ fontSize: '13px', color: '#8aab96', lineHeight: 1.5 }}>
                Registra tu ánimo al menos 7 días para ver patrones y recibir insights personalizados de la IA.
                Llevas <strong style={{ color: '#2dd4bf' }}>{registros.length} de 7</strong> días.
              </p>
            </div>
          )}
        </>
      )}

      {/* Modal registro ánimo */}
      {modalAnimo && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' }}
          onClick={e => { if (e.target === e.currentTarget) setModalAnimo(false); }}
        >
          <div style={{ background: '#0d1a12', border: '1px solid #1a6b4a', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '380px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '6px' }}>¿Cómo estás ahora?</h3>
            <p style={{ fontSize: '13px', color: '#5a8a6a', marginBottom: '24px' }}>Registro rápido de ánimo</p>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>{animoEmoji(animoHoy)}</div>
              <p style={{ fontSize: '28px', fontWeight: '900', color: animoColor(animoHoy) }}>{animoHoy}/10</p>
            </div>

            <input
              type="range" min={1} max={10} value={animoHoy}
              onChange={e => setAnimoHoy(+e.target.value)}
              style={{ width: '100%', accentColor: animoColor(animoHoy), marginBottom: '20px' }}
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
              {['😰 Ansioso/a', '😌 Tranquilo/a', '😢 Triste', '😄 Feliz', '😤 Frustrado/a', '🙏 Agradecido/a'].map(e => (
                <button
                  key={e} onClick={() => setEmocionHoy(e)}
                  style={{ padding: '6px 12px', borderRadius: '16px', border: `1px solid ${emocionHoy === e ? '#2dd4bf' : '#2a3d2e'}`, background: emocionHoy === e ? 'rgba(45,212,191,0.15)' : 'transparent', color: emocionHoy === e ? '#2dd4bf' : '#5a8a6a', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}
                >
                  {e}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={registrarAnimo} style={{ flex: 1, background: '#1a6b4a', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Guardar</button>
              <button onClick={() => setModalAnimo(false)} style={{ flex: 1, background: '#1a2e1f', color: '#5a8a6a', padding: '12px', borderRadius: '8px', border: '1px solid #2a3d2e', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
