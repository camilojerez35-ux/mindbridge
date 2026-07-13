'use client';
// src/app/(auth)/consentimiento-google/page.tsx
// Paso obligatorio para usuarios que entran via Google OAuth.
// Ley 1581/2012 requiere consentimiento explícito antes de tratar datos de salud.

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ConsentimientoGooglePage() {
  const { update } = useSession();
  const router = useRouter();
  const [checks, setChecks] = useState({ privacidad: false, ia: false, marketing: false });
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const toggle = (k: keyof typeof checks) => setChecks(p => ({ ...p, [k]: !p[k] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!checks.privacidad) errs.privacidad = 'Requerido para continuar (Ley 1581/2012)';
    if (!checks.ia)         errs.ia = 'Requerido para continuar (Resolución 2654/2019)';
    if (!fechaNacimiento)   errs.fechaNacimiento = 'Requerido para continuar';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/consentimiento-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aceptaPrivacidad: checks.privacidad,
          aceptaIA: checks.ia,
          aceptaMarketing: checks.marketing,
          fechaNacimiento,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors({ general: data.error ?? 'Error al guardar. Intenta de nuevo.' });
        return;
      }

      // Refrescar el JWT para limpiar `necesitaConsentimiento`
      await update();
      router.push('/dashboard');
    } catch {
      setErrors({ general: 'Error de conexión. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0d1a12,#0a1510)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link href="/" style={{ fontSize: '26px', fontWeight: '900', color: '#2dd4bf', textDecoration: 'none' }}>MindBridge</Link>
          <p style={{ fontSize: '12px', color: '#3d5c48', marginTop: '4px' }}>🇨🇴 Colombia · Salud Mental Accesible</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1a2e1f', borderRadius: '18px', padding: '36px' }}>

          {/* Encabezado */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '42px', marginBottom: '12px' }}>🔒</div>
            <h1 style={{ fontSize: '22px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>
              Un paso más antes de continuar
            </h1>
            <p style={{ fontSize: '13px', color: '#8aab96', lineHeight: 1.6 }}>
              MindBridge trata datos sensibles de salud mental. La ley colombiana exige tu consentimiento explícito antes de comenzar.
            </p>
          </div>

          {/* Info legal */}
          <div style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', color: '#5a8a6a', lineHeight: 1.7 }}>
              Al usar MindBridge accedes a apoyo emocional mediante Inteligencia Artificial. Tus conversaciones pueden contener información de salud protegida por la <strong style={{ color: '#2dd4bf' }}>Ley 1581/2012</strong> y la <strong style={{ color: '#2dd4bf' }}>Resolución 2654/2019</strong>.
            </p>
          </div>

          {errors.general && (
            <div style={{ background: 'rgba(184,32,32,0.1)', border: '1px solid rgba(184,32,32,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
              <p style={{ color: '#f87171', fontSize: '13px' }}>{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#8aab96', marginBottom: '6px' }}>
                Fecha de nacimiento <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${errors.fechaNacimiento ? '#f87171' : '#1a2e1f'}`, background: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px' }}
              />
              {errors.fechaNacimiento && (
                <p style={{ fontSize: '11px', color: '#f87171', marginTop: '4px' }}>{errors.fechaNacimiento}</p>
              )}
              <p style={{ fontSize: '11px', color: '#3d5c48', marginTop: '4px' }}>
                MindBridge está disponible solo para mayores de 18 años.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>

              <ConsentCheck
                checked={checks.privacidad}
                onChange={() => toggle('privacidad')}
                error={errors.privacidad}
                required
              >
                Acepto la <Link href="/politica-privacidad" target="_blank" style={{ color: '#2dd4bf' }}>Política de Privacidad</Link> y autorizo el tratamiento de mis datos personales y de salud según la <strong style={{ color: '#8aab96' }}>Ley 1581/2012</strong>
              </ConsentCheck>

              <ConsentCheck
                checked={checks.ia}
                onChange={() => toggle('ia')}
                error={errors.ia}
                required
              >
                Autorizo el uso de Inteligencia Artificial para brindarme apoyo emocional. Entiendo que <strong style={{ color: '#8aab96' }}>no sustituye atención profesional</strong> y que mis conversaciones son confidenciales (<strong style={{ color: '#8aab96' }}>Resolución 2654/2019</strong>)
              </ConsentCheck>

              <ConsentCheck
                checked={checks.marketing}
                onChange={() => toggle('marketing')}
              >
                Acepto recibir contenido educativo sobre salud mental por email <span style={{ color: '#3d5c48' }}>(opcional)</span>
              </ConsentCheck>

            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ background: checks.privacidad && checks.ia ? '#1a6b4a' : '#1a2e1f', color: 'white', padding: '14px', borderRadius: '10px', fontWeight: '700', fontSize: '15px', border: 'none', cursor: loading ? 'wait' : 'pointer', transition: 'background .2s', width: '100%' }}
            >
              {loading ? 'Guardando...' : 'Aceptar y continuar →'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '11px', color: '#3d5c48', marginTop: '16px', lineHeight: 1.6 }}>
              Puedes retirar tu consentimiento en cualquier momento desde Configuración → Privacidad.<br />
              Crisis:{' '}
              <a href="tel:106" style={{ color: '#2dd4bf', fontWeight: 700, textDecoration: 'none' }}>106</a>
              {' · '}
              <a href="tel:8001225555" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>800-112-5555</a>
              {' · '}
              <a href="tel:123" style={{ color: '#f87171', fontWeight: 700, textDecoration: 'none' }}>123</a>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}

function ConsentCheck({
  checked, onChange, error, required, children,
}: {
  checked: boolean;
  onChange: () => void;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer', padding: '12px', background: checked ? 'rgba(45,212,191,0.06)' : 'transparent', border: `1px solid ${checked ? 'rgba(45,212,191,0.2)' : '#1a2e1f'}`, borderRadius: '8px', transition: 'all .15s' }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{ marginTop: '3px', accentColor: '#2dd4bf', width: '16px', height: '16px', flexShrink: 0 }}
        />
        <span style={{ fontSize: '13px', color: '#8aab96', lineHeight: 1.6 }}>
          {children}
          {required && <span style={{ color: '#f87171' }}> *</span>}
        </span>
      </label>
      {error && (
        <p style={{ fontSize: '11px', color: '#f87171', marginTop: '4px', marginLeft: '4px' }}>{error}</p>
      )}
    </div>
  );
}
