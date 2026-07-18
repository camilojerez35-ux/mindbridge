'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import EmptyState from '@/components/ui/EmptyState';

// ── Tipos ──────────────────────────────────────────────────────────

interface Psicologo {
  id: string;
  nombreCompleto: string;
  especialidades: string[];
  enfoqueTerapeutico: string[];
  bio: string;
  formacion?: string | null;
  anosExperiencia: number;
  tarifaCOP: number;
  disponibilidad?: Record<string, string[]> | null;
  ciudades: string[];
  modalidad: string[];
  idiomas: string[];
  calificacionPromedio: number | null;
  totalCitas?: number;
  totalReseñas?: number;
  fotoUrl: string | null;
  tarjetaVerificada?: boolean;
  tarjetaProfesionalId?: string | null;
  tarjetaVencimiento?: string | null;
  activo: boolean;
}

interface DatosWidget {
  publicKey: string;
  currency: string;
  amountInCents: number;
  reference: string;
  integritySignature: string;
  redirectUrl: string;
  customerData: { email: string; fullName: string };
}

interface CitaCreada {
  citaId: string;
  referencia: string;
  psicologo: string;
  montoCOP: number;
  datosWidget: DatosWidget;
}

interface CitaAPI {
  id: string;
  fechaHora: string;
  estado: string;
  montoCOP: number;
  estadoPago: string;
  salaVideollamada?: string | null;
  psicologoId: string;
  psicologo: { nombreCompleto: string };
  pago?: { metodoPago: string } | null;
  resena?: { id: string; calificacion: number; comentario: string | null } | null;
}

// ── Helpers ────────────────────────────────────────────────────────

const HORARIOS = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM'];

const ESTADO_COLOR: Record<string, string> = {
  CONFIRMADA: '#2dd4bf', PENDIENTE: '#fbbf24', COMPLETADA: '#6ee7b7',
  CANCELADA_USUARIO: '#f87171', CANCELADA_PSICOLOGO: '#f87171',
};

const COLORES_CARD = ['#1a6b4a','#1a3d6b','#2d0a3d','#3d1a0a','#1a3a1a','#3d2d0a'];

/** Iniciales para el avatar cuando no hay fotoUrl */
function iniciales(nombre: string): string {
  return nombre.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

/** Días hasta que vence la tarjeta profesional (negativo = ya venció) */
function diasParaVencimiento(vencimiento?: string | null): number | null {
  if (!vencimiento) return null;
  return Math.floor((new Date(vencimiento).getTime() - Date.now()) / 86400000);
}

/** El psicólogo tiene al menos un día con horarios disponibles */
function tieneDisponibilidad(disponibilidad?: Record<string, string[]> | null): boolean {
  if (!disponibilidad) return true; // sin datos → asumir disponible para no bloquear el flujo
  return Object.values(disponibilidad).some(slots => slots.length > 0);
}

type Vista = 'buscar' | 'perfil' | 'agendar' | 'miscitas';

// ── Componente ─────────────────────────────────────────────────────

export default function CitasPage() {
  // Psicólogos de la BD
  const [psicologos, setPsicologos]         = useState<Psicologo[]>([]);
  const [cargandoPs, setCargandoPs]         = useState(true);
  const [errorCarga, setErrorCarga]         = useState('');
  const [total, setTotal]                   = useState(0);

  // Filtros
  const [filtro, setFiltro]                 = useState('');
  const [filtroCiudad, setFiltroCiudad]     = useState('');

  // Navegación
  const [vista, setVista]                   = useState<Vista>('buscar');
  const [psicologo, setPsicologo]           = useState<Psicologo | null>(null);

  // Agendamiento
  const [horario, setHorario]               = useState('');
  const [dia, setDia]                       = useState('');
  const [metodoPago, setMetodoPago]         = useState('');
  const [cargando, setCargando]             = useState(false);
  const [error, setError]                   = useState('');
  const [citaCreada, setCitaCreada]         = useState<CitaCreada | null>(null);
  const wompiFormRef                        = useRef<HTMLDivElement>(null);

  // Mis citas
  const [citas, setCitas]                   = useState<CitaAPI[]>([]);
  const [cargandoCitas, setCargandoCitas]   = useState(false);

  // Reseñas
  const [modalResena, setModalResena]       = useState<CitaAPI | null>(null);
  const [estrellas, setEstrellas]           = useState(0);
  const [estrellasHover, setEstrellasHover] = useState(0);
  const [comentario, setComentario]         = useState('');
  const [enviandoResena, setEnviandoResena] = useState(false);
  const [errorResena, setErrorResena]       = useState('');

  // ── Carga de psicólogos desde la API ────────────────────────────

  const cargarPsicologos = useCallback(async () => {
    setCargandoPs(true);
    setErrorCarga('');
    try {
      const params = new URLSearchParams({ limite: '50' });
      if (filtroCiudad) params.set('ciudad', filtroCiudad);

      const res = await fetch(`/api/psicologos?${params}`);
      if (!res.ok) throw new Error('Error al cargar psicólogos');
      const data = await res.json();
      setPsicologos(data.psicologos ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setErrorCarga('No se pudieron cargar los psicólogos. Intenta de nuevo.');
    } finally {
      setCargandoPs(false);
    }
  }, [filtroCiudad]);

  useEffect(() => { cargarPsicologos(); }, [cargarPsicologos]);

  // Filtro de texto libre (client-side sobre los resultados ya cargados)
  const filtrados = psicologos.filter(p => {
    if (!filtro) return true;
    const q = filtro.toLowerCase();
    return (
      p.nombreCompleto.toLowerCase().includes(q) ||
      p.especialidades.some(e => e.toLowerCase().includes(q)) ||
      p.ciudades.some(c => c.toLowerCase().includes(q)) ||
      (p.bio ?? '').toLowerCase().includes(q)
    );
  });

  // ── Carga de citas del usuario ───────────────────────────────────

  useEffect(() => {
    if (vista !== 'miscitas') return;
    setCargandoCitas(true);
    fetch('/api/citas')
      .then(r => r.json())
      .then(data => setCitas(data.citas ?? []))
      .catch(() => setCitas([]))
      .finally(() => setCargandoCitas(false));
  }, [vista]);

  // Detectar retorno desde Wompi con pago exitoso
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('pago') === 'exitoso') {
      setVista('miscitas');
      window.history.replaceState({}, '', '/dashboard/citas');
    }
  }, []);

  // ── Reseñas ───────────────────────────────────────────────────────

  const abrirModalResena = (cita: CitaAPI) => {
    setModalResena(cita);
    setEstrellas(cita.resena?.calificacion ?? 0);
    setComentario(cita.resena?.comentario ?? '');
    setErrorResena('');
  };

  const enviarResena = async () => {
    if (!modalResena || estrellas === 0) { setErrorResena('Selecciona una calificación.'); return; }
    setEnviandoResena(true);
    setErrorResena('');
    try {
      const res = await fetch('/api/resenas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citaId: modalResena.id, calificacion: estrellas, comentario: comentario.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorResena(data.error || 'Error al enviar'); return; }
      // Actualizar la cita en el estado local
      setCitas(prev => prev.map(c => c.id === modalResena.id ? { ...c, resena: data.resena } : c));
      setModalResena(null);
    } catch { setErrorResena('Error de conexión.'); }
    finally { setEnviandoResena(false); }
  };

  // ── Agendamiento ─────────────────────────────────────────────────

  const confirmarCita = async () => {
    if (!horario || !dia || !metodoPago || !psicologo) return;
    setError('');
    setCargando(true);

    const [time, meridiem] = horario.split(' ');
    const [hStr, mStr] = time.split(':');
    let horas = parseInt(hStr, 10);
    if (meridiem === 'PM' && horas !== 12) horas += 12;
    if (meridiem === 'AM' && horas === 12) horas = 0;
    // Construir fecha en hora Colombia (UTC-5) para que 8 AM se guarde como 13:00 UTC
    const fechaHora = new Date(`${dia}T${String(horas).padStart(2,'0')}:${mStr}:00-05:00`).toISOString();

    try {
      const res = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          psicologoId: psicologo.id,
          fechaHora,
          metodoPago: metodoPago.toUpperCase() as 'PSE'|'NEQUI'|'TARJETA'|'DAVIPLATA',
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Error al agendar la cita'); return; }
      setCitaCreada({
        citaId:      data.citaId,
        referencia:  data.referencia,
        psicologo:   data.psicologo,
        montoCOP:    data.montoCOP,
        datosWidget: data.datosWidget,
      });
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  // ── Montar widget de Wompi cuando la cita es creada ──────────────
  // El widget de Wompi es un script que transforma un <form> con data-* en un botón de pago.
  useEffect(() => {
    if (!citaCreada || !wompiFormRef.current) return;

    const { datosWidget: w } = citaCreada;
    if (!w.publicKey) return; // Sin clave pública → entorno sin Wompi configurado

    const container = wompiFormRef.current;
    container.innerHTML = ''; // Limpiar instancia anterior si existe

    // Crear el formulario que Wompi transforma en botón de pago
    const form = document.createElement('form');
    form.action = 'https://checkout.wompi.co/p/';
    form.method = 'GET';

    const campos: Record<string, string> = {
      'public-key':            w.publicKey,
      'currency':              w.currency,
      'amount-in-cents':       String(w.amountInCents),
      'reference':             w.reference,
      'signature:integrity':   w.integritySignature,
      'redirect-url':          w.redirectUrl,
      'customer-data:email':   w.customerData.email,
      'customer-data:full-name': w.customerData.fullName,
    };

    Object.entries(campos).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type  = 'hidden';
      input.name  = `data-${key}`;
      input.value = value;
      form.appendChild(input);
    });

    // Botón visible que envía el formulario
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.textContent = `💳 Pagar $${new Intl.NumberFormat('es-CO').format(citaCreada.montoCOP)} COP`;
    btn.style.cssText = 'width:100%;padding:14px;background:#1a6b4a;color:white;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;margin-top:8px;';
    form.appendChild(btn);

    container.appendChild(form);

    // Cargar el script de Wompi (idempotente — solo se añade una vez)
    if (!document.querySelector('script[src*="checkout.wompi.co"]')) {
      const script = document.createElement('script');
      script.src   = 'https://checkout.wompi.co/widget.js';
      script.async = true;
      document.body.appendChild(script);
    }

    return () => { container.innerHTML = ''; };
  }, [citaCreada]);

  // ── Helpers de render ────────────────────────────────────────────

  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
    return { label: d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' }), value: d.toISOString().split('T')[0] };
  });

  const fmt = (n: number) => new Intl.NumberFormat('es-CO').format(n);

  const colorCard = (id: string) => COLORES_CARD[id.charCodeAt(0) % COLORES_CARD.length];

  // ── Render ───────────────────────────────────────────────────────

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header + tabs */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'white', marginBottom: '16px' }}>
          👨‍⚕️ Psicólogos y Citas
        </h1>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {([['buscar','🔍 Buscar psicólogos'], ['miscitas','📅 Mis citas']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setVista(v)} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: vista === v ? '#1a6b4a' : '#1a2e1f', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit' }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ── BUSCAR ── */}
      {vista === 'buscar' && (
        <>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              placeholder="🔍 Buscar por nombre, especialidad o ciudad..."
              style={{ flex: 1, minWidth: '200px', background: '#0d1a12', border: '1px solid #2a3d2e', borderRadius: '10px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
            />
            <select
              value={filtroCiudad}
              onChange={e => setFiltroCiudad(e.target.value)}
              style={{ background: '#0d1a12', border: '1px solid #2a3d2e', borderRadius: '10px', padding: '12px 14px', color: filtroCiudad ? 'white' : '#5a8a6a', fontSize: '14px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
            >
              <option value="">Todas las ciudades</option>
              {['Bogotá','Medellín','Cali','Barranquilla','Bucaramanga'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Estado de carga */}
          {cargandoPs && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '16px' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '16px', height: '220px', opacity: 0.5, animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          )}

          {/* Error */}
          {!cargandoPs && errorCarga && (
            <EmptyState
              icon="⚠️"
              titulo="Error al cargar psicólogos"
              descripcion={errorCarga}
              accionLabel="Reintentar"
              onAccion={cargarPsicologos}
            />
          )}

          {/* Sin resultados */}
          {!cargandoPs && !errorCarga && filtrados.length === 0 && (
            <EmptyState
              icon="🔍"
              titulo={total === 0 ? 'No hay psicólogos disponibles aún' : 'Sin resultados para tu búsqueda'}
              descripcion={total === 0
                ? 'Estamos verificando psicólogos COLPSIC. Vuelve pronto.'
                : 'Intenta con otro nombre, especialidad o ciudad.'
              }
              accionLabel="Limpiar filtros"
              onAccion={() => { setFiltro(''); setFiltroCiudad(''); }}
            />
          )}

          {/* Grilla de psicólogos */}
          {!cargandoPs && !errorCarga && filtrados.length > 0 && (
            <>
              <p style={{ fontSize: '13px', color: '#5a8a6a' }}>
                {filtrados.length} psicólogo{filtrados.length !== 1 ? 's' : ''} verificado{filtrados.length !== 1 ? 's' : ''} ante COLPSIC
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '16px' }}>
                {filtrados.map(ps => {
                  const disponible = tieneDisponibilidad(ps.disponibilidad);
                  const color = colorCard(ps.id);
                  const avatar = ps.fotoUrl ? null : iniciales(ps.nombreCompleto);
                  const rating = ps.calificacionPromedio ?? 0;
                  const ciudad = ps.ciudades[0] ?? '';

                  return (
                    <div key={ps.id} style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '16px', overflow: 'hidden' }}>
                      <div style={{ background: color, padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                        {/* Avatar */}
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900', color: 'white', flexShrink: 0, overflow: 'hidden' }}>
                          {ps.fotoUrl
                            ? <img src={ps.fotoUrl} alt={ps.nombreCompleto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : avatar
                          }
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'white' }}>{ps.nombreCompleto}</h3>
                            {ps.tarjetaVerificada && (
                              <span
                                title={ps.tarjetaProfesionalId ? `COLPSIC N.° ${ps.tarjetaProfesionalId}` : 'Verificado ante COLPSIC'}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: '10px', padding: '1px 7px', fontSize: '10px', fontWeight: '700', color: '#4ade80', flexShrink: 0 }}
                              >
                                ✓ COLPSIC
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>
                            {ciudad}{ciudad ? ' · ' : ''}{ps.anosExperiencia} año{ps.anosExperiencia !== 1 ? 's' : ''} exp.
                          </p>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {ps.especialidades.slice(0, 2).map(e => (
                              <span key={e} style={{ fontSize: '10px', background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '10px', color: 'rgba(255,255,255,0.9)' }}>{e}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          {rating > 0 ? (
                            <>
                              <p style={{ fontSize: '18px', fontWeight: '900', color: 'white' }}>⭐ {rating.toFixed(1)}</p>
                              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{ps.totalReseñas ?? 0} reseña{(ps.totalReseñas ?? 0) !== 1 ? 's' : ''}</p>
                            </>
                          ) : (
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Nuevo</p>
                          )}
                        </div>
                      </div>

                      <div style={{ padding: '16px 20px' }}>
                        <p style={{ fontSize: '13px', color: '#5a8a6a', lineHeight: 1.5, marginBottom: '14px' }}>
                          {ps.bio.slice(0, 120)}{ps.bio.length > 120 ? '…' : ''}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                          <div>
                            <p style={{ fontSize: '18px', fontWeight: '900', color: '#2dd4bf' }}>${fmt(ps.tarifaCOP)}</p>
                            <p style={{ fontSize: '11px', color: '#3d5c48' }}>COP por sesión</p>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => { setPsicologo(ps); setVista('perfil'); }}
                              style={{ padding: '9px 14px', background: '#1a2e1f', border: '1px solid #2a3d2e', borderRadius: '8px', color: '#8aab96', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}
                            >Ver perfil</button>
                            <button
                              onClick={() => { setPsicologo(ps); setVista('agendar'); setCitaCreada(null); setError(''); }}
                              disabled={!disponible}
                              style={{ padding: '9px 14px', background: disponible ? '#1a6b4a' : '#1a2e1f', border: 'none', borderRadius: '8px', color: disponible ? 'white' : '#3d5c48', cursor: disponible ? 'pointer' : 'not-allowed', fontSize: '12px', fontWeight: '700', fontFamily: 'inherit' }}
                            >
                              {disponible ? 'Agendar cita' : 'Sin disponibilidad'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* ── MIS CITAS ── */}
      {vista === 'miscitas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {cargandoCitas && <p style={{ color: '#5a8a6a', fontSize: '14px' }}>Cargando citas...</p>}
          {!cargandoCitas && citas.length === 0 && (
            <EmptyState
              icon="📅"
              titulo="Aún no tienes citas agendadas"
              descripcion="Agenda tu primera sesión con un psicólogo certificado."
              accionLabel="🔍 Buscar psicólogos"
              onAccion={() => setVista('buscar')}
            />
          )}
          {citas.map(c => {
            const estadoColor = ESTADO_COLOR[c.estado] ?? '#8aab96';
            const fechaFmt = new Date(c.fechaHora).toLocaleString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
            return (
              <div key={c.id} style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '700', color: 'white', fontSize: '15px', marginBottom: '4px' }}>{c.psicologo.nombreCompleto}</p>
                  <p style={{ fontSize: '13px', color: '#5a8a6a' }}>📅 {fechaFmt}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: `${estadoColor}22`, color: estadoColor, border: `1px solid ${estadoColor}44`, borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '700' }}>
                    {c.estado.replace(/_/g, ' ')}
                  </span>
                  <p style={{ fontSize: '13px', color: '#3d5c48', marginTop: '4px' }}>${fmt(c.montoCOP)} COP</p>
                </div>
                {c.estado === 'CONFIRMADA' && (
                  <a href={`/dashboard/citas/${c.id}/videollamada`} style={{ background: '#1a6b4a', color: 'white', padding: '9px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '13px' }}>📹 Iniciar sesión</a>
                )}
                {c.estado === 'COMPLETADA' && (
                  c.resena ? (
                    <button onClick={() => abrirModalResena(c)} style={{ background: 'rgba(251,191,36,0.08)', color: '#fbbf24', padding: '9px 16px', borderRadius: '8px', border: '1px solid rgba(251,191,36,0.2)', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>
                      {'⭐'.repeat(c.resena.calificacion)} Ver reseña
                    </button>
                  ) : (
                    <button onClick={() => abrirModalResena(c)} style={{ background: '#1a2e1f', color: '#fbbf24', padding: '9px 16px', borderRadius: '8px', border: '1px solid rgba(251,191,36,0.2)', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>
                      ⭐ Dejar reseña
                    </button>
                  )
                )}
                {c.estadoPago === 'PENDIENTE' && (
                  <span style={{ fontSize: '12px', color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '8px', padding: '4px 10px' }}>⏳ Pago pendiente</span>
                )}
              </div>
            );
          })}
          <button onClick={() => setVista('buscar')} style={{ background: '#1a6b4a', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', marginTop: '8px' }}>
            + Agendar nueva cita
          </button>
        </div>
      )}

      {/* ── PERFIL PSICÓLOGO ── */}
      {vista === 'perfil' && psicologo && (
        <div style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ background: colorCard(psicologo.id), padding: '28px', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '900', color: 'white', flexShrink: 0, overflow: 'hidden' }}>
              {psicologo.fotoUrl
                ? <img src={psicologo.fotoUrl} alt={psicologo.nombreCompleto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : iniciales(psicologo.nombreCompleto)
              }
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>{psicologo.nombreCompleto}</h2>
                {psicologo.tarjetaVerificada && (
                  <span
                    title={psicologo.tarjetaProfesionalId ? `Tarjeta profesional N.° ${psicologo.tarjetaProfesionalId} — COLPSIC` : 'Verificado ante COLPSIC'}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(34,197,94,0.18)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '12px', padding: '3px 10px', fontSize: '12px', fontWeight: '800', color: '#4ade80' }}
                  >
                    ✓ COLPSIC Verificado
                  </span>
                )}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                {psicologo.ciudades.join(', ')} · {psicologo.anosExperiencia} años de experiencia
                {(psicologo.calificacionPromedio ?? 0) > 0 ? ` · ⭐ ${psicologo.calificacionPromedio!.toFixed(1)} (${psicologo.totalReseñas ?? 0} reseñas)` : ''}
              </p>
            </div>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* COLPSIC verification block */}
            {psicologo.tarjetaVerificada && (() => {
              const dias = diasParaVencimiento(psicologo.tarjetaVencimiento);
              const vencida = dias !== null && dias < 0;
              const proxima = dias !== null && dias >= 0 && dias <= 90;
              return (
                <div style={{ background: vencida ? 'rgba(248,113,113,0.07)' : 'rgba(34,197,94,0.07)', border: `1px solid ${vencida ? 'rgba(248,113,113,0.25)' : 'rgba(34,197,94,0.25)'}`, borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '20px', flexShrink: 0, marginTop: '1px' }}>{vencida ? '⚠️' : '🏛️'}</span>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '800', color: vencida ? '#f87171' : '#4ade80', marginBottom: '2px' }}>
                      {vencida ? 'Tarjeta profesional vencida' : 'Verificado ante COLPSIC'}
                    </p>
                    {psicologo.tarjetaProfesionalId && (
                      <p style={{ fontSize: '12px', color: '#8aab96', marginBottom: '2px' }}>
                        Tarjeta profesional N.° <strong style={{ color: 'white' }}>{psicologo.tarjetaProfesionalId}</strong>
                      </p>
                    )}
                    {psicologo.tarjetaVencimiento && (
                      <p style={{ fontSize: '11px', color: vencida ? '#f87171' : proxima ? '#fbbf24' : '#5a8a6a' }}>
                        {vencida
                          ? `Venció hace ${Math.abs(dias!)} días — en revisión por MenteBridge`
                          : proxima
                            ? `Vence en ${dias} días`
                            : `Vigente hasta ${new Date(psicologo.tarjetaVencimiento).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`
                        }
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}

            <div>
              <h3 style={{ fontSize: '14px', color: '#5a8a6a', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Sobre mí</h3>
              <p style={{ fontSize: '14px', color: '#a0b4a8', lineHeight: 1.7 }}>{psicologo.bio}</p>
            </div>
            {psicologo.formacion && (
              <div>
                <h3 style={{ fontSize: '14px', color: '#5a8a6a', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Formación</h3>
                <p style={{ fontSize: '14px', color: '#a0b4a8', lineHeight: 1.7 }}>{psicologo.formacion}</p>
              </div>
            )}
            <div>
              <h3 style={{ fontSize: '14px', color: '#5a8a6a', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Especialidades</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {psicologo.especialidades.map(e => (
                  <span key={e} style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)', color: '#2dd4bf', padding: '5px 12px', borderRadius: '20px', fontSize: '13px' }}>{e}</span>
                ))}
              </div>
            </div>
            {psicologo.enfoqueTerapeutico.length > 0 && (
              <div>
                <h3 style={{ fontSize: '14px', color: '#5a8a6a', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Enfoque terapéutico</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {psicologo.enfoqueTerapeutico.map(e => (
                    <span key={e} style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', color: '#818cf8', padding: '5px 12px', borderRadius: '20px', fontSize: '13px' }}>{e}</span>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setVista('agendar'); setCitaCreada(null); setError(''); }}
                disabled={!tieneDisponibilidad(psicologo.disponibilidad)}
                style={{ flex: 1, background: tieneDisponibilidad(psicologo.disponibilidad) ? '#1a6b4a' : '#1a2e1f', color: 'white', padding: '13px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: tieneDisponibilidad(psicologo.disponibilidad) ? 'pointer' : 'not-allowed', fontFamily: 'inherit', fontSize: '14px', opacity: tieneDisponibilidad(psicologo.disponibilidad) ? 1 : 0.5 }}
              >
                {tieneDisponibilidad(psicologo.disponibilidad) ? `Agendar cita — $${fmt(psicologo.tarifaCOP)} COP` : 'Sin disponibilidad'}
              </button>
              <button onClick={() => setVista('buscar')} style={{ padding: '13px 20px', background: '#1a2e1f', border: '1px solid #2a3d2e', borderRadius: '8px', color: '#5a8a6a', cursor: 'pointer', fontFamily: 'inherit' }}>← Volver</button>
            </div>
          </div>
        </div>
      )}

      {/* ── AGENDAR ── */}
      {vista === 'agendar' && psicologo && (
        <div style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '16px', padding: '28px', maxWidth: '560px' }}>

          {citaCreada ? (
            <div style={{ padding: '4px 0' }}>
              {/* Confirmación */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', marginBottom: '6px' }}>
                  ¡Cita registrada!
                </h3>
                <p style={{ color: '#8aab96', fontSize: '14px', marginBottom: '4px' }}>{citaCreada.psicologo}</p>
                <p style={{ fontSize: '12px', color: '#5a8a6a', fontFamily: 'monospace' }}>Ref: {citaCreada.referencia}</p>
              </div>

              {/* Resumen de pago */}
              <div style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', color: '#8aab96', marginBottom: '8px', fontWeight: '600' }}>Resumen del pago</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'white' }}>
                  <span>Sesión de psicología (45 min)</span>
                  <span style={{ fontWeight: '700', color: '#2dd4bf' }}>
                    ${new Intl.NumberFormat('es-CO').format(citaCreada.montoCOP)} COP
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#5a8a6a', marginTop: '6px' }}>
                  Método: {metodoPago} · Pago seguro vía Wompi
                </p>
              </div>

              {/* Widget de Wompi o fallback sin clave */}
              {citaCreada.datosWidget.publicKey ? (
                <>
                  <p style={{ fontSize: '13px', color: '#5a8a6a', textAlign: 'center', marginBottom: '12px' }}>
                    Completa el pago para confirmar tu cita. Serás redirigido a Wompi.
                  </p>
                  <div ref={wompiFormRef} />
                </>
              ) : (
                <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '10px', padding: '14px 16px', marginBottom: '12px' }}>
                  <p style={{ fontSize: '13px', color: '#fbbf24', fontWeight: '600', marginBottom: '4px' }}>⚠️ Pago en modo sandbox</p>
                  <p style={{ fontSize: '12px', color: '#a0896a' }}>
                    Configura <code>WOMPI_PUBLIC_KEY</code> en producción para activar el checkout real.
                    Tu cita quedó registrada — el equipo la confirmará manualmente.
                  </p>
                </div>
              )}

              {/* Acciones secundarias */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => { setVista('miscitas'); setCitaCreada(null); }}
                  style={{ flex: 1, padding: '11px', background: '#1a2e1f', border: '1px solid #2a3d2e', borderRadius: '8px', color: '#8aab96', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px' }}
                >
                  Ver mis citas
                </button>
                <button
                  onClick={() => { setCitaCreada(null); setHorario(''); setDia(''); setMetodoPago(''); }}
                  style={{ flex: 1, padding: '11px', background: '#1a2e1f', border: '1px solid #2a3d2e', borderRadius: '8px', color: '#8aab96', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px' }}
                >
                  Agendar otra cita
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: colorCard(psicologo.id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: 'white', overflow: 'hidden' }}>
                  {psicologo.fotoUrl
                    ? <img src={psicologo.fotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : iniciales(psicologo.nombreCompleto)
                  }
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>Agendar con {psicologo.nombreCompleto}</h2>
                  <p style={{ fontSize: '13px', color: '#5a8a6a' }}>Sesión de 45 min · ${fmt(psicologo.tarifaCOP)} COP</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Día */}
                <div>
                  <label style={{ fontSize: '13px', color: '#8aab96', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Selecciona el día</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {diasSemana.map(d => (
                      <button key={d.value} onClick={() => setDia(d.value)} style={{ padding: '8px 14px', borderRadius: '8px', border: `1px solid ${dia === d.value ? '#2dd4bf' : '#2a3d2e'}`, background: dia === d.value ? 'rgba(45,212,191,0.15)' : 'transparent', color: dia === d.value ? '#2dd4bf' : '#5a8a6a', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', fontWeight: dia === d.value ? '700' : '400' }}>{d.label}</button>
                    ))}
                  </div>
                </div>

                {/* Hora */}
                <div>
                  <label style={{ fontSize: '13px', color: '#8aab96', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Selecciona la hora</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {HORARIOS.map(h => (
                      <button key={h} onClick={() => setHorario(h)} style={{ padding: '8px 14px', borderRadius: '8px', border: `1px solid ${horario === h ? '#2dd4bf' : '#2a3d2e'}`, background: horario === h ? 'rgba(45,212,191,0.15)' : 'transparent', color: horario === h ? '#2dd4bf' : '#5a8a6a', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', fontWeight: horario === h ? '700' : '400' }}>{h}</button>
                    ))}
                  </div>
                </div>

                {/* Método de pago */}
                <div>
                  <label style={{ fontSize: '13px', color: '#8aab96', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Método de pago</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['PSE','NEQUI','DAVIPLATA','TARJETA'].map(m => (
                      <button key={m} onClick={() => setMetodoPago(m)} style={{ padding: '9px 16px', borderRadius: '8px', border: `1px solid ${metodoPago === m ? '#2dd4bf' : '#2a3d2e'}`, background: metodoPago === m ? 'rgba(45,212,191,0.15)' : 'transparent', color: metodoPago === m ? '#2dd4bf' : '#5a8a6a', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', fontWeight: metodoPago === m ? '700' : '400' }}>{m}</button>
                    ))}
                  </div>
                </div>

                {/* Resumen */}
                {dia && horario && metodoPago && (
                  <div style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: '10px', padding: '16px' }}>
                    <p style={{ fontSize: '13px', color: '#8aab96', marginBottom: '6px' }}>Resumen de la cita:</p>
                    <p style={{ fontSize: '14px', color: 'white' }}>📅 {dia} a las {horario}</p>
                    <p style={{ fontSize: '14px', color: 'white' }}>👨‍⚕️ {psicologo.nombreCompleto}</p>
                    <p style={{ fontSize: '14px', color: 'white' }}>💳 {metodoPago} · ${fmt(psicologo.tarifaCOP)} COP</p>
                  </div>
                )}

                {error && (
                  <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '12px 16px', color: '#f87171', fontSize: '13px' }}>
                    ⚠️ {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={confirmarCita}
                    disabled={!horario || !dia || !metodoPago || cargando}
                    style={{ flex: 1, background: horario && dia && metodoPago ? '#1a6b4a' : '#1a2e1f', color: 'white', padding: '13px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', opacity: (!horario || !dia || !metodoPago) ? 0.5 : 1 }}
                  >
                    {cargando ? 'Registrando cita...' : 'Registrar cita y pagar'}
                  </button>
                  <button onClick={() => setVista('buscar')} style={{ padding: '13px 20px', background: '#1a2e1f', border: '1px solid #2a3d2e', borderRadius: '8px', color: '#5a8a6a', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
    {/* ── Modal de reseña ── */}
    {modalResena && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        onClick={e => { if (e.target === e.currentTarget) setModalResena(null); }}>
        <div style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '20px', padding: '32px', maxWidth: '440px', width: '100%' }}>
          <h3 style={{ color: 'white', fontWeight: '800', fontSize: '18px', marginBottom: '4px' }}>
            {modalResena.resena ? 'Tu reseña' : '¿Cómo fue tu sesión?'}
          </h3>
          <p style={{ color: '#5a8a6a', fontSize: '13px', marginBottom: '24px' }}>
            con <strong style={{ color: '#8aab96' }}>{modalResena.psicologo.nombreCompleto}</strong>
          </p>

          {/* Estrellas */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {[1,2,3,4,5].map(n => (
              <button
                key={n}
                onClick={() => !modalResena.resena && setEstrellas(n)}
                onMouseEnter={() => !modalResena.resena && setEstrellasHover(n)}
                onMouseLeave={() => setEstrellasHover(0)}
                style={{ background: 'none', border: 'none', cursor: modalResena.resena ? 'default' : 'pointer', fontSize: '36px', padding: '0', lineHeight: 1, filter: (estrellasHover || estrellas) >= n ? 'none' : 'grayscale(1) opacity(0.3)', transition: 'filter 0.1s' }}
              >
                ⭐
              </button>
            ))}
          </div>
          <p style={{ color: '#5a8a6a', fontSize: '13px', marginBottom: '16px', minHeight: '18px' }}>
            {(estrellasHover || estrellas) === 1 && 'Muy mala experiencia'}
            {(estrellasHover || estrellas) === 2 && 'Podría mejorar'}
            {(estrellasHover || estrellas) === 3 && 'Regular'}
            {(estrellasHover || estrellas) === 4 && 'Buena sesión'}
            {(estrellasHover || estrellas) === 5 && '¡Excelente sesión!'}
          </p>

          {/* Comentario */}
          <textarea
            value={comentario}
            onChange={e => !modalResena.resena && setComentario(e.target.value)}
            readOnly={!!modalResena.resena}
            placeholder="Comparte tu experiencia (opcional)..."
            rows={4}
            style={{ width: '100%', background: '#0a1510', border: '1px solid #2a3d2e', borderRadius: '10px', padding: '12px', color: 'white', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box', opacity: modalResena.resena ? 0.7 : 1 }}
          />
          <p style={{ color: '#3d5c48', fontSize: '11px', textAlign: 'right', marginTop: '4px' }}>{comentario.length}/1000</p>

          {errorResena && <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>{errorResena}</p>}

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            {!modalResena.resena && (
              <button
                onClick={enviarResena}
                disabled={enviandoResena || estrellas === 0}
                style={{ flex: 1, background: estrellas > 0 ? '#0d9488' : '#1a2e1f', color: 'white', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '14px', cursor: estrellas > 0 ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: enviandoResena ? 0.7 : 1 }}
              >
                {enviandoResena ? 'Enviando...' : 'Enviar reseña'}
              </button>
            )}
            <button
              onClick={() => setModalResena(null)}
              style={{ flex: modalResena.resena ? 1 : 0, padding: '12px 20px', background: '#1a2e1f', border: '1px solid #2a3d2e', borderRadius: '10px', color: '#5a8a6a', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {modalResena.resena ? 'Cerrar' : 'Cancelar'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

