'use client';

import { useEffect, useState } from 'react';
// Fuente canónica auditada — nunca hardcodear números de emergencia aquí
import { LINEAS_ACTIVAS, LINEAS_REGIONALES } from '@mindbridge/ai-clinical/config/lineas-emergencia';

const CIUDADES = [
  { value: 'bogota',       label: 'Bogotá' },
  { value: 'medellin',     label: 'Medellín' },
  { value: 'cali',         label: 'Cali' },
  { value: 'barranquilla', label: 'Barranquilla' },
  { value: 'bucaramanga',  label: 'Bucaramanga' },
  { value: 'otra',         label: 'Otra ciudad' },
];

const CLAVE_CIUDAD = 'mb_blog_ciudad';
const LINEA_COLORES = ['#2dd4bf', '#818cf8', '#f87171', '#fbbf24'];

function telefono(numero: string) {
  return `tel:${numero.replace(/\D/g, '')}`;
}

/** 6044444448 → 604 444 4448 · 3229643755 → 322 964 3755 (líneas cortas como 106 quedan igual) */
function formatear(numero: string) {
  const d = numero.replace(/\D/g, '');
  return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : numero;
}

export function LineasCrisis({ compacto = false }: { compacto?: boolean }) {
  const [ciudad, setCiudad] = useState('');

  // Preferencia de conveniencia por visitante; si el storage falla, se muestra sin ciudad
  useEffect(() => {
    try {
      const guardada = localStorage.getItem(CLAVE_CIUDAD);
      if (guardada && LINEAS_REGIONALES[guardada]) setCiudad(guardada);
    } catch { /* storage bloqueado */ }
  }, []);

  function elegir(valor: string) {
    setCiudad(valor);
    try { localStorage.setItem(CLAVE_CIUDAD, valor); } catch { /* storage bloqueado */ }
  }

  const regional = ciudad ? LINEAS_REGIONALES[ciudad] : undefined;
  // Si la línea local es la misma que una nacional ya listada, no la repetimos
  const regionalEsNueva = regional && !LINEAS_ACTIVAS.some(l => l.numero.replace(/\D/g, '') === regional.numero.replace(/\D/g, ''));

  return (
    <aside
      aria-label="Líneas de ayuda en crisis"
      style={{
        background: 'rgba(248,113,113,0.06)',
        border: '1px solid rgba(248,113,113,0.25)',
        borderRadius: '16px',
        padding: compacto ? '16px 18px' : '22px 24px',
      }}
    >
      <p style={{ fontSize: '14px', fontWeight: '800', color: '#fca5a5', marginBottom: '6px' }}>
        ¿Estás en peligro o piensas en hacerte daño?
      </p>
      <p style={{ fontSize: '13px', color: '#c9a3a3', lineHeight: 1.6, marginBottom: '14px' }}>
        No estás solo. Llama ahora, las líneas son gratuitas:
      </p>

      <label htmlFor={compacto ? 'ciudad-crisis-c' : 'ciudad-crisis'} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#c9a3a3', marginBottom: '12px' }}>
        ¿En qué ciudad estás?
        <select
          id={compacto ? 'ciudad-crisis-c' : 'ciudad-crisis'}
          value={ciudad}
          onChange={e => elegir(e.target.value)}
          style={{ background: '#101a14', color: 'white', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 10px', fontSize: '13px' }}
        >
          <option value="">Selecciona tu ciudad</option>
          {CIUDADES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
        {regional && regionalEsNueva && (
          <a
            href={telefono(regional.numero)}
            style={{ display: 'block', background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.4)', borderRadius: '10px', padding: '10px 12px', textDecoration: 'none' }}
          >
            <span style={{ display: 'block', fontSize: '17px', fontWeight: '900', color: '#fca5a5' }}>{formatear(regional.numero)}</span>
            <span style={{ display: 'block', fontSize: '11px', color: '#e5c4c4', lineHeight: 1.4 }}>📍 {regional.nombre}</span>
          </a>
        )}
        {LINEAS_ACTIVAS.map((l, i) => {
          const esLocal = regional && l.numero.replace(/\D/g, '') === regional.numero.replace(/\D/g, '');
          return (
            <a
              key={l.numero}
              href={telefono(l.numero)}
              style={{ display: 'block', background: 'rgba(255,255,255,0.03)', border: `1px solid ${esLocal ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', padding: '10px 12px', textDecoration: 'none' }}
            >
              <span style={{ display: 'block', fontSize: '17px', fontWeight: '900', color: LINEA_COLORES[i % LINEA_COLORES.length] }}>{formatear(l.numero)}</span>
              <span style={{ display: 'block', fontSize: '11px', color: '#8aab96', lineHeight: 1.4 }}>
                {esLocal ? `📍 ${regional.nombre}` : l.nombre} · {l.disponibilidad}
              </span>
            </a>
          );
        })}
      </div>
    </aside>
  );
}
