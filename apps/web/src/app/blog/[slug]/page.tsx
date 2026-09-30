import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BlogShell, LineasCrisis } from '@/components/blog/BlogShell';
import { RespiracionGuiada } from '@/components/blog/RespiracionGuiada';
import { Tamizaje } from '@/components/blog/Tamizaje';
import { Compartir } from '@/components/blog/Compartir';
import {
  ARTICULOS,
  TIPO_INFO,
  articulosRelacionados,
  formatearFecha,
  getArticulo,
} from '@/lib/blog/articulos';

export const dynamicParams = false;

function anclaDe(titulo: string, i: number) {
  const base = titulo
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return base || `seccion-${i + 1}`;
}

export function generateStaticParams() {
  return ARTICULOS.map(a => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = getArticulo(params.slug);
  if (!a) return {};
  return {
    title: a.titulo,
    description: a.descripcion,
    alternates: { canonical: `/blog/${a.slug}` },
    openGraph: {
      type: 'article',
      title: a.titulo,
      description: a.descripcion,
      url: `/blog/${a.slug}`,
      publishedTime: a.publicado,
      modifiedTime: a.actualizado,
    },
  };
}

export default function ArticuloPage({ params }: { params: { slug: string } }) {
  const a = getArticulo(params.slug);
  if (!a) notFound();

  const tipo = TIPO_INFO[a.tipo];
  const relacionados = articulosRelacionados(a);
  const secciones = a.secciones.map((s, i) => ({ ...s, ancla: anclaDe(s.titulo, i) }));

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: a.titulo,
      description: a.descripcion,
      datePublished: a.publicado,
      dateModified: a.actualizado,
      inLanguage: 'es-CO',
      author: { '@type': 'Organization', name: 'MenteBridge Colombia' },
      publisher: { '@type': 'Organization', name: 'MenteBridge Colombia' },
      mainEntityOfPage: `/blog/${a.slug}`,
      citation: a.fuentes.map(f => f.url),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Blog', item: 'https://mentebridge.com/blog' },
        { '@type': 'ListItem', position: 2, name: a.tipo, item: `https://mentebridge.com/blog?tipo=${tipo.param}` },
        { '@type': 'ListItem', position: 3, name: a.titulo },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: a.faq.map(q => ({
        '@type': 'Question',
        name: q.pregunta,
        acceptedAnswer: { '@type': 'Answer', text: q.respuesta },
      })),
    },
  ];

  return (
    <BlogShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article style={{ maxWidth: '760px', margin: '0 auto', padding: '40px clamp(16px, 5vw, 32px) 80px' }}>
        {/* Migas */}
        <nav aria-label="Ruta" style={{ fontSize: '12px', color: 'var(--ink-subtle)', marginBottom: '24px' }}>
          <Link href="/blog" style={{ color: 'var(--ink-subtle)', textDecoration: 'none' }}>Blog</Link>
          {' / '}
          <Link href={`/blog?tipo=${tipo.param}`} style={{ color: tipo.color, textDecoration: 'none' }}>{a.tipo}</Link>
        </nav>

        {/* Cabecera */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ background: tipo.bg, color: tipo.color, fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {a.tipo}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{a.categoria}</span>
          <span style={{ fontSize: '12px', color: 'var(--ink-subtle)' }}>· ⏱ {a.lectura} de lectura</span>
        </div>

        <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: '900', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '16px' }}>
          {a.titulo}
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--ink-subtle)', marginBottom: '28px' }}>
          Equipo editorial MenteBridge · Actualizado el {formatearFecha(a.actualizado)}
          {a.revisadoPor && <> · Revisión clínica: {a.revisadoPor.nombre} (T.P. {a.revisadoPor.tarjetaProfesional})</>}
        </p>

        {a.crisisDestacada && <div style={{ marginBottom: '28px' }}><LineasCrisis /></div>}

        {/* Respuesta corta */}
        <div style={{ background: tipo.bg, borderLeft: `3px solid ${tipo.color}`, borderRadius: '0 14px 14px 0', padding: '20px 22px', marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', fontWeight: '800', color: tipo.color, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
            Respuesta corta
          </p>
          <p style={{ fontSize: '16px', lineHeight: 1.7, color: '#e5f0ea' }}>{a.respuestaCorta}</p>
        </div>

        {/* Índice */}
        <nav aria-label="En este artículo" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '16px 20px', marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>En este artículo</p>
          <ol style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--ink-muted)' }}>
            {secciones.map(s => (
              <li key={s.ancla} style={{ fontSize: '14px', lineHeight: 1.5 }}>
                <a href={`#${s.ancla}`} className="hover:underline" style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>{s.titulo}</a>
              </li>
            ))}
            <li style={{ fontSize: '14px' }}><a href="#preguntas" className="hover:underline" style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>Preguntas frecuentes</a></li>
            <li style={{ fontSize: '14px' }}><a href="#fuentes" className="hover:underline" style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>Fuentes</a></li>
          </ol>
        </nav>

        {/* Secciones */}
        {secciones.map(s => (
          <section key={s.ancla} id={s.ancla} style={{ marginBottom: '36px', scrollMarginTop: '80px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.01em', marginBottom: '14px', lineHeight: 1.3 }}>{s.titulo}</h2>
            {s.parrafos?.map((p, i) => (
              <p key={i} style={{ fontSize: '16px', lineHeight: 1.8, color: '#b8cfc2', marginBottom: '14px' }}>{p}</p>
            ))}
            {s.lista && (
              <ul style={{ paddingLeft: '4px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                {s.lista.map((item, i) => (
                  <li key={i} style={{ display: 'flex', gap: '10px', fontSize: '15px', lineHeight: 1.7, color: '#b8cfc2' }}>
                    <span aria-hidden style={{ color: tipo.color, flexShrink: 0 }}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            {s.pasos && (
              <ol style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
                {s.pasos.map((paso, i) => (
                  <li key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 16px' }}>
                    <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: tipo.bg, border: `1px solid ${tipo.color}55`, color: tipo.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>{paso}</span>
                  </li>
                ))}
              </ol>
            )}
            {s.herramienta === 'respiracion' && <RespiracionGuiada />}
            {(s.herramienta === 'phq9' || s.herramienta === 'gad7') && <Tamizaje id={s.herramienta} />}
          </section>
        ))}

        {/* FAQ */}
        <section id="preguntas" style={{ marginBottom: '40px', scrollMarginTop: '80px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '14px' }}>Preguntas frecuentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {a.faq.map(q => (
              <details key={q.pregunta} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 18px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: '700', fontSize: '15px', color: 'white' }}>{q.pregunta}</summary>
                <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#b8cfc2', marginTop: '10px' }}>{q.respuesta}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Fuentes */}
        <section id="fuentes" style={{ marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', scrollMarginTop: '80px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>Fuentes</h2>
          <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {a.fuentes.map(f => (
              <li key={f.url} style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--ink-muted)' }}>
                {f.entidad} ({f.anio}).{' '}
                <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2dd4bf', textDecoration: 'underline', textUnderlineOffset: '3px' }}>{f.titulo}<span className="sr-only"> (se abre en otra pestaña)</span></a>
              </li>
            ))}
          </ol>
          <p style={{ fontSize: '12px', color: 'var(--ink-subtle)', lineHeight: 1.7, marginTop: '16px' }}>
            Este contenido es informativo y no reemplaza la evaluación de un profesional de la salud.
            Si encuentras un error, escríbenos a{' '}
            <a href="mailto:soporte@mentebridge.com" style={{ color: '#2dd4bf', textDecoration: 'underline', textUnderlineOffset: '3px' }}>soporte@mentebridge.com</a>
            {' '}para corregirlo.
          </p>
          <div style={{ marginTop: '20px' }}>
            <Compartir titulo={a.titulo} ruta={`/blog/${a.slug}`} />
          </div>
        </section>

        {!a.crisisDestacada && <div style={{ marginBottom: '40px' }}><LineasCrisis compacto /></div>}

        {/* CTA */}
        <div style={{ background: 'rgba(26,107,74,0.08)', border: '1px solid rgba(45,212,191,0.12)', borderRadius: '20px', padding: '28px', textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '8px' }}>¿Quieres hablar con alguien?</h2>
          <p style={{ color: 'var(--ink-muted)', fontSize: '14px', lineHeight: 1.7, marginBottom: '18px' }}>
            En MenteBridge puedes empezar con acompañamiento 24/7 y agendar con psicólogos con tarjeta profesional.
          </p>
          <Link href="/registro" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#1a6b4a,#0d5438)', color: 'white', padding: '12px 28px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>
            Empezar gratis →
          </Link>
        </div>

        {/* Relacionados */}
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '14px' }}>Sigue leyendo</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
            {relacionados.map(r => (
              <Link key={r.slug} href={`/blog/${r.slug}`} style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: TIPO_INFO[r.tipo].color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{r.tipo}</span>
                <p style={{ fontSize: '14px', fontWeight: '700', color: 'white', lineHeight: 1.4, marginTop: '6px' }}>{r.titulo}</p>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </BlogShell>
  );
}
