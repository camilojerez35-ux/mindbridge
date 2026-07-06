'use client';

import Link from 'next/link';

export default function AuthError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#080f0b', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '380px' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
        <h1 style={{ fontSize: '22px', fontWeight: '900', color: 'white', marginBottom: '10px' }}>
          Algo salió mal
        </h1>
        <p style={{ fontSize: '14px', color: '#5a8a6a', lineHeight: 1.7, marginBottom: '28px' }}>
          Ocurrió un error inesperado. Por favor intenta de nuevo o vuelve al inicio.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{ background: 'linear-gradient(135deg,#1a6b4a,#0d5438)', color: 'white', border: 'none', padding: '11px 24px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Intentar de nuevo
          </button>
          <Link href="/login" style={{ background: 'rgba(255,255,255,0.05)', color: '#8aab96', border: '1px solid rgba(255,255,255,0.1)', padding: '11px 24px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', textDecoration: 'none', display: 'inline-block' }}>
            Ir al login
          </Link>
        </div>
        <p style={{ marginTop: '32px', fontSize: '11px', color: '#2a3d2e' }}>
          Crisis:{' '}
          <a href="tel:106" style={{ color: '#2dd4bf', fontWeight: 700, textDecoration: 'none' }}>106</a>
          {' · '}
          <a href="tel:8001225555" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>800-112-5555</a>
          {' · '}
          <a href="tel:123" style={{ color: '#f87171', fontWeight: 700, textDecoration: 'none' }}>123</a>
        </p>
      </div>
    </div>
  );
}
