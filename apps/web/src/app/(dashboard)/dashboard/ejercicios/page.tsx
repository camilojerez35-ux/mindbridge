'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const EJERCICIOS = [
  { id:'r1', cat:'Respiración', icon:'🫁', titulo:'Respiración 4-4-6', duracion:3, nivel:'Principiante', desc:'Técnica básica para reducir ansiedad. Inhala 4s, sostén 4s, exhala 6s.', pasos:['Siéntate cómodamente con la espalda recta','Cierra los ojos suavemente','Inhala por la nariz durante 4 segundos','Sostén el aire durante 4 segundos','Exhala lentamente por la boca durante 6 segundos','Repite 6 veces'], color:'#1a6b4a', borderColor:'#2dd4bf' },
  { id:'r2', cat:'Respiración', icon:'⬛', titulo:'Respiración cuadrada', duracion:5, nivel:'Principiante', desc:'4 segundos en cada fase. Excelente para calmar la mente rápidamente.', pasos:['Exhala todo el aire primero','Inhala durante 4 segundos','Sostén durante 4 segundos','Exhala durante 4 segundos','Sostén vacío durante 4 segundos','Repite 5 veces'], color:'#1a3d6b', borderColor:'#818cf8' },
  { id:'g1', cat:'Grounding', icon:'🌱', titulo:'Técnica 5-4-3-2-1', duracion:5, nivel:'Principiante', desc:'Ancla tu mente al presente usando los 5 sentidos. Ideal para ataques de pánico.', pasos:['Nombra 5 cosas que puedes VER ahora mismo','Nombra 4 cosas que puedes TOCAR','Nombra 3 cosas que puedes ESCUCHAR','Nombra 2 cosas que puedes OLER','Nombra 1 cosa que puedes SABOREAR','Respira profundo y nota cómo te sientes'], color:'#3d2d0a', borderColor:'#fbbf24' },
  { id:'g2', cat:'Grounding', icon:'🦶', titulo:'Grounding corporal', duracion:3, nivel:'Principiante', desc:'Reconecta con tu cuerpo para salir de pensamientos rumiativos.', pasos:['Siente el peso de tus pies en el suelo','Presiona suavemente el suelo con los pies','Siente la presión de la silla en tu cuerpo','Nota la temperatura del aire en tu piel','Aprieta y relaja las manos 3 veces','Abre los ojos y mira a tu alrededor'], color:'#1a2e1f', borderColor:'#2d9e6f' },
  { id:'m1', cat:'Mindfulness', icon:'🧘', titulo:'Escaneo corporal', duracion:10, nivel:'Intermedio', desc:'Recorre tu cuerpo con atención plena para liberar tensiones acumuladas.', pasos:['Acuéstate o siéntate cómodamente','Cierra los ojos y respira profundo 3 veces','Lleva tu atención a los pies — ¿qué sientes?','Sube lentamente a las piernas y rodillas','Continúa por el abdomen y el pecho','Termina en la cabeza y cara, relajando cada músculo'], color:'#2d0a3d', borderColor:'#a855f7' },
  { id:'m2', cat:'Mindfulness', icon:'🍃', titulo:'Defusión cognitiva', duracion:5, nivel:'Intermedio', desc:'Toma distancia de pensamientos intrusivos. Técnica ACT muy efectiva.', pasos:['Identifica un pensamiento que te molesta','En lugar de "Soy un fracaso" di: "Noto que tengo el pensamiento de que soy un fracaso"','Imagina ese pensamiento como una hoja en un río','Observa cómo fluye sin aferrarte a él','Repite con otros pensamientos intrusivos','Nota cómo el pensamiento pierde intensidad'], color:'#0a2e2d', borderColor:'#06b6d4' },
  { id:'t1', cat:'TCC', icon:'🧠', titulo:'Registro ABC', duracion:8, nivel:'Intermedio', desc:'Identifica la conexión entre situación, pensamiento y emoción.', pasos:['A — Situación: ¿Qué pasó exactamente?','B — Pensamiento: ¿Qué pensaste automáticamente?','C — Emoción: ¿Qué sentiste y con qué intensidad (1-10)?','Evalúa: ¿Tienes evidencia a favor y en contra?','Genera un pensamiento alternativo más equilibrado','¿Cómo te sientes ahora? ¿Cambió la intensidad?'], color:'#1a1a3d', borderColor:'#6366f1' },
  { id:'r3', cat:'Relajación', icon:'💆', titulo:'Relajación muscular', duracion:10, nivel:'Principiante', desc:'Técnica de Jacobson: tensiona y relaja grupos musculares para liberar estrés.', pasos:['Siéntate cómodamente y respira profundo','Aprieta los puños 5 segundos — suéltalo todo','Encoge los hombros hasta las orejas 5 segundos — suéltalo','Arruga la cara fuertemente 5 segundos — relaja','Tensa el abdomen 5 segundos — suéltalo','Nota la diferencia entre tensión y relajación'], color:'#2d1a0a', borderColor:'#f59e0b' },
];

const CATS = ['Todos','Respiración','Grounding','Mindfulness','TCC','Relajación'];

type Conteo = Record<string, number>;

export default function EjerciciosPage() {
  const [cat, setCat] = useState('Todos');
  const [activo, setActivo] = useState<typeof EJERCICIOS[0] | null>(null);
  const [paso, setPaso] = useState(0);
  const [segundos, setSegundos] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [completado, setCompletado] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Tracking state
  const [conteo, setConteo] = useState<Conteo>({});
  const [totalMinutos, setTotalMinutos] = useState(0);
  const [totalCompletados, setTotalCompletados] = useState(0);
  const [guardandoCompletado, setGuardandoCompletado] = useState(false);

  const filtrados = cat === 'Todos' ? EJERCICIOS : EJERCICIOS.filter(e => e.cat === cat);

  const cargarStats = useCallback(async () => {
    try {
      const res = await fetch('/api/ejercicios/completados?dias=365');
      const data = await res.json();
      if (res.ok) {
        setConteo(data.conteo ?? {});
        setTotalMinutos(data.totalMinutos ?? 0);
        setTotalCompletados(data.total ?? 0);
      }
    } catch { /* silencioso — datos de tracking no son críticos */ }
  }, []);

  useEffect(() => { cargarStats(); }, [cargarStats]);

  useEffect(() => {
    if (corriendo) {
      intervalRef.current = setInterval(() => setSegundos(s => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [corriendo]);

  const iniciar = (ej: typeof EJERCICIOS[0]) => {
    setActivo(ej); setPaso(0); setSegundos(0); setCorriendo(true); setCompletado(false);
  };

  const siguiente = () => {
    if (!activo) return;
    if (paso < activo.pasos.length - 1) {
      setPaso(p => p + 1);
    } else {
      setCorriendo(false);
      setCompletado(true);
      registrarCompletado(activo, segundos);
    }
  };

  const registrarCompletado = async (ej: typeof EJERCICIOS[0], durSeg: number) => {
    setGuardandoCompletado(true);
    try {
      const res = await fetch('/api/ejercicios/completados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ejercicioId: ej.id, titulo: ej.titulo, categoria: ej.cat, duracionSeg: durSeg }),
      });
      if (res.ok) {
        setConteo(prev => ({ ...prev, [ej.id]: (prev[ej.id] ?? 0) + 1 }));
        setTotalMinutos(prev => prev + Math.round(durSeg / 60));
        setTotalCompletados(prev => prev + 1);
      }
    } finally {
      setGuardandoCompletado(false);
    }
  };

  const cerrar = () => { setActivo(null); setCorriendo(false); setCompletado(false); setPaso(0); setSegundos(0); };

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // Ejercicio más practicado
  const masUsado = EJERCICIOS.find(e => e.id === Object.entries(conteo).sort((a, b) => b[1] - a[1])[0]?.[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'white' }}>🧘 Ejercicios Guiados</h1>
        <p style={{ fontSize: '13px', color: '#5a8a6a', marginTop: '4px' }}>Respiración, grounding, mindfulness y técnicas TCC basadas en evidencia</p>
      </div>

      {/* Stats de práctica */}
      {totalCompletados > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px' }}>
          {[
            { label: 'Sesiones totales', val: totalCompletados, icon: '✅', color: '#2dd4bf' },
            { label: 'Minutos practicados', val: totalMinutos, icon: '⏱', color: '#fbbf24' },
            { label: 'Más practicado', val: masUsado ? masUsado.icon + ' ' + masUsado.titulo.split(' ')[0] : '—', icon: '🏆', color: '#a78bfa' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '22px' }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '11px', color: '#3d5c48', marginTop: '2px' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ padding: '8px 16px', borderRadius: '20px', border: `1px solid ${cat === c ? '#2dd4bf' : '#2a3d2e'}`, background: cat === c ? 'rgba(45,212,191,0.12)' : 'transparent', color: cat === c ? '#2dd4bf' : '#5a8a6a', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', fontWeight: cat === c ? '700' : '400' }}>
            {c}
          </button>
        ))}
      </div>

      {/* Grid ejercicios */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
        {filtrados.map(ej => {
          const vecesHecho = conteo[ej.id] ?? 0;
          return (
            <div key={ej.id} style={{ background: ej.color, border: `1px solid ${ej.borderColor}`, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>

              {/* Badge de veces completado */}
              {vecesHecho > 0 && (
                <div style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(0,0,0,0.4)', border: `1px solid ${ej.borderColor}55`, borderRadius: '10px', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '10px' }}>✅</span>
                  <span style={{ fontSize: '11px', color: ej.borderColor, fontWeight: '700' }}>{vecesHecho}×</span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '32px' }}>{ej.icon}</span>
                <div style={{ display: 'flex', gap: '6px', marginRight: vecesHecho > 0 ? '44px' : '0' }}>
                  <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '3px 8px', borderRadius: '10px', color: 'rgba(255,255,255,0.7)' }}>{ej.nivel}</span>
                  <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '3px 8px', borderRadius: '10px', color: 'rgba(255,255,255,0.7)' }}>⏱ {ej.duracion} min</span>
                </div>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: ej.borderColor, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{ej.cat}</p>
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'white', marginBottom: '6px' }}>{ej.titulo}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{ej.desc}</p>
              </div>
              <button onClick={() => iniciar(ej)} style={{ background: ej.borderColor, color: '#0d1a12', padding: '11px', borderRadius: '8px', border: 'none', fontWeight: '800', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', marginTop: 'auto' }}>
                {vecesHecho > 0 ? '▶ Practicar de nuevo' : '▶ Iniciar ejercicio'}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── MODAL EJERCICIO ── */}
      {activo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' }}>
          <div style={{ background: '#0d1a12', border: `2px solid ${activo.borderColor}`, borderRadius: '24px', width: '100%', maxWidth: '500px', overflow: 'hidden' }}>

            {/* Header modal */}
            <div style={{ background: activo.color, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '11px', color: activo.borderColor, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{activo.cat}</p>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>{activo.titulo}</h3>
              </div>
              <button onClick={cerrar} style={{ background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            {!completado ? (
              <div style={{ padding: '28px' }}>
                {/* Timer y progreso */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontSize: '13px', color: '#5a8a6a' }}>Paso {paso + 1} de {activo.pasos.length}</span>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: activo.borderColor, fontFamily: 'monospace' }}>{fmt(segundos)}</span>
                </div>

                {/* Barra progreso */}
                <div style={{ height: '4px', background: '#1a2e1f', borderRadius: '2px', marginBottom: '24px' }}>
                  <div style={{ height: '100%', width: `${((paso + 1) / activo.pasos.length) * 100}%`, background: activo.borderColor, borderRadius: '2px', transition: 'width .3s' }} />
                </div>

                {/* Paso actual */}
                <div style={{ background: `${activo.color}88`, border: `1px solid ${activo.borderColor}44`, borderRadius: '14px', padding: '24px', marginBottom: '24px', textAlign: 'center', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontSize: '18px', color: 'white', lineHeight: 1.6, fontWeight: '500' }}>{activo.pasos[paso]}</p>
                </div>

                {/* Todos los pasos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
                  {activo.pasos.map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', opacity: i > paso ? 0.3 : 1 }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: i < paso ? activo.borderColor : i === paso ? activo.borderColor + '44' : '#1a2e1f', border: `1px solid ${activo.borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                        {i < paso ? '✓' : i + 1}
                      </div>
                      <p style={{ fontSize: '12px', color: i <= paso ? '#8aab96' : '#3d5c48', lineHeight: 1.4 }}>{p}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setCorriendo(p => !p)} style={{ flex: 1, background: '#1a2e1f', border: '1px solid #2a3d2e', color: 'white', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600', fontSize: '14px' }}>
                    {corriendo ? '⏸ Pausar' : '▶ Reanudar'}
                  </button>
                  <button onClick={siguiente} style={{ flex: 2, background: activo.borderColor, color: '#0d1a12', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '800', fontSize: '14px' }}>
                    {paso === activo.pasos.length - 1 ? '✅ Completar' : 'Siguiente paso →'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
                <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>¡Excelente trabajo!</h3>
                <p style={{ color: '#8aab96', marginBottom: '4px' }}>Completaste "{activo.titulo}"</p>
                <p style={{ fontSize: '13px', color: '#5a8a6a', marginBottom: '4px' }}>Tiempo: {fmt(segundos)}</p>
                {conteo[activo.id] && (
                  <p style={{ fontSize: '13px', color: activo.borderColor, fontWeight: '700', marginBottom: '20px' }}>
                    🏅 Has hecho este ejercicio {conteo[activo.id]} {conteo[activo.id] === 1 ? 'vez' : 'veces'}
                  </p>
                )}
                {guardandoCompletado && (
                  <p style={{ fontSize: '12px', color: '#3d5c48', marginBottom: '16px' }}>Guardando progreso...</p>
                )}
                <p style={{ fontSize: '14px', color: '#8aab96', lineHeight: 1.6, marginBottom: '28px' }}>
                  La consistencia es clave. Practica este ejercicio regularmente para mejores resultados.
                </p>
                <button onClick={cerrar} style={{ background: activo.borderColor, color: '#0d1a12', padding: '13px 32px', borderRadius: '8px', border: 'none', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit', fontSize: '15px' }}>
                  Ver más ejercicios
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
