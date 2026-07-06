'use client';

import { useState, useEffect } from 'react';
import { FileText, AlertTriangle, FlaskConical, CheckCircle2, Clock, Loader2 } from 'lucide-react';

type CitaResumen = {
  id: string;
  usuario: { id: string; nombre: string | null; apellido: string | null };
};

type Historia = {
  paciente: {
    nombre: string | null; apellido: string | null; email: string;
    fechaNacimiento: string | null; ciudadColombia: string | null;
    motivoConsulta: string | null; planActual: string; createdAt: string;
  };
  citas: Array<{
    id: string; fechaHora: string; duracionMinutos: number;
    estado: string; tipo: string; modalidad: string;
    notasClinicas: string | null; notasPrevias: string | null;
    resena: { calificacion: number; comentario: string | null } | null;
  }>;
  incidentes: Array<{
    id: string; nivel: string; indicadoresDetectados: string[];
    protocoloActivado: boolean; resolucion: string | null;
    timestampDeteccion: string; timestampResolucion: string | null;
  }>;
  resultadosTest: Array<{
    testId: string; puntajeTotal: number; resultadoTitulo: string; createdAt: string;
  }>;
  tareas: Array<{
    titulo: string; tipo: string; estado: string; createdAt: string; completadaEn: string | null;
  }>;
};

const NIVEL_COLOR: Record<string, string> = {
  BAJO:     'text-amber-400 bg-amber-500/10',
  MODERADO: 'text-orange-400 bg-orange-500/10',
  ALTO:     'text-red-400 bg-red-500/10',
  CRITICO:  'text-red-300 bg-red-600/20',
};

export default function HistoriaClinica({ citasHoy }: { citasHoy: CitaResumen[] }) {
  const [pacienteSelId, setPacienteSelId] = useState<string | null>(null);
  const [historia, setHistoria]           = useState<Historia | null>(null);
  const [cargando, setCargando]           = useState(false);
  const [seccion, setSeccion]             = useState<'citas' | 'incidentes' | 'tests' | 'tareas'>('citas');

  // Lista única de pacientes
  const pacientes = Array.from(
    new Map(citasHoy.map(c => [c.usuario.id, c.usuario])).values()
  );

  useEffect(() => {
    if (!pacienteSelId) return;
    setCargando(true);
    setHistoria(null);
    fetch(`/api/psicologo/pacientes/${pacienteSelId}/historia`)
      .then(r => r.json())
      .then(d => setHistoria(d))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [pacienteSelId]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-white mb-1">Historia Clínica</h2>
        <p className="text-xs text-gray-600">Selecciona un paciente para ver su historial completo</p>
      </div>

      {/* Selector de paciente */}
      <div className="flex flex-wrap gap-2">
        {pacientes.length === 0 && (
          <p className="text-sm text-gray-600">Aún no tienes pacientes con citas registradas.</p>
        )}
        {pacientes.map(p => {
          const nombre = [p.nombre, p.apellido].filter(Boolean).join(' ') || 'Paciente';
          return (
            <button
              key={p.id}
              onClick={() => setPacienteSelId(p.id === pacienteSelId ? null : p.id)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${
                pacienteSelId === p.id
                  ? 'bg-teal-500/15 border-teal-500/40 text-teal-300'
                  : 'bg-white/3 border-white/8 text-gray-400 hover:text-gray-200'
              }`}
            >
              {nombre}
            </button>
          );
        })}
      </div>

      {cargando && (
        <div className="flex items-center justify-center py-10 gap-3">
          <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
          <span className="text-sm text-gray-600">Cargando historia clínica...</span>
        </div>
      )}

      {historia && !cargando && (
        <div className="space-y-4">
          {/* Encabezado del paciente */}
          <div className="bg-[#0d1a12] border border-white/5 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-white">
                  {[historia.paciente.nombre, historia.paciente.apellido].filter(Boolean).join(' ') || 'Paciente'}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">{historia.paciente.email}</p>
                {historia.paciente.ciudadColombia && (
                  <p className="text-xs text-gray-600">{historia.paciente.ciudadColombia}</p>
                )}
              </div>
              <div className="text-right text-xs text-gray-600">
                <p>Plan: <span className="text-teal-400 font-semibold">{historia.paciente.planActual}</span></p>
                <p>En plataforma desde {new Date(historia.paciente.createdAt).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            {historia.paciente.motivoConsulta && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-[11px] text-gray-600 uppercase tracking-wider mb-1">Motivo de consulta inicial</p>
                <p className="text-sm text-gray-400 leading-relaxed">{historia.paciente.motivoConsulta}</p>
              </div>
            )}
          </div>

          {/* Tabs de sección */}
          <div className="flex gap-1 bg-white/3 p-1 rounded-xl border border-white/5">
            {([
              ['citas',       `📅 Citas (${historia.citas.length})`],
              ['incidentes',  `⚠️ Crisis (${historia.incidentes.length})`],
              ['tests',       `🧪 Tests (${historia.resultadosTest.length})`],
              ['tareas',      `✅ Tareas (${historia.tareas.length})`],
            ] as const).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setSeccion(v)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${seccion === v ? 'bg-teal-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Citas */}
          {seccion === 'citas' && (
            <div className="space-y-2">
              {historia.citas.length === 0 && <p className="text-sm text-gray-600 text-center py-4">Sin citas registradas</p>}
              {historia.citas.map(cita => (
                <div key={cita.id} className="bg-[#0d1a12] border border-white/5 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {new Date(cita.fechaHora).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {new Date(cita.fechaHora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })} · {cita.duracionMinutos} min · {cita.modalidad}
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-lg font-bold ${cita.estado === 'COMPLETADA' ? 'bg-teal-500/10 text-teal-400' : 'bg-white/5 text-gray-500'}`}>
                      {cita.estado.replace('_', ' ')}
                    </span>
                  </div>
                  {cita.notasClinicas && (
                    <div className="mt-2 pt-2 border-t border-white/5">
                      <p className="text-[11px] text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <FileText className="w-3 h-3" />Notas clínicas
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line line-clamp-4">{cita.notasClinicas}</p>
                    </div>
                  )}
                  {cita.resena && (
                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2">
                      <span className="text-xs text-gray-600">Calificación del paciente:</span>
                      <span className="text-sm font-bold text-amber-400">{'⭐'.repeat(cita.resena.calificacion)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Incidentes de crisis */}
          {seccion === 'incidentes' && (
            <div className="space-y-2">
              {historia.incidentes.length === 0 && <p className="text-sm text-gray-600 text-center py-4">Sin incidentes de crisis registrados</p>}
              {historia.incidentes.map(inc => (
                <div key={inc.id} className="bg-[#0d1a12] border border-red-500/10 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${NIVEL_COLOR[inc.nivel] ?? ''}`}>{inc.nivel}</span>
                    <span className="text-xs text-gray-600">
                      {new Date(inc.timestampDeteccion).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {inc.indicadoresDetectados.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {inc.indicadoresDetectados.map(i => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-white/5 text-gray-500 rounded">{i}</span>
                      ))}
                    </div>
                  )}
                  {inc.resolucion && <p className="text-xs text-gray-500">Resolución: {inc.resolucion}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Tests */}
          {seccion === 'tests' && (
            <div className="space-y-2">
              {historia.resultadosTest.length === 0 && <p className="text-sm text-gray-600 text-center py-4">Sin tests realizados</p>}
              {historia.resultadosTest.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 bg-[#0d1a12] border border-white/5 rounded-xl">
                  <div>
                    <p className="text-sm text-white font-semibold flex items-center gap-2">
                      <FlaskConical className="w-3.5 h-3.5 text-purple-400" />{t.testId}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">{t.resultadoTitulo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-teal-400">{t.puntajeTotal} pts</p>
                    <p className="text-[11px] text-gray-700">
                      {new Date(t.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tareas */}
          {seccion === 'tareas' && (
            <div className="space-y-2">
              {historia.tareas.length === 0 && <p className="text-sm text-gray-600 text-center py-4">Sin tareas asignadas</p>}
              {historia.tareas.map((t, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5 bg-[#0d1a12] border border-white/5 rounded-xl">
                  {t.estado === 'COMPLETADA'
                    ? <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    : <Clock className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  }
                  <div className="flex-1">
                    <p className="text-sm text-white font-semibold">{t.titulo}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      {t.tipo} · {t.estado}
                      {t.completadaEn && ` · completada ${new Date(t.completadaEn).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
