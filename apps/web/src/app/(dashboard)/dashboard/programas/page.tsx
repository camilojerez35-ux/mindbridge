'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const PROGRAMAS = [
  {
    id:'p1', titulo:'Manejo de la Ansiedad', duracion:'4 semanas', sesiones:12, icono:'😰',
    color:'#1a6b4a', border:'#2dd4bf',
    descripcion:'Aprende a identificar, comprender y reducir la ansiedad con técnicas TCC respaldadas por evidencia.',
    semanas:[
      { n:1, titulo:'Entendiendo tu ansiedad', temas:['¿Qué es la ansiedad?','El ciclo ansiedad-evitación','Registro de pensamientos'] },
      { n:2, titulo:'Técnicas de regulación', temas:['Respiración diafragmática','Relajación muscular progresiva','Grounding 5-4-3-2-1'] },
      { n:3, titulo:'Reestructuración cognitiva', temas:['Pensamientos automáticos','Distorsiones cognitivas','Generar alternativas'] },
      { n:4, titulo:'Exposición gradual', temas:['Jerarquía del miedo','Exposición paso a paso','Mantenimiento a largo plazo'] },
    ],
    progreso: 25,
    inscrito: true,
  },
  {
    id:'p2', titulo:'Sueño y Descanso', duracion:'3 semanas', sesiones:9, icono:'😴',
    color:'#1a3d6b', border:'#818cf8',
    descripcion:'Mejora la calidad de tu sueño con higiene del sueño, técnicas de relajación y manejo de pensamientos nocturnos.',
    semanas:[
      { n:1, titulo:'Higiene del sueño', temas:['El ciclo circadiano','Rutina pre-sueño','Ambiente ideal'] },
      { n:2, titulo:'Pensamientos nocturnos', temas:['Preocupaciones en la cama','Técnica de "ventana de preocupación"','Mindfulness nocturno'] },
      { n:3, titulo:'Consolidación del sueño', temas:['Restricción del sueño','Relajación progresiva','Plan de mantenimiento'] },
    ],
    progreso: 0,
    inscrito: false,
  },
  {
    id:'p3', titulo:'Autoestima y Confianza', duracion:'4 semanas', sesiones:10, icono:'💪',
    color:'#3d1a0a', border:'#fbbf24',
    descripcion:'Construye una imagen más positiva de ti mismo/a, supera el autocrítica y desarrolla autocompasión.',
    semanas:[
      { n:1, titulo:'Conoce tu autoestima', temas:['Origen de la autoestima','Creencias nucleares','Diario de fortalezas'] },
      { n:2, titulo:'Autocrítica y autocompasión', temas:['El crítico interno','Terapia centrada en compasión','Carta de autocompasión'] },
      { n:3, titulo:'Habilidades sociales', temas:['Comunicación asertiva','Límites saludables','Afrontar el rechazo'] },
      { n:4, titulo:'Identidad positiva', temas:['Valores personales','Metas alineadas','Plan de vida'] },
    ],
    progreso: 0,
    inscrito: false,
  },
  {
    id:'p4', titulo:'Duelo y Pérdida', duracion:'5 semanas', sesiones:14, icono:'🕊️',
    color:'#2d0a3d', border:'#a855f7',
    descripcion:'Acompaña tu proceso de duelo con herramientas clínicas basadas en el modelo de las etapas del duelo y la terapia integrativa.',
    semanas:[
      { n:1, titulo:'Las fases del duelo', temas:['Modelo de Kübler-Ross','Duelo complicado','Validar tus emociones'] },
      { n:2, titulo:'Procesando el dolor', temas:['Carta a lo que perdiste','Ritual de despedida','Memoria vs. presente'] },
      { n:3, titulo:'Red de apoyo', temas:['Pedir ayuda','Comunicar tu dolor','Grupos de apoyo'] },
      { n:4, titulo:'Encontrar significado', temas:['Viktor Frankl y el sentido','Crecimiento post-traumático','Legado'] },
      { n:5, titulo:'Continuar la vida', temas:['Nueva normalidad','Metas futuras','Honrar la pérdida'] },
    ],
    progreso: 0,
    inscrito: false,
  },
];

export default function ProgramasPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const esPlanGratis = !session || session.user.plan === 'GRATIS';

  if (esPlanGratis) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '20px', textAlign: 'center', padding: '40px 24px' }}>
      <div style={{ fontSize: '56px' }}>🔒</div>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>Programas guiados — Plan Plus</h2>
        <p style={{ fontSize: '14px', color: '#5a8a6a', lineHeight: 1.7, maxWidth: '400px' }}>
          Los programas estructurados de 3-5 semanas están disponibles a partir del plan Plus. Incluyen TCC, manejo de ansiedad, sueño, autoestima y más.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/dashboard/perfil?tab=plan" style={{ background: '#2dd4bf', color: '#0d1a12', padding: '12px 28px', borderRadius: '10px', fontWeight: '800', fontSize: '14px', textDecoration: 'none' }}>
          Ver planes →
        </Link>
        <Link href="/dashboard" style={{ background: 'transparent', color: '#5a8a6a', padding: '12px 24px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', textDecoration: 'none', border: '1px solid #2a3d2e' }}>
          Volver al inicio
        </Link>
      </div>
      <p style={{ fontSize: '12px', color: '#3d5c48' }}>Plan Plus desde <strong style={{ color: '#2dd4bf' }}>$25.000 COP/mes</strong> · Cancela cuando quieras</p>
    </div>
  );
  const [programaActivo, setProgramaActivo] = useState<typeof PROGRAMAS[0]|null>(null);
  const [semanaActiva, setSemanaActiva] = useState(0);
  const [programas, setProgramas] = useState(PROGRAMAS);

  const inscribirse = (id: string) => {
    setProgramas(prev => prev.map(p => p.id === id ? { ...p, inscrito: true } : p));
    setProgramaActivo(prev => prev?.id === id ? { ...prev, inscrito: true } : prev);
  };

  const abrirTema = (programa: typeof PROGRAMAS[0], semana: typeof PROGRAMAS[0]['semanas'][0], tema: string) => {
    const msg = encodeURIComponent(`Quiero trabajar el tema "${tema}" del programa "${programa.titulo}" (Semana ${semana.n}: ${semana.titulo}). ¿Puedes guiarme?`);
    router.push(`/dashboard/chat?inicio=${msg}`);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize:'24px', fontWeight:'900', color:'white' }}>📚 Programas Guiados</h1>
        <p style={{ fontSize:'13px', color:'#5a8a6a', marginTop:'4px' }}>Programas estructurados de 3-5 semanas basados en evidencia clínica</p>
      </div>

      {/* Grid de programas */}
      {!programaActivo && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'16px' }}>
          {programas.map(p=>(
            <div key={p.id} style={{ background:p.color, border:`1px solid ${p.border}`, borderRadius:'16px', padding:'24px', cursor:'pointer' }} onClick={()=>{ setProgramaActivo(p); setSemanaActiva(0); }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
                <span style={{ fontSize:'32px' }}>{p.icono}</span>
                {p.inscrito && <span style={{ background:'rgba(45,212,191,0.2)', color:'#2dd4bf', fontSize:'10px', fontWeight:'800', padding:'3px 8px', borderRadius:'10px' }}>EN CURSO</span>}
              </div>
              <h3 style={{ fontSize:'17px', fontWeight:'800', color:'white', marginBottom:'6px' }}>{p.titulo}</h3>
              <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)', marginBottom:'12px', lineHeight:1.5 }}>{p.descripcion}</p>
              <div style={{ display:'flex', gap:'12px', marginBottom:'14px' }}>
                <span style={{ fontSize:'12px', color:p.border }}>⏱ {p.duracion}</span>
                <span style={{ fontSize:'12px', color:p.border }}>📝 {p.sesiones} sesiones</span>
              </div>
              {p.inscrito && p.progreso > 0 && (
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                    <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.6)' }}>Progreso</span>
                    <span style={{ fontSize:'11px', color:p.border, fontWeight:'700' }}>{p.progreso}%</span>
                  </div>
                  <div style={{ height:'4px', background:'rgba(255,255,255,0.1)', borderRadius:'2px' }}>
                    <div style={{ height:'100%', width:`${p.progreso}%`, background:p.border, borderRadius:'2px' }} />
                  </div>
                </div>
              )}
              <button style={{ marginTop:'16px', width:'100%', background:p.border, color:'#0d1a12', padding:'11px', borderRadius:'8px', border:'none', fontWeight:'800', cursor:'pointer', fontSize:'13px', fontFamily:'inherit' }}>
                {p.inscrito ? 'Continuar programa →' : 'Ver programa →'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── PROGRAMA ACTIVO ── */}
      {programaActivo && (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {/* Nav */}
          <button onClick={()=>setProgramaActivo(null)} style={{ background:'none', border:'none', color:'#5a8a6a', cursor:'pointer', fontSize:'14px', fontFamily:'inherit', alignSelf:'flex-start', display:'flex', alignItems:'center', gap:'6px' }}>
            ← Todos los programas
          </button>

          {/* Header programa */}
          <div style={{ background:programaActivo.color, border:`1px solid ${programaActivo.border}`, borderRadius:'16px', padding:'24px', display:'flex', gap:'16px', alignItems:'flex-start', flexWrap:'wrap' }}>
            <span style={{ fontSize:'40px' }}>{programaActivo.icono}</span>
            <div style={{ flex:1 }}>
              <h2 style={{ fontSize:'22px', fontWeight:'900', color:'white', marginBottom:'6px' }}>{programaActivo.titulo}</h2>
              <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.7)', marginBottom:'12px', lineHeight:1.6 }}>{programaActivo.descripcion}</p>
              <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
                <span style={{ color:programaActivo.border, fontSize:'13px', fontWeight:'700' }}>⏱ {programaActivo.duracion}</span>
                <span style={{ color:programaActivo.border, fontSize:'13px', fontWeight:'700' }}>📝 {programaActivo.sesiones} sesiones</span>
              </div>
              {programaActivo.progreso > 0 && (
                <div style={{ marginTop:'14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                    <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>Tu progreso</span>
                    <span style={{ fontSize:'12px', color:programaActivo.border, fontWeight:'700' }}>{programaActivo.progreso}%</span>
                  </div>
                  <div style={{ height:'6px', background:'rgba(255,255,255,0.1)', borderRadius:'3px' }}>
                    <div style={{ height:'100%', width:`${programaActivo.progreso}%`, background:programaActivo.border, borderRadius:'3px' }} />
                  </div>
                </div>
              )}
            </div>
            {!programaActivo.inscrito ? (
              <button onClick={()=>inscribirse(programaActivo.id)} style={{ background:programaActivo.border, color:'#0d1a12', padding:'12px 24px', borderRadius:'10px', border:'none', fontWeight:'800', cursor:'pointer', fontFamily:'inherit', fontSize:'14px', flexShrink:0 }}>
                Iniciar programa
              </button>
            ) : (
              <span style={{ background:'rgba(45,212,191,0.2)', color:'#2dd4bf', fontSize:'12px', fontWeight:'800', padding:'6px 14px', borderRadius:'10px', flexShrink:0 }}>EN CURSO</span>
            )}
          </div>

          {/* Semanas */}
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {programaActivo.semanas.map((semana, idx)=>{
              const completada = idx * (100 / programaActivo.semanas.length) < programaActivo.progreso;
              const activa = idx === semanaActiva;
              return (
                <div key={idx} style={{ background:'#0d1a12', border:`1px solid ${activa?programaActivo.border:'#1a2e1f'}`, borderRadius:'12px', overflow:'hidden', cursor:'pointer' }} onClick={()=>setSemanaActiva(activa?-1:idx)}>
                  <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:'14px' }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:completada?programaActivo.color:'#1a2e1f', border:`2px solid ${completada?programaActivo.border:'#2a3d2e'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontSize:'14px', fontWeight:'900', color:completada?programaActivo.border:'#3d5c48' }}>{completada?'✓':idx+1}</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:'700', color:'white', fontSize:'14px' }}>Semana {semana.n}: {semana.titulo}</p>
                      <p style={{ fontSize:'12px', color:'#5a8a6a', marginTop:'2px' }}>{semana.temas.length} temas · {Math.ceil(semana.temas.length * 15)} min aprox.</p>
                    </div>
                    <span style={{ color:'#3d5c48', transition:'transform .2s', transform:activa?'rotate(180deg)':'none' }}>▾</span>
                  </div>
                  {activa && (
                    <div style={{ padding:'0 20px 18px', borderTop:'1px solid #1a2e1f' }}>
                      <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginTop:'14px' }}>
                        {semana.temas.map((tema,ti)=>(
                          <div
                            key={ti}
                            onClick={()=>abrirTema(programaActivo, semana, tema)}
                            style={{ display:'flex', gap:'10px', alignItems:'center', padding:'10px 14px', background:'#141f17', borderRadius:'8px', cursor:'pointer' }}
                          >
                            <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:completada?programaActivo.border:'#1a2e1f', border:`1px solid ${completada?programaActivo.border:'#2a3d2e'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'11px', color:'white' }}>
                              {completada?'✓':ti+1}
                            </div>
                            <span style={{ fontSize:'13px', color:'#8aab96', flex:1 }}>{tema}</span>
                            <span style={{ background:`${programaActivo.border}22`, color:programaActivo.border, fontSize:'11px', padding:'2px 8px', borderRadius:'10px', fontWeight:'700', flexShrink:0 }}>
                              Trabajar con IA →
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
