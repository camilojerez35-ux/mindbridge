'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Registro { fecha: string; valor: number; }

function colorClasses(valor: number): { bg: string; text: string; border: string } {
  if (valor >= 8) return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40' };
  if (valor >= 6) return { bg: 'bg-teal-500/20',    text: 'text-teal-400',    border: 'border-teal-500/40'    };
  if (valor >= 4) return { bg: 'bg-yellow-500/20',  text: 'text-yellow-400',  border: 'border-yellow-500/40'  };
  return             { bg: 'bg-red-500/20',     text: 'text-red-400',     border: 'border-red-500/40'     };
}

const NOMBRES_MES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_SEMANA = ['D','L','M','X','J','V','S'];
const HOY = new Date().toISOString().split('T')[0];

export default function CalendarioAnimo() {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [registros, setRegistros] = useState<Record<string, number>>({});
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const [diasVista, setDiasVista] = useState<7 | 30 | 365>(30);

  useEffect(() => {
    fetch(`/api/animo?dias=${diasVista}`)
      .then(r => r.json())
      .then(data => {
        const map: Record<string, number> = {};
        (data.registros ?? []).forEach((r: Registro) => {
          map[r.fecha.slice(0, 10)] = r.valor;
        });
        setRegistros(map);
      })
      .catch(() => {});
  }, [diasVista]);

  async function registrarAnimo(fecha: string, valor: number) {
    setRegistros(prev => ({ ...prev, [fecha]: valor }));
    setDiaSeleccionado(null);
    await fetch('/api/animo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fecha, valor }),
    });
  }

  function cambiarMes(delta: number) {
    let nuevoMes = mes + delta;
    let nuevoAnio = anio;
    if (nuevoMes < 0) { nuevoMes = 11; nuevoAnio--; }
    if (nuevoMes > 11) { nuevoMes = 0; nuevoAnio++; }
    setMes(nuevoMes);
    setAnio(nuevoAnio);
  }

  // Calendar grid
  const primerDia = new Date(anio, mes, 1).getDay();
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const celdas: (string | null)[] = [
    ...Array(primerDia).fill(null),
    ...Array.from({ length: diasEnMes }, (_, d) =>
      `${anio}-${String(mes + 1).padStart(2, '0')}-${String(d + 1).padStart(2, '0')}`
    ),
  ];

  const valores = Object.values(registros);
  const promedio = valores.length
    ? (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(1)
    : '—';

  return (
    <div className="flex flex-col gap-4">

      {/* Period selector */}
      <div className="flex gap-2">
        {([7, 30, 365] as const).map(v => (
          <button
            key={v}
            onClick={() => setDiasVista(v)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
              diasVista === v
                ? 'bg-teal-600 border-teal-600 text-white'
                : 'bg-white/3 border-white/8 text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            {v === 7 ? '7 días' : v === 30 ? '30 días' : 'Todo'}
          </button>
        ))}
      </div>

      {/* Summary card */}
      <div className="bg-[#0d1117] border border-white/5 rounded-2xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">Promedio del período</p>
          <p className="text-3xl font-black text-white mt-1">
            {promedio}
            <span className="text-base text-gray-600 font-normal">/10</span>
          </p>
        </div>
        <div className="flex items-end gap-1">
          {[3, 5, 7, 9].map(v => {
            const { bg } = colorClasses(v);
            return (
              <div
                key={v}
                className={`w-2 rounded-sm ${bg}`}
                style={{ height: `${v * 4}px` }}
              />
            );
          })}
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-5">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => cambiarMes(-1)}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-white">{NOMBRES_MES[mes]} {anio}</span>
          <button
            onClick={() => cambiarMes(1)}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DIAS_SEMANA.map(d => (
            <div key={d} className="text-center text-[10px] text-gray-700 font-bold py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {celdas.map((fecha, i) => {
            if (!fecha) return <div key={i} />;
            const dia = parseInt(fecha.split('-')[2]);
            const valor = registros[fecha];
            const esHoy = fecha === HOY;
            const esFuturo = fecha > HOY;
            const cls = valor ? colorClasses(valor) : null;

            return (
              <button
                key={fecha}
                onClick={() => !esFuturo && setDiaSeleccionado(fecha)}
                disabled={esFuturo}
                className={`aspect-square rounded-lg text-xs font-semibold flex items-center justify-center border transition-all ${
                  valor && cls
                    ? `${cls.bg} ${cls.text} ${cls.border}`
                    : esHoy
                    ? 'border-teal-500/50 text-teal-500 bg-transparent'
                    : esFuturo
                    ? 'border-white/3 text-gray-800 cursor-default'
                    : 'border-white/5 text-gray-600 hover:bg-white/5 hover:text-gray-400'
                }`}
              >
                {dia}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day mood picker modal */}
      {diaSeleccionado && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-sm font-bold text-white">
                ¿Cómo te sentiste el{' '}
                {new Date(diaSeleccionado + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}?
              </h3>
              <button
                onClick={() => setDiaSeleccionado(null)}
                className="p-1 text-gray-600 hover:text-gray-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 mb-4">1 = muy mal · 10 = excelente</p>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map(v => {
                const { bg, text, border } = colorClasses(v);
                return (
                  <button
                    key={v}
                    onClick={() => registrarAnimo(diaSeleccionado, v)}
                    className={`aspect-square rounded-xl text-sm font-black border transition-all hover:scale-105 ${bg} ${text} ${border}`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
