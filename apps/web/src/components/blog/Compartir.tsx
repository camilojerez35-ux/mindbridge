'use client';

import { useState } from 'react';

/** WhatsApp (canal principal en Colombia) + copiar enlace / compartir nativo */
export function Compartir({ titulo, ruta }: { titulo: string; ruta: string }) {
  const [copiado, setCopiado] = useState(false);

  function url() {
    return `${window.location.origin}${ruta}`;
  }

  async function compartir() {
    const enlace = url();
    try {
      if (navigator.share) {
        await navigator.share({ title: titulo, url: enlace });
        return;
      }
      await navigator.clipboard.writeText(enlace);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch { /* el usuario canceló o el portapapeles está bloqueado */ }
  }

  const boton = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', cursor: 'pointer' } as const;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '12px', color: '#8aab96' }}>¿Le puede servir a alguien?</span>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(titulo + ' — MenteBridge')}%20${encodeURIComponent('https://mentebridge.com' + ruta)}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...boton, background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.35)', color: '#86efac' }}
      >
        WhatsApp
      </a>
      <button type="button" onClick={compartir} style={{ ...boton, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: '#c9dccf' }}>
        {copiado ? '¡Enlace copiado!' : 'Copiar enlace'}
      </button>
    </div>
  );
}
