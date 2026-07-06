'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Clock, BookOpen, Wind, PenLine, Zap, Loader2 } from 'lucide-react';

type Tarea = {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: string;
  estado: string;
  fechaLimite: string | null;
  usuario: { nombre: string | null; apellido: string | null; email: string };
};

const TIPOS = ['PRACTICA', 'LECTURA', 'EJERCICIO', 'REGISTRO'] as const;

const TIPO_ICONO: Record<string, React.ReactNode> = {
  LECTURA:   <BookOpen className="w-3.5 h-3.5" />,
  EJERCICIO: <Wind className="w-3.5 h-3.5" />,
  REGISTRO:  <PenLine className="w-3.5 h-3.5" />,
  PRACTICA:  <Zap className="w-3.5 h-3.5" />,
};

const ESTADO_COLOR: Record<string, string> = {
  PENDIENTE:   'text-amber-400',
  EN_PROCESO:  'text-teal-400',
  COMPLETADA:  'text-gray-500',
};

export default function TareasPanel() {
  const [tareas, setTareas]         = useState<Tarea[]>([]);
  const [cargando, setCargando]     = useState(true);
  const [modal, setModal]           = useState(false);
  const [guardando, setGuardando]   = useState(false);
  const [eliminando, setEliminando] = useState<string | null>(null);

  // Formulario nueva tarea
  const [form, setForm] = useState({
    usuarioId:   '',
    titulo:      '',
    descripcion: '',
    tipo:        'PRACTICA' as typeof TIPOS[number],
    fechaLimite: '',
  });
  const [pacientes, setPacientes]   = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    cargarTareas();
    cargarPacientes();
  }, []);

  async function cargarTareas() {
    setCargando(true);
    try {
      const res = await fetch('/api/psicologo/tareas');
      if (res.ok) {
        const data = await res.json();
        setTareas(data.tareas ?? []);
      }
    } finally {
      setCargando(false);
    }
  }

  async function cargarPacientes() {
    try {
      const res = await fetch('/api/psicologo/citas?desde=2020-01-01&hasta=2030-12-31');
      if (res.ok) {
        const data = await res.json();
        const vistos = new Set<string>();
        const lista: { id: string; nombre: string }[] = [];
        (data.citas ?? []).forEach((c: any) => {
          if (!vistos.has(c.usuario.id)) {
            vistos.add(c.usuario.id);
            lista.push({
              id: c.usuario.id,
              nombre: [c.usuario.nombre, c.usuario.apellido].filter(Boolean).join(' ') || c.usuario.email,
            });
          }
        });
        setPacientes(lista);
      }
    } catch {}
  }

  async function crearTarea() {
    if (!form.usuarioId || !form.titulo.trim()) return;
    setGuardando(true);
    try {
      const res = await fetch('/api/psicologo/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId:   form.usuarioId,
          titulo:      form.titulo.trim(),
          descripcion: form.descripcion.trim() || undefined,
          tipo:        form.tipo,
          fechaLimite: form.fechaLimite ? new Date(form.fechaLimite).toISOString() : undefined,
        }),
      });
      if (res.ok) {
        await cargarTareas();
        setModal(false);
        setForm({ usuarioId: '', titulo: '', descripcion: '', tipo: 'PRACTICA', fechaLimite: '' });
      }
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id: string) {
    setEliminando(id);
    try {
      await fetch(`/api/psicologo/tareas/${id}`, { method: 'DELETE' });
      setTareas(prev => prev.filter(t => t.id !== id));
    } finally {
      setEliminando(null);
    }
  }

  const pendientes  = tareas.filter(t => t.estado !== 'COMPLETADA');
  const completadas = tareas.filter(t => t.estado === 'COMPLETADA');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white">Tareas asignadas</h2>
          <p className="text-xs text-gray-600 mt-0.5">{pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''} · {completadas.length} completada{completadas.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />Nueva tarea
        </button>
      </div>

      {cargando && <p className="text-center py-8 text-gray-600 text-sm">Cargando...</p>}

      {!cargando && tareas.length === 0 && (
        <div className="text-center py-12 bg-[#0d1a12] border border-white/5 rounded-xl">
          <p className="text-3xl mb-3">✅</p>
          <p className="text-gray-500 text-sm">Aún no has asignado tareas a tus pacientes.</p>
          <button onClick={() => setModal(true)} className="mt-4 text-sm text-teal-400 hover:text-teal-300 font-semibold">
            + Asignar primera tarea
          </button>
        </div>
      )}

      {pendientes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Pendientes</p>
          {pendientes.map(t => <TareaRow key={t.id} tarea={t} onEliminar={eliminar} eliminando={eliminando} />)}
        </div>
      )}

      {completadas.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Completadas</p>
          {completadas.map(t => <TareaRow key={t.id} tarea={t} onEliminar={eliminar} eliminando={eliminando} />)}
        </div>
      )}

      {/* Modal nueva tarea */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1a12] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-black text-white">Nueva tarea para paciente</h3>

            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Paciente</label>
              <select
                value={form.usuarioId}
                onChange={e => setForm(f => ({ ...f, usuarioId: e.target.value }))}
                className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-gray-300 outline-none focus:border-teal-500/40"
              >
                <option value="">Seleccionar paciente...</option>
                {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Tipo</label>
              <div className="flex gap-2 flex-wrap">
                {TIPOS.map(t => (
                  <button
                    key={t}
                    onClick={() => setForm(f => ({ ...f, tipo: t }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${form.tipo === t ? 'bg-teal-500/15 border-teal-500/40 text-teal-400' : 'bg-white/3 border-white/8 text-gray-500'}`}
                  >
                    {TIPO_ICONO[t]}{t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Título *</label>
              <input
                value={form.titulo}
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                placeholder="Ej: Registrar pensamientos automáticos esta semana"
                className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-gray-300 placeholder:text-gray-700 outline-none focus:border-teal-500/40"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Descripción (opcional)</label>
              <textarea
                value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                placeholder="Instrucciones detalladas para el paciente..."
                rows={3}
                className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-gray-300 placeholder:text-gray-700 outline-none focus:border-teal-500/40 resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Fecha límite (opcional)</label>
              <input
                type="date"
                value={form.fechaLimite}
                onChange={e => setForm(f => ({ ...f, fechaLimite: e.target.value }))}
                className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-gray-300 outline-none focus:border-teal-500/40"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setModal(false)}
                className="flex-1 py-2.5 bg-white/5 text-gray-500 rounded-xl border border-white/8 text-sm hover:bg-white/8 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={crearTarea}
                disabled={guardando || !form.usuarioId || !form.titulo.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors"
              >
                {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
                {guardando ? 'Creando...' : 'Crear tarea'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TareaRow({ tarea, onEliminar, eliminando }: { tarea: Tarea; onEliminar: (id: string) => void; eliminando: string | null }) {
  const nombre = [tarea.usuario.nombre, tarea.usuario.apellido].filter(Boolean).join(' ') || tarea.usuario.email;
  const vence = tarea.fechaLimite ? new Date(tarea.fechaLimite) : null;

  return (
    <div className="flex items-start gap-3 p-3.5 bg-[#0d1a12] border border-white/5 rounded-xl">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-sm text-white font-semibold">{tarea.titulo}</span>
          <span className={`text-[10px] font-bold uppercase ${ESTADO_COLOR[tarea.estado] ?? 'text-gray-500'}`}>
            {tarea.estado === 'COMPLETADA' ? <CheckCircle2 className="w-3 h-3 inline" /> : null} {tarea.estado.replace('_', ' ')}
          </span>
        </div>
        {tarea.descripcion && <p className="text-xs text-gray-600 line-clamp-1 mb-1">{tarea.descripcion}</p>}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[11px] text-gray-700">Paciente: {nombre}</span>
          {vence && (
            <span className="flex items-center gap-1 text-[11px] text-gray-700">
              <Clock className="w-3 h-3" />
              {vence.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => onEliminar(tarea.id)}
        disabled={eliminando === tarea.id}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0 disabled:opacity-40"
      >
        {eliminando === tarea.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
