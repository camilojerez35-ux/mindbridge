'use client';
// src/app/(dashboard)/admin/page.tsx
// RUTA: http://localhost:3000/admin
// Solo accesible con rol ADMIN o SUPERADMIN

import { useState, useEffect, useCallback } from 'react';

const USUARIOS_DEMO = [
  { id:'u1', nombre:'Ana García', email:'ana@demo.co', plan:'PLUS', estado:'ACTIVO', ciudad:'Bogotá', registro:'01 May 2026', ultimoAcceso:'Hoy' },
  { id:'u2', nombre:'Carlos Mora', email:'carlos@demo.co', plan:'GRATIS', estado:'ACTIVO', ciudad:'Medellín', registro:'05 May 2026', ultimoAcceso:'Ayer' },
  { id:'u3', nombre:'Laura Vargas', email:'laura@demo.co', plan:'FAMILIA', estado:'ACTIVO', ciudad:'Cali', registro:'10 May 2026', ultimoAcceso:'Hace 2 días' },
];

const PSICOLOGOS_DEMO = [
  { id:'ps1', nombre:'Dra. Andrea Morales', colpsic:'PSI-2019-001234', ciudad:'Bogotá', estado:'ACTIVO', citas:28, calificacion:4.9 },
  { id:'ps2', nombre:'Ps. Carlos Restrepo', colpsic:'PSI-2020-005678', ciudad:'Medellín', estado:'ACTIVO', citas:15, calificacion:4.8 },
  { id:'ps3', nombre:'Ps. Juan Torres', colpsic:'PSI-2023-009999', ciudad:'Bogotá', estado:'PENDIENTE_VERIFICACION', citas:0, calificacion:0 },
];

const INCIDENTES_DEMO = [
  { id:'i1', nivel:'CRITICO', fecha:'Hoy 2:34 PM', protocoloActivado:true, resolucion:'Usuario confirmó estar seguro', revisado:true },
  { id:'i2', nivel:'ALTO', fecha:'Ayer 9:12 AM', protocoloActivado:false, resolucion:null, revisado:false },
  { id:'i3', nivel:'MODERADO', fecha:'Hace 2 días', protocoloActivado:false, resolucion:'Sesión continuó normalmente', revisado:true },
];

type PsicologoAdmin = {
  id: string; nombreCompleto: string; tarjetaProfesionalId: string;
  tarjetaVerificada: boolean; estado: string; activo: boolean;
  especialidades: string[]; ciudades: string[]; tarifaCOP: number;
  anosExperiencia: number; createdAt: string; email: string;
};

const FORM_PS_VACIO = {
  email: '', password: '', nombreCompleto: '', tarjetaProfesionalId: '',
  especialidades: '', enfoqueTerapeutico: '', formacion: '',
  anosExperiencia: '', tarifaCOP: '', ciudades: '', modalidad: 'VIDEOLLAMADA',
};

export default function AdminPage() {
  const [tab, setTab] = useState<'dashboard'|'usuarios'|'psicologos'|'crisis'|'pagos'>('dashboard');
  const [busqueda, setBusqueda] = useState('');

  /* ── Psicólogos ── */
  const [psicologos, setPsicologos]         = useState<PsicologoAdmin[]>([]);
  const [cargandoPs, setCargandoPs]         = useState(false);
  const [mostrarFormPs, setMostrarFormPs]   = useState(false);
  const [formPs, setFormPs]                 = useState(FORM_PS_VACIO);
  const [creandoPs, setCreandoPs]           = useState(false);
  const [errorPs, setErrorPs]               = useState('');
  const [okPs, setOkPs]                     = useState('');
  const [accionandoPs, setAccionandoPs]     = useState<string | null>(null);

  const cargarPsicologos = useCallback(async () => {
    setCargandoPs(true);
    try {
      const res = await fetch('/api/admin/psicologos');
      if (res.ok) { const d = await res.json(); setPsicologos(d.psicologos ?? []); }
    } finally { setCargandoPs(false); }
  }, []);

  useEffect(() => { if (tab === 'psicologos') cargarPsicologos(); }, [tab, cargarPsicologos]);

  const crearPsicologo = async () => {
    setErrorPs(''); setOkPs(''); setCreandoPs(true);
    try {
      const split = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean);
      const res = await fetch('/api/admin/psicologos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:                formPs.email,
          password:             formPs.password,
          nombreCompleto:       formPs.nombreCompleto,
          tarjetaProfesionalId: formPs.tarjetaProfesionalId,
          especialidades:       split(formPs.especialidades),
          enfoqueTerapeutico:   split(formPs.enfoqueTerapeutico),
          formacion:            formPs.formacion,
          anosExperiencia:      formPs.anosExperiencia ? parseInt(formPs.anosExperiencia) : 0,
          tarifaCOP:            formPs.tarifaCOP       ? parseInt(formPs.tarifaCOP)       : 0,
          ciudades:             split(formPs.ciudades),
          modalidad:            [formPs.modalidad],
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setOkPs(d.mensaje ?? 'Psicólogo creado correctamente');
        setFormPs(FORM_PS_VACIO);
        setMostrarFormPs(false);
        cargarPsicologos();
      } else {
        setErrorPs(d.error ?? 'Error al crear');
      }
    } finally { setCreandoPs(false); }
  };

  const verificarPsicologo = async (psicologoId: string, accion: 'APROBAR' | 'RECHAZAR') => {
    setAccionandoPs(psicologoId);
    try {
      const res = await fetch('/api/psicologos/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ psicologoId, accion, tarjetaConfirmada: accion === 'APROBAR' }),
      });
      if (res.ok) {
        const nuevoEstado = accion === 'APROBAR' ? 'VERIFICADO' : 'RECHAZADO';
        setPsicologos(prev => prev.map(p => p.id === psicologoId ? { ...p, estado: nuevoEstado, activo: accion === 'APROBAR' } : p));
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error || 'Error al verificar');
      }
    } finally { setAccionandoPs(null); }
  };

  const campoPs = (k: keyof typeof FORM_PS_VACIO) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFormPs(p => ({ ...p, [k]: e.target.value }));

  const nivelColor = (n:string) => n==='CRITICO'?'#f87171':n==='ALTO'?'#fbbf24':'#2dd4bf';
  const nivelBg = (n:string) => n==='CRITICO'?'rgba(248,113,113,0.1)':n==='ALTO'?'rgba(251,191,36,0.1)':'rgba(45,212,191,0.1)';
  const fmt = (n:number) => new Intl.NumberFormat('es-CO').format(n);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontSize:'24px', fontWeight:'900', color:'white' }}>⚙️ Panel de Administración</h1>
          <p style={{ fontSize:'13px', color:'#5a8a6a', marginTop:'4px' }}>MindBridge Colombia · Vista admin</p>
        </div>
        <span style={{ background:'rgba(184,32,32,0.15)', color:'#f87171', border:'1px solid rgba(184,32,32,0.3)', borderRadius:'8px', padding:'6px 14px', fontSize:'12px', fontWeight:'700' }}>🔐 ADMIN</span>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'4px', flexWrap:'wrap', background:'#0d1a12', padding:'4px', borderRadius:'10px', border:'1px solid #1a2e1f' }}>
        {[['dashboard','📊 Dashboard'],['usuarios','👥 Usuarios'],['psicologos','👨‍⚕️ Psicólogos'],['crisis','🚨 Crisis'],['pagos','💰 Pagos']].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v as any)} style={{ flex:1, padding:'9px 6px', borderRadius:'7px', border:'none', background:tab===v?'#1a6b4a':'transparent', color:tab===v?'white':'#5a8a6a', cursor:'pointer', fontSize:'12px', fontWeight:tab===v?'700':'400', fontFamily:'inherit', whiteSpace:'nowrap' }}>{l}</button>
        ))}
      </div>

      {/* ── DASHBOARD ── */}
      {tab === 'dashboard' && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'12px' }}>
            {[
              { label:'Usuarios totales', val:'1.284', icon:'👥', color:'#2dd4bf', delta:'+127 este mes' },
              { label:'MRR', val:'$12.4M', icon:'💰', color:'#fbbf24', delta:'+18% vs mes ant.' },
              { label:'Citas este mes', val:'342', icon:'📅', color:'#818cf8', delta:'+45 vs mes ant.' },
              { label:'Psicólogos activos', val:'34', icon:'👨‍⚕️', color:'#fb7185', delta:'3 pendientes' },
              { label:'Churn mensual', val:'3.2%', icon:'📉', color:'#34d399', delta:'Meta: <5%' },
              { label:'NPS promedio', val:'61', icon:'⭐', color:'#fbbf24', delta:'Meta: >55' },
            ].map((s,i)=>(
              <div key={i} style={{ background:'#0d1a12', border:'1px solid #1a2e1f', borderRadius:'12px', padding:'16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <span style={{ fontSize:'22px' }}>{s.icon}</span>
                  <span style={{ fontSize:'11px', color:'#3d5c48' }}>{s.delta}</span>
                </div>
                <div style={{ fontSize:'22px', fontWeight:'900', color:s.color, lineHeight:1, marginTop:'8px' }}>{s.val}</div>
                <div style={{ fontSize:'11px', color:'#3d5c48', marginTop:'4px', textTransform:'uppercase', letterSpacing:'0.08em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Alertas del día */}
          <div style={{ background:'#0d1a12', border:'1px solid rgba(184,32,32,0.25)', borderRadius:'14px', padding:'20px' }}>
            <h3 style={{ fontSize:'14px', fontWeight:'700', color:'#f87171', marginBottom:'12px' }}>🚨 Alertas del día</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {[
                { tipo:'Crisis crítica', desc:'1 incidente detectado a las 2:34 PM — protocolo activado', color:'#f87171' },
                { tipo:'Verificación pendiente', desc:'Ps. Juan Torres esperando verificación COLPSIC hace 3 días', color:'#fbbf24' },
                { tipo:'Pago pendiente', desc:'Transferencias a 8 psicólogos pendientes del mes anterior', color:'#818cf8' },
              ].map((a,i)=>(
                <div key={i} style={{ display:'flex', gap:'10px', alignItems:'flex-start', padding:'10px 14px', background:'rgba(255,255,255,0.02)', borderRadius:'8px', borderLeft:`3px solid ${a.color}` }}>
                  <div>
                    <p style={{ fontSize:'13px', color:'white', fontWeight:'600' }}>{a.tipo}</p>
                    <p style={{ fontSize:'12px', color:'#5a8a6a' }}>{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── USUARIOS ── */}
      {tab === 'usuarios' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar usuario..." style={{ flex:1, minWidth:'200px', background:'#0d1a12', border:'1px solid #2a3d2e', borderRadius:'8px', padding:'10px 14px', color:'white', fontSize:'13px', outline:'none', fontFamily:'inherit' }} />
            <button style={{ background:'#1a6b4a', color:'white', padding:'10px 16px', borderRadius:'8px', border:'none', fontWeight:'600', cursor:'pointer', fontSize:'13px', fontFamily:'inherit' }}>Exportar CSV</button>
          </div>
          <div style={{ background:'#0d1a12', border:'1px solid #1a2e1f', borderRadius:'14px', overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 1fr 1fr 1fr 1fr', gap:'8px', padding:'12px 16px', background:'#141f17', fontSize:'11px', color:'#3d5c48', textTransform:'uppercase', letterSpacing:'0.08em' }}>
              <span>Nombre</span><span>Email</span><span>Plan</span><span>Ciudad</span><span>Registro</span><span>Acciones</span>
            </div>
            {USUARIOS_DEMO.filter(u=>!busqueda||u.nombre.toLowerCase().includes(busqueda.toLowerCase())||u.email.toLowerCase().includes(busqueda.toLowerCase())).map(u=>(
              <div key={u.id} style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 1fr 1fr 1fr 1fr', gap:'8px', padding:'14px 16px', borderTop:'1px solid #1a2e1f', alignItems:'center' }}>
                <span style={{ fontSize:'14px', color:'white', fontWeight:'600' }}>{u.nombre}</span>
                <span style={{ fontSize:'12px', color:'#5a8a6a' }}>{u.email}</span>
                <span style={{ fontSize:'11px', background:u.plan==='PLUS'?'rgba(45,212,191,0.1)':u.plan==='FAMILIA'?'rgba(129,140,248,0.1)':'rgba(255,255,255,0.05)', color:u.plan==='PLUS'?'#2dd4bf':u.plan==='FAMILIA'?'#818cf8':'#5a8a6a', padding:'3px 8px', borderRadius:'10px', fontWeight:'700' }}>{u.plan}</span>
                <span style={{ fontSize:'12px', color:'#5a8a6a' }}>{u.ciudad}</span>
                <span style={{ fontSize:'11px', color:'#3d5c48' }}>{u.registro}</span>
                <div style={{ display:'flex', gap:'4px' }}>
                  <button style={{ background:'#1a2e1f', border:'1px solid #2a3d2e', color:'#8aab96', padding:'5px 8px', borderRadius:'6px', cursor:'pointer', fontSize:'11px', fontFamily:'inherit' }}>Ver</button>
                  <button style={{ background:'rgba(184,32,32,0.1)', border:'1px solid rgba(184,32,32,0.2)', color:'#f87171', padding:'5px 8px', borderRadius:'6px', cursor:'pointer', fontSize:'11px', fontFamily:'inherit' }}>⛔</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PSICÓLOGOS ── */}
      {tab === 'psicologos' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* Header + botón agregar */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'10px' }}>
            <h2 style={{ fontSize:'16px', fontWeight:'700', color:'white' }}>
              Psicólogos ({psicologos.length})
            </h2>
            <button
              onClick={() => { setMostrarFormPs(p => !p); setErrorPs(''); setOkPs(''); }}
              style={{ background:'#1a6b4a', color:'white', padding:'9px 18px', borderRadius:'8px', border:'none', fontWeight:'700', cursor:'pointer', fontSize:'13px', fontFamily:'inherit' }}
            >
              {mostrarFormPs ? '✕ Cancelar' : '+ Agregar psicólogo'}
            </button>
          </div>

          {/* Mensaje éxito */}
          {okPs && (
            <div style={{ background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:'10px', padding:'12px 16px' }}>
              <p style={{ color:'#34d399', fontSize:'13px', fontWeight:'600' }}>✅ {okPs}</p>
            </div>
          )}

          {/* Formulario crear psicólogo */}
          {mostrarFormPs && (
            <div style={{ background:'#0d1a12', border:'1px solid rgba(45,212,191,0.2)', borderRadius:'14px', padding:'24px', display:'flex', flexDirection:'column', gap:'14px' }}>
              <h3 style={{ fontWeight:'700', color:'white', fontSize:'15px', marginBottom:'4px' }}>➕ Nuevo psicólogo</h3>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'12px' }}>
                {([
                  { k:'nombreCompleto', label:'Nombre completo', ph:'Dra. Andrea Morales', req:true },
                  { k:'email',          label:'Email',           ph:'psicologa@ejemplo.com', req:true },
                  { k:'password',       label:'Contraseña temporal', ph:'Mínimo 8 caracteres', req:true },
                  { k:'tarjetaProfesionalId', label:'N° tarjeta COLPSIC', ph:'PSI-2020-001234', req:true },
                  { k:'especialidades', label:'Especialidades (coma)', ph:'Ansiedad, Depresión', req:false },
                  { k:'enfoqueTerapeutico', label:'Enfoque (coma)', ph:'TCC, Mindfulness', req:false },
                  { k:'formacion',      label:'Formación',       ph:'Psicólogo clínico, U. Andes', req:false },
                  { k:'anosExperiencia',label:'Años experiencia', ph:'5', req:false },
                  { k:'tarifaCOP',      label:'Tarifa (COP)',    ph:'80000', req:false },
                  { k:'ciudades',       label:'Ciudades (coma)', ph:'Bogotá, Medellín', req:false },
                ] as const).map(({ k, label, ph, req }) => (
                  <div key={k}>
                    <label style={{ fontSize:'11px', color:'#5a8a6a', fontWeight:'600', display:'block', marginBottom:'4px' }}>
                      {label}{req && <span style={{ color:'#f87171' }}> *</span>}
                    </label>
                    <input
                      type={k === 'password' ? 'password' : ['anosExperiencia','tarifaCOP'].includes(k) ? 'number' : 'text'}
                      value={formPs[k as keyof typeof FORM_PS_VACIO]}
                      onChange={campoPs(k as keyof typeof FORM_PS_VACIO)}
                      placeholder={ph}
                      style={{ width:'100%', background:'#141f17', border:'1px solid #2a3d2e', borderRadius:'8px', padding:'9px 12px', color:'white', fontSize:'13px', outline:'none', fontFamily:'inherit' }}
                    />
                  </div>
                ))}

                <div>
                  <label style={{ fontSize:'11px', color:'#5a8a6a', fontWeight:'600', display:'block', marginBottom:'4px' }}>Modalidad</label>
                  <select
                    value={formPs.modalidad}
                    onChange={campoPs('modalidad')}
                    style={{ width:'100%', background:'#141f17', border:'1px solid #2a3d2e', borderRadius:'8px', padding:'9px 12px', color:'white', fontSize:'13px', outline:'none', fontFamily:'inherit' }}
                  >
                    <option value="VIDEOLLAMADA">Videollamada</option>
                    <option value="TELEFONICA">Telefónica</option>
                    <option value="PRESENCIAL">Presencial</option>
                  </select>
                </div>
              </div>

              {errorPs && <p style={{ color:'#f87171', fontSize:'13px' }}>⚠️ {errorPs}</p>}

              <button
                onClick={crearPsicologo}
                disabled={creandoPs || !formPs.email || !formPs.password || !formPs.nombreCompleto || !formPs.tarjetaProfesionalId}
                style={{ background:'#1a6b4a', color:'white', padding:'11px 24px', borderRadius:'8px', border:'none', fontWeight:'700', cursor:'pointer', fontSize:'13px', fontFamily:'inherit', alignSelf:'flex-start', opacity: creandoPs ? 0.7 : 1 }}
              >
                {creandoPs ? 'Creando...' : '✅ Crear psicólogo'}
              </button>
            </div>
          )}

          {/* Lista */}
          {cargandoPs && <p style={{ color:'#5a8a6a', fontSize:'14px' }}>Cargando psicólogos...</p>}

          {!cargandoPs && psicologos.length === 0 && !mostrarFormPs && (
            <div style={{ background:'#0d1a12', border:'1px solid #1a2e1f', borderRadius:'14px', padding:'32px', textAlign:'center' }}>
              <p style={{ fontSize:'28px', marginBottom:'10px' }}>👨‍⚕️</p>
              <p style={{ color:'#5a8a6a', fontSize:'14px' }}>No hay psicólogos registrados aún. Agrega el primero.</p>
            </div>
          )}

          {psicologos.map(ps => {
            const esPendiente = ps.estado === 'PENDIENTE_VERIFICACION';
            const esVerificado = ps.estado === 'VERIFICADO' || ps.estado === 'ACTIVO';
            const colorEstado = esVerificado ? '#2dd4bf' : esPendiente ? '#fbbf24' : '#f87171';
            const bgEstado = esVerificado ? 'rgba(45,212,191,0.1)' : esPendiente ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)';
            return (
              <div key={ps.id} style={{ background:'#0d1a12', border:`1px solid ${esPendiente ? 'rgba(251,191,36,0.25)' : '#1a2e1f'}`, borderRadius:'14px', padding:'18px 20px', display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
                <div style={{ flex:1, minWidth:'200px' }}>
                  <p style={{ fontWeight:'700', color:'white', fontSize:'15px', marginBottom:'3px' }}>{ps.nombreCompleto}</p>
                  <p style={{ fontSize:'12px', color:'#5a8a6a', marginBottom:'3px' }}>{ps.email}</p>
                  <p style={{ fontSize:'12px', color:'#3d5c48' }}>COLPSIC: {ps.tarjetaProfesionalId} · {ps.ciudades.join(', ') || '—'}</p>
                  {ps.especialidades.length > 0 && (
                    <p style={{ fontSize:'11px', color:'#3d5c48', marginTop:'3px' }}>{ps.especialidades.join(' · ')}</p>
                  )}
                </div>
                <span style={{ background: bgEstado, color: colorEstado, border:`1px solid ${colorEstado}33`, borderRadius:'20px', padding:'4px 12px', fontSize:'12px', fontWeight:'700', flexShrink:0 }}>
                  {ps.estado.replace(/_/g, ' ')}
                </span>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  {esPendiente && (
                    <>
                      <button
                        onClick={() => verificarPsicologo(ps.id, 'APROBAR')}
                        disabled={accionandoPs === ps.id}
                        style={{ background:'#1a6b4a', color:'white', padding:'8px 14px', borderRadius:'8px', border:'none', cursor:'pointer', fontSize:'12px', fontFamily:'inherit', fontWeight:'700', opacity: accionandoPs === ps.id ? 0.6 : 1 }}
                      >
                        ✅ Aprobar
                      </button>
                      <button
                        onClick={() => verificarPsicologo(ps.id, 'RECHAZAR')}
                        disabled={accionandoPs === ps.id}
                        style={{ background:'rgba(184,32,32,0.1)', border:'1px solid rgba(184,32,32,0.2)', color:'#f87171', padding:'8px 12px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontFamily:'inherit', opacity: accionandoPs === ps.id ? 0.6 : 1 }}
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                  {esVerificado && (
                    <span style={{ fontSize:'12px', color:'#2dd4bf' }}>✅ Verificado</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CRISIS ── */}
      {tab === 'crisis' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
            <h2 style={{ fontSize:'16px', fontWeight:'700', color:'white' }}>Registro de incidentes de crisis</h2>
            <span style={{ fontSize:'12px', color:'#5a8a6a' }}>Revisado mensualmente por Psicólogo Co-Fundador</span>
          </div>
          {INCIDENTES_DEMO.map(inc=>(
            <div key={inc.id} style={{ background:'#0d1a12', border:`1px solid rgba(255,255,255,0.06)`, borderLeft:`3px solid ${nivelColor(inc.nivel)}`, borderRadius:'12px', padding:'16px 20px', display:'flex', gap:'14px', alignItems:'flex-start', flexWrap:'wrap' }}>
              <span style={{ background:nivelBg(inc.nivel), color:nivelColor(inc.nivel), padding:'4px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:'800', flexShrink:0 }}>{inc.nivel}</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:'13px', color:'#5a8a6a', marginBottom:'4px' }}>🕐 {inc.fecha}</p>
                <p style={{ fontSize:'13px', color:inc.protocoloActivado?'#2dd4bf':'#fbbf24' }}>{inc.protocoloActivado?'✅ Protocolo de crisis activado':'⚠️ Protocolo no activado'}</p>
                {inc.resolucion && <p style={{ fontSize:'12px', color:'#5a8a6a', marginTop:'4px' }}>Resolución: {inc.resolucion}</p>}
              </div>
              <span style={{ background:inc.revisado?'rgba(52,211,153,0.1)':'rgba(251,191,36,0.1)', color:inc.revisado?'#34d399':'#fbbf24', fontSize:'11px', fontWeight:'700', padding:'4px 10px', borderRadius:'10px' }}>
                {inc.revisado?'Revisado':'Pendiente revisión'}
              </span>
            </div>
          ))}
          <div style={{ background:'rgba(45,212,191,0.05)', border:'1px solid rgba(45,212,191,0.15)', borderRadius:'10px', padding:'14px 18px' }}>
            <p style={{ fontSize:'13px', color:'#2dd4bf', fontWeight:'700', marginBottom:'4px' }}>📋 Auditoría clínica obligatoria</p>
            <p style={{ fontSize:'12px', color:'#5a8a6a' }}>El 100% de incidentes críticos debe revisarse mensualmente con el Psicólogo Co-Fundador. Próxima revisión: 1 Jun 2026.</p>
          </div>
        </div>
      )}

      {/* ── PAGOS ── */}
      {tab === 'pagos' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'12px' }}>
            {[
              { label:'Ingresos suscripciones', val:`$${fmt(8400000)}`, color:'#2dd4bf' },
              { label:'Comisiones de citas', val:`$${fmt(4124000)}`, color:'#818cf8' },
              { label:'Total MRR', val:`$${fmt(12524000)}`, color:'#fbbf24' },
              { label:'Pendiente a psicólogos', val:`$${fmt(2800000)}`, color:'#f87171' },
            ].map((s,i)=>(
              <div key={i} style={{ background:'#0d1a12', border:'1px solid #1a2e1f', borderRadius:'12px', padding:'18px', textAlign:'center' }}>
                <div style={{ fontSize:'20px', fontWeight:'900', color:s.color }}>{s.val}</div>
                <div style={{ fontSize:'11px', color:'#3d5c48', marginTop:'4px', textTransform:'uppercase', letterSpacing:'0.08em' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background:'#0d1a12', border:'1px solid #1a2e1f', borderRadius:'14px', padding:'20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
              <h3 style={{ fontSize:'14px', fontWeight:'700', color:'white' }}>Transferencias pendientes a psicólogos</h3>
              <button style={{ background:'#1a6b4a', color:'white', padding:'8px 16px', borderRadius:'8px', border:'none', fontWeight:'700', cursor:'pointer', fontSize:'12px', fontFamily:'inherit' }}>Procesar todas</button>
            </div>
            {PSICOLOGOS_DEMO.filter(p=>p.estado==='ACTIVO').map(ps=>(
              <div key={ps.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #1a2e1f', flexWrap:'wrap', gap:'8px' }}>
                <span style={{ fontSize:'14px', color:'white' }}>{ps.nombre}</span>
                <span style={{ fontSize:'14px', color:'#2dd4bf', fontWeight:'700' }}>${fmt(ps.citas * 64000)}</span>
                <button style={{ background:'#1a2e1f', border:'1px solid #2a3d2e', color:'#8aab96', padding:'6px 12px', borderRadius:'6px', cursor:'pointer', fontSize:'12px', fontFamily:'inherit' }}>Transferir</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
