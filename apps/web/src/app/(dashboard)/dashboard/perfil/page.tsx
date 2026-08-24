'use client';

import { useState, useEffect } from 'react';

const PLANES = [
  { id:'GRATIS', nombre:'Gratis', precio:'$0', desc:'Para empezar', color:'#1a2e1f', border:'#2a3d2e', items:['5 chats IA/mes','1 test PHQ-9','Diario básico'] },
  { id:'BASICO', nombre:'Básico', precio:'$14.900 COP/mes', desc:'Precio de entrada', color:'#1a4d3d', border:'#5eead4', items:['Chat IA ilimitado','Diario completo','Todos los tests'] },
  { id:'PLUS', nombre:'Plus', precio:'$25.900 COP/mes', desc:'Más popular', color:'#1a6b4a', border:'#2dd4bf', items:['Todo el plan Básico','Resumen IA semanal','Ejercicios personalizados','Prioridad en respuestas','15% dto en citas'], highlight:true },
  { id:'FAMILIA', nombre:'Familia', precio:'$44.900 COP/mes', desc:'Hasta 5 personas', color:'#1a3d6b', border:'#818cf8', items:['Todo el plan Plus','Hasta 5 miembros','Dashboard familiar','20% dto en citas'] },
];

type PlanId = 'GRATIS' | 'BASICO' | 'PLUS' | 'FAMILIA';

export default function PerfilPage() {
  const [tab, setTab] = useState<'perfil'|'plan'|'seguridad'|'consentimientos'>('perfil');
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', telefono: '', ciudad: '' });
  const [planActual, setPlanActual] = useState('GRATIS');
  const [suscripcionVence, setSuscripcionVence] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState('');
  const [cargando, setCargando] = useState(true);
  const [pwForm, setPwForm] = useState({ actual: '', nueva: '', confirmar: '' });
  const [pwGuardado, setPwGuardado] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwGuardando, setPwGuardando] = useState(false);
  const [planModal, setPlanModal] = useState<PlanId | null>(null);
  const [upgradando, setUpgradando] = useState(false);
  const [upgradeExito, setUpgradeExito] = useState(false);
  const [eliminandoCuenta, setEliminandoCuenta] = useState(false);
  const [errorEliminacion, setErrorEliminacion] = useState('');

  // Cargar perfil real al montar
  useEffect(() => {
    fetch('/api/usuarios')
      .then(r => r.json())
      .then(data => {
        if (data.usuario) {
          const u = data.usuario;
          setForm({
            nombre:   u.nombre   ?? '',
            apellido: u.apellido ?? '',
            email:    u.email    ?? '',
            telefono: u.telefono ?? '',
            ciudad:   u.ciudadColombia ?? '',
          });
          setPlanActual(u.planActual ?? 'GRATIS');
          setSuscripcionVence(u.suscripcionVence ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const guardar = async () => {
    setErrorGuardado('');
    const res = await fetch('/api/usuarios', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre:         form.nombre   || undefined,
        apellido:       form.apellido || undefined,
        telefono:       form.telefono || null,
        ciudadColombia: form.ciudad   || null,
      }),
    });
    if (res.ok) {
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2500);
    } else {
      const d = await res.json().catch(() => ({}));
      setErrorGuardado(d.error ?? 'Error al guardar');
    }
  };

  const cambiarPassword = async () => {
    setPwError('');
    if (pwForm.nueva !== pwForm.confirmar) {
      setPwError('Las contraseñas nuevas no coinciden');
      return;
    }
    if (pwForm.nueva.length < 8) {
      setPwError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    setPwGuardando(true);
    try {
      const res = await fetch('/api/usuarios/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passwordActual: pwForm.actual, passwordNueva: pwForm.nueva }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setPwGuardado(true);
        setPwForm({ actual: '', nueva: '', confirmar: '' });
        setTimeout(() => setPwGuardado(false), 3000);
      } else {
        setPwError(d.error ?? 'Error al cambiar la contraseña');
      }
    } finally {
      setPwGuardando(false);
    }
  };

  const confirmarUpgrade = async () => {
    if (!planModal) return;
    setUpgradando(true);
    try {
      const res = await fetch('/api/usuarios/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planModal }),
      });
      if (res.ok) {
        setPlanActual(planModal);
        setUpgradeExito(true);
        setTimeout(() => { setPlanModal(null); setUpgradeExito(false); }, 2000);
      }
    } finally {
      setUpgradando(false);
    }
  };

  if (cargando) return <p style={{ color: '#5a8a6a', padding: '24px' }}>Cargando perfil...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#1a6b4a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '900', color: '#2dd4bf', flexShrink: 0 }}>
          {form.nombre.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>{form.nombre} {form.apellido}</h1>
          <p style={{ fontSize: '13px', color: '#5a8a6a' }}>
            {form.email} · Plan {planActual}
            {suscripcionVence && <span style={{ color: '#fbbf24' }}> · vence {new Date(suscripcionVence).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', background: '#0d1a12', padding: '4px', borderRadius: '10px', border: '1px solid #1a2e1f' }}>
        {[['perfil','👤 Mi Perfil'],['plan','💎 Plan'],['seguridad','🔒 Seguridad'],['consentimientos','📋 Privacidad']].map(([v,l])=>(
          <button key={v} onClick={() => setTab(v as any)} style={{ flex: 1, padding: '9px 12px', borderRadius: '7px', border: 'none', background: tab===v?'#1a6b4a':'transparent', color: tab===v?'white':'#5a8a6a', cursor: 'pointer', fontSize: '12px', fontWeight: tab===v?'700':'400', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{l}</button>
        ))}
      </div>

      {/* ── PERFIL ── */}
      {tab === 'perfil' && (
        <div style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>Datos personales</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {[['nombre','Nombre','Juan'],['apellido','Apellido','García'],['telefono','Teléfono (opcional)','+57 300 000 0000'],['ciudad','Ciudad','Bogotá']].map(([k,l,ph])=>(
              <div key={k}>
                <label style={{ fontSize: '12px', color: '#5a8a6a', fontWeight: '600', display: 'block', marginBottom: '5px' }}>{l}</label>
                <input value={(form as any)[k]} onChange={e => setForm(p=>({...p,[k]:e.target.value}))} placeholder={ph} style={{ width: '100%', background: '#141f17', border: '1px solid #2a3d2e', borderRadius: '8px', padding: '10px 12px', color: 'white', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
              </div>
            ))}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: '12px', color: '#5a8a6a', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Email</label>
              <input value={form.email} disabled style={{ width: '100%', background: '#0a1510', border: '1px solid #1a2e1f', borderRadius: '8px', padding: '10px 12px', color: '#3d5c48', fontSize: '13px', fontFamily: 'inherit' }} />
              <p style={{ fontSize: '11px', color: '#3d5c48', marginTop: '3px' }}>El email no se puede cambiar</p>
            </div>
          </div>
          <button onClick={guardar} style={{ background: '#1a6b4a', color: 'white', padding: '11px 24px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit', alignSelf: 'flex-start' }}>
            {guardado ? '✅ Guardado' : 'Guardar cambios'}
          </button>
          {errorGuardado && <p style={{ fontSize: '13px', color: '#f87171' }}>⚠️ {errorGuardado}</p>}
        </div>
      )}

      {/* ── PLAN ── */}
      {tab === 'plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {PLANES.map(plan => (
            <div key={plan.id} style={{ background: plan.color, border: `2px solid ${planActual===plan.id ? plan.border : '#1a2e1f'}`, borderRadius: '14px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
              {plan.highlight && <div style={{ position: 'absolute', top: '12px', right: '-20px', background: '#2dd4bf', color: '#0d1a12', fontSize: '9px', fontWeight: '800', padding: '3px 28px', transform: 'rotate(35deg)', letterSpacing: '0.1em' }}>POPULAR</div>}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'white' }}>{plan.nombre}</h3>
                    {planActual === plan.id && <span style={{ background: 'rgba(45,212,191,0.2)', border: '1px solid #2dd4bf', color: '#2dd4bf', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>ACTUAL</span>}
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: '900', color: plan.border, marginBottom: '8px' }}>{plan.precio}</p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {plan.items.map((item,i)=>(
                      <li key={i} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', display: 'flex', gap: '6px' }}>
                        <span style={{ color: plan.border }}>✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {planActual !== plan.id && (
                  <button
                    onClick={() => setPlanModal(plan.id as PlanId)}
                    style={{ background: plan.border, color: '#0d1a12', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', flexShrink: 0 }}
                  >
                    {plan.id === 'GRATIS' ? 'Bajar al plan Gratis' : `Cambiar a ${plan.nombre}`}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SEGURIDAD ── */}
      {tab === 'seguridad' && (
        <div style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>Seguridad de la cuenta</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={{ fontSize: '12px', color: '#5a8a6a', fontWeight: '600' }}>Contraseña actual</label>
            <input type="password" value={pwForm.actual} onChange={e => setPwForm(p => ({ ...p, actual: e.target.value }))} placeholder="••••••••" style={{ background: '#141f17', border: '1px solid #2a3d2e', borderRadius: '8px', padding: '10px 12px', color: 'white', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <label style={{ fontSize: '12px', color: '#5a8a6a', fontWeight: '600' }}>Nueva contraseña</label>
            <input type="password" value={pwForm.nueva} onChange={e => setPwForm(p => ({ ...p, nueva: e.target.value }))} placeholder="Mínimo 8 caracteres" style={{ background: '#141f17', border: '1px solid #2a3d2e', borderRadius: '8px', padding: '10px 12px', color: 'white', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <label style={{ fontSize: '12px', color: '#5a8a6a', fontWeight: '600' }}>Confirmar nueva contraseña</label>
            <input type="password" value={pwForm.confirmar} onChange={e => setPwForm(p => ({ ...p, confirmar: e.target.value }))} placeholder="Repite la contraseña" style={{ background: '#141f17', border: '1px solid #2a3d2e', borderRadius: '8px', padding: '10px 12px', color: 'white', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            {pwError && <p style={{ fontSize: '13px', color: '#f87171' }}>⚠️ {pwError}</p>}
            <button onClick={cambiarPassword} disabled={pwGuardando || !pwForm.actual || !pwForm.nueva || !pwForm.confirmar} style={{ background: pwGuardado ? '#1a4a35' : '#1a6b4a', color: 'white', padding: '11px 24px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', alignSelf: 'flex-start', opacity: (!pwForm.actual || !pwForm.nueva || !pwForm.confirmar) ? 0.5 : 1 }}>
              {pwGuardando ? 'Guardando...' : pwGuardado ? '✅ Contraseña actualizada' : 'Cambiar contraseña'}
            </button>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #1a2e1f' }} />

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'white', marginBottom: '12px' }}>Autenticación de dos factores (2FA)</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: '#141f17', borderRadius: '10px', border: '1px solid #2a3d2e' }}>
              <div>
                <p style={{ fontSize: '14px', color: 'white', fontWeight: '600' }}>Activar 2FA por email</p>
                <p style={{ fontSize: '12px', color: '#5a8a6a', marginTop: '2px' }}>Recibirás un código cada vez que inicies sesión</p>
              </div>
              <button style={{ background: '#1a2e1f', border: '1px solid #2a3d2e', color: '#5a8a6a', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit' }}>Activar</button>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #1a2e1f' }} />

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#f87171', marginBottom: '10px' }}>Zona de peligro</h3>
            {errorEliminacion && (
              <p style={{ fontSize: '12px', color: '#f87171', marginBottom: '10px', background: 'rgba(184,32,32,0.1)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(184,32,32,0.2)' }}>{errorEliminacion}</p>
            )}
            <button
              disabled={eliminandoCuenta}
              onClick={async () => {
                const confirmacion = window.prompt('Esta acción es irreversible.\n\nEscribe ELIMINAR (en mayúsculas) para confirmar la eliminación de tu cuenta y todos tus datos personales:');
                if (confirmacion !== 'ELIMINAR') return;
                setEliminandoCuenta(true);
                setErrorEliminacion('');
                try {
                  const res = await fetch('/api/usuarios/eliminar-datos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ confirmacion: 'ELIMINAR' }),
                  });
                  const data = await res.json();
                  if (!res.ok) { setErrorEliminacion(data.error || 'Error al eliminar'); return; }
                  alert('Cuenta eliminada. Serás redirigido al inicio.');
                  window.location.href = '/';
                } catch {
                  setErrorEliminacion('Error de conexión. Intenta nuevamente o escribe a privacidad@mentebridge.com');
                } finally {
                  setEliminandoCuenta(false);
                }
              }}
              style={{ background: 'rgba(184,32,32,0.1)', border: '1px solid rgba(184,32,32,0.3)', color: '#f87171', padding: '10px 20px', borderRadius: '8px', cursor: eliminandoCuenta ? 'not-allowed' : 'pointer', fontSize: '13px', fontFamily: 'inherit', fontWeight: '600', opacity: eliminandoCuenta ? 0.6 : 1 }}
            >
              {eliminandoCuenta ? 'Eliminando...' : 'Eliminar mi cuenta'}
            </button>
            <p style={{ fontSize: '11px', color: '#3d5c48', marginTop: '6px' }}>Esta acción es irreversible. Todos tus datos serán eliminados permanentemente (Ley 1581/2012 — Habeas Data).</p>
          </div>
        </div>
      )}

      {/* ── CONSENTIMIENTOS ── */}
      {tab === 'consentimientos' && (
        <div style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>Privacidad y consentimientos</h2>
          <p style={{ fontSize: '13px', color: '#5a8a6a', lineHeight: 1.6 }}>Tienes control total sobre tus datos. Cumplimos con la Ley 1581 de 2012 (Habeas Data) y la Resolución 2654/2019.</p>

          {[
            { titulo:'Política de privacidad', desc:'Tratamiento de datos personales sensibles de salud', fecha:'15 May 2026', obligatorio:true },
            { titulo:'Uso de Inteligencia Artificial', desc:'Autorización para el apoyo emocional con IA (Res. 2654/2019)', fecha:'15 May 2026', obligatorio:true },
            { titulo:'Marketing y contenido educativo', desc:'Recibir emails con contenido de bienestar', fecha:'15 May 2026', obligatorio:false },
          ].map((c,i)=>(
            <div key={i} style={{ padding: '16px', background: '#141f17', borderRadius: '10px', border: '1px solid #2a3d2e', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <p style={{ fontSize: '14px', color: 'white', fontWeight: '600' }}>{c.titulo}</p>
                  {c.obligatorio && <span style={{ fontSize: '10px', background: 'rgba(184,32,32,0.15)', color: '#f87171', padding: '2px 6px', borderRadius: '6px', fontWeight: '700' }}>Requerido</span>}
                </div>
                <p style={{ fontSize: '12px', color: '#5a8a6a' }}>{c.desc}</p>
                <p style={{ fontSize: '11px', color: '#3d5c48', marginTop: '4px' }}>Aceptado el {c.fecha}</p>
              </div>
              {!c.obligatorio && (
                <button style={{ background: 'rgba(184,32,32,0.1)', border: '1px solid rgba(184,32,32,0.2)', color: '#f87171', padding: '7px 14px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', flexShrink: 0 }}>Revocar</button>
              )}
            </div>
          ))}

          <hr style={{ border: 'none', borderTop: '1px solid #1a2e1f' }} />
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>Tus derechos (Ley 1581/2012)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={async () => {
                const res = await fetch('/api/usuarios/datos');
                if (!res.ok) return;
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `mentebridge-mis-datos-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#141f17', border: '1px solid #2a3d2e', borderRadius: '8px', color: '#8aab96', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', textAlign: 'left' }}
            >
              <span style={{ fontSize: '16px' }}>📥</span> Descargar mis datos
            </button>
            <button
              onClick={() => setTab('perfil')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#141f17', border: '1px solid #2a3d2e', borderRadius: '8px', color: '#8aab96', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', textAlign: 'left' }}
            >
              <span style={{ fontSize: '16px' }}>✏️</span> Actualizar mis datos
            </button>
            <button
              onClick={() => setTab('seguridad')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#141f17', border: '1px solid #2a3d2e', borderRadius: '8px', color: '#f87171', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', textAlign: 'left' }}
            >
              <span style={{ fontSize: '16px' }}>🗑️</span> Eliminar mi cuenta
            </button>
            <a
              href="mailto:privacidad@mentebridge.com?subject=Solicitud%20Habeas%20Data"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#141f17', border: '1px solid #2a3d2e', borderRadius: '8px', color: '#8aab96', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', textDecoration: 'none' }}
            >
              <span style={{ fontSize: '16px' }}>📬</span> Contactar privacidad
            </a>
          </div>
          <p style={{ fontSize: '12px', color: '#3d5c48' }}>Tiempo de respuesta: 10-15 días hábiles · privacidad@mentebridge.com</p>
        </div>
      )}

      {/* ── MODAL UPGRADE ── */}
      {planModal && <ModalUpgrade
        plan={PLANES.find(p => p.id === planModal)!}
        exito={upgradeExito}
        cargando={upgradando}
        onConfirmar={confirmarUpgrade}
        onCerrar={() => !upgradando && setPlanModal(null)}
      />}
    </div>
  );
}

function ModalUpgrade({ plan, exito, cargando, onConfirmar, onCerrar }: {
  plan: typeof PLANES[number];
  exito: boolean;
  cargando: boolean;
  onConfirmar: () => void;
  onCerrar: () => void;
}) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000, padding: '20px' }}
      onClick={onCerrar}
    >
      <div
        style={{ background: '#0d1a12', border: `1px solid ${plan.border}`, borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '420px' }}
        onClick={e => e.stopPropagation()}
      >
        {exito ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '52px', marginBottom: '12px' }}>✅</div>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', marginBottom: '6px' }}>¡Plan actualizado!</h3>
            <p style={{ fontSize: '14px', color: '#8aab96' }}>Ahora estás en el plan {plan.nombre}.</p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <p style={{ fontSize: '12px', color: plan.border, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Confirmar cambio de plan</p>
              <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'white', marginBottom: '4px' }}>Plan {plan.nombre}</h3>
              <p style={{ fontSize: '24px', fontWeight: '900', color: plan.border }}>{plan.precio}</p>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {plan.items.map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '13px', color: '#8aab96' }}>
                  <span style={{ color: plan.border, flexShrink: 0 }}>✓</span> {item}
                </li>
              ))}
            </ul>

            {plan.id !== 'GRATIS' && (
              <div style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px' }}>
                <p style={{ fontSize: '12px', color: '#5a8a6a', lineHeight: 1.5 }}>
                  💳 El cobro se procesará a través de <strong style={{ color: '#8aab96' }}>Wompi</strong> de forma segura. Puedes cancelar en cualquier momento.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={onCerrar}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #2a3d2e', borderRadius: '8px', color: '#5a8a6a', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
              >
                Cancelar
              </button>
              <button
                onClick={onConfirmar}
                disabled={cargando}
                style={{ flex: 2, padding: '12px', background: plan.border, border: 'none', borderRadius: '8px', color: '#0d1a12', fontWeight: '800', cursor: cargando ? 'wait' : 'pointer', fontSize: '14px', fontFamily: 'inherit', opacity: cargando ? 0.7 : 1 }}
              >
                {cargando ? 'Procesando...' : plan.id === 'GRATIS' ? 'Bajar al plan Gratis' : `Activar plan ${plan.nombre}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
