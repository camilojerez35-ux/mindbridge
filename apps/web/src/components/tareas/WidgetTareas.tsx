'use client';

import { useState } from 'react';
import { CheckCircle2, Clock, BookOpen, Wind, PenLine, Zap } from 'lucide-react';

type TareaProp = {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: string;
  estado: string;
  fechaLimite: Date | string | null;
  psicologo: {
    usuario: { nombre: string | null; apellido: string | null };
  };
};

const TIPO_ICONO: Record<string, React.ReactNode> = {
  LECTURA:   <BookOpen className="w-3.5 h-3.5" />,
  EJERCICIO: <Wind className="w-3.5 h-3.5" />,
  REGISTRO:  <PenLine className="w-3.5 h-3.5" />,
  PRACTICA:  <Zap className="w-3.5 h-3.5" />,
};

const TIPO_COLOR: Record<string, string> = {
  LECTURA:   'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  EJERCICIO: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  REGISTRO:  'text-teal-400 bg-teal-500/10 border-teal-500/20',
  PRACTICA:  'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

export default function WidgetTareas({ tareas: tareasIniciales }: { tareas: TareaProp[] }) {
  const [tareas, setTareas] = useState(tareasIniciales);
  const [completando, setCompletando] = useState<string | null>(null);

  async function marcarCompletada(id: string) {
    setCompletando(id);
    try {
      const res = await fetch('/api/tareas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tareaId: id, estado: 'COMPLETADA' }),
      });
      if (res.ok) {
        setTareas(prev => prev.filter(t => t.id !== id));
      }
    } finally {
      setCompletando(null);
    }
  }

  if (tareas.length === 0) return null;

  return (
    <div className="bg-[#0d1a12] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-white">Tareas de tu psicólogo</h2>
          <p className="text-xs text-gray-600 mt-0.5">{tareas.length} pendiente{tareas.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {tareas.map(tarea => {
          const psicoNombre = [tarea.psicologo.usuario.nombre, tarea.psicologo.usuario.apellido].filter(Boolean).join(' ');
          const vence = tarea.fechaLimite ? new Date(tarea.fechaLimite) : null;
          const vencida = vence && vence < new Date();
          const colorClase = TIPO_COLOR[tarea.tipo] ?? TIPO_COLOR.PRACTICA;

          return (
            <div
              key={tarea.id}
              className="flex items-start gap-3 p-3.5 bg-white/2 border border-white/5 rounded-xl group hover:border-white/10 transition-all"
            >
              {/* Tipo badge */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold flex-shrink-0 mt-0.5 ${colorClase}`}>
                {TIPO_ICONO[tarea.tipo]}
                <span className="uppercase tracking-wider">{tarea.tipo}</span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-semibold leading-snug">{tarea.titulo}</p>
                {tarea.descripcion && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{tarea.descripcion}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-[11px] text-gray-700">Por {psicoNombre || 'tu psicólogo'}</span>
                  {vence && (
                    <span className={`flex items-center gap-1 text-[11px] ${vencida ? 'text-red-400' : 'text-gray-600'}`}>
                      <Clock className="w-3 h-3" />
                      {vencida ? 'Venció el ' : 'Vence el '}
                      {vence.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => marcarCompletada(tarea.id)}
                disabled={completando === tarea.id}
                title="Marcar como completada"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:text-teal-400 hover:bg-teal-500/10 transition-all flex-shrink-0 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4.5 h-4.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
