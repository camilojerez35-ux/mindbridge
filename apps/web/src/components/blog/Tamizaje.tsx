'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TAMIZAJES, bandaPara, type TamizajeId } from '@/lib/blog/tamizajes';
import { LineasCrisis } from './LineasCrisis';

/**
 * Autoevaluación anónima. Las respuestas viven solo en el estado del componente:
 * no se guardan en storage ni se envían a ningún servidor (datos de salud — Ley 1581/2012).
 */
export function Tamizaje({ id }: { id: TamizajeId }) {
  const t = TAMIZAJES[id];
  const [abierto, setAbierto] = useState(false);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(() => t.items.map(() => null));
  const [verResultado, setVerResultado] = useState(false);

  const completas = respuestas.every(r => r !== null);
  const puntaje = respuestas.reduce<number>((acc, r) => acc + (r ?? 0), 0);
  const maximo = t.items.length * 3;
  const banda = bandaPara(t, puntaje);
  const alertaRiesgo = t.itemRiesgo !== undefined && (respuestas[t.itemRiesgo] ?? 0) > 0;

  function responder(i: number, valor: number) {
    setRespuestas(prev => prev.map((r, j) => (j === i ? valor : r)));
  }

  function reiniciar() {
    setRespuestas(t.items.map(() => null));
    setVerResultado(false);
  }

  const caja = { background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.22)', borderRadius: '18px', padding: '22px', margin: '8px 0 16px' } as const;

  if (!abierto) {
    return (
      <div style={caja}>
        <p style={{ fontSize: '11px', fontWeight: '800', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
          Autoevaluación · {t.nombre}
        </p>
        <p style={{ fontSize: '15px', color: '#e5f0ea', lineHeight: 1.6, marginBottom: '6px' }}>
          {t.items.length} preguntas sobre {t.mide} en las últimas 2 semanas. Toma unos 2 minutos.
        </p>
        <p style={{ fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
          🔒 Anónima: tus respuestas no se guardan ni se envían. Es una herramienta de cribado, no un diagnóstico.
        </p>
        <button type="button" onClick={() => setAbierto(true)} style={{ background: 'rgba(129,140,248,0.15)', color: '#c7d2fe', border: '1px solid rgba(129,140,248,0.4)', padding: '10px 22px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
          Hacer el {t.nombre} →
        </button>
      </div>
    );
  }

  return (
    <div style={caja}>
      <p style={{ fontSize: '11px', fontWeight: '800', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
        {t.nombre} · Anónimo, no se guarda
      </p>
      <p style={{ fontSize: '15px', fontWeight: '700', color: '#e5f0ea', lineHeight: 1.5, marginBottom: '18px' }}>{t.instruccion}</p>

      <ol style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {t.items.map((item, i) => (
          <li key={i}>
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: '8px' }}>
                <strong style={{ color: '#818cf8' }}>{i + 1}.</strong> {item}
              </legend>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px' }}>
                {t.opciones.map((op, valor) => {
                  const marcado = respuestas[i] === valor;
                  return (
                    <label key={op} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: marcado ? 'rgba(129,140,248,0.18)' : 'rgba(255,255,255,0.03)', border: `1px solid ${marcado ? 'rgba(129,140,248,0.55)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', padding: '8px 10px', fontSize: '12px', color: marcado ? 'white' : 'var(--ink-muted)' }}>
                      <input type="radio" name={`${t.id}-${i}`} checked={marcado} onChange={() => responder(i, valor)} style={{ accentColor: '#818cf8' }} />
                      {op}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>

      {/* La alerta de riesgo aparece apenas se marca, sin esperar al resultado */}
      {alertaRiesgo && (
        <div role="alert" style={{ marginTop: '18px' }}>
          <p style={{ fontSize: '14px', color: '#fca5a5', lineHeight: 1.6, marginBottom: '10px' }}>
            Gracias por responder con honestidad. Cuando aparecen pensamientos de muerte o de hacerse daño es importante hablar con alguien hoy, sin importar el puntaje total.
          </p>
          <LineasCrisis compacto />
        </div>
      )}

      {!verResultado ? (
        <button
          type="button"
          disabled={!completas}
          onClick={() => setVerResultado(true)}
          style={{ marginTop: '20px', background: completas ? 'linear-gradient(135deg,#4f46e5,#3730a3)' : 'rgba(255,255,255,0.05)', color: completas ? 'white' : 'var(--ink-subtle)', border: 'none', padding: '11px 24px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: completas ? 'pointer' : 'not-allowed' }}
        >
          {completas ? 'Ver resultado' : `Responde todas las preguntas (${respuestas.filter(r => r !== null).length}/${t.items.length})`}
        </button>
      ) : (
        <div aria-live="polite" style={{ marginTop: '20px', background: 'rgba(0,0,0,0.2)', border: `1px solid ${banda.color}55`, borderRadius: '14px', padding: '18px' }}>
          <p style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>Tu puntaje</p>
          <p style={{ fontSize: '30px', fontWeight: '900', color: banda.color, lineHeight: 1.2 }}>
            {puntaje} <span style={{ fontSize: '15px', color: 'var(--ink-subtle)' }}>de {maximo}</span>
          </p>
          <p style={{ fontSize: '16px', fontWeight: '800', color: 'white', margin: '4px 0 8px' }}>{banda.nivel}</p>
          <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: '12px' }}>{banda.mensaje}</p>
          <p style={{ fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.7, marginBottom: '12px' }}>
            <strong>Importante:</strong> este resultado es un tamizaje, no un diagnóstico. Solo un profesional de salud mental puede evaluar tu situación completa.
            {' '}{t.notaValidacion}
          </p>
          <p style={{ fontSize: '11px', color: 'var(--ink-subtle)', lineHeight: 1.7, marginBottom: '14px' }}>
            Fuentes:{' '}
            {t.fuentes.map((f, i) => (
              <span key={f.url}>{i > 0 && ' · '}<a href={f.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2dd4bf' }}>{f.titulo}</a></span>
            ))}
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link href="/blog/como-pedir-cita-con-psicologo-por-eps-en-colombia" style={{ background: 'linear-gradient(135deg,#1a6b4a,#0d5438)', color: 'white', padding: '10px 18px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '13px' }}>
              Cómo pedir cita →
            </Link>
            <button type="button" onClick={reiniciar} style={{ background: 'transparent', color: 'var(--ink-muted)', border: '1px solid rgba(255,255,255,0.12)', padding: '10px 18px', borderRadius: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
              Borrar respuestas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
