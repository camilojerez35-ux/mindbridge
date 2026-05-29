'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  MessageSquare,
  CalendarDays,
  BookOpen,
  BarChart2,
  Settings,
  LogOut,
  Users,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',               label: 'Inicio',        icon: <BarChart2 size={18} /> },
  { href: '/dashboard/chat',          label: 'Chat IA',       icon: <MessageSquare size={18} /> },
  { href: '/dashboard/citas',         label: 'Citas',         icon: <CalendarDays size={18} /> },
  { href: '/dashboard/diario',        label: 'Diario',        icon: <BookOpen size={18} /> },
  { href: '/dashboard/progreso',      label: 'Progreso',      icon: <BarChart2 size={18} /> },
  { href: '/dashboard/configuracion', label: 'Configuración', icon: <Settings size={18} /> },
];

const ADMIN_ITEMS: NavItem[] = [
  { href: '/dashboard/admin',   label: 'Panel Admin', icon: <ShieldCheck size={18} /> },
];

const PSICOLOGO_ITEMS: NavItem[] = [
  { href: '/dashboard/psicologo', label: 'Mi Panel', icon: <Stethoscope size={18} /> },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const rol = session?.user?.rol;
  const esAdmin     = rol === 'ADMIN' || rol === 'SUPERADMIN';
  const esPsicologo = rol === 'PSICOLOGO';

  const itemClass = (href: string) =>
    [
      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
      pathname === href || (href !== '/dashboard' && pathname?.startsWith(href))
        ? 'bg-teal-50 text-teal-700'
        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800',
    ].join(' ');

  return (
    <nav
      aria-label="Navegación principal"
      className="flex flex-col h-full bg-white border-r border-stone-100 w-56 shrink-0 py-6 px-3"
    >
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 px-3 mb-8">
        <span className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white text-xs font-bold">M</span>
        <span className="font-semibold text-stone-800 text-base">MindBridge</span>
      </Link>

      {/* Items principales */}
      <ul className="flex flex-col gap-1 flex-1" role="list">
        {NAV_ITEMS.map(item => (
          <li key={item.href}>
            <Link href={item.href} className={itemClass(item.href)}>
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Sección psicólogo */}
      {esPsicologo && (
        <ul
          className="flex flex-col gap-1 mb-4 pt-4 border-t border-stone-100"
          role="list"
          aria-label="Panel psicólogo"
        >
          <li className="px-3 pb-1">
            <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Psicólogo</span>
          </li>
          {PSICOLOGO_ITEMS.map(item => (
            <li key={item.href}>
              <Link href={item.href} className={itemClass(item.href)}>
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Sección admin */}
      {esAdmin && (
        <ul
          className="flex flex-col gap-1 mb-4 pt-4 border-t border-stone-100"
          role="list"
          aria-label="Administración"
        >
          <li className="px-3 pb-1">
            <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Administración</span>
          </li>
          {ADMIN_ITEMS.map(item => (
            <li key={item.href}>
              <Link href={item.href} className={[
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname?.startsWith('/dashboard/admin')
                  ? 'bg-red-50 text-red-700'
                  : 'text-stone-600 hover:bg-red-50 hover:text-red-700',
              ].join(' ')}>
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Cerrar sesión */}
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-stone-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
      >
        <LogOut size={18} aria-hidden="true" />
        Cerrar sesión
      </button>
    </nav>
  );
}
