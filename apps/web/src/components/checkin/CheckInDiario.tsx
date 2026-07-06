'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'mb_checkin_date';
const EMOCIONES = ['😰 Ansioso/a', '😌 Tranquilo/a', '😢 Triste', '😄 Feliz', '😤 Frustrado/a', '🙏 Agradecido/a'];

export default function CheckInDiario() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [valor, setValor] = useState(7);
  const [emocion, setEmocion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    const hoy = new Date().toDateString();
    const ultimoCheckin = localStorage.getItem(STORAGE_KEY);
    if (ultimoCheckin !== hoy) {
      // Pequeño delay para que la página cargue antes de mostrar el modal
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const animoColor = (v: number) => v >= 7 ? '#2dd4bf' : v >= 4 ? '#fbbf24' : '#f87171';
  const animoEmoji = (v: number) => v >= 8 ? '😄' : v >= 6 ? '🙂' : v >= 4 ? '😐' : v >= 2 ? '😔' : '😢';
  const animoLabel = (v: number) => v >= 8 ? 'Muy bien' : v >= 6 ? 'Bien' : v >= 4 ? 'Regular' : v >= 2 ? 'Mal' : 'Muy mal';

  const guardar = async () => {
    setGuardando(true);
    try {
      await fetch('/api/animo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor, emociones: emocion ? [emocion] : [], contexto: 'check-in diario' }),
      });
      localStorage.setItem(STORAGE_KEY, new Date().toDateString());
      setGuardado(true);
      setTimeout(() => {
        setVisible(false);
        if (valor <= 3) router.push('/dashboard/chat');
      }, 1400);
    } catch {
      // Guardar fecha igual para no molestar si hay error de red
      localStorage.setItem(STORAGE_KEY, new Date().toDateString());
      setVisible(false);
    } finally {
      setGuardando(false);
    }
  };

  const omitir = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toDateString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
      onClick={e => { if (e.target === e.currentTarget) omitir(); }}
    >
      <div style={{ background: '#0d1a12', border: '1px solid #1a6b4a', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>

        {!guardado ? (
          <>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px', lineHeight: 1 }}>{animoEmoji(valor)}</div>
              <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'white', marginBottom: '6px' }}>¿Cómo estás hoy?</h2>
              <p style={{ fontSize: '13px', color: '#5a8a6a' }}>Check-in diario · 30 segundos</p>
            </div>

            {/* Valor */}
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '32px', fontWeight: '900', color: animoColor(valor) }}>{valor}</span>
              <span style={{ fontSize: '16px', color: '#5a8a6a' }}>/10</span>
              <span style={{ fontSize: '14px', color: animoColor(valor), marginLeft: '10px', fontWeight: '600' }}>{animoLabel(valor)}</span>
            </div>

            <input
              type="range" min={1} max={10} value={valor}
              onChange={e => setValor(+e.target.value)}
              style={{ width: '100%', accentColor: animoColor(valor), marginBottom: '24px', height: '6px', cursor: 'pointer' }}
            />

            {/* Emociones */}
            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontSize: '12px', color: '#5a8a6a', fontWeight: '600', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>¿Alguna emoción predominante?</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {EMOCIONES.map(e => (
                  <button
                    key={e}
                    onClick={() => setEmocion(prev => prev === e ? '' : e)}
                    style={{ padding: '6px 13px', borderRadius: '16px', border: `1px solid ${emocion === e ? '#2dd4bf' : '#2a3d2e'}`, background: emocion === e ? 'rgba(45,212,191,0.15)' : 'transparent', color: emocion === e ? '#2dd4bf' : '#5a8a6a', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', transition: 'all .15s' }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Mensaje de apoyo si está mal */}
            {valor <= 3 && (
              <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px' }}>
                <p style={{ fontSize: '13px', color: '#fca5a5', lineHeight: 1.5 }}>
                  Parece un día difícil. Después de registrar, te llevaré al chat para que puedas hablar con la IA. 💚
                </p>
              </div>
            )}

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={guardar}
                disabled={guardando}
                style={{ flex: 1, background: '#1a6b4a', color: 'white', padding: '13px', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity .15s', opacity: guardando ? 0.6 : 1 }}
              >
                {guardando ? 'Guardando...' : 'Registrar ánimo'}
              </button>
              <button
                onClick={omitir}
                style={{ padding: '13px 16px', background: 'transparent', color: '#3d5c48', borderRadius: '10px', border: '1px solid #1a2e1f', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
              >
                Omitir
              </button>
            </div>

            <p style={{ textAlign: 'center', fontSize: '11px', color: '#2a3d2e', marginTop: '16px' }}>
              🔒 Dato privado · Solo una vez al día
            </p>
          </>
        ) : (
          /* Estado guardado */
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>¡Registrado!</h3>
            <p style={{ fontSize: '14px', color: '#5a8a6a', lineHeight: 1.5 }}>
              {valor <= 3
                ? 'Te llevo al chat para que no estés solo/a...'
                : 'Tu ánimo de hoy quedó guardado. ¡Sigue adelante! 💚'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
