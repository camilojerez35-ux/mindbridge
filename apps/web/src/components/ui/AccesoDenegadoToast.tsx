'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const MENSAJES: Record<string, string> = {
  admin:      'Esta sección es solo para administradores.',
  psicologo:  'Esta sección es solo para psicólogos registrados en la plataforma.',
};

export default function AccesoDenegadoToast() {
  const params = useSearchParams();
  const [visible, setVisible] = useState(false);

  const acceso   = params.get('acceso');
  const requiere = params.get('requiere') ?? '';

  useEffect(() => {
    if (acceso === 'denegado') {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(t);
    }
  }, [acceso]);

  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed', top: '76px', right: '24px', zIndex: 9000,
        background: '#1a0a0a', border: '1px solid rgba(248,113,113,0.4)',
        borderRadius: '12px', padding: '14px 18px',
        display: 'flex', gap: '10px', alignItems: 'flex-start',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        maxWidth: '320px',
        animation: 'slideIn .2s ease',
      }}
    >
      <span style={{ fontSize: '18px', flexShrink: 0 }}>🔒</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '13px', fontWeight: '700', color: '#f87171', marginBottom: '2px' }}>Acceso denegado</p>
        <p style={{ fontSize: '12px', color: '#8aab96', lineHeight: 1.4 }}>
          {MENSAJES[requiere] ?? 'No tienes permiso para acceder a esa sección.'}
        </p>
      </div>
      <button
        onClick={() => setVisible(false)}
        aria-label="Cerrar"
        style={{ background: 'none', border: 'none', color: '#5a8a6a', cursor: 'pointer', fontSize: '14px', padding: '0', lineHeight: 1, flexShrink: 0 }}
      >
        ✕
      </button>
    </div>
  );
}
