'use client';

import { useState, useEffect, useCallback } from 'react';
import TareasPanel from '@/components/tareas/TareasPanel';
import HistoriaClinica from '@/components/psicologo/HistoriaClinica';

/* ── Tipos ── */
type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA_USUARIO' | 'CANCELADA_PSICOLOGO' | 'EN_CURSO' | 'NO_ASISTIO';

interface Cita {
  id: string;
  fechaHora: string;
  duracionMinutos: number;
  estado: EstadoCita;
  tipo: string;
  modalidad: string;
  montoPsicologoCOP: number;
  estadoPago: string;
  salaVideollamada: string | null;
  usuario: { id: string; nombre: string | null; apellido: string | null; imagen: string | null };
}

interface Notificacion {
  id: string;
  tipo: 'CITA_PENDIENTE';
  mensaje: string;
  citaId: string;
  fechaHora: string;
  tipoCita: string;
}

type PerfilForm = {
  nombreCompleto: string; bio: string; formacion: string;
  especialidades: string; enfoqueTerapeutico: string;
  anosExperiencia: string; tarifaCOP: string; ciudades: string;
};

const FORM_VACIO: PerfilForm = {
  nombreCompleto: '', bio: '', formacion: '',
  especialidades: '', enfoqueTerapeutico: '',
  anosExperiencia: '', tarifaCOP: '', ciudades: '',
};

/* ── Helpers ── */
const nombrePaciente = (c: Cita) =>
  [c.usuario.nombre, c.usuario.apellido].filter(Boolean).join(' ') || 'Paciente';

const TZ = 'America/Bogota';

const fmtHora = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: TZ });

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ });

const colorEstado: Record<EstadoCita, { bg: string; color: string; label: string }> = {
  PENDIENTE:          { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', label: 'Pendiente' },
  CONFIRMADA:         { bg: 'rgba(45,212,191,0.12)',  color: '#2dd4bf', label: 'Confirmada' },
  COMPLETADA:         { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', label: 'Completada' },
  EN_CURSO:           { bg: 'rgba(129,140,248,0.12)', color: '#818cf8', label: 'En curso' },
  CANCELADA_USUARIO:  { bg: 'rgba(248,113,113,0.1)',  color: '#f87171', label: 'Cancelada' },
  CANCELADA_PSICOLOGO:{ bg: 'rgba(248,113,113,0.1)',  color: '#f87171', label: 'Cancelada' },
  NO_ASISTIO:         { bg: 'rgba(148,163,184,0.1)',  color: '#94a3b8', label: 'No asistió' },
};

/* ── Componente principal ── */
export default function PsicologoPage() {
  const [tab, setTab] = useState<'hoy' | 'agenda' | 'pacientes' | 'tareas' | 'pagos' | 'perfil'>('hoy');

  /* Citas */
  const [citasHoy, setCitasHoy]     = useState<Cita[]>([]);
  const [citasMes, setCitasMes]     = useState<Cita[]>([]);
  const [cargandoCitas, setCargandoCitas] = useState(false);

  /* Notificaciones */
  const [notifs, setNotifs]         = useState<Notificacion[]>([]);
  const [panelNotifs, setPanelNotifs] = useState(false);

  /* Calendario */
  const [mesVista, setMesVista]     = useState(() => new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);

  /* Acción sobre cita */
  const [accionando, setAccionando] = useState<string | null>(null);

  /* Notas clínicas */
  const [citaNotas,      setCitaNotas]      = useState<string | null>(null); // id de cita con panel abierto
  const [notasCita,      setNotasCita]      = useState('');
  const [notasCargando,  setNotasCargando]  = useState(false);
  const [notasGuardando, setNotasGuardando] = useState(false);
  const [notasGuardadas, setNotasGuardadas] = useState(false);
  const [notasError,     setNotasError]     = useState('');

  /* Perfil */
  const [form, setForm]             = useState<PerfilForm>(FORM_VACIO);
  const [cargandoPerfil, setCargandoPerfil] = useState(false);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [perfilGuardado, setPerfilGuardado]   = useState(false);
  const [errorPerfil, setErrorPerfil]         = useState('');
  const [verificado, setVerificado]           = useState(false);
  const [estadoPerfil, setEstadoPerfil]       = useState('');

  /* ── Carga de datos ── */
  const cargarCitasHoy = useCallback(async () => {
    const hoy   = new Date(); hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy); manana.setDate(manana.getDate() + 1);
    setCargandoCitas(true);
    try {
      const res = await fetch(`/api/psicologo/citas?desde=${hoy.toISOString()}&hasta=${manana.toISOString()}`);
      if (res.ok) { const d = await res.json(); setCitasHoy(d.citas ?? []); }
    } finally { setCargandoCitas(false); }
  }, []);

  const cargarCitasMes = useCallback(async () => {
    const desde = new Date(mesVista.getFullYear(), mesVista.getMonth(), 1);
    const hasta  = new Date(mesVista.getFullYear(), mesVista.getMonth() + 1, 0, 23, 59, 59);
    const res = await fetch(`/api/psicologo/citas?desde=${desde.toISOString()}&hasta=${hasta.toISOString()}`);
    if (res.ok) { const d = await res.json(); setCitasMes(d.citas ?? []); }
  }, [mesVista]);

  const cargarNotificaciones = useCallback(async () => {
    const res = await fetch('/api/psicologo/notificaciones');
    if (res.ok) { const d = await res.json(); setNotifs(d.notificaciones ?? []); }
  }, []);

  useEffect(() => { cargarCitasHoy(); cargarNotificaciones(); }, [cargarCitasHoy, cargarNotificaciones]);
  useEffect(() => { if (tab === 'agenda') cargarCitasMes(); }, [tab, cargarCitasMes]);

  /* ── Acción confirmar/cancelar ── */
  const accionarCita = async (citaId: string, accion: 'CONFIRMAR' | 'CANCELAR') => {
    setAccionando(citaId);
    try {
      const res = await fetch(`/api/psicologo/citas/${citaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion }),
      });
      if (res.ok) {
        const nuevoEstado: EstadoCita = accion === 'CONFIRMAR' ? 'CONFIRMADA' : 'CANCELADA_PSICOLOGO';
        setCitasHoy(prev => prev.map(c => c.id === citaId ? { ...c, estado: nuevoEstado } : c));
        setCitasMes(prev => prev.map(c => c.id === citaId ? { ...c, estado: nuevoEstado } : c));
        setNotifs(prev => prev.filter(n => n.citaId !== citaId));
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error || 'No se pudo actualizar la cita');
      }
    } finally { setAccionando(null); }
  };

  /* ── Notas clínicas ── */
  const abrirNotas = async (citaId: string) => {
    if (citaNotas === citaId) { setCitaNotas(null); return; }
    setCitaNotas(citaId);
    setNotasCargando(true);
    setNotasError('');
    setNotasGuardadas(false);
    try {
      const res = await fetch(`/api/psicologo/citas/${citaId}/notas`);
      if (res.ok) {
        const d = await res.json();
        setNotasCita(d.notasClinicas ?? '');
      }
    } catch { setNotasError('No se pudieron cargar las notas.'); }
    finally { setNotasCargando(false); }
  };

  const guardarNotas = async (citaId: string) => {
    setNotasGuardando(true);
    setNotasError('');
    setNotasGuardadas(false);
    try {
      const res = await fetch(`/api/psicologo/citas/${citaId}/notas`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notasClinicas: notasCita }),
      });
      if (res.ok) {
        setNotasGuardadas(true);
        setTimeout(() => setNotasGuardadas(false), 3000);
      } else {
        const d = await res.json().catch(() => ({}));
        setNotasError(d.error || 'Error al guardar');
      }
    } catch { setNotasError('Error de conexión.'); }
    finally { setNotasGuardando(false); }
  };

  /* ── Perfil ── */
  const cargarPerfil = useCallback(async () => {
    setCargandoPerfil(true);
    try {
      const res = await fetch('/api/psicologos/perfil');
      if (!res.ok) return;
      const { psicologo } = await res.json();
      setVerificado(psicologo.tarjetaVerificada ?? false);
      setEstadoPerfil(psicologo.estado ?? '');
      setForm({
        nombreCompleto:     psicologo.nombreCompleto ?? '',
        bio:                psicologo.bio ?? '',
        formacion:          psicologo.formacion ?? '',
        especialidades:     (psicologo.especialidades ?? []).join(', '),
        enfoqueTerapeutico: (psicologo.enfoqueTerapeutico ?? []).join(', '),
        anosExperiencia:    String(psicologo.anosExperiencia ?? ''),
        tarifaCOP:          String(psicologo.tarifaCOP ?? ''),
        ciudades:           (psicologo.ciudades ?? []).join(', '),
      });
    } finally { setCargandoPerfil(false); }
  }, []);

  useEffect(() => { if (tab === 'perfil') cargarPerfil(); }, [tab, cargarPerfil]);

  const guardarPerfil = async () => {
    setErrorPerfil(''); setGuardandoPerfil(true);
    try {
      const split = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean);
      const res = await fetch('/api/psicologos/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreCompleto:     form.nombreCompleto   || undefined,
          bio:                form.bio              || undefined,
          formacion:          form.formacion        || undefined,
          especialidades:     split(form.especialidades),
          enfoqueTerapeutico: split(form.enfoqueTerapeutico),
          anosExperiencia:    form.anosExperiencia ? parseInt(form.anosExperiencia, 10) : undefined,
          tarifaCOP:          form.tarifaCOP       ? parseInt(form.tarifaCOP, 10)       : undefined,
          ciudades:           split(form.ciudades),
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) { setPerfilGuardado(true); setTimeout(() => setPerfilGuardado(false), 3000); }
      else setErrorPerfil(d.error ?? 'Error al guardar');
    } finally { setGuardandoPerfil(false); }
  };

  const campo = (k: keyof PerfilForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  /* ── Calendario helpers ── */
  const diasEnMes = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const primerDia = (y: number, m: number) => {
    const d = new Date(y, m, 1).getDay();
    return d === 0 ? 6 : d - 1; // lunes=0
  };

  const citasPorDia = (dia: number): Cita[] => {
    const y = mesVista.getFullYear(), m = mesVista.getMonth();
    return citasMes.filter(c => {
      // Comparar en hora Colombia para que 8 AM no caiga en el día anterior
      const fCO = new Date(new Date(c.fechaHora).toLocaleString('en-US', { timeZone: TZ }));
      return fCO.getFullYear() === y && fCO.getMonth() === m && fCO.getDate() === dia;
    });
  };

  const isoDelDia = (dia: number) => {
    const d = new Date(mesVista.getFullYear(), mesVista.getMonth(), dia);
    return d.toISOString().split('T')[0];
  };

  const citasDiaSeleccionado = diaSeleccionado
    ? citasMes.filter(c => c.fechaHora.startsWith(diaSeleccionado))
    : [];

  const mesActual = mesVista.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

  /* ── Render ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'white' }}>👨‍⚕️ Panel del Psicólogo</h1>
          <p style={{ fontSize: '13px', color: '#5a8a6a', marginTop: '4px' }}>
            {form.nombreCompleto ? `Dr/a. ${form.nombreCompleto}` : 'MenteBridge'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {verificado && (
            <div style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: '8px', padding: '6px 14px' }}>
              <span style={{ fontSize: '11px', color: '#2dd4bf', fontWeight: '700' }}>✅ COLPSIC Verificado</span>
            </div>
          )}
          {estadoPerfil === 'PENDIENTE_VERIFICACION' && (
            <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '8px', padding: '6px 14px' }}>
              <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: '700' }}>⏳ Verificación pendiente</span>
            </div>
          )}

          {/* Campana notificaciones */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setPanelNotifs(p => !p)}
              style={{ background: notifs.length > 0 ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${notifs.length > 0 ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', width: '40px', height: '40px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
              title="Notificaciones"
            >
              🔔
              {notifs.length > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0a1510' }}>
                  {notifs.length}
                </span>
              )}
            </button>

            {/* Panel desplegable */}
            {panelNotifs && (
              <div style={{ position: 'absolute', top: '48px', right: 0, width: '340px', background: '#0d1a12', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 100, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', color: 'white', fontSize: '13px' }}>🔔 Notificaciones</span>
                  <button onClick={() => setPanelNotifs(false)} style={{ background: 'none', border: 'none', color: '#5a8a6a', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                </div>
                {notifs.length === 0 ? (
                  <p style={{ padding: '20px', color: '#3d5c48', fontSize: '13px', textAlign: 'center' }}>Sin notificaciones pendientes</p>
                ) : (
                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {notifs.map(n => (
                      <div key={n.id} style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <p style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: 1.5 }}>{n.mensaje}</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => { accionarCita(n.citaId, 'CONFIRMAR'); setPanelNotifs(false); }}
                            disabled={accionando === n.citaId}
                            style={{ flex: 1, background: '#1a6b4a', color: 'white', border: 'none', borderRadius: '7px', padding: '7px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', opacity: accionando === n.citaId ? 0.6 : 1 }}
                          >
                            ✅ Confirmar
                          </button>
                          <button
                            onClick={() => { accionarCita(n.citaId, 'CANCELAR'); setPanelNotifs(false); }}
                            disabled={accionando === n.citaId}
                            style={{ flex: 1, background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '7px', padding: '7px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', opacity: accionando === n.citaId ? 0.6 : 1 }}
                          >
                            ✕ Cancelar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px' }}>
        {[
          { label: 'Citas hoy', val: String(citasHoy.length), icon: '📅', color: '#2dd4bf' },
          { label: 'Este mes', val: String(citasMes.filter(c => c.estado !== 'CANCELADA_USUARIO' && c.estado !== 'CANCELADA_PSICOLOGO').length), icon: '📊', color: '#818cf8' },
          { label: 'Pendientes confirmar', val: String(citasMes.filter(c => c.estado === 'PENDIENTE').length), icon: '⏳', color: '#fbbf24' },
          { label: 'Completadas mes', val: String(citasMes.filter(c => c.estado === 'COMPLETADA').length), icon: '✅', color: '#34d399' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>{s.icon}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: '11px', color: '#3d5c48', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', background: '#0d1a12', padding: '4px', borderRadius: '10px', border: '1px solid #1a2e1f' }}>
        {[['hoy', '📅 Hoy'], ['agenda', '🗓 Calendario'], ['pacientes', '👥 Pacientes'], ['tareas', '✅ Tareas'], ['pagos', '💰 Pagos'], ['perfil', '👤 Mi Perfil']].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v as any)} style={{ flex: 1, padding: '9px 8px', borderRadius: '7px', border: 'none', background: tab === v ? '#1a6b4a' : 'transparent', color: tab === v ? 'white' : '#5a8a6a', cursor: 'pointer', fontSize: '12px', fontWeight: tab === v ? '700' : '400', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{l}</button>
        ))}
      </div>

      {/* ── HOY ── */}
      {tab === 'hoy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>
            Citas de hoy — {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>

          {cargandoCitas && <p style={{ color: '#5a8a6a', fontSize: '14px' }}>Cargando citas...</p>}

          {!cargandoCitas && citasHoy.length === 0 && (
            <div style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '14px', padding: '32px', textAlign: 'center' }}>
              <p style={{ fontSize: '32px', marginBottom: '12px' }}>🌿</p>
              <p style={{ color: '#5a8a6a', fontSize: '14px' }}>Sin citas programadas para hoy</p>
            </div>
          )}

          {citasHoy.map(cita => {
            const est = colorEstado[cita.estado] ?? colorEstado.PENDIENTE;
            return (
              <div key={cita.id} style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '14px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center', minWidth: '64px' }}>
                  <p style={{ fontSize: '18px', fontWeight: '900', color: '#2dd4bf' }}>{fmtHora(cita.fechaHora)}</p>
                  <p style={{ fontSize: '11px', color: '#3d5c48' }}>{cita.duracionMinutos} min</p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '700', color: 'white', fontSize: '15px', marginBottom: '4px' }}>{nombrePaciente(cita)}</p>
                  <p style={{ fontSize: '13px', color: '#5a8a6a', marginBottom: '8px' }}>{cita.tipo.replace('_', ' ')} · {cita.modalidad}</p>
                  {citaNotas === cita.id && (
                    <div style={{ marginTop: '14px', borderTop: '1px solid #1a2e1f', paddingTop: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#5a8a6a', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📝 Notas clínicas</span>
                        <span style={{ fontSize: '11px', color: '#3d5c48' }}>— solo visibles para ti</span>
                      </div>
                      {notasCargando ? (
                        <p style={{ color: '#3d5c48', fontSize: '13px' }}>Cargando...</p>
                      ) : (
                        <>
                          <textarea
                            value={notasCita}
                            onChange={e => { setNotasCita(e.target.value); setNotasGuardadas(false); }}
                            placeholder={`Motivo de consulta:\n\nObservaciones:\n\nPlan terapéutico:\n\nTareas para el paciente:`}
                            rows={8}
                            style={{ width: '100%', background: '#0a1510', border: '1px solid #2a3d2e', borderRadius: '8px', padding: '12px', color: 'white', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                            <button
                              onClick={() => guardarNotas(cita.id)}
                              disabled={notasGuardando}
                              style={{ background: notasGuardadas ? '#1a6b4a' : '#0d9488', color: 'white', padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: notasGuardando ? 'wait' : 'pointer', fontSize: '13px', fontFamily: 'inherit', fontWeight: '700', opacity: notasGuardando ? 0.7 : 1 }}>
                              {notasGuardando ? 'Guardando...' : notasGuardadas ? '✅ Guardado' : 'Guardar notas'}
                            </button>
                            <span style={{ fontSize: '12px', color: '#3d5c48' }}>
                              {notasCita.length}/10000 caracteres
                            </span>
                            {notasError && <span style={{ fontSize: '12px', color: '#f87171' }}>{notasError}</span>}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ background: est.bg, color: est.color, border: `1px solid ${est.color}33`, borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '700' }}>{est.label}</span>
                  {cita.estado === 'PENDIENTE' && (
                    <>
                      <button onClick={() => accionarCita(cita.id, 'CONFIRMAR')} disabled={accionando === cita.id}
                        style={{ background: '#1a6b4a', color: 'white', padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '700', fontFamily: 'inherit', opacity: accionando === cita.id ? 0.6 : 1 }}>
                        ✅ Confirmar
                      </button>
                      <button onClick={() => accionarCita(cita.id, 'CANCELAR')} disabled={accionando === cita.id}
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', fontFamily: 'inherit', opacity: accionando === cita.id ? 0.6 : 1 }}>
                        ✕ Cancelar
                      </button>
                    </>
                  )}
                  {cita.estado === 'CONFIRMADA' && (
                    <a href={`/dashboard/citas/${cita.id}/videollamada`}
                      style={{ background: '#1a6b4a', color: 'white', padding: '8px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: '700' }}>
                      📹 Iniciar
                    </a>
                  )}
                  <button onClick={() => abrirNotas(cita.id)}
                    style={{ background: citaNotas === cita.id ? 'rgba(13,148,136,0.15)' : '#1a2e1f', border: `1px solid ${citaNotas === cita.id ? '#0d9488' : '#2a3d2e'}`, color: citaNotas === cita.id ? '#2dd4bf' : '#8aab96', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', fontWeight: '600' }}>
                    📝 Notas
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CALENDARIO ── */}
      {tab === 'agenda' && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>

          {/* Calendario mensual */}
          <div style={{ flex: '1 1 320px', background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '14px', padding: '20px' }}>
            {/* Nav mes */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <button onClick={() => { setMesVista(m => new Date(m.getFullYear(), m.getMonth() - 1, 1)); setDiaSeleccionado(null); }}
                style={{ background: '#1a2e1f', border: '1px solid #2a3d2e', color: '#8aab96', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontFamily: 'inherit' }}>‹</button>
              <span style={{ fontWeight: '700', color: 'white', fontSize: '15px', textTransform: 'capitalize' }}>{mesActual}</span>
              <button onClick={() => { setMesVista(m => new Date(m.getFullYear(), m.getMonth() + 1, 1)); setDiaSeleccionado(null); }}
                style={{ background: '#1a2e1f', border: '1px solid #2a3d2e', color: '#8aab96', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontFamily: 'inherit' }}>›</button>
            </div>

            {/* Cabecera días semana */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px', marginBottom: '6px' }}>
              {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: '#3d5c48', fontWeight: '700', padding: '4px 0' }}>{d}</div>
              ))}
            </div>

            {/* Días */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px' }}>
              {Array.from({ length: primerDia(mesVista.getFullYear(), mesVista.getMonth()) }).map((_, i) => (
                <div key={`e${i}`} />
              ))}
              {Array.from({ length: diasEnMes(mesVista.getFullYear(), mesVista.getMonth()) }, (_, i) => i + 1).map(dia => {
                const citasDia = citasPorDia(dia);
                const iso = isoDelDia(dia);
                const esHoy = iso === new Date().toISOString().split('T')[0];
                const seleccionado = iso === diaSeleccionado;
                const pendientes = citasDia.filter(c => c.estado === 'PENDIENTE').length;
                return (
                  <button key={dia} onClick={() => setDiaSeleccionado(seleccionado ? null : iso)}
                    style={{
                      aspectRatio: '1', borderRadius: '8px', border: seleccionado ? '2px solid #2dd4bf' : esHoy ? '2px solid rgba(45,212,191,0.4)' : '1px solid transparent',
                      background: seleccionado ? 'rgba(45,212,191,0.15)' : esHoy ? 'rgba(45,212,191,0.06)' : 'transparent',
                      color: esHoy ? '#2dd4bf' : 'white', fontSize: '13px', fontWeight: esHoy || seleccionado ? '700' : '400',
                      cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', position: 'relative', padding: '4px',
                    }}>
                    {dia}
                    {citasDia.length > 0 && (
                      <span style={{ display: 'flex', gap: '2px' }}>
                        {citasDia.slice(0, 3).map((c, i) => (
                          <span key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: pendientes > 0 ? '#fbbf24' : '#2dd4bf', display: 'inline-block' }} />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '14px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[{ color: '#2dd4bf', label: 'Confirmada' }, { color: '#fbbf24', label: 'Pendiente' }, { color: '#f87171', label: 'Cancelada' }].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                  <span style={{ fontSize: '11px', color: '#5a8a6a' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Panel derecho: citas del día seleccionado */}
          <div style={{ flex: '1 1 300px', background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontWeight: '700', color: 'white', fontSize: '15px' }}>
              {diaSeleccionado
                ? new Date(diaSeleccionado + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
                : 'Selecciona un día'}
            </h3>

            {!diaSeleccionado && (
              <p style={{ color: '#3d5c48', fontSize: '13px' }}>Haz clic en un día del calendario para ver sus citas.</p>
            )}

            {diaSeleccionado && citasDiaSeleccionado.length === 0 && (
              <p style={{ color: '#3d5c48', fontSize: '13px' }}>Sin citas para este día.</p>
            )}

            {citasDiaSeleccionado.map(cita => {
              const est = colorEstado[cita.estado] ?? colorEstado.PENDIENTE;
              return (
                <div key={cita.id} style={{ background: '#141f17', border: '1px solid #2a3d2e', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', color: '#2dd4bf', fontSize: '15px' }}>{fmtHora(cita.fechaHora)}</span>
                    <span style={{ background: est.bg, color: est.color, border: `1px solid ${est.color}33`, borderRadius: '10px', padding: '3px 10px', fontSize: '11px', fontWeight: '700' }}>{est.label}</span>
                  </div>
                  <p style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>{nombrePaciente(cita)}</p>
                  <p style={{ color: '#5a8a6a', fontSize: '12px' }}>{cita.tipo.replace('_', ' ')} · {cita.duracionMinutos} min · {cita.modalidad}</p>
                  {cita.estado === 'PENDIENTE' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => accionarCita(cita.id, 'CONFIRMAR')} disabled={accionando === cita.id}
                        style={{ flex: 1, background: '#1a6b4a', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', opacity: accionando === cita.id ? 0.6 : 1 }}>
                        ✅ Confirmar
                      </button>
                      <button onClick={() => accionarCita(cita.id, 'CANCELAR')} disabled={accionando === cita.id}
                        style={{ flex: 1, background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', opacity: accionando === cita.id ? 0.6 : 1 }}>
                        ✕ Cancelar
                      </button>
                    </div>
                  )}
                  {cita.estado === 'CONFIRMADA' && (
                    <a href={`/dashboard/citas/${cita.id}/videollamada`}
                      style={{ background: '#1a6b4a', color: 'white', padding: '8px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: '700', textAlign: 'center' }}>
                      📹 Iniciar videollamada
                    </a>
                  )}
                  <button onClick={() => abrirNotas(cita.id)}
                    style={{ background: citaNotas === cita.id ? 'rgba(13,148,136,0.15)' : '#1a2e1f', border: `1px solid ${citaNotas === cita.id ? '#0d9488' : '#2a3d2e'}`, color: citaNotas === cita.id ? '#2dd4bf' : '#8aab96', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', fontWeight: '600', width: '100%' }}>
                    📝 {citaNotas === cita.id ? 'Cerrar notas' : 'Ver / editar notas'}
                  </button>
                  {citaNotas === cita.id && (
                    <div style={{ borderTop: '1px solid #1a2e1f', paddingTop: '12px' }}>
                      {notasCargando ? (
                        <p style={{ color: '#3d5c48', fontSize: '13px' }}>Cargando...</p>
                      ) : (
                        <>
                          <textarea
                            value={notasCita}
                            onChange={e => { setNotasCita(e.target.value); setNotasGuardadas(false); }}
                            placeholder={`Motivo de consulta:\n\nObservaciones:\n\nPlan terapéutico:`}
                            rows={6}
                            style={{ width: '100%', background: '#0a1510', border: '1px solid #2a3d2e', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                            <button onClick={() => guardarNotas(cita.id)} disabled={notasGuardando}
                              style={{ background: notasGuardadas ? '#1a6b4a' : '#0d9488', color: 'white', padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '700', fontFamily: 'inherit', opacity: notasGuardando ? 0.7 : 1 }}>
                              {notasGuardando ? 'Guardando...' : notasGuardadas ? '✅ Guardado' : 'Guardar'}
                            </button>
                            {notasError && <span style={{ fontSize: '11px', color: '#f87171' }}>{notasError}</span>}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PACIENTES / HISTORIA ── */}
      {tab === 'pacientes' && (
        <HistoriaClinica citasHoy={[...citasHoy, ...citasMes]} />
      )}

      {/* ── TAREAS ── */}
      {tab === 'tareas' && (
        <TareasPanel />
      )}

      {/* ── PAGOS ── */}
      {tab === 'pagos' && (
        <div style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>Pagos — {new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '12px' }}>
            {[
              { label: 'Citas completadas', val: String(citasMes.filter(c => c.estado === 'COMPLETADA').length), color: '#2dd4bf' },
              { label: 'Ingreso neto mes', val: '$' + citasMes.filter(c => c.estado === 'COMPLETADA' && c.estadoPago === 'APROBADO').reduce((s, c) => s + c.montoPsicologoCOP, 0).toLocaleString('es-CO'), color: '#fbbf24' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#141f17', border: '1px solid #2a3d2e', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '900', color: s.color }}>{s.val}</div>
                <div style={{ fontSize: '11px', color: '#3d5c48', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PERFIL ── */}
      {tab === 'perfil' && (
        <div style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>Mi perfil público</h2>
          {cargandoPerfil ? (
            <p style={{ color: '#5a8a6a', fontSize: '14px' }}>Cargando perfil...</p>
          ) : (
            <>
              {([
                { k: 'nombreCompleto' as const,     label: 'Nombre completo',                        ph: 'Dr/a. Nombre Apellido' },
                { k: 'tarifaCOP' as const,           label: 'Tarifa por sesión (COP)',                ph: '80000' },
                { k: 'anosExperiencia' as const,     label: 'Años de experiencia',                    ph: '5' },
                { k: 'especialidades' as const,      label: 'Especialidades (separadas por coma)',     ph: 'Ansiedad, Depresión, TCC' },
                { k: 'enfoqueTerapeutico' as const,  label: 'Enfoque terapéutico (separado por coma)', ph: 'TCC, Mindfulness' },
                { k: 'ciudades' as const,            label: 'Ciudades (separadas por coma)',           ph: 'Bogotá, Medellín' },
                { k: 'formacion' as const,           label: 'Formación académica',                     ph: 'Psicólogo clínico, U. de los Andes (2018)' },
              ]).map(({ k, label, ph }) => (
                <div key={k}>
                  <label style={{ fontSize: '12px', color: '#5a8a6a', fontWeight: '600', display: 'block', marginBottom: '5px' }}>{label}</label>
                  <input value={form[k]} onChange={campo(k)} placeholder={ph}
                    type={k === 'tarifaCOP' || k === 'anosExperiencia' ? 'number' : 'text'}
                    style={{ width: '100%', background: '#141f17', border: '1px solid #2a3d2e', borderRadius: '8px', padding: '10px 12px', color: 'white', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '12px', color: '#5a8a6a', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Bio profesional</label>
                <textarea value={form.bio} onChange={campo('bio')} placeholder="Descripción breve de tu práctica, enfoque y experiencia..." rows={4}
                  style={{ width: '100%', background: '#141f17', border: '1px solid #2a3d2e', borderRadius: '8px', padding: '10px 12px', color: 'white', fontSize: '13px', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
              {errorPerfil && <p style={{ fontSize: '13px', color: '#f87171' }}>⚠️ {errorPerfil}</p>}
              <button onClick={guardarPerfil} disabled={guardandoPerfil}
                style={{ background: perfilGuardado ? '#1a4a35' : '#1a6b4a', color: 'white', padding: '11px 24px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start', opacity: guardandoPerfil ? 0.7 : 1 }}>
                {guardandoPerfil ? 'Guardando...' : perfilGuardado ? '✅ Perfil actualizado' : 'Guardar perfil'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
