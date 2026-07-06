'use client';

import { useState, useEffect, useCallback } from 'react';
import EmptyState from '@/components/ui/EmptyState';

const EMOCIONES = ['😄 Alegría','😢 Tristeza','😰 Ansiedad','😌 Calma','😠 Enojo','😨 Miedo','🌟 Esperanza','😓 Agotamiento','🙏 Gratitud','😔 Soledad','❤️ Amor','😤 Frustración'];
const ETIQUETAS = ['Trabajo','Familia','Pareja','Salud','Amigos','Dinero','Estudio','Personal'];

type EntradaLista = {
  id: string;
  estadoAnimo: number;
  emociones: string[];
  etiquetas: string[];
  analisisIA: string | null;
  esFavorito: boolean;
  createdAt: string;
};

type EntradaDetalle = EntradaLista & { contenido: string };

export default function DiarioPage() {
  const [vista, setVista] = useState<'lista' | 'nueva'>('lista');
  const [entradas, setEntradas] = useState<EntradaLista[]>([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState({ contenido: '', animo: 5, emociones: [] as string[], etiquetas: [] as string[], privado: true });
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandida, setExpandida] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<Record<string, EntradaDetalle>>({});
  const [cargandoDetalle, setCargandoDetalle] = useState<string | null>(null);

  const cargarEntradas = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch('/api/diario?limite=50');
      const data = await res.json();
      if (res.ok) setEntradas(data.entradas ?? []);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarEntradas(); }, [cargarEntradas]);

  const toggleEmocion = (e: string) => setForm(p => ({ ...p, emociones: p.emociones.includes(e) ? p.emociones.filter(x => x !== e) : [...p.emociones, e] }));
  const toggleEtiqueta = (e: string) => setForm(p => ({ ...p, etiquetas: p.etiquetas.includes(e) ? p.etiquetas.filter(x => x !== e) : [...p.etiquetas, e] }));

  const guardar = async () => {
    if (!form.contenido.trim()) return;
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch('/api/diario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido: form.contenido, animo: form.animo, emociones: form.emociones, etiquetas: form.etiquetas }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Error al guardar'); return; }
      setEntradas(p => [data.entrada, ...p]);
      setForm({ contenido: '', animo: 5, emociones: [], etiquetas: [], privado: true });
      setGuardado(true);
      setTimeout(() => { setGuardado(false); setVista('lista'); }, 1500);
    } catch {
      setError('No se pudo conectar. Verifica tu conexión.');
    } finally {
      setGuardando(false);
    }
  };

  const toggleExpansion = async (id: string) => {
    if (expandida === id) { setExpandida(null); return; }
    setExpandida(id);
    if (detalle[id]) return;
    setCargandoDetalle(id);
    try {
      const res = await fetch(`/api/diario/${id}`);
      const data = await res.json();
      if (res.ok) setDetalle(p => ({ ...p, [id]: data.entrada }));
    } finally {
      setCargandoDetalle(null);
    }
  };

  const animoColor = (v: number) => v >= 7 ? '#2dd4bf' : v >= 4 ? '#fbbf24' : '#f87171';
  const animoEmoji = (v: number) => v >= 8 ? '😄' : v >= 6 ? '🙂' : v >= 4 ? '😐' : v >= 2 ? '😔' : '😢';
  const formatFecha = (iso: string) => new Date(iso).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

  const promedio = entradas.length ? (entradas.reduce((a, e) => a + e.estadoAnimo, 0) / entradas.length).toFixed(1) : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'white' }}>📔 Diario Emocional</h1>
          <p style={{ fontSize: '13px', color: '#5a8a6a', marginTop: '4px' }}>Registra y entiende tus emociones</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setVista('lista')} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: vista === 'lista' ? '#1a6b4a' : '#1a2e1f', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit' }}>Ver entradas</button>
          <button onClick={() => setVista('nueva')} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: vista === 'nueva' ? '#1a6b4a' : '#1a2e1f', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit' }}>+ Nueva entrada</button>
        </div>
      </div>

      {/* ── NUEVA ENTRADA ── */}
      {vista === 'nueva' && (
        <div style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>Nueva entrada · {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>

          {/* Ánimo */}
          <div>
            <label style={{ fontSize: '13px', color: '#8aab96', fontWeight: '600', display: 'block', marginBottom: '10px' }}>¿Cómo está tu ánimo hoy? {animoEmoji(form.animo)} {form.animo}/10</label>
            <input type="range" min={1} max={10} value={form.animo} onChange={e => setForm(p => ({ ...p, animo: +e.target.value }))} style={{ width: '100%', accentColor: animoColor(form.animo) }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#3d5c48', marginTop: '4px' }}>
              <span>😢 Muy mal</span><span>😄 Excelente</span>
            </div>
          </div>

          {/* Emociones */}
          <div>
            <label style={{ fontSize: '13px', color: '#8aab96', fontWeight: '600', display: 'block', marginBottom: '10px' }}>¿Qué emociones sientes? (elige las que apliquen)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {EMOCIONES.map(e => (
                <button key={e} onClick={() => toggleEmocion(e)} style={{ padding: '7px 14px', borderRadius: '20px', border: `1px solid ${form.emociones.includes(e) ? '#2dd4bf' : '#2a3d2e'}`, background: form.emociones.includes(e) ? 'rgba(45,212,191,0.15)' : 'transparent', color: form.emociones.includes(e) ? '#2dd4bf' : '#5a8a6a', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', transition: 'all .15s' }}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Texto */}
          <div>
            <label style={{ fontSize: '13px', color: '#8aab96', fontWeight: '600', display: 'block', marginBottom: '8px' }}>¿Qué está pasando? ¿Cómo te sientes?</label>
            <textarea
              value={form.contenido}
              onChange={e => setForm(p => ({ ...p, contenido: e.target.value }))}
              placeholder="Escribe libremente... este es tu espacio seguro. Todo lo que escribas es privado y está cifrado."
              rows={6}
              style={{ width: '100%', background: '#141f17', border: '1px solid #2a3d2e', borderRadius: '10px', padding: '14px', color: 'white', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7, outline: 'none' }}
            />
            <p style={{ fontSize: '11px', color: '#3d5c48', marginTop: '4px' }}>{form.contenido.length} / 5000 caracteres · 🔒 Cifrado extremo a extremo</p>
          </div>

          {/* Etiquetas */}
          <div>
            <label style={{ fontSize: '13px', color: '#8aab96', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Etiquetas (opcional)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ETIQUETAS.map(e => (
                <button key={e} onClick={() => toggleEtiqueta(e)} style={{ padding: '5px 12px', borderRadius: '20px', border: `1px solid ${form.etiquetas.includes(e) ? '#818cf8' : '#2a3d2e'}`, background: form.etiquetas.includes(e) ? 'rgba(129,140,248,0.15)' : 'transparent', color: form.etiquetas.includes(e) ? '#818cf8' : '#5a8a6a', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', color: '#f87171', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {/* Acciones */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={guardar} disabled={!form.contenido.trim() || guardando} style={{ background: '#1a6b4a', color: 'white', padding: '12px 28px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', opacity: !form.contenido.trim() ? 0.5 : 1 }}>
              {guardando ? 'Guardando...' : guardado ? '✅ Guardado' : '💾 Guardar entrada'}
            </button>
            <button onClick={() => setVista('lista')} style={{ background: '#1a2e1f', color: '#5a8a6a', padding: '12px 20px', borderRadius: '8px', border: '1px solid #2a3d2e', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>Cancelar</button>
            <label style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', marginLeft: 'auto', fontSize: '13px', color: '#5a8a6a' }}>
              <input type="checkbox" checked={form.privado} onChange={e => setForm(p => ({ ...p, privado: e.target.checked }))} style={{ accentColor: '#2dd4bf' }} />
              🔒 Entrada privada
            </label>
          </div>
        </div>
      )}

      {/* ── LISTA ── */}
      {vista === 'lista' && (
        <>
          {cargando && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#5a8a6a', fontSize: '14px' }}>Cargando entradas...</div>
          )}

          {!cargando && entradas.length === 0 && (
            <EmptyState
              icon="📔"
              titulo="Tu diario emocional está vacío"
              descripcion="Registrar cómo te sientes cada día es el primer paso para entenderte mejor. Solo toma 2 minutos."
              accionLabel="✍️ Escribir primera entrada"
              onAccion={() => setVista('nueva')}
            />
          )}

          {!cargando && entradas.length > 0 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '12px' }}>
                {[
                  { label: 'Entradas totales', val: entradas.length, icon: '📔', color: '#2dd4bf' },
                  { label: 'Ánimo promedio', val: `${promedio}/10`, icon: '📊', color: '#fbbf24' },
                  { label: 'Emoción frecuente', val: (() => { const todas = entradas.flatMap(e => e.emociones); if (!todas.length) return '—'; const freq = todas.reduce<Record<string,number>>((a, e) => { a[e] = (a[e] ?? 0) + 1; return a; }, {}); return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0].split(' ')[0]; })(), icon: '💭', color: '#a78bfa' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>{s.icon}</div>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: s.color, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: '11px', color: '#3d5c48', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {entradas.map(entrada => (
                  <div key={entrada.id} style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => toggleExpansion(entrada.id)}>
                    <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `${animoColor(entrada.estadoAnimo)}22`, border: `2px solid ${animoColor(entrada.estadoAnimo)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                        {animoEmoji(entrada.estadoAnimo)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', color: '#5a8a6a' }}>{formatFecha(entrada.createdAt)}</span>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: animoColor(entrada.estadoAnimo) }}>Ánimo: {entrada.estadoAnimo}/10</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                          {entrada.emociones.slice(0, 3).map(e => (
                            <span key={e} style={{ fontSize: '11px', background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)', color: '#2dd4bf', padding: '2px 8px', borderRadius: '10px' }}>{e}</span>
                          ))}
                          {entrada.etiquetas.slice(0, 2).map(e => (
                            <span key={e} style={{ fontSize: '11px', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', color: '#818cf8', padding: '2px 8px', borderRadius: '10px' }}>{e}</span>
                          ))}
                        </div>
                      </div>
                      <span style={{ color: '#3d5c48', fontSize: '18px', transition: 'transform .2s', transform: expandida === entrada.id ? 'rotate(180deg)' : 'none' }}>▾</span>
                    </div>

                    {expandida === entrada.id && (
                      <div style={{ padding: '0 20px 20px', borderTop: '1px solid #1a2e1f' }}>
                        {cargandoDetalle === entrada.id && (
                          <p style={{ fontSize: '13px', color: '#5a8a6a', marginTop: '16px' }}>Cargando...</p>
                        )}
                        {detalle[entrada.id] && (
                          <>
                            <p style={{ fontSize: '14px', color: '#a0b4a8', lineHeight: 1.7, marginTop: '16px', whiteSpace: 'pre-wrap' }}>{detalle[entrada.id].contenido}</p>
                            {entrada.analisisIA && (
                              <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: '10px' }}>
                                <p style={{ fontSize: '11px', color: '#2dd4bf', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>🤖 Análisis IA</p>
                                <p style={{ fontSize: '13px', color: '#8aab96', lineHeight: 1.6 }}>{entrada.analisisIA}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
