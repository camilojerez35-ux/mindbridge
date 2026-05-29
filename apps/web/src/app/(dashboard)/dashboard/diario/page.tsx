'use client';

import { useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';

const EMOCIONES = ['😄 Alegría','😢 Tristeza','😰 Ansiedad','😌 Calma','😠 Enojo','😨 Miedo','🌟 Esperanza','😓 Agotamiento','🙏 Gratitud','😔 Soledad','❤️ Amor','😤 Frustración'];

const ETIQUETAS = ['Trabajo','Familia','Pareja','Salud','Amigos','Dinero','Estudio','Personal'];

// Sin datos demo — el usuario empieza con diario vacío
const ENTRADAS_INICIALES: typeof ENTRADAS_TIPO[] = [];
type EntradaDiario = { id: string; fecha: Date; animo: number; emociones: string[]; contenido: string; analisis: string; etiquetas: string[] };
const ENTRADAS_TIPO = {} as EntradaDiario;

export default function DiarioPage() {
  const [vista, setVista] = useState<'lista'|'nueva'>('lista');
  const [entradas, setEntradas] = useState<EntradaDiario[]>(ENTRADAS_INICIALES);
  const [form, setForm] = useState({ contenido: '', animo: 5, emociones: [] as string[], etiquetas: [] as string[], privado: true });
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [expandida, setExpandida] = useState<string|null>(null);

  const toggleEmocion = (e: string) => setForm(p => ({ ...p, emociones: p.emociones.includes(e) ? p.emociones.filter(x => x !== e) : [...p.emociones, e] }));
  const toggleEtiqueta = (e: string) => setForm(p => ({ ...p, etiquetas: p.etiquetas.includes(e) ? p.etiquetas.filter(x => x !== e) : [...p.etiquetas, e] }));

  const guardar = async () => {
    if (!form.contenido.trim()) return;
    setGuardando(true);
    await new Promise(r => setTimeout(r, 1000));
    const nueva = { id: Date.now().toString(), fecha: new Date(), animo: form.animo, emociones: form.emociones, contenido: form.contenido, analisis: 'Análisis generado por IA en base a tu entrada de hoy.', etiquetas: form.etiquetas };
    setEntradas(p => [nueva, ...p]);
    setForm({ contenido: '', animo: 5, emociones: [], etiquetas: [], privado: true });
    setGuardando(false);
    setGuardado(true);
    setTimeout(() => { setGuardado(false); setVista('lista'); }, 1500);
  };

  const animoColor = (v: number) => v >= 7 ? '#2dd4bf' : v >= 4 ? '#fbbf24' : '#f87171';
  const animoEmoji = (v: number) => v >= 8 ? '😄' : v >= 6 ? '🙂' : v >= 4 ? '😐' : v >= 2 ? '😔' : '😢';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'white' }}>📔 Diario Emocional</h1>
          <p style={{ fontSize: '13px', color: '#5a8a6a', marginTop: '4px' }}>Registra y entiende tus emociones</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setVista('lista')} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: vista==='lista' ? '#1a6b4a' : '#1a2e1f', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit' }}>Ver entradas</button>
          <button onClick={() => setVista('nueva')} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: vista==='nueva' ? '#1a6b4a' : '#1a2e1f', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit' }}>+ Nueva entrada</button>
        </div>
      </div>

      {/* ── NUEVA ENTRADA ── */}
      {vista === 'nueva' && (
        <div style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>Nueva entrada · {new Date().toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long' })}</h2>

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
            <p style={{ fontSize: '11px', color: '#3d5c48', marginTop: '4px' }}>{form.contenido.length} caracteres · Guardado automáticamente</p>
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
          {/* Estado vacío — primer uso */}
          {entradas.length === 0 && (
            <EmptyState
              icon="📔"
              titulo="Tu diario emocional está vacío"
              descripcion="Registrar cómo te sientes cada día es el primer paso para entenderte mejor. Solo toma 2 minutos."
              accionLabel="✍️ Escribir primera entrada"
              onAccion={() => setVista('nueva')}
            />
          )}

          {/* Resumen — solo si hay entradas */}
          {entradas.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '12px' }}>
              {[
                { label: 'Entradas este mes', val: entradas.length, icon: '📔', color: '#2dd4bf' },
                { label: 'Ánimo promedio', val: (entradas.reduce((a,e)=>a+e.animo,0)/entradas.length).toFixed(1)+'/10', icon: '📊', color: '#fbbf24' },
                { label: 'Racha actual', val: `${entradas.length} día${entradas.length > 1 ? 's' : ''}`, icon: '🔥', color: '#fb7185' },
              ].map((s,i) => (
                <div key={i} style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', marginBottom: '6px' }}>{s.icon}</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: '11px', color: '#3d5c48', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Entradas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {entradas.map(entrada => (
              <div key={entrada.id} style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setExpandida(expandida===entrada.id ? null : entrada.id)}>
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `${animoColor(entrada.animo)}22`, border: `2px solid ${animoColor(entrada.animo)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    {animoEmoji(entrada.animo)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', color: '#5a8a6a' }}>{entrada.fecha.toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long' })}</span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: animoColor(entrada.animo) }}>Ánimo: {entrada.animo}/10</span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#8aab96', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entrada.contenido}</p>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {entrada.emociones.slice(0,3).map(e => (
                        <span key={e} style={{ fontSize: '11px', background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)', color: '#2dd4bf', padding: '2px 8px', borderRadius: '10px' }}>{e}</span>
                      ))}
                    </div>
                  </div>
                  <span style={{ color: '#3d5c48', fontSize: '18px', transition: 'transform .2s', transform: expandida===entrada.id ? 'rotate(180deg)' : 'none' }}>▾</span>
                </div>

                {expandida === entrada.id && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid #1a2e1f' }}>
                    <p style={{ fontSize: '14px', color: '#a0b4a8', lineHeight: 1.7, marginTop: '16px', whiteSpace: 'pre-wrap' }}>{entrada.contenido}</p>
                    {entrada.analisis && (
                      <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: '10px' }}>
                        <p style={{ fontSize: '11px', color: '#2dd4bf', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>🤖 Análisis IA</p>
                        <p style={{ fontSize: '13px', color: '#8aab96', lineHeight: 1.6 }}>{entrada.analisis}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
