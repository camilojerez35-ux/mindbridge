'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard',            icon: '🏠', label: 'Inicio' },
  { href: '/dashboard/chat',       icon: '🤖', label: 'Chat IA' },
  { href: '/dashboard/diario',     icon: '📔', label: 'Diario' },
  { href: '/dashboard/progreso',   icon: '📈', label: 'Progreso' },
  { href: '/dashboard/ejercicios', icon: '🧘', label: 'Ejercicios' },
  { href: '/dashboard/citas',      icon: '👨‍⚕️', label: 'Citas' },
  { href: '/dashboard/perfil',     icon: '👤', label: 'Perfil' },
];

const PLAN_LABELS: Record<string, string> = {
  GRATIS: 'Plan Gratis',
  PLUS: 'Plan Plus',
  FAMILIA: 'Plan Familia',
  EMPRESARIAL: 'Plan Empresarial',
};

const PLAN_DESC: Record<string, string> = {
  GRATIS: '3 sesiones IA/semana',
  PLUS: 'Sesiones ilimitadas',
  FAMILIA: 'Hasta 5 miembros',
  EMPRESARIAL: 'Equipo completo',
};

interface Props {
  children: React.ReactNode;
  userName: string | null | undefined;
  userPlan: string;
  userInitial: string;
}

export default function DashboardClient({ children, userName, userPlan, userInitial }: Props) {
  const pathname = usePathname();
  const esPlanGratis = userPlan === 'GRATIS';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a1510', fontFamily: 'Inter,system-ui,sans-serif', color: 'white' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: '220px', background: '#0d1a12', borderRight: '1px solid #1a2e1f', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50 }}>

        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #1a2e1f' }}>
          <Link href="/" style={{ fontSize: '20px', fontWeight: '900', color: '#2dd4bf', textDecoration: 'none' }}>MindBridge</Link>
          <p style={{ fontSize: '10px', color: '#3d5c48', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Colombia</p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '8px', textDecoration: 'none',
                  fontSize: '14px', fontWeight: active ? '700' : '400',
                  color: active ? 'white' : '#5a8a6a',
                  background: active ? 'rgba(45,212,191,0.1)' : 'transparent',
                  borderLeft: active ? '2px solid #2dd4bf' : '2px solid transparent',
                  transition: 'all .15s',
                }}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Plan badge */}
        <div style={{ padding: '16px', borderTop: '1px solid #1a2e1f' }}>
          <div style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: '8px', padding: '10px 12px' }}>
            <p style={{ fontSize: '11px', color: '#2dd4bf', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {PLAN_LABELS[userPlan] ?? userPlan}
            </p>
            <p style={{ fontSize: '11px', color: '#5a8a6a', marginTop: '2px' }}>
              {PLAN_DESC[userPlan] ?? ''}
            </p>
            {esPlanGratis && (
              <Link href="/dashboard/perfil" style={{ fontSize: '11px', color: '#2dd4bf', textDecoration: 'none', marginTop: '6px', display: 'block', fontWeight: '600' }}>
                Actualizar a Plus →
              </Link>
            )}
          </div>
        </div>

        {/* Crisis siempre visible */}
        <div style={{ padding: '12px 16px', background: 'rgba(184,32,32,0.08)', borderTop: '1px solid rgba(184,32,32,0.15)' }}>
          <p style={{ fontSize: '10px', color: '#f87171', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>⚠️ Crisis</p>
          <p style={{ fontSize: '12px', color: '#f87171', fontWeight: '700' }}>Línea 106 · 123</p>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Top bar */}
        <header style={{ height: '60px', background: '#0d1a12', borderBottom: '1px solid #1a2e1f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', position: 'sticky', top: 0, zIndex: 40 }}>
          <p style={{ fontSize: '13px', color: '#3d5c48' }}>
            Hola, <strong style={{ color: '#8aab96' }}>{userName ?? 'Usuario'}</strong> 👋
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{ background: 'none', border: 'none', color: '#5a8a6a', cursor: 'pointer', fontSize: '18px' }} title="Notificaciones">🔔</button>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1a6b4a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#2dd4bf', cursor: 'pointer' }}>
              {userInitial}
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
