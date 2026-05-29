'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const LINEAS_REGIONALES: Record<string, { nombre: string; numero: string }> = {
  bogota:       { nombre: 'Línea Salud Mental Bogotá', numero: '106' },
  medellin:     { nombre: 'Línea 106 Antioquia', numero: '106' },
  cali:         { nombre: 'Secretaría Salud Valle', numero: '6026200000' },
  barranquilla: { nombre: 'Línea 106 Barranquilla', numero: '106' },
  bucaramanga:  { nombre: 'Línea Salud Mental Santander', numero: '6076436363' },
  otra:         { nombre: 'Línea Nacional Salud Mental', numero: '8001225555' },
};

const CIUDADES = [
  { value: 'bogota',       label: 'Bogotá' },
  { value: 'medellin',     label: 'Medellín' },
  { value: 'cali',         label: 'Cali' },
  { value: 'barranquilla', label: 'Barranquilla' },
  { value: 'bucaramanga',  label: 'Bucaramanga' },
  { value: 'otra',         label: 'Otra ciudad' },
];

export default function PanicButton() {
  const [abierto, setAbierto] = useState(false);
  const [ciudad, setCiudad] = useState('bogota');
  const [contactoEmergencia, setContactoEmergencia] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const cerrarBtnRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const cerrar = useCallback(() => {
    setAbierto(false);
    // Devolver el foco al botón que abrió el modal
    setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  // Trap de foco dentro del modal
  useEffect(() => {
    if (!abierto) return;

    // Enfocar el botón de cerrar al abrir
    setTimeout(() => cerrarBtnRef.current?.focus(), 50);

    const modal = modalRef.current;
    if (!modal) return;

    const focusableSelectors = [
      'a[href]', 'button:not([disabled])', 'input:not([disabled])',
      'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cerrar();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusables = Array.from(modal.querySelectorAll<HTMLElement>(focusableSelectors));
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [abierto, cerrar]);

  const lineaRegional = LINEAS_REGIONALES[ciudad] ?? LINEAS_REGIONALES.otra;

  const lineas = [
    {
      numero: lineaRegional.numero,
      nombre: lineaRegional.nombre,
      desc: 'Gratuita · 24 horas · Confidencial',
      color: '#2dd4bf',
      urgencia: 'primary' as const,
    },
    {
      numero: '8001225555',
      nombre: 'Línea Nacional Salud Mental',
      desc: 'Gratuita · Horario extendido',
      color: '#818cf8',
      urgencia: 'secondary' as const,
    },
    {
      numero: '123',
      nombre: 'Emergencias Colombia',
      desc: 'Si tu vida está en peligro inmediato',
      color: '#f87171',
      urgencia: 'danger' as const,
    },
  ];

  // Deduplicar si la línea regional coincide con la nacional
  const lineasUnicas = lineas.filter((l, i, arr) =>
    i === arr.findIndex(x => x.numero === l.numero)
  );

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setAbierto(true)}
        aria-label="Ayuda de emergencia en crisis"
        aria-haspopup="dialog"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 900,
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#b82020,#7f1d1d)',
          border: '2px solid rgba(248,113,113,0.4)',
          color: 'white',
          fontSize: '22px',
          cursor: 'pointer',
          boxShadow: '0 0 0 4px rgba(184,32,32,0.2), 0 4px 16px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform .15s, box-shadow .15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 6px rgba(184,32,32,0.3), 0 6px 20px rgba(0,0,0,0.5)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 4px rgba(184,32,32,0.2), 0 4px 16px rgba(0,0,0,0.4)';
        }}
      >
        🆘
      </button>

      {abierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Recursos de crisis"
          aria-describedby="crisis-modal-desc"
          ref={modalRef}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '20px',
          }}
        >
          <div style={{
            background: '#0d1a12',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: '20px',
            padding: '32px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 0 40px rgba(184,32,32,0.2)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 id="crisis-modal-title" style={{ fontSize: '20px', fontWeight: '900', color: 'white', marginBottom: '6px' }}>
                  ¿Estás en crisis?
                </h2>
                <p id="crisis-modal-desc" style={{ fontSize: '13px', color: '#f87171', lineHeight: 1.5 }}>
                  Hay personas capacitadas esperando tu llamada <strong>ahora mismo</strong>.
                </p>
              </div>
              <button
                ref={cerrarBtnRef}
                onClick={cerrar}
                aria-label="Cerrar recursos de crisis"
                style={{ background: 'none', border: 'none', color: '#5a8a6a', fontSize: '20px', cursor: 'pointer', padding: '4px', lineHeight: 1, flexShrink: 0 }}
              >
                ✕
              </button>
            </div>

            {/* Selector de ciudad */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="crisis-ciudad"
                style={{ display: 'block', fontSize: '12px', color: '#8aab96', marginBottom: '6px', fontWeight: '600' }}
              >
                ¿En qué ciudad estás?
              </label>
              <select
                id="crisis-ciudad"
                value={ciudad}
                onChange={e => setCiudad(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: '#0a1510', color: 'white',
                  border: '1px solid rgba(45,212,191,0.2)', borderRadius: '8px',
                  fontSize: '14px', fontFamily: 'inherit', cursor: 'pointer',
                }}
              >
                {CIUDADES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Líneas de emergencia */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {lineasUnicas.map(({ numero, nombre, desc, color, urgencia }) => (
                <a
                  key={numero}
                  href={`tel:${numero}`}
                  aria-label={`Llamar ${nombre}: ${numero}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 16px',
                    background: urgencia === 'danger' ? 'rgba(248,113,113,0.08)' : 'rgba(45,212,191,0.04)',
                    border: `1px solid ${urgencia === 'danger' ? 'rgba(248,113,113,0.25)' : 'rgba(45,212,191,0.12)'}`,
                    borderRadius: '12px',
                    textDecoration: 'none',
                    transition: 'background .15s',
                  }}
                >
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: `${color}22`,
                    border: `2px solid ${color}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', flexShrink: 0,
                  }}>
                    📞
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '18px', fontWeight: '900', color, lineHeight: 1, marginBottom: '3px' }}>
                      {numero.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3').replace(/^(\d{3})$/, '$1')}
                    </p>
                    <p style={{ fontSize: '13px', color: 'white', fontWeight: '600', marginBottom: '2px' }}>{nombre}</p>
                    <p style={{ fontSize: '11px', color: '#5a8a6a' }}>{desc}</p>
                  </div>
                  <span style={{ color, fontSize: '16px' }} aria-hidden="true">›</span>
                </a>
              ))}
            </div>

            {/* Contacto de emergencia personal */}
            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="crisis-contacto"
                style={{ display: 'block', fontSize: '12px', color: '#8aab96', marginBottom: '6px', fontWeight: '600' }}
              >
                Contacto de emergencia personal (opcional)
              </label>
              <input
                id="crisis-contacto"
                type="tel"
                value={contactoEmergencia}
                onChange={e => setContactoEmergencia(e.target.value)}
                placeholder="Número de un familiar o amigo de confianza"
                aria-describedby="crisis-contacto-hint"
                style={{
                  width: '100%', padding: '10px 12px',
                  background: '#0a1510', color: 'white',
                  border: '1px solid rgba(45,212,191,0.2)', borderRadius: '8px',
                  fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
              <p id="crisis-contacto-hint" style={{ fontSize: '11px', color: '#5a8a6a', marginTop: '4px' }}>
                Solo visible para ti. No se guarda en el servidor.
              </p>
              {contactoEmergencia && (
                <a
                  href={`tel:${contactoEmergencia.replace(/\s/g, '')}`}
                  aria-label={`Llamar a tu contacto de emergencia: ${contactoEmergencia}`}
                  style={{
                    display: 'block', marginTop: '8px',
                    padding: '10px 14px', textAlign: 'center',
                    background: 'rgba(129,140,248,0.1)',
                    border: '1px solid rgba(129,140,248,0.3)',
                    borderRadius: '8px', color: '#818cf8',
                    textDecoration: 'none', fontSize: '14px', fontWeight: '600',
                  }}
                >
                  📞 Llamar a mi contacto de emergencia
                </a>
              )}
            </div>

            {/* Recordatorio de IA */}
            <div style={{
              padding: '12px 16px',
              background: 'rgba(251,191,36,0.06)',
              border: '1px solid rgba(251,191,36,0.15)',
              borderRadius: '10px',
              marginBottom: '20px',
            }}>
              <p style={{ fontSize: '12px', color: '#fbbf24', lineHeight: 1.5 }}>
                <strong>Recuerda:</strong> La IA de MindBridge no reemplaza la atención en crisis.
                En emergencias reales, llama al 123.
              </p>
            </div>

            <button
              onClick={cerrar}
              style={{
                width: '100%', padding: '12px',
                background: '#1a2e1f', color: '#8aab96',
                border: '1px solid #2a3d2e', borderRadius: '10px',
                cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit',
              }}
            >
              Cerrar y volver a MindBridge
            </button>
          </div>
        </div>
      )}
    </>
  );
}
