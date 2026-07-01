'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import EmptyState from '@/components/ui/EmptyState';
import ResumenSemanal from '@/components/progreso/ResumenSemanal';

type RegistroAnimo = { id: string; valor: number; emociones: string[]; nota: string | null; contexto: string | null; fecha: string };
type ResultadoTest  = { testId: string; puntajeTotal: number; resultadoTitulo: string; createdAt: string };

const EMOCIONES_RAPIDAS = ['😰 Ansioso/a', '😌 Tranquilo/a', '😢 Triste', '😄 Feliz', '😤 Frustrado/a', '🙏 Agradecido/a'];
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function ProgresoPage() {
  const [modalAnimo, setModalAnimo]       = useState(false);
  const [animoHoy, setAnimoHoy]           = useState(7);
  const [emocionHoy, setEmocionHoy]       = useState('');
  const [registros, setRegistros]         = useState<RegistroAnimo[]>([]);
  const [estadisticas, setEstadisticas]   = useState({ promedio: 0, total: 0, mejor: 0, peor: 0 });
  const [resultadosTest, setResultadosTest] = useState<ResultadoTest[]>([]);
  const [cargando, setCargando]           = useState(true);
  const [guardando, setGuardando]         = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [rangoVista, setRangoVista]       = useState<7 | 30>(30);
  const [rangoLargo, setRangoLargo]       = useState<90 | 180>(90);
  const [registrosLargo, setRegistrosLargo] = useState<RegistroAnimo[]>([]);
  const [cargandoLargo, setCargandoLargo] = useState(false);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [animoRes, testRes] = await Promise.all([
        fetch('/api/animo?dias=30'),
        fetch('/api/tests/resultado?historial=true').catch(() => null),
      ]);
      const animoData = await animoRes.json();
      if (animoRes.ok) {
        setRegistros(animoData.registros ?? []);
        if (animoData.estadisticas) setEstadisticas(animoData.estadisticas);
      }
      if (testRes?.ok) {
        const testData = await testRes.json();
        setResultadosTest(testData.resultados ?? []);
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const cargarDatosLargo = useCallback(async (dias: 90 | 180) => {
    setCargandoLargo(true);
    try {
      const res = await fetch(`/api/animo?dias=${dias}`);
      if (res.ok) {
        const data = await res.json();
        setRegistrosLargo(data.registros ?? []);
      }
    } finally {
      setCargandoLargo(false);
    }
  }, []);

  useEffect(() => { cargarDatosLargo(rangoLargo); }, [rangoLargo, cargarDatosLargo]);

  const registrarAnimo = async () => {
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch('/api/animo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor: animoHoy, emociones: emocionHoy ? [emocionHoy] : [] }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Error al guardar'); return; }
      setRegistros(prev => [data.registro, ...prev]);
      setEstadisticas(prev => {
        const todos = [animoHoy, ...registros.map(r => r.valor)];
        return {
          promedio: parseFloat((todos.reduce((a, v) => a + v, 0) / todos.length).toFixed(1)),
          total: todos.length,
          mejor: Math.max(...todos),
          peor: Math.min(...todos),
        };
      });
      setModalAnimo(false);
      setEmocionHoy('');
    } catch {
      setError('No se pudo conectar. Verifica tu conexión.');
    } finally {
      setGuardando(false);
    }
  };

  const animoColor = (v: number) => v >= 7 ? '#2dd4bf' : v >= 4 ? '#fbbf24' : '#f87171';
  const animoEmoji = (v: number) => v >= 8 ? '😄' : v >= 6 ? '🙂' : v >= 4 ? '😐' : '😔';

  // Gráfica N días
  const datosGrafica = (() => {
    const hoy = new Date();
    return Array.from({ length: rangoVista }, (_, i) => {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() - (rangoVista - 1 - i));
      const registro = registros.find(r => new Date(r.fecha).toDateString() === d.toDateString());
      return {
        dia: rangoVista === 7 ? DIAS[d.getDay()] : d.getDate().toString(),
        valor: registro?.valor ?? null,
        fecha: d,
      };
    });
  })();

  // Comparación semana actual vs semana pasada
  const comparacionSemanal = (() => {
    const hoy = new Date();
    const inicioEsta = new Date(hoy); inicioEsta.setDate(hoy.getDate() - 6);
    const inicioPasada = new Date(hoy); inicioPasada.setDate(hoy.getDate() - 13);
    const finPasada = new Date(hoy); finPasada.setDate(hoy.getDate() - 7);

    const esta = registros.filter(r => new Date(r.fecha) >= inicioEsta);
    const pasada = registros.filter(r => {
      const d = new Date(r.fecha);
      return d >= inicioPasada && d <= finPasada;
    });

    const promEsta = esta.length ? esta.reduce((s, r) => s + r.valor, 0) / esta.length : null;
    const promPasada = pasada.length ? pasada.reduce((s, r) => s + r.valor, 0) / pasada.length : null;
    const diferencia = promEsta !== null && promPasada !== null ? promEsta - promPasada : null;

    return { promEsta, promPasada, diferencia };
  })();

  // Top emociones del mes
  const topEmociones = (() => {
    const conteo: Record<string, number> = {};
    registros.forEach(r => r.emociones.forEach(e => { conteo[e] = (conteo[e] ?? 0) + 1; }));
    return Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 5);
  })();

  // Correlaciones emoción → ánimo promedio
  const correlaciones = (() => {
    const mapa: Record<string, number[]> = {};
    registros.forEach(r => r.emociones.forEach(e => {
      if (!mapa[e]) mapa[e] = [];
      mapa[e].push(r.valor);
    }));
    return Object.entries(mapa)
      .filter(([, vals]) => vals.length >= 2)
      .map(([emocion, vals]) => ({
        emocion,
        promedio: parseFloat((vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1)),
        veces: vals.length,
      }))
      .sort((a, b) => b.veces - a.veces)
      .slice(0, 5);
  })();

  // Promedios mensuales para vista largo plazo
  const promediosMensuales = (() => {
    const meses: Record<string, number[]> = {};
    registrosLargo.forEach(r => {
      const d = new Date(r.fecha);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!meses[key]) meses[key] = [];
      meses[key].push(r.valor);
    });
    return Object.entries(meses)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, vals]) => {
        const [year, month] = key.split('-');
        const label = new Date(+year, +month - 1, 1).toLocaleDateString('es-CO', { month: 'short', year: '2-digit' });
        return {
          key,
          label,
          promedio: parseFloat((vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1)),
          registros: vals.length,
        };
      });
  })();

  // Tendencia largo plazo: pendiente de regresión lineal simple
  const tendenciaLP = (() => {
    if (promediosMensuales.length < 2) return null;
    const n = promediosMensuales.length;
    const xs = promediosMensuales.map((_, i) => i);
    const ys = promediosMensuales.map(m => m.promedio);
    const sumX  = xs.reduce((s, v) => s + v, 0);
    const sumY  = ys.reduce((s, v) => s + v, 0);
    const sumXY = xs.reduce((s, v, i) => s + v * ys[i], 0);
    const sumX2 = xs.reduce((s, v) => s + v * v, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  })();

  // Tendencia de tests — agrupar por testId
  const tendenciaTests = (() => {
    const agrupados: Record<string, { fecha: string; puntaje: number }[]> = {};
    resultadosTest.forEach(r => {
      if (!agrupados[r.testId]) agrupados[r.testId] = [];
      agrupados[r.testId].push({ fecha: r.createdAt, puntaje: r.puntajeTotal });
    });
    return Object.entries(agrupados)
      .filter(([, arr]) => arr.length >= 2)
      .map(([testId, arr]) => {
        const sorted = arr.sort((a, b) => a.fecha.localeCompare(b.fecha));
        const diff = sorted[sorted.length - 1].puntaje - sorted[0].puntaje;
        return { testId, primero: sorted[0], ultimo: sorted[sorted.length - 1], diff, veces: sorted.length };
      });
  })();

  const tieneRegistros = registros.length > 0;
  const maxVal = Math.max(...datosGrafica.map(d => d.valor ?? 0), 10);

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">📈 Seguimiento de Progreso</h1>
          <p className="text-sm text-gray-600 mt-1">Monitorea tu bienestar emocional en el tiempo</p>
        </div>
        <button
          onClick={() => setModalAnimo(true)}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold rounded-xl transition-colors"
        >
          + Registrar ánimo
        </button>
      </div>

      {cargando && (
        <div className="text-center py-10 text-gray-600 text-sm">Cargando datos...</div>
      )}

      {!cargando && !tieneRegistros && (
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

      {/* Resumen semanal con IA — siempre visible si hay datos */}
      {!cargando && <ResumenSemanal />}

      {!cargando && tieneRegistros && (
        <>
          {/* Stats principales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Ánimo promedio', val: `${estadisticas.promedio}/10`, icon: '📊', color: animoColor(estadisticas.promedio) },
              { label: 'Mejor registro', val: `${estadisticas.mejor}/10`, icon: '🌟', color: '#fbbf24' },
              { label: 'Días registrados', val: estadisticas.total, icon: '🔥', color: '#fb7185' },
              { label: 'Peor día', val: `${estadisticas.peor}/10`, icon: '🌧️', color: '#f87171' },
            ].map((s, i) => (
              <div key={i} className="bg-[#0d1a12] border border-white/5 rounded-xl p-4 text-center">
                <div className="text-xl mb-1.5">{s.icon}</div>
                <div className="text-xl font-black" style={{ color: s.color }}>{s.val}</div>
                <div className="text-[10px] text-gray-700 mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Comparación semanal */}
          {comparacionSemanal.promEsta !== null && (
            <div className="bg-[#0d1a12] border border-white/5 rounded-xl p-5">
              <h2 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Esta semana vs. semana pasada</h2>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="text-center">
                  <div className="text-2xl font-black" style={{ color: animoColor(comparacionSemanal.promEsta) }}>
                    {comparacionSemanal.promEsta.toFixed(1)}
                  </div>
                  <div className="text-[11px] text-gray-600 mt-1">Esta semana</div>
                </div>
                {comparacionSemanal.promPasada !== null && (
                  <>
                    <div className="text-gray-700 text-lg">→</div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-gray-500">{comparacionSemanal.promPasada.toFixed(1)}</div>
                      <div className="text-[11px] text-gray-600 mt-1">Semana pasada</div>
                    </div>
                    {comparacionSemanal.diferencia !== null && (
                      <div className={`px-3 py-1.5 rounded-xl text-sm font-bold ${comparacionSemanal.diferencia >= 0 ? 'bg-teal-500/10 text-teal-400' : 'bg-red-500/10 text-red-400'}`}>
                        {comparacionSemanal.diferencia >= 0 ? '+' : ''}{comparacionSemanal.diferencia.toFixed(1)} puntos
                      </div>
                    )}
                  </>
                )}
                {comparacionSemanal.promPasada === null && (
                  <p className="text-gray-600 text-sm">Registra más días para ver la comparación</p>
                )}
              </div>
            </div>
          )}

          {/* Gráfica con toggle 7/30 días */}
          <div className="bg-[#0d1a12] border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white">Evolución del ánimo</h2>
              <div className="flex rounded-lg overflow-hidden border border-white/8">
                {([7, 30] as const).map(n => (
                  <button
                    key={n}
                    onClick={() => setRangoVista(n)}
                    className={`px-3 py-1.5 text-xs font-semibold transition-colors ${rangoVista === n ? 'bg-teal-600 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                  >
                    {n}d
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end gap-1 h-28 mb-2">
              {datosGrafica.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  {d.valor !== null ? (
                    <div
                      title={`${d.dia}: ${d.valor}/10`}
                      className="w-full rounded-sm transition-all duration-300"
                      style={{
                        background: `linear-gradient(to top, ${animoColor(d.valor)}, ${animoColor(d.valor)}88)`,
                        height: `${(d.valor / maxVal) * 100}%`,
                        minHeight: '4px',
                      }}
                    />
                  ) : (
                    <div className="w-full h-1 bg-white/5 rounded-sm" />
                  )}
                </div>
              ))}
            </div>

            {/* Labels — solo mostrar algunos en vista de 30 días */}
            <div className="flex gap-1">
              {datosGrafica.map((d, i) => (
                <div key={i} className="flex-1 text-center" style={{ fontSize: '9px', color: d.valor ? '#6b9e80' : '#2a3d2e' }}>
                  {rangoVista === 7 ? d.dia : (i % 5 === 0 ? d.dia : '')}
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-3 justify-center flex-wrap">
              {([['#2dd4bf', '7-10 Bien'], ['#fbbf24', '4-6 Regular'], ['#f87171', '1-3 Difícil']] as [string, string][]).map(([c, l]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
                  <span className="text-[11px] text-gray-700">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top emociones + Correlaciones */}
          {topEmociones.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">

              {/* Top emociones */}
              <div className="bg-[#0d1a12] border border-white/5 rounded-xl p-5">
                <h2 className="text-sm font-bold text-white mb-4">Emociones más frecuentes este mes</h2>
                <div className="space-y-2.5">
                  {topEmociones.map(([emocion, count], i) => {
                    const pct = Math.round((count / registros.length) * 100);
                    return (
                      <div key={emocion}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-300">{emocion}</span>
                          <span className="text-xs text-gray-600">{count}x</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: i === 0 ? '#2dd4bf' : i === 1 ? '#818cf8' : '#fbbf24',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Correlaciones */}
              {correlaciones.length > 0 && (
                <div className="bg-[#0d1a12] border border-white/5 rounded-xl p-5">
                  <h2 className="text-sm font-bold text-white mb-1">Cómo te afectan tus emociones</h2>
                  <p className="text-xs text-gray-600 mb-4">Ánimo promedio cuando registras cada emoción</p>
                  <div className="space-y-3">
                    {correlaciones.map(({ emocion, promedio, veces }) => (
                      <div key={emocion} className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-gray-300">{emocion}</span>
                          <span className="text-[11px] text-gray-700 ml-2">({veces} veces)</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: animoColor(promedio) }}>
                          {animoEmoji(promedio)} {promedio}/10
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Historial de tests */}
          {resultadosTest.length > 0 && (
            <div className="bg-[#0d1a12] border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white">Tests realizados</h2>
                <Link href="/tests" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">Ver todos →</Link>
              </div>
              <div className="space-y-2">
                {resultadosTest.slice(0, 5).map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm text-gray-300 font-medium">{r.testId}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{r.resultadoTitulo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-teal-400">{r.puntajeTotal} pts</p>
                      <p className="text-[11px] text-gray-700">
                        {new Date(r.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Largo plazo (3 / 6 meses) ── */}
          {promediosMensuales.length >= 2 && (
            <div className="bg-[#0d1a12] border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h2 className="text-sm font-bold text-white">Tendencia a largo plazo</h2>
                  <p className="text-xs text-gray-600 mt-0.5">Promedio mensual de ánimo</p>
                </div>
                <div className="flex rounded-lg overflow-hidden border border-white/8">
                  {([90, 180] as const).map(n => (
                    <button
                      key={n}
                      onClick={() => setRangoLargo(n)}
                      className={`px-3 py-1.5 text-xs font-semibold transition-colors ${rangoLargo === n ? 'bg-teal-600 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                    >
                      {n === 90 ? '3 meses' : '6 meses'}
                    </button>
                  ))}
                </div>
              </div>

              {cargandoLargo ? (
                <div className="h-28 flex items-center justify-center text-gray-600 text-sm">Cargando...</div>
              ) : (
                <>
                  {/* Indicador de tendencia global */}
                  {tendenciaLP !== null && (
                    <div className={`mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${tendenciaLP > 0.05 ? 'bg-teal-500/10 text-teal-400' : tendenciaLP < -0.05 ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-gray-400'}`}>
                      {tendenciaLP > 0.05 ? '↗ Tendencia positiva' : tendenciaLP < -0.05 ? '↘ Tendencia a la baja' : '→ Estable'}
                      <span className="opacity-60">({tendenciaLP > 0 ? '+' : ''}{tendenciaLP.toFixed(2)} pts/mes)</span>
                    </div>
                  )}

                  {/* Barras mensuales */}
                  <div className="flex items-end gap-2 h-32 mb-2">
                    {promediosMensuales.map(m => {
                      const color = animoColor(m.promedio);
                      return (
                        <div key={m.key} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                          <span className="text-[9px] font-bold" style={{ color }}>{m.promedio}</span>
                          <div
                            title={`${m.label}: ${m.promedio}/10 (${m.registros} registros)`}
                            className="w-full rounded-t-sm transition-all"
                            style={{
                              height: `${(m.promedio / 10) * 80}%`,
                              background: `linear-gradient(to top, ${color}, ${color}88)`,
                              minHeight: '6px',
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    {promediosMensuales.map(m => (
                      <div key={m.key} className="flex-1 text-center text-[9px] text-gray-700">{m.label}</div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Evolución de tests ── */}
          {tendenciaTests.length > 0 && (
            <div className="bg-[#0d1a12] border border-white/5 rounded-xl p-5">
              <h2 className="text-sm font-bold text-white mb-1">Evolución en tests psicológicos</h2>
              <p className="text-xs text-gray-600 mb-4">Comparando tu primera y última aplicación</p>
              <div className="space-y-4">
                {tendenciaTests.map(({ testId, primero, ultimo, diff, veces }) => (
                  <div key={testId}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-300 font-medium">{testId}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${diff < 0 ? 'bg-teal-500/10 text-teal-400' : diff > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-gray-500'}`}>
                        {diff < 0 ? '↓' : diff > 0 ? '↑' : '='} {diff > 0 ? '+' : ''}{diff} pts · {veces} veces
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-lg font-black text-gray-400">{primero.puntaje}</div>
                        <div className="text-[9px] text-gray-700">
                          {new Date(primero.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: '100%',
                            background: diff < 0
                              ? 'linear-gradient(to right, #6b7280, #2dd4bf)'
                              : 'linear-gradient(to right, #6b7280, #fbbf24)',
                          }}
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-black" style={{ color: diff < 0 ? '#2dd4bf' : diff > 0 ? '#fbbf24' : '#6b7280' }}>
                          {ultimo.puntaje}
                        </div>
                        <div className="text-[9px] text-gray-700">
                          {new Date(ultimo.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-700 mt-4 leading-relaxed">
                * Para tests de síntomas (PHQ-9, GAD-7) una puntuación más baja indica mejoría. Para tests de recursos y fortalezas, una puntuación más alta es mejor.
              </p>
            </div>
          )}

          {promediosMensuales.length < 2 && estadisticas.total >= 7 && (
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-xl flex gap-3 items-center">
              <span className="text-xl">🗓️</span>
              <p className="text-sm text-gray-500 leading-relaxed">
                Las tendencias a largo plazo aparecerán cuando tengas datos de al menos <strong className="text-indigo-400">2 meses</strong>.
                Llevas <strong className="text-indigo-400">{estadisticas.total} registros</strong> — ¡sigue así!
              </p>
            </div>
          )}

          {estadisticas.total < 7 && (
            <div className="p-4 bg-teal-500/5 border border-teal-500/15 rounded-xl flex gap-3 items-center">
              <span className="text-xl">💡</span>
              <p className="text-sm text-gray-500 leading-relaxed">
                Registra tu ánimo al menos 7 días para ver patrones y correlaciones.
                Llevas <strong className="text-teal-400">{estadisticas.total} de 7</strong> días.
              </p>
            </div>
          )}
        </>
      )}

      {/* ── Comunidad de pares (próximamente) ── */}
      {!cargando && (
        <div className="bg-[#0d1a12] border border-indigo-500/20 rounded-xl p-5 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl flex-shrink-0">
            🫂
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-sm font-bold text-white">Comunidad de pares — Próximamente</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 rounded-full">Beta</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">
              Foros moderados por psicólogos donde podrás compartir experiencias, estrategias y apoyo mutuo con personas en situaciones similares. Tu privacidad siempre protegida.
            </p>
            <div className="flex gap-3 flex-wrap">
              {[
                { emoji: '💬', label: 'Grupos temáticos' },
                { emoji: '🔒', label: 'Moderación clínica' },
                { emoji: '🎭', label: 'Anonimato opcional' },
              ].map(({ emoji, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 text-[11px] text-gray-600">
                  <span>{emoji}</span>{label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal registro ánimo */}
      {modalAnimo && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setModalAnimo(false); }}
        >
          <div className="bg-[#0d1a12] border border-teal-500/30 rounded-2xl p-8 w-full max-w-sm">
            <h3 className="text-xl font-black text-white mb-1">¿Cómo estás ahora?</h3>
            <p className="text-sm text-gray-600 mb-6">Registro rápido de ánimo</p>

            <div className="text-center mb-5">
              <div className="text-5xl mb-2">{animoEmoji(animoHoy)}</div>
              <p className="text-3xl font-black" style={{ color: animoColor(animoHoy) }}>{animoHoy}/10</p>
            </div>

            <input
              type="range" min={1} max={10} value={animoHoy}
              onChange={e => setAnimoHoy(+e.target.value)}
              className="w-full mb-5"
              style={{ accentColor: animoColor(animoHoy) }}
            />

            <div className="flex flex-wrap gap-2 mb-5">
              {EMOCIONES_RAPIDAS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmocionHoy(prev => prev === e ? '' : e)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                    emocionHoy === e
                      ? 'bg-teal-500/15 border-teal-500/40 text-teal-400'
                      : 'bg-white/3 border-white/8 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
            )}

            <div className="flex gap-3">
              <button
                onClick={registrarAnimo}
                disabled={guardando}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-bold rounded-xl transition-colors"
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => setModalAnimo(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/8 text-gray-500 rounded-xl border border-white/8 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
