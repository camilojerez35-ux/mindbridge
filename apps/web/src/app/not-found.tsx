import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a1510', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', padding: '40px 24px', maxWidth: '480px' }}>

          <div style={{ fontSize: '72px', marginBottom: '8px' }}>🌿</div>

          <h1 style={{ fontSize: '80px', fontWeight: '900', color: '#1a6b4a', lineHeight: 1, margin: '0 0 4px' }}>404</h1>

          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'white', margin: '0 0 12px' }}>
            Esta página no existe
          </h2>

          <p style={{ fontSize: '14px', color: '#5a8a6a', lineHeight: 1.7, margin: '0 0 32px' }}>
            La ruta que buscas no está disponible. Puede que haya sido movida o que el enlace esté incorrecto.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/dashboard"
              style={{ display: 'inline-block', background: '#1a6b4a', color: 'white', textDecoration: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '700', fontSize: '14px' }}
            >
              Ir al dashboard →
            </Link>
            <Link
              href="/"
              style={{ display: 'inline-block', background: 'transparent', color: '#5a8a6a', textDecoration: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', fontSize: '14px', border: '1px solid #2a3d2e' }}
            >
              Inicio
            </Link>
          </div>

          <p style={{ fontSize: '11px', color: '#2a3d2e', marginTop: '40px' }}>
            Crisis: <strong style={{ color: '#2dd4bf' }}>Línea 106 · 123</strong>
          </p>
        </div>
      </div>
  );
}
