'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormState {
  nombre: string; apellido: string; email: string; password: string;
  tarjetaProfesionalId: string; especialidades: string; enfoqueTerapeutico: string;
  formacion: string; bio: string; anosExperiencia: string; tarifaCOP: string;
  ciudades: string; modalidad: string;
  aceptaPoliticaPrivacidad: boolean;
}

const INITIAL: FormState = {
  nombre: '', apellido: '', email: '', password: '',
  tarjetaProfesionalId: '', especialidades: '', enfoqueTerapeutico: '',
  formacion: '', bio: '', anosExperiencia: '', tarifaCOP: '',
  ciudades: '', modalidad: 'VIDEOLLAMADA',
  aceptaPoliticaPrivacidad: false,
};

export default function RegistroPsicologoPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = useCallback(
    (k: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value })),
    [],
  );

  const split = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.aceptaPoliticaPrivacidad) {
      setError('Debes aceptar la política de privacidad');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/psicologos/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          password: form.password,
          tarjetaProfesionalId: form.tarjetaProfesionalId,
          especialidades: split(form.especialidades),
          enfoqueTerapeutico: split(form.enfoqueTerapeutico),
          formacion: form.formacion,
          bio: form.bio,
          anosExperiencia: parseInt(form.anosExperiencia) || 0,
          tarifaCOP: parseInt(form.tarifaCOP) || 0,
          ciudades: split(form.ciudades),
          modalidad: form.modalidad.split(',').map(m => m.trim()),
          aceptaPoliticaPrivacidad: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setExito(true);
      } else {
        setError(data.error ?? 'Error al enviar solicitud');
      }
    } finally {
      setLoading(false);
    }
  };

  const input = 'w-full bg-[#141f17] border border-[#2a3d2e] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-[#2dd4bf] transition-colors';
  const label = 'block text-xs font-semibold text-[#5a8a6a] mb-1.5';

  if (exito) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a1410', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
          <h1 style={{ fontSize: '22px', fontWeight: '900', color: 'white', marginBottom: '12px' }}>
            Solicitud enviada
          </h1>
          <p style={{ fontSize: '14px', color: '#5a8a6a', lineHeight: 1.6, marginBottom: '24px' }}>
            Revisaremos tu información y tarjeta COLPSIC en los próximos <strong style={{ color: 'white' }}>2–3 días hábiles</strong>.
            Te notificaremos por email cuando tu perfil esté aprobado y puedas comenzar a recibir citas.
          </p>
          <Link href="/login" style={{ display: 'inline-block', background: '#1a6b4a', color: 'white', padding: '11px 28px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', textDecoration: 'none' }}>
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a1410', padding: '32px 16px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '28px', fontWeight: '900', color: '#2dd4bf' }}>🧠 MenteBridge</span>
          </Link>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginTop: '16px', marginBottom: '6px' }}>
            Únete como psicólogo
          </h1>
          <p style={{ fontSize: '13px', color: '#5a8a6a' }}>
            Revisaremos tu tarjeta COLPSIC antes de activar tu perfil.{' '}
            <Link href="/login" style={{ color: '#2dd4bf', textDecoration: 'none' }}>¿Ya tienes cuenta?</Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Datos personales */}
          <section style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#2dd4bf', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Datos personales
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className={label}>Nombre <span style={{ color: '#f87171' }}>*</span></label>
                <input className={input} value={form.nombre} onChange={set('nombre')} placeholder="Andrea" required />
              </div>
              <div>
                <label className={label}>Apellido <span style={{ color: '#f87171' }}>*</span></label>
                <input className={input} value={form.apellido} onChange={set('apellido')} placeholder="Morales" required />
              </div>
            </div>
            <div>
              <label className={label}>Correo electrónico <span style={{ color: '#f87171' }}>*</span></label>
              <input className={input} type="email" value={form.email} onChange={set('email')} placeholder="psicologa@ejemplo.com" required />
            </div>
            <div>
              <label className={label}>Contraseña <span style={{ color: '#f87171' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  className={input}
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Mínimo 8 caracteres, mayúscula, número y símbolo"
                  required
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#5a8a6a', cursor: 'pointer', fontSize: '13px' }}
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>
          </section>

          {/* Verificación COLPSIC */}
          <section style={{ background: '#0d1a12', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                Verificación COLPSIC
              </h2>
              <p style={{ fontSize: '12px', color: '#5a8a6a', marginTop: '4px' }}>
                Tu tarjeta será verificada manualmente antes de activar tu perfil. Resolución 2654/2019.
              </p>
            </div>
            <div>
              <label className={label}>N° tarjeta profesional COLPSIC <span style={{ color: '#f87171' }}>*</span></label>
              <input
                className={input}
                value={form.tarjetaProfesionalId}
                onChange={set('tarjetaProfesionalId')}
                placeholder="PSI-2020-001234"
                required
              />
            </div>
          </section>

          {/* Perfil profesional */}
          <section style={{ background: '#0d1a12', border: '1px solid #1a2e1f', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#2dd4bf', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Perfil profesional
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className={label}>Años de experiencia <span style={{ color: '#f87171' }}>*</span></label>
                <input className={input} type="number" min="0" max="60" value={form.anosExperiencia} onChange={set('anosExperiencia')} placeholder="5" required />
              </div>
              <div>
                <label className={label}>Tarifa por sesión (COP) <span style={{ color: '#f87171' }}>*</span></label>
                <input className={input} type="number" min="10000" value={form.tarifaCOP} onChange={set('tarifaCOP')} placeholder="80000" required />
              </div>
            </div>
            <div>
              <label className={label}>Especialidades (separadas por coma) <span style={{ color: '#f87171' }}>*</span></label>
              <input className={input} value={form.especialidades} onChange={set('especialidades')} placeholder="Ansiedad, Depresión, Trauma" required />
            </div>
            <div>
              <label className={label}>Enfoque terapéutico (separado por coma) <span style={{ color: '#f87171' }}>*</span></label>
              <input className={input} value={form.enfoqueTerapeutico} onChange={set('enfoqueTerapeutico')} placeholder="TCC, Mindfulness, ACT" required />
            </div>
            <div>
              <label className={label}>Formación académica <span style={{ color: '#f87171' }}>*</span></label>
              <input className={input} value={form.formacion} onChange={set('formacion')} placeholder="Psicólogo Clínico, Universidad de los Andes (2015)" required />
            </div>
            <div>
              <label className={label}>Ciudades donde atiendes (separadas por coma) <span style={{ color: '#f87171' }}>*</span></label>
              <input className={input} value={form.ciudades} onChange={set('ciudades')} placeholder="Bogotá, Medellín" required />
            </div>
            <div>
              <label className={label}>Modalidad <span style={{ color: '#f87171' }}>*</span></label>
              <select className={input} value={form.modalidad} onChange={set('modalidad')} style={{ cursor: 'pointer' }}>
                <option value="VIDEOLLAMADA">Videollamada</option>
                <option value="TELEFONICA">Telefónica</option>
                <option value="VIDEOLLAMADA,TELEFONICA">Videollamada y Telefónica</option>
                <option value="VIDEOLLAMADA,TELEFONICA,PRESENCIAL">Todas las modalidades</option>
              </select>
            </div>
            <div>
              <label className={label}>Presentación / Bio <span style={{ color: '#f87171' }}>*</span></label>
              <textarea
                className={input}
                value={form.bio}
                onChange={set('bio')}
                placeholder="Cuéntanos sobre tu experiencia, enfoque y cómo ayudas a tus pacientes (mínimo 20 caracteres)..."
                rows={4}
                required
                style={{ resize: 'vertical' }}
              />
            </div>
          </section>

          {/* Consentimiento */}
          <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.aceptaPoliticaPrivacidad}
              onChange={set('aceptaPoliticaPrivacidad')}
              style={{ marginTop: '2px', accentColor: '#2dd4bf', flexShrink: 0 }}
            />
            <span style={{ fontSize: '12px', color: '#5a8a6a', lineHeight: 1.5 }}>
              Acepto la{' '}
              <Link href="/politica-privacidad" target="_blank" style={{ color: '#2dd4bf', textDecoration: 'none' }}>
                Política de Privacidad
              </Link>{' '}
              y el tratamiento de mis datos (Ley 1581/2012). Entiendo que mi perfil estará inactivo hasta ser verificado por el equipo de MenteBridge.
            </span>
          </label>

          {error && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '12px 14px' }}>
              <p style={{ color: '#f87171', fontSize: '13px' }}>⚠️ {error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !form.aceptaPoliticaPrivacidad}
            style={{
              background: loading ? '#14532d' : '#1a6b4a',
              color: 'white',
              padding: '13px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: '800',
              fontSize: '14px',
              cursor: loading || !form.aceptaPoliticaPrivacidad ? 'not-allowed' : 'pointer',
              opacity: !form.aceptaPoliticaPrivacidad ? 0.6 : 1,
              transition: 'all 0.15s',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Enviando solicitud...' : 'Enviar solicitud de verificación'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#3d5c48' }}>
            ¿Eres paciente?{' '}
            <Link href="/registro" style={{ color: '#2dd4bf', textDecoration: 'none' }}>
              Regístrate aquí
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
