'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface PsicologoPendiente {
  id: string;
  nombreCompleto: string;
  tarjetaProfesionalId: string;
  tarjetaVencimiento: string | null;
  estado: string;
  especialidades: string[];
  anosExperiencia: number;
  createdAt: string;
  usuario: { email: string; createdAt: string };
}

const COLPSIC_BUSQUEDA_URL = 'https://colpsic.org.co/consulta-de-tarjetas-profesionales/';

export default function VerificacionColpsicPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [psicologos, setPsicologos] = useState<PsicologoPendiente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('PENDIENTE_VERIFICACION');
  const [procesando, setProcesando] = useState<string | null>(null);
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.rol !== 'ADMIN') router.replace('/dashboard');
  }, [session, status, router]);

  const cargar = useCallback(async () => {
    setCargando(true);
    const res = await fetch(`/api/psicologos/verificar?estado=${filtroEstado}`);
    if (res.ok) {
      const data = await res.json();
      setPsicologos(data.psicologos);
    }
    setCargando(false);
  }, [filtroEstado]);

  useEffect(() => { cargar(); }, [cargar]);

  async function accion(psicologoId: string, tipo: 'APROBAR' | 'RECHAZAR' | 'SUSPENDER') {
    setProcesando(psicologoId);
    setMensaje(null);
    try {
      const res = await fetch('/api/psicologos/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          psicologoId,
          accion: tipo,
          notasAdmin: notas[psicologoId] ?? '',
          tarjetaConfirmada: tipo === 'APROBAR',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje({ tipo: 'ok', texto: data.mensaje });
        cargar();
      } else {
        setMensaje({ tipo: 'error', texto: data.error ?? 'Error desconocido' });
      }
    } finally {
      setProcesando(null);
    }
  }

  if (status === 'loading' || (session && session.user.rol !== 'ADMIN')) return null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Verificación COLPSIC</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Gestión de psicólogos — Resolución 2654/2019. Verifica manualmente en{' '}
          <a href={COLPSIC_BUSQUEDA_URL} target="_blank" rel="noopener noreferrer"
            className="text-teal-600 underline">
            colpsic.org.co
          </a>{' '}
          antes de aprobar.
        </p>
      </div>

      {mensaje && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${mensaje.tipo === 'ok' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Filtros de estado */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['PENDIENTE_VERIFICACION', 'VERIFICADO', 'RECHAZADO', 'SUSPENDIDO'].map(e => (
          <button
            key={e}
            onClick={() => setFiltroEstado(e)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filtroEstado === e
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {e.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : psicologos.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No hay psicólogos en este estado.</div>
      ) : (
        <div className="space-y-4">
          {psicologos.map(p => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{p.nombreCompleto}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.estado === 'VERIFICADO' || p.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' :
                      p.estado === 'RECHAZADO' ? 'bg-red-100 text-red-700' :
                      p.estado === 'SUSPENDIDO' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {p.estado.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium text-gray-700">Tarjeta COLPSIC:</span>{' '}
                      <code className="bg-gray-100 px-1 rounded">{p.tarjetaProfesionalId}</code>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span> {p.usuario.email}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Experiencia:</span> {p.anosExperiencia} años
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Registro:</span>{' '}
                      {new Date(p.createdAt).toLocaleDateString('es-CO')}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-700">Especialidades:</span>{' '}
                      {p.especialidades.join(', ')}
                    </div>
                  </div>

                  {/* Link directo a verificación COLPSIC */}
                  <a
                    href={COLPSIC_BUSQUEDA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 underline mb-3"
                  >
                    Verificar tarjeta {p.tarjetaProfesionalId} en COLPSIC →
                  </a>

                  {/* Notas del admin */}
                  <textarea
                    placeholder="Notas internas (opcional) — se envían al psicólogo si se rechaza"
                    value={notas[p.id] ?? ''}
                    onChange={e => setNotas(prev => ({ ...prev, [p.id]: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg p-2 resize-none h-16 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <button
                    onClick={() => accion(p.id, 'APROBAR')}
                    disabled={procesando === p.id || p.estado === 'VERIFICADO'}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {procesando === p.id ? '...' : '✓ Aprobar'}
                  </button>
                  <button
                    onClick={() => accion(p.id, 'RECHAZAR')}
                    disabled={procesando === p.id || p.estado === 'RECHAZADO'}
                    className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ✕ Rechazar
                  </button>
                  <button
                    onClick={() => accion(p.id, 'SUSPENDER')}
                    disabled={procesando === p.id || p.estado === 'SUSPENDIDO'}
                    className="bg-orange-50 text-orange-700 border border-orange-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ⏸ Suspender
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
