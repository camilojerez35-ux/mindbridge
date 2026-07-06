'use client';
// src/app/(auth)/verificar-email/page.tsx
// Página de resultado tras hacer clic en el enlace de verificación de email.

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function VerificarEmailPage() {
  const searchParams = useSearchParams();
  const exito = searchParams.get('exito') === 'true';
  const yaVerificado = searchParams.get('verificado') === 'ya';
  const error = searchParams.get('error');

  if (exito || yaVerificado) {
    return (
      <Layout>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '10px' }}>
            {yaVerificado ? '¡Ya estás verificado!' : '¡Email verificado!'}
          </h1>
          <p style={{ color: '#8aab96', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
            {yaVerificado
              ? 'Tu cuenta ya estaba activa. Puedes iniciar sesión.'
              : 'Tu cuenta está activa. Ya puedes iniciar sesión y comenzar tu camino de bienestar.'}
          </p>
          <Link href="/login" style={btnStyle}>
            Iniciar sesión →
          </Link>
        </div>
      </Layout>
    );
  }

  if (error) {
    const esExpirado = decodeURIComponent(error).toLowerCase().includes('expirado');
    return (
      <Layout>
        <EnlaceInvalido esExpirado={esExpirado} mensaje={decodeURIComponent(error)} />
      </Layout>
    );
  }

  // Estado inicial — usuario llegó directamente a la página sin parámetros
  return (
    <Layout>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>📧</div>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '10px' }}>
          Revisa tu email
        </h1>
        <p style={{ color: '#8aab96', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
          Te enviamos un enlace de verificación. Haz clic en él para activar tu cuenta.<br />
          El enlace es válido por <strong style={{ color: 'white' }}>24 horas</strong>.
        </p>
        <p style={{ color: '#3d5c48', fontSize: '12px' }}>
          ¿No lo recibiste? Revisa tu carpeta de spam o{' '}
          <ReenviarLink />
        </p>
      </div>
    </Layout>
  );
}

function EnlaceInvalido({ esExpirado, mensaje }: { esExpirado: boolean; mensaje: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>⚠️</div>
      <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '10px' }}>
        {esExpirado ? 'Enlace expirado' : 'Enlace inválido'}
      </h1>
      <p style={{ color: '#8aab96', fontSize: '14px', lineHeight: 1.6, marginBottom: '8px' }}>
        {mensaje}
      </p>
      {esExpirado && (
        <p style={{ color: '#5a8a6a', fontSize: '13px', marginBottom: '28px' }}>
          Solicita un nuevo enlace de verificación:
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
        <ReenviarLink style={btnStyle} />
        <Link href="/registro" style={{ ...btnStyle, background: '#1a2e1f', color: '#8aab96' }}>
          Crear cuenta nueva
        </Link>
      </div>
    </div>
  );
}

function ReenviarLink({ style }: { style?: React.CSSProperties }) {
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState<'idle' | 'loading' | 'enviado' | 'error'>('idle');
  const [mostrarForm, setMostrarForm] = useState(!!style);

  if (!mostrarForm) {
    return (
      <button
        onClick={() => setMostrarForm(true)}
        style={{ background: 'none', border: 'none', color: '#2dd4bf', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', fontFamily: 'inherit', padding: 0 }}
      >
        solicitar uno nuevo
      </button>
    );
  }

  if (estado === 'enviado') {
    return <p style={{ color: '#2dd4bf', fontSize: '13px' }}>✓ Enlace enviado. Revisa tu email.</p>;
  }

  const handleReenviar = async () => {
    if (!email.includes('@')) return;
    setEstado('loading');
    try {
      await fetch('/api/auth/reenviar-verificacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setEstado('enviado');
    } catch {
      setEstado('error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...(style ? {} : { marginTop: '12px' }) }}>
      <input
        type="email"
        placeholder="tu@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #2a3d2e', borderRadius: '8px', padding: '10px 14px', color: 'white', fontSize: '14px', outline: 'none', width: '100%' }}
      />
      <button
        onClick={handleReenviar}
        disabled={estado === 'loading' || !email.includes('@')}
        style={{ ...btnStyle, opacity: estado === 'loading' || !email.includes('@') ? 0.6 : 1, cursor: 'pointer', border: 'none' }}
      >
        {estado === 'loading' ? 'Enviando...' : 'Reenviar enlace'}
      </button>
      {estado === 'error' && (
        <p style={{ color: '#f87171', fontSize: '12px', textAlign: 'center' }}>Error al enviar. Intenta de nuevo.</p>
      )}
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0d1a12,#0a1510)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link href="/" style={{ fontSize: '26px', fontWeight: '900', color: '#2dd4bf', textDecoration: 'none' }}>MindBridge</Link>
          <p style={{ fontSize: '12px', color: '#3d5c48', marginTop: '4px' }}>🇨🇴 Colombia · Salud Mental Accesible</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1a2e1f', borderRadius: '18px', padding: '40px 36px' }}>
          {children}
        </div>
        <p style={{ textAlign: 'center', fontSize: '11px', color: '#2a3d2e', marginTop: '20px' }}>
          Crisis:{' '}
          <a href="tel:106" style={{ color: '#2dd4bf', fontWeight: 700, textDecoration: 'none' }}>Línea 106</a>
          {' · '}
          <a href="tel:123" style={{ color: '#f87171', fontWeight: 700, textDecoration: 'none' }}>123</a>
        </p>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  display: 'block', background: '#1a6b4a', color: 'white', padding: '13px 24px',
  borderRadius: '8px', fontWeight: '700', fontSize: '14px', textDecoration: 'none',
  textAlign: 'center',
};
