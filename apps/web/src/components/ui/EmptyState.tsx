'use client';

interface Props {
  icon: string;
  titulo: string;
  descripcion: string;
  accionLabel?: string;
  onAccion?: () => void;
  accionHref?: string;
  secundarioLabel?: string;
  onSecundario?: () => void;
}

export default function EmptyState({
  icon, titulo, descripcion,
  accionLabel, onAccion, accionHref,
  secundarioLabel, onSecundario,
}: Props) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center',
      padding: '56px 24px', gap: '12px',
      background: '#0d1a12', border: '1px dashed #2a3d2e',
      borderRadius: '16px',
    }}>
      <div style={{ fontSize: '48px', lineHeight: 1, marginBottom: '4px' }}>{icon}</div>
      <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'white', margin: 0 }}>{titulo}</h3>
      <p style={{ fontSize: '13px', color: '#5a8a6a', lineHeight: 1.6, maxWidth: '320px', margin: 0 }}>{descripcion}</p>

      {(accionLabel || secundarioLabel) && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {accionLabel && (
            accionHref
              ? <a href={accionHref} style={{ padding: '10px 22px', background: '#1a6b4a', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '700' }}>{accionLabel}</a>
              : <button onClick={onAccion} style={{ padding: '10px 22px', background: '#1a6b4a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', fontFamily: 'inherit' }}>{accionLabel}</button>
          )}
          {secundarioLabel && (
            <button onClick={onSecundario} style={{ padding: '10px 22px', background: 'transparent', color: '#5a8a6a', border: '1px solid #2a3d2e', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>{secundarioLabel}</button>
          )}
        </div>
      )}
    </div>
  );
}
