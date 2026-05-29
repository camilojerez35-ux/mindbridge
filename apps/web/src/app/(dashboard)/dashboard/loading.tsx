export default function DashboardLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px' }}>
      {/* Hero skeleton */}
      <div style={{
        background: 'rgba(26,107,74,0.1)',
        border: '1px solid rgba(45,212,191,0.1)',
        borderRadius: '20px',
        padding: '32px 36px',
        height: '160px',
        animation: 'pulse 1.5s ease-in-out infinite',
      }} />

      {/* Stats skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            background: '#0d1a12',
            border: '1px solid #1a2e1f',
            borderRadius: '14px',
            height: '80px',
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: `${i * 0.1}s`,
          }} />
        ))}
      </div>

      {/* Accesos skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            background: '#0d1a12',
            border: '1px solid #1a2e1f',
            borderRadius: '16px',
            height: '84px',
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: `${i * 0.08}s`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
