import { ImageResponse } from 'next/og';
import { ARTICULOS, TIPO_INFO, getArticulo } from '@/lib/blog/articulos';

export const alt = 'Artículo del blog de MenteBridge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return ARTICULOS.map(a => ({ slug: a.slug }));
}

/** Imagen de vista previa al compartir (WhatsApp, redes). Sin emojis ni fuentes externas: se genera offline. */
export default function Image({ params }: { params: { slug: string } }) {
  const a = getArticulo(params.slug);
  const tipo = a ? TIPO_INFO[a.tipo] : TIPO_INFO['Cómo'];

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', background: 'linear-gradient(135deg, #080f0b 0%, #0d2419 100%)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', padding: '8px 22px', borderRadius: '999px', background: tipo.bg, border: `2px solid ${tipo.color}`, color: tipo.color, fontSize: 28, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {a?.tipo ?? 'Blog'}
          </div>
          {a && <div style={{ display: 'flex', fontSize: 28, color: '#8aab96' }}>{a.categoria} · {a.lectura} de lectura</div>}
        </div>
        <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
          {a?.titulo ?? 'Respuestas claras sobre salud mental'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 800, color: '#2dd4bf' }}>MenteBridge</div>
          <div style={{ display: 'flex', fontSize: 24, color: '#8aab96' }}>
            {a ? `${a.fuentes.length} fuentes citadas · Blog de salud mental` : 'Blog de salud mental'}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
