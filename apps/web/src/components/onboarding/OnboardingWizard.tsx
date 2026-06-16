'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'mb_onboarding_v1';

type ObjetivoId = 'ansiedad' | 'tristeza' | 'estres' | 'sueno' | 'autoconocimiento';

const OBJETIVOS = [
  { id: 'ansiedad',         icon: '😰', label: 'Manejar la ansiedad',     desc: 'Técnicas TCC y respiración' },
  { id: 'tristeza',         icon: '😔', label: 'Procesar tristeza o duelo', desc: 'Apoyo emocional y ACT' },
  { id: 'estres',           icon: '😓', label: 'Reducir el estrés',        desc: 'Mindfulness y regulación' },
  { id: 'sueno',            icon: '😴', label: 'Mejorar el sueño',         desc: 'Higiene del sueño' },
  { id: 'autoconocimiento', icon: '🌱', label: 'Autoconocimiento',         desc: 'Diario emocional y progreso' },
];

const DESTINO: Record<string, { href: string; cta: string }> = {
  ansiedad:         { href: '/dashboard/chat',       cta: 'Hablar con la IA sobre mi ansiedad →' },
  tristeza:         { href: '/dashboard/chat',       cta: 'Hablar con la IA sobre cómo me siento →' },
  estres:           { href: '/dashboard/ejercicios', cta: 'Hacer un ejercicio de respiración ahora →' },
  sueno:            { href: '/dashboard/programas',  cta: 'Ver el programa de Sueño y Descanso →' },
  autoconocimiento: { href: '/dashboard/diario',     cta: 'Escribir mi primera entrada del diario →' },
};

export default function OnboardingWizard() {
  const router = useRouter();
  const [paso, setPaso] = useState(0);
  const [objetivos, setObjetivos] = useState<ObjetivoId[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const hecho = localStorage.getItem(STORAGE_KEY);
      if (!hecho) setVisible(true);
    } catch {
      // localStorage no disponible (SSR o navegador restringido)
    }
  }, []);

  const completar = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* noop */ }
    setVisible(false);
  };

  const toggleObjetivo = (id: ObjetivoId) => {
    setObjetivos(prev =>
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    );
  };

  const primerObjetivo = objetivos[0] ?? null;

  const irAlDestino = () => {
    completar();
    if (primerObjetivo && DESTINO[primerObjetivo]) {
      router.push(DESTINO[primerObjetivo].href);
    }
  };

  if (!visible) return null;

  const PASOS = [
    // Paso 0 — Bienvenida
    <div key="bienvenida" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
        <div style={{ fontSize: '52px', marginBottom: '12px' }}>💚</div>
        <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>
          Bienvenido/a a MindBridge
        </h2>
        <p style={{ fontSize: '14px', color: '#8aab96', lineHeight: 1.6, maxWidth: '340px', margin: '0 auto' }}>
          Este es tu espacio seguro para el bienestar emocional. En 2 minutos te mostramos cómo sacarle el máximo provecho.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[
          { icon: '🤖', texto: 'Chat con IA clínica — disponible 24/7, sin juicios' },
          { icon: '📔', texto: 'Diario emocional cifrado — solo tú puedes verlo' },
          { icon: '👨‍⚕️', texto: 'Psicólogos certificados — cuando quieras más apoyo' },
          { icon: '🧘', texto: 'Ejercicios guiados — respiración, grounding, TCC' },
        ].map(({ icon, texto }) => (
          <div key={texto} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 14px', background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.1)', borderRadius: '10px' }}>
            <span style={{ fontSize: '18px' }}>{icon}</span>
            <span style={{ fontSize: '13px', color: '#8aab96' }}>{texto}</span>
          </div>
        ))}
      </div>
    </div>,

    // Paso 1 — Objetivos (multi-selección)
    <div key="objetivo" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'white', marginBottom: '6px' }}>
          ¿Qué te trae a MindBridge?
        </h2>
        <p style={{ fontSize: '13px', color: '#5a8a6a' }}>
          Puedes elegir varias. Puedes cambiar esto en cualquier momento.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {OBJETIVOS.map(o => {
          const sel = objetivos.includes(o.id as ObjetivoId);
          return (
            <button
              key={o.id}
              onClick={() => toggleObjetivo(o.id as ObjetivoId)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 16px', borderRadius: '12px', border: 'none',
                background: sel ? 'rgba(45,212,191,0.12)' : 'rgba(255,255,255,0.03)',
                outline: sel ? '1.5px solid #2dd4bf' : '1.5px solid #2a3d2e',
                cursor: 'pointer', textAlign: 'left', transition: 'all .15s', fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: '22px', flexShrink: 0 }}>{o.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: sel ? '#2dd4bf' : 'white', marginBottom: '2px' }}>{o.label}</p>
                <p style={{ fontSize: '12px', color: '#5a8a6a' }}>{o.desc}</p>
              </div>
              <div style={{
                width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
                border: sel ? '2px solid #2dd4bf' : '2px solid #2a3d2e',
                background: sel ? '#2dd4bf' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .15s',
              }}>
                {sel && <span style={{ color: '#0d1a12', fontSize: '12px', fontWeight: '900', lineHeight: 1 }}>✓</span>}
              </div>
            </button>
          );
        })}
      </div>
      {objetivos.length > 0 && (
        <p style={{ fontSize: '12px', color: '#2dd4bf', textAlign: 'center' }}>
          {objetivos.length} {objetivos.length === 1 ? 'tema seleccionado' : 'temas seleccionados'} ✓
        </p>
      )}
    </div>,

    // Paso 2 — Cómo funciona la IA
    <div key="ia" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'white', marginBottom: '6px' }}>
          Sobre la IA de MindBridge
        </h2>
        <p style={{ fontSize: '13px', color: '#5a8a6a', lineHeight: 1.5 }}>
          Para usarla bien, es importante entender qué puede y qué no puede hacer.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[
          { tipo: 'si', icon: '✅', texto: 'Escucharte sin juzgar las 24 horas del día' },
          { tipo: 'si', icon: '✅', texto: 'Enseñarte técnicas de regulación emocional' },
          { tipo: 'si', icon: '✅', texto: 'Detectar si estás en crisis y darte recursos inmediatos' },
          { tipo: 'si', icon: '✅', texto: 'Orientarte hacia un psicólogo cuando sea necesario' },
          { tipo: 'no', icon: '⛔', texto: 'Diagnosticar trastornos mentales' },
          { tipo: 'no', icon: '⛔', texto: 'Reemplazar la psicoterapia profesional' },
          { tipo: 'no', icon: '⛔', texto: 'Atender una emergencia en tiempo real' },
        ].map(({ tipo, icon, texto }) => (
          <div key={texto} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '8px 0' }}>
            <span style={{ fontSize: '15px', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
            <span style={{ fontSize: '13px', color: tipo === 'si' ? '#8aab96' : '#f87171', lineHeight: 1.4 }}>{texto}</span>
          </div>
        ))}
        <div style={{ marginTop: '8px', padding: '10px 12px', background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: '10px', fontSize: '12px', color: '#f87171' }}>
          🚨 En crisis real, llama ahora:{' '}
          <a href="tel:106" style={{ color: '#2dd4bf', fontWeight: 700, textDecoration: 'none' }}>106</a>
          {' · '}
          <a href="tel:8001225555" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>800-112-5555</a>
          {' · '}
          <a href="tel:123" style={{ color: '#f87171', fontWeight: 700, textDecoration: 'none' }}>123</a>
        </div>
      </div>
    </div>,

    // Paso 3 — Primer paso recomendado
    <div key="primerpaso" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
        <div style={{ fontSize: '44px', marginBottom: '10px' }}>
          {primerObjetivo ? OBJETIVOS.find(o => o.id === primerObjetivo)?.icon : '🚀'}
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>
          ¡Todo listo!
        </h2>
        {objetivos.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '10px' }}>
            {objetivos.map(id => {
              const o = OBJETIVOS.find(x => x.id === id);
              return o ? (
                <span key={id} style={{ fontSize: '11px', background: 'rgba(45,212,191,0.12)', border: '1px solid rgba(45,212,191,0.25)', borderRadius: '20px', padding: '3px 10px', color: '#2dd4bf', fontWeight: '600' }}>
                  {o.icon} {o.label}
                </span>
              ) : null;
            })}
          </div>
        )}
        <p style={{ fontSize: '13px', color: '#8aab96', lineHeight: 1.6, maxWidth: '320px', margin: '0 auto' }}>
          {primerObjetivo ? 'Este es tu primer paso recomendado:' : 'Tu espacio está listo. Te recomendamos empezar por aquí:'}
        </p>
      </div>

      {primerObjetivo && DESTINO[primerObjetivo] && (
        <button
          onClick={irAlDestino}
          style={{
            padding: '16px', background: 'linear-gradient(135deg,#1a6b4a,#0d4a32)',
            border: '1px solid rgba(45,212,191,0.3)', borderRadius: '12px',
            color: 'white', fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
          }}
        >
          {DESTINO[primerObjetivo].cta}
        </button>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ fontSize: '11px', color: '#3d5c48', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700' }}>También puedes explorar</p>
        {[
          { href: '/dashboard/chat',       label: '🤖 Hablar con la IA' },
          { href: '/dashboard/ejercicios', label: '🧘 Hacer un ejercicio guiado' },
          { href: '/dashboard/diario',     label: '📔 Escribir en el diario' },
        ].filter(l => !primerObjetivo || DESTINO[primerObjetivo]?.href !== l.href).map(l => (
          <a
            key={l.href}
            href={l.href}
            onClick={completar}
            style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid #2a3d2e', borderRadius: '8px', color: '#8aab96', textDecoration: 'none', fontSize: '13px', display: 'block' }}
          >
            {l.label}
          </a>
        ))}
      </div>
    </div>,
  ];

  const esPrimerPaso = paso === 0;
  const esUltimoPaso = paso === PASOS.length - 1;
  const puedeSiguiente = paso === 1 ? objetivos.length > 0 : true;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenida a MindBridge"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9000, padding: '20px',
      }}
    >
      <div style={{
        background: '#0d1a12',
        border: '1px solid #1a6b4a',
        borderRadius: '20px',
        padding: '32px',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '90vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>

        {/* Progreso */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {PASOS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: i === paso ? 3 : 1,
                height: '4px',
                borderRadius: '2px',
                background: i <= paso ? '#2dd4bf' : '#1a2e1f',
                transition: 'flex .3s, background .2s',
              }}
            />
          ))}
          <span style={{ fontSize: '11px', color: '#3d5c48', marginLeft: '6px', whiteSpace: 'nowrap' }}>
            {paso + 1} / {PASOS.length}
          </span>
        </div>

        {/* Contenido del paso actual */}
        {PASOS[paso]}

        {/* Navegación */}
        <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
          {!esPrimerPaso && (
            <button
              onClick={() => setPaso(p => p - 1)}
              style={{ padding: '11px 20px', background: 'transparent', border: '1px solid #2a3d2e', borderRadius: '8px', color: '#5a8a6a', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
            >
              ← Atrás
            </button>
          )}

          {!esUltimoPaso && (
            <button
              onClick={() => setPaso(p => p + 1)}
              disabled={!puedeSiguiente}
              style={{
                flex: 1, padding: '12px', borderRadius: '8px', border: 'none',
                background: puedeSiguiente ? '#1a6b4a' : '#1a2e1f',
                color: puedeSiguiente ? 'white' : '#3d5c48',
                cursor: puedeSiguiente ? 'pointer' : 'not-allowed',
                fontSize: '14px', fontWeight: '700', fontFamily: 'inherit',
                transition: 'background .15s',
              }}
            >
              {paso === 1 && objetivos.length === 0 ? 'Selecciona al menos una opción' : 'Continuar →'}
            </button>
          )}

          {esUltimoPaso && objetivos.length === 0 && (
            <button
              onClick={completar}
              style={{ flex: 1, padding: '12px', background: '#1a6b4a', borderRadius: '8px', border: 'none', color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Ir al dashboard →
            </button>
          )}
        </div>

        {/* Skip */}
        {!esUltimoPaso && (
          <button
            onClick={completar}
            style={{ background: 'none', border: 'none', color: '#3d5c48', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', padding: '0' }}
          >
            Saltar introducción
          </button>
        )}
      </div>
    </div>
  );
}
