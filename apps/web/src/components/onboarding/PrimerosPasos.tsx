'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'mb_primeros_pasos_v1';

const PASOS = [
  { id: 'chat',      icon: '🤖', label: 'Primera conversación con la IA',   href: '/dashboard/chat',       desc: 'Cuéntale cómo estás hoy' },
  { id: 'diario',    icon: '📔', label: 'Primera entrada del diario',       href: '/dashboard/diario',     desc: 'Solo toma 2 minutos' },
  { id: 'ejercicio', icon: '🧘', label: 'Un ejercicio de respiración',      href: '/dashboard/ejercicios', desc: 'Prueba el 4-4-6 ahora' },
  { id: 'cita',      icon: '👨‍⚕️', label: 'Explorar psicólogos disponibles', href: '/dashboard/citas',      desc: 'Sin compromiso, solo mira' },
];

interface Props {
  // IDs de pasos ya completados según la BD — se combinan con localStorage
  completadosDB?: string[];
}

export default function PrimerosPasos({ completadosDB = [] }: Props) {
  const [completados, setCompletados] = useState<string[]>([]);
  const [cerrado, setCerrado] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const local = raw ? (JSON.parse(raw) as { completados?: string[]; cerrado?: boolean }) : {};
      // Unión de completados en localStorage y los reales de la BD
      const union = Array.from(new Set([...(local.completados ?? []), ...completadosDB]));
      setCompletados(union);
      setCerrado(local.cerrado ?? false);
      // Persistir la unión para mantener consistencia
      if (union.length !== (local.completados ?? []).length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ completados: union, cerrado: local.cerrado ?? false }));
      }
    } catch { /* noop */ }
  }, [completadosDB.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const marcar = (id: string) => {
    const nuevos = completados.includes(id) ? completados : [...completados, id];
    setCompletados(nuevos);
    guardar(nuevos, cerrado);
  };

  const cerrar = () => {
    setCerrado(true);
    guardar(completados, true);
  };

  const guardar = (c: string[], ce: boolean) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ completados: c, cerrado: ce })); } catch { /* noop */ }
  };

  const porcentaje = Math.round((completados.length / PASOS.length) * 100);

  if (cerrado || completados.length === PASOS.length) return null;

  return (
    <div style={{
      background: '#0d1a12',
      border: '1px solid rgba(45,212,191,0.2)',
      borderRadius: '16px',
      padding: '22px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: 'white', margin: 0 }}>
              🗺️ Primeros pasos
            </h2>
            <span style={{
              fontSize: '11px', fontWeight: '700', color: '#2dd4bf',
              background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)',
              padding: '2px 8px', borderRadius: '10px',
            }}>
              {completados.length}/{PASOS.length} completos
            </span>
          </div>
          <div style={{ height: '4px', background: '#1a2e1f', borderRadius: '2px', overflow: 'hidden', width: '200px' }}>
            <div style={{
              height: '100%', width: `${porcentaje}%`,
              background: 'linear-gradient(to right, #1a6b4a, #2dd4bf)',
              borderRadius: '2px', transition: 'width .4s ease',
            }} />
          </div>
        </div>
        <button
          onClick={cerrar}
          aria-label="Cerrar primeros pasos"
          style={{ background: 'none', border: 'none', color: '#3d5c48', cursor: 'pointer', fontSize: '16px', padding: '2px', lineHeight: 1, flexShrink: 0 }}
        >
          ✕
        </button>
      </div>

      {/* Lista de pasos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {PASOS.map(paso => {
          const hecho = completados.includes(paso.id);
          return (
            <div
              key={paso.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '10px',
                background: hecho ? 'rgba(45,212,191,0.05)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${hecho ? 'rgba(45,212,191,0.15)' : '#1a2e1f'}`,
                opacity: hecho ? 0.6 : 1,
                transition: 'all .2s',
              }}
            >
              <button
                onClick={() => marcar(paso.id)}
                aria-label={hecho ? `${paso.label} completado` : `Marcar ${paso.label} como completado`}
                style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  border: `2px solid ${hecho ? '#2dd4bf' : '#2a3d2e'}`,
                  background: hecho ? '#2dd4bf' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: '12px', transition: 'all .2s',
                }}
              >
                {hecho && <span style={{ color: '#0d1a12', fontWeight: '900' }}>✓</span>}
              </button>

              <span style={{ fontSize: '18px', flexShrink: 0 }}>{paso.icon}</span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '13px', fontWeight: '600',
                  color: hecho ? '#5a8a6a' : 'white',
                  textDecoration: hecho ? 'line-through' : 'none',
                  marginBottom: '2px',
                }}>
                  {paso.label}
                </p>
                {!hecho && <p style={{ fontSize: '11px', color: '#3d5c48' }}>{paso.desc}</p>}
              </div>

              {!hecho && (
                <Link
                  href={paso.href}
                  onClick={() => marcar(paso.id)}
                  style={{
                    fontSize: '12px', color: '#2dd4bf', textDecoration: 'none',
                    fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  Ir →
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
