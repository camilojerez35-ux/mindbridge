'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Registro = { valor: number; emociones: string[]; fecha: string };

type Semana = { promedio: number; dias: number };

function calcularRacha(registros: Registro[]): number {
  if (!registros.length) return 0;
  const diasConRegistro = new Set(
    registros.map(r => new Date(r.fecha).toDateString())
  );
  let racha = 0;
  const cursor = new Date();
  // Si hoy no tiene registro, empieza desde ayer
  if (!diasConRegistro.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (diasConRegistro.has(cursor.toDateString())) {
    racha++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return racha;
}

function calcularSemana(registros: Registro[], desdeHace: number, hasta: number): Semana {
  const ahora = Date.now();
  const filtrados = registros.filter(r => {
    const diff = (ahora - new Date(r.fecha).getTime()) / 86400000;
    return diff >= desdeHace && diff < hasta;
  });
  const diasUnicos = new Set(filtrados.map(r => new Date(r.fecha).toDateString())).size;
  const promedio = filtrados.length
    ? parseFloat((filtrados.reduce((a, r) => a + r.valor, 0) / filtrados.length).toFixed(1))
    : 0;
  return { promedio, dias: diasUnicos };
}

function generarInsight(semanaActual: Semana, semanaAnterior: Semana, racha: number, registros: Registro[]): string {
  if (!registros.length) return 'Registra tu ánimo diariamente para recibir insights personalizados.';

  const diff = semanaActual.promedio - semanaAnterior.promedio;

  // Emoción más frecuente esta semana
  const ahora = Date.now();
  const emocionesRecientes = registros
    .filter(r => (ahora - new Date(r.fecha).getTime()) / 86400000 < 7)
    .flatMap(r => r.emociones);
  const frecuencia = emocionesRecientes.reduce<Record<string, number>>((a, e) => {
    a[e] = (a[e] ?? 0) + 1; return a;
  }, {});
  const emocionTop = Object.entries(frecuencia).sort((a, b) => b[1] - a[1])[0]?.[0];

  if (racha >= 7) return `🔥 ¡${racha} días seguidos registrando! Eso requiere disciplina real. Sigue así.`;
  if (semanaActual.promedio >= 7 && diff > 0) return `📈 Tu ánimo mejoró ${diff.toFixed(1)} puntos vs la semana pasada. ¿Qué estuvo haciendo bien?`;
  if (semanaActual.promedio < 5 && semanaAnterior.promedio > 0) return `💬 Ha sido una semana difícil. Hablar con alguien puede ayudar — el chat está disponible 24/7.`;
  if (diff < -1.5 && semanaAnterior.promedio > 0) return `⚠️ Tu ánimo bajó ${Math.abs(diff).toFixed(1)} puntos esta semana. Considera hacer un ejercicio de respiración o escribir en el diario.`;
  if (emocionTop?.includes('Ansi')) return `😰 La ansiedad apareció seguido esta semana. Los ejercicios de respiración y grounding pueden ayudar.`;
  if (emocionTop?.includes('Agot')) return `😓 Varias entradas con agotamiento. Revisar el sueño y los descansos puede marcar la diferencia.`;
  if (semanaActual.dias < 3 && semanaActual.dias > 0) return `📅 Registraste ${semanaActual.dias} de 7 días esta semana. La constancia es clave para ver patrones.`;
  return `✨ Promedio de ${semanaActual.promedio}/10 esta semana. Registra cada día para ver tu tendencia completa.`;
}

const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function RachaBienestar() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch('/api/animo?dias=60')
      .then(r => r.json())
      .then(d => { if (d.registros) setRegistros(d.registros); })
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return (
    <div style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '16px', padding: '24px', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: '13px', color: '#3d5c48' }}>Cargando progreso...</span>
    </div>
  );

  const racha = calcularRacha(registros);
  const semanaActual = calcularSemana(registros, 0, 7);
  const semanaAnterior = calcularSemana(registros, 7, 14);
  const insight = generarInsight(semanaActual, semanaAnterior, racha, registros);

  const tendencia = semanaAnterior.promedio > 0
    ? semanaActual.promedio - semanaAnterior.promedio
    : null;

  // Últimos 7 días para mini gráfica
  const ultimos7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const registrosDelDia = registros.filter(r => new Date(r.fecha).toDateString() === d.toDateString());
    const promedioDia = registrosDelDia.length
      ? registrosDelDia.reduce((a, r) => a + r.valor, 0) / registrosDelDia.length
      : null;
    return { dia: DIAS_CORTOS[d.getDay()], valor: promedioDia, esHoy: i === 6 };
  });

  const maxBarVal = Math.max(...ultimos7.map(d => d.valor ?? 0), 10);
  const barColor = (v: number) => v >= 7 ? '#2dd4bf' : v >= 4 ? '#fbbf24' : '#f87171';

  const tendenciaColor = tendencia === null ? '#5a8a6a' : tendencia > 0 ? '#2dd4bf' : tendencia < 0 ? '#f87171' : '#fbbf24';
  const tendenciaIcon = tendencia === null ? '—' : tendencia > 0 ? '↑' : tendencia < 0 ? '↓' : '→';
  const tendenciaTexto = tendencia === null
    ? 'Sin datos semana anterior'
    : tendencia > 0
      ? `+${tendencia.toFixed(1)} vs semana pasada`
      : tendencia < 0
        ? `${tendencia.toFixed(1)} vs semana pasada`
        : 'Igual que la semana pasada';

  return (
    <div style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'white', marginBottom: '2px' }}>Racha y resumen semanal</h2>
          <p style={{ fontSize: '12px', color: '#3d5c48' }}>Últimos 7 días</p>
        </div>
        <Link href="/dashboard/progreso" style={{ fontSize: '12px', color: '#2dd4bf', textDecoration: 'none', fontWeight: '600' }}>
          Ver detalle →
        </Link>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>

        {/* Racha */}
        <div style={{ background: '#0a130d', border: `1px solid ${racha >= 3 ? 'rgba(251,113,133,0.3)' : '#1a2e1f'}`, borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>{racha >= 7 ? '🔥' : racha >= 3 ? '⚡' : '💫'}</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: racha >= 3 ? '#fb7185' : '#5a8a6a', lineHeight: 1 }}>{racha}</div>
          <div style={{ fontSize: '11px', color: '#3d5c48', marginTop: '3px' }}>día{racha !== 1 ? 's' : ''} de racha</div>
        </div>

        {/* Promedio semanal */}
        <div style={{ background: '#0a130d', border: '1px solid #1a2e1f', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>📊</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: semanaActual.promedio >= 7 ? '#2dd4bf' : semanaActual.promedio >= 4 ? '#fbbf24' : semanaActual.promedio > 0 ? '#f87171' : '#3d5c48', lineHeight: 1 }}>
            {semanaActual.promedio > 0 ? semanaActual.promedio : '—'}
          </div>
          <div style={{ fontSize: '11px', color: '#3d5c48', marginTop: '3px' }}>promedio /10</div>
        </div>

        {/* Tendencia */}
        <div style={{ background: '#0a130d', border: '1px solid #1a2e1f', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>📈</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: tendenciaColor, lineHeight: 1 }}>{tendenciaIcon}</div>
          <div style={{ fontSize: '10px', color: '#3d5c48', marginTop: '3px', lineHeight: 1.3 }}>{tendenciaTexto}</div>
        </div>
      </div>

      {/* Mini gráfica de barras */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '60px', marginBottom: '6px' }}>
          {ultimos7.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              {d.valor !== null ? (
                <div
                  title={`${d.dia}: ${d.valor.toFixed(1)}/10`}
                  style={{
                    width: '100%',
                    borderRadius: '3px 3px 0 0',
                    background: d.esHoy
                      ? `linear-gradient(to top, ${barColor(d.valor)}, ${barColor(d.valor)})`
                      : `linear-gradient(to top, ${barColor(d.valor)}88, ${barColor(d.valor)}44)`,
                    height: `${(d.valor / maxBarVal) * 100}%`,
                    minHeight: '4px',
                    outline: d.esHoy ? `2px solid ${barColor(d.valor)}` : 'none',
                    outlineOffset: '1px',
                    transition: 'height .3s',
                  }}
                />
              ) : (
                <div style={{ width: '100%', height: '4px', background: '#1a2e1f', borderRadius: '2px' }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {ultimos7.map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '10px', color: d.esHoy ? '#8aab96' : '#3d5c48', fontWeight: d.esHoy ? '700' : '400' }}>
              {d.dia}
            </div>
          ))}
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '12px 16px', background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.12)', borderRadius: '10px' }}>
        <p style={{ fontSize: '13px', color: '#8aab96', lineHeight: 1.6, margin: 0 }}>{insight}</p>
      </div>

      {/* CTA si no hay datos */}
      {registros.length === 0 && (
        <p style={{ fontSize: '12px', color: '#3d5c48', textAlign: 'center' }}>
          Registra tu primer ánimo para comenzar a ver tu racha.
        </p>
      )}
    </div>
  );
}
