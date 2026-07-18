import Link from 'next/link';
import type { Metadata } from 'next';
import { db } from '@/lib/db/client';

export const metadata: Metadata = {
  title: 'Psicólogos verificados — MenteBridge Colombia',
  description: 'Conoce a los psicólogos verificados COLPSIC disponibles en MenteBridge. Agenda tu primera cita en minutos.',
};

export const revalidate = 300;

export default async function PsicologosPage() {
  const psicologos = await db.psicologo.findMany({
    where: { activo: true, estado: { in: ['VERIFICADO', 'ACTIVO'] } },
    select: {
      id: true,
      nombreCompleto: true,
      especialidades: true,
      anosExperiencia: true,
      tarifaCOP: true,
      calificacionPromedio: true,
      fotoUrl: true,
      bio: true,
      modalidad: true,
      ciudades: true,
      enfoqueTerapeutico: true,
    },
    orderBy: { calificacionPromedio: 'desc' },
    take: 24,
  });

  return (
    <div style={{ background: '#080f0b', minHeight: '100vh', color: 'white' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 48px',
        borderBottom: '1px solid rgba(45,212,191,0.08)',
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,15,11,0.85)',
        backdropFilter: 'blur(20px)',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#1a6b4a,#0d4a32)', border: '1px solid rgba(45,212,191,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>💚</div>
          <span style={{ fontSize: '19px', fontWeight: '900', color: '#2dd4bf', letterSpacing: '-0.02em' }}>MenteBridge</span>
        </Link>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/login" style={{ color: '#5a8a6a', textDecoration: 'none', fontSize: '14px', fontWeight: '500', padding: '8px 16px', borderRadius: '8px' }}>Iniciar sesión</Link>
          <Link href="/registro" style={{ background: 'linear-gradient(135deg,#1a6b4a,#0d5438)', color: 'white', padding: '10px 22px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '700', boxShadow: '0 2px 12px rgba(26,107,74,0.4)' }}>
            Comenzar gratis
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', padding: '72px 48px 56px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,212,191,0.05) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: '20px', padding: '7px 18px', fontSize: '11px', color: '#2dd4bf', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
            🩺 Psicólogos verificados
          </div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '14px', lineHeight: 1.1 }}>
            Profesionales reales,<br /><span style={{ background: 'linear-gradient(90deg,#2dd4bf,#4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>verificados COLPSIC</span>
          </h1>
          <p style={{ color: '#5a8a6a', fontSize: '16px', maxWidth: '520px', lineHeight: 1.7 }}>
            Cada psicólogo en MenteBridge tiene su tarjeta profesional verificada. Elige por especialidad, modalidad o ciudad y agenda tu primera cita.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 48px 80px' }}>

        {psicologos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#5a8a6a' }}>
            <p style={{ fontSize: '15px' }}>Estamos verificando nuevos psicólogos. Vuelve pronto.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '16px' }}>
            {psicologos.map(p => (
              <article key={p.id} style={{
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px',
                padding: '28px',
                display: 'flex', flexDirection: 'column', gap: '14px',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#2dd4bf55,transparent)' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'rgba(45,212,191,0.15)', border: '1px solid rgba(45,212,191,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: '800', color: '#2dd4bf', flexShrink: 0,
                    backgroundImage: p.fotoUrl ? `url(${p.fotoUrl})` : undefined,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                  }}>
                    {!p.fotoUrl && p.nombreCompleto[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: '800', color: 'white' }}>{p.nombreCompleto}</p>
                    <p style={{ fontSize: '12px', color: '#3d5c48' }}>{p.anosExperiencia} años de experiencia</p>
                  </div>
                </div>

                {p.bio && (
                  <p style={{ fontSize: '13px', color: '#5a8a6a', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                    {p.bio}
                  </p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {p.especialidades.slice(0, 3).map(e => (
                    <span key={e} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '4px 10px', fontSize: '11px', color: '#8aab96' }}>
                      {e}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#2dd4bf' }}>
                      {p.calificacionPromedio ? `★ ${p.calificacionPromedio.toFixed(1)}` : 'Nuevo en la plataforma'}
                    </p>
                    <p style={{ fontSize: '11px', color: '#3d5c48' }}>
                      {p.modalidad.map(m => m === 'VIDEOLLAMADA' ? 'Virtual' : m === 'TELEFONICA' ? 'Telefónica' : m).join(' · ') || 'Modalidad flexible'}
                    </p>
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>
                    ${p.tarifaCOP.toLocaleString('es-CO')} <span style={{ fontSize: '10px', color: '#3d5c48', fontWeight: '500' }}>/ sesión</span>
                  </p>
                </div>

                <Link href="/registro" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: 'linear-gradient(135deg,#1a6b4a22,#0d543811)',
                  border: '1px solid rgba(45,212,191,0.3)',
                  color: '#2dd4bf', padding: '12px',
                  borderRadius: '12px', textDecoration: 'none',
                  fontWeight: '700', fontSize: '13px',
                }}>
                  Agendar cita →
                </Link>
              </article>
            ))}
          </div>
        )}

        {/* ── CTA ── */}
        <div style={{ marginTop: '64px', background: 'rgba(26,107,74,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(45,212,191,0.12)', borderRadius: '20px', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>💚</div>
          <h3 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '10px', letterSpacing: '-0.01em' }}>¿No sabes por dónde empezar?</h3>
          <p style={{ color: '#5a8a6a', fontSize: '14px', marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px', lineHeight: 1.7 }}>
            Crea tu cuenta gratis y nuestra IA clínica te acompaña 24/7 mientras encuentras al psicólogo ideal.
          </p>
          <Link href="/registro" style={{ background: 'linear-gradient(135deg,#1a6b4a,#0d5438)', color: 'white', padding: '13px 32px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '14px', boxShadow: '0 2px 12px rgba(26,107,74,0.4)' }}>
            Empezar gratis →
          </Link>
        </div>
      </div>

      {/* Footer mínimo */}
      <footer style={{ padding: '24px 48px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <p style={{ fontSize: '12px', color: '#2a3d2e' }}>
          © 2026 MenteBridge Colombia · Crisis:{' '}
          <a href="tel:106" style={{ color: '#2dd4bf', fontWeight: 700, textDecoration: 'none' }}>106</a>
          {' · '}
          <a href="tel:8001225555" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>800-112-5555</a>
          {' · '}
          <a href="tel:123" style={{ color: '#f87171', fontWeight: 700, textDecoration: 'none' }}>123</a>
        </p>
        <Link href="/" style={{ fontSize: '12px', color: '#3d5c48', textDecoration: 'none' }}>← Volver al inicio</Link>
      </footer>
    </div>
  );
}
