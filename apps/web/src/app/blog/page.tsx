import Link from 'next/link';
import type { Metadata } from 'next';
import { BlogShell, LineasCrisis } from '@/components/blog/BlogShell';
import { ARTICULOS, TIPOS, TIPO_INFO, tipoDesdeParam, type Articulo } from '@/lib/blog/articulos';

export const metadata: Metadata = {
  title: 'Blog — Respuestas claras sobre salud mental',
  description:
    'Cuándo pedir ayuda, cómo actuar y cuánto tiempo toma: respuestas sobre salud mental basadas en la OMS, guías clínicas y estudios científicos, pensadas para Colombia.',
  alternates: { canonical: '/blog' },
};

function Tarjeta({ a }: { a: Articulo }) {
  const tipo = TIPO_INFO[a.tipo];
  return (
    <Link href={`/blog/${a.slug}`} style={{ textDecoration: 'none' }}>
      <article style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px',
        padding: '24px',
        height: '100%',
        display: 'flex', flexDirection: 'column', gap: '12px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${tipo.color}66,transparent)` }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ background: tipo.bg, color: tipo.color, fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {a.tipo} · {a.categoria}
          </span>
          <span style={{ fontSize: '11px', color: '#7a9e87', whiteSpace: 'nowrap' }}>⏱ {a.lectura}</span>
        </div>
        <div style={{ fontSize: '28px' }} aria-hidden>{a.emoji}</div>
        <h3 style={{ fontSize: '17px', fontWeight: '800', lineHeight: 1.35, letterSpacing: '-0.01em', color: 'white' }}>{a.titulo}</h3>
        <p style={{ fontSize: '13px', color: '#8aab96', lineHeight: 1.7, flex: 1, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
          {a.respuestaCorta}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: '11px', color: '#7a9e87' }}>{a.fuentes.length} fuentes citadas</span>
          <span style={{ color: tipo.color, fontSize: '13px', fontWeight: '700' }}>Leer →</span>
        </div>
      </article>
    </Link>
  );
}

export default function BlogPage({ searchParams }: { searchParams: { tipo?: string } }) {
  const filtro = tipoDesdeParam(searchParams.tipo);
  const grupos = filtro ? [filtro] : TIPOS;

  return (
    <BlogShell>
      {/* ── HERO ── */}
      <section style={{ position: 'relative', padding: '56px 0 32px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: 'min(700px, 100%)', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,212,191,0.05) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: '20px', padding: '7px 18px', fontSize: '11px', color: '#2dd4bf', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
            📖 Blog MenteBridge
          </div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '14px', lineHeight: 1.1 }}>
            <span style={{ color: TIPO_INFO['Cuándo'].color }}>Cuándo</span>,{' '}
            <span style={{ color: TIPO_INFO['Cómo'].color }}>cómo</span> y{' '}
            <span style={{ color: TIPO_INFO['Cuánto'].color }}>cuánto</span>:<br />
            respuestas claras sobre salud mental
          </h1>
          <p style={{ color: '#8aab96', fontSize: '16px', maxWidth: '600px', lineHeight: 1.7 }}>
            Cada artículo responde una pregunta concreta y cita sus fuentes: OMS, guías clínicas,
            estudios revisados por pares y normativa colombiana.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px) 80px' }}>
        {/* ── FILTROS ── */}
        <nav aria-label="Filtrar por tipo de pregunta" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {[{ label: 'Todas', href: '/blog', activo: !filtro, color: '#e5f0ea' },
            ...TIPOS.map(t => ({ label: t, href: `/blog?tipo=${TIPO_INFO[t].param}`, activo: filtro === t, color: TIPO_INFO[t].color }))
          ].map(f => (
            <Link
              key={f.label}
              href={f.href}
              aria-current={f.activo ? 'page' : undefined}
              style={{
                background: f.activo ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${f.activo ? f.color : 'rgba(255,255,255,0.08)'}`,
                color: f.activo ? f.color : '#8aab96',
                fontSize: '13px', fontWeight: '700', padding: '8px 16px', borderRadius: '20px', textDecoration: 'none',
              }}
            >
              {f.label}
            </Link>
          ))}
        </nav>

        {/* ── GRUPOS ── */}
        {grupos.map(t => {
          const lista = ARTICULOS.filter(a => a.tipo === t);
          if (lista.length === 0) return null;
          return (
            <section key={t} style={{ marginBottom: '56px' }}>
              <div style={{ marginBottom: '18px' }}>
                <h2 id={`grupo-${TIPO_INFO[t].param}`} style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.01em', color: TIPO_INFO[t].color }}>
                  ¿{t}…? <span style={{ fontSize: '14px', fontWeight: '600', color: '#8aab96' }}>{lista.length} artículos</span>
                </h2>
                <p style={{ fontSize: '14px', color: '#8aab96' }}>{TIPO_INFO[t].descripcion}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(228px, 100%), 1fr))', gap: '16px' }}>
                {lista.map(a => <Tarjeta key={a.slug} a={a} />)}
              </div>
            </section>
          );
        })}

        <LineasCrisis />
      </div>
    </BlogShell>
  );
}
