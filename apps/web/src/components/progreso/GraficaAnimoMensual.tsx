'use client';

import { useEffect, useState } from 'react';

type Registro = { valor: number; fecha: string };

const DIAS_CORTOS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

function barColor(v: number): string {
  return v >= 7 ? '#2dd4bf' : v >= 4 ? '#fbbf24' : '#f87171';
}

export default function GraficaAnimoMensual() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch('/api/animo?dias=28')
      .then(r => r.json())
      .then(d => { if (d.registros) setRegistros(d.registros); })
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return (
    <div style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '16px', padding: '24px', minHeight: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: '13px', color: '#3d5c48' }}>Cargando gráfica...</span>
    </div>
  );

  const dias28 = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (27 - i));
    const registrosDelDia = registros.filter(r => new Date(r.fecha).toDateString() === d.toDateString());
    const promedioDia = registrosDelDia.length
      ? registrosDelDia.reduce((a, r) => a + r.valor, 0) / registrosDelDia.length
      : null;
    return { fecha: d, dia: DIAS_CORTOS[d.getDay()], valor: promedioDia, esHoy: i === 27 };
  });

  const conDatos = dias28.filter(d => d.valor !== null);
  const promedioGeneral = conDatos.length
    ? (conDatos.reduce((a, d) => a + (d.valor ?? 0), 0) / conDatos.length).toFixed(1)
    : null;

  return (
    <div style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'white', marginBottom: '2px' }}>Tu ánimo — últimas 4 semanas</h2>
          <p style={{ fontSize: '12px', color: '#3d5c48' }}>
            {conDatos.length > 0
              ? `${conDatos.length} de 28 días registrados${promedioGeneral ? ` · promedio ${promedioGeneral}/10` : ''}`
              : 'Aún no hay registros en este período'}
          </p>
        </div>
      </div>

      {conDatos.length > 0 ? (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '90px' }}>
          {dias28.map((d, i) => (
            <div
              key={i}
              title={d.valor !== null ? `${d.fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}: ${d.valor.toFixed(1)}/10` : undefined}
              style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}
            >
              {d.valor !== null ? (
                <div
                  style={{
                    width: '100%',
                    borderRadius: '2px 2px 0 0',
                    background: d.esHoy ? barColor(d.valor) : `${barColor(d.valor)}99`,
                    height: `${Math.max((d.valor / 10) * 100, 4)}%`,
                    outline: d.esHoy ? `1.5px solid ${barColor(d.valor)}` : 'none',
                    transition: 'height .3s',
                  }}
                />
              ) : (
                <div style={{ width: '100%', height: '3px', background: '#1a2e1f', borderRadius: '2px' }} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: '12px', color: '#3d5c48', textAlign: 'center', padding: '20px 0' }}>
          Registra tu ánimo cada día para ver tu evolución del último mes.
        </p>
      )}
    </div>
  );
}
