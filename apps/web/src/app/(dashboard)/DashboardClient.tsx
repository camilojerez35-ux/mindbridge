'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import {
  Home, MessageCircle, BookOpen, TrendingUp, Wind,
  Calendar, User, LogOut, Bell, ChevronRight, Zap,
  ShieldCheck, Stethoscope, FlaskConical, GraduationCap,
} from 'lucide-react';
import CheckInDiario from '@/components/checkin/CheckInDiario';

const navItems = [
  { href: '/dashboard',            icon: Home,           label: 'Inicio' },
  { href: '/dashboard/chat',       icon: MessageCircle,  label: 'Chat IA' },
  { href: '/dashboard/diario',     icon: BookOpen,       label: 'Diario' },
  { href: '/tests',                icon: FlaskConical,   label: 'Tests' },
  { href: '/aprender',             icon: GraduationCap,  label: 'Aprender' },
  { href: '/dashboard/progreso',   icon: TrendingUp,     label: 'Progreso' },
  { href: '/dashboard/ejercicios', icon: Wind,           label: 'Ejercicios' },
  { href: '/dashboard/citas',      icon: Calendar,       label: 'Citas' },
  { href: '/dashboard/perfil',     icon: User,           label: 'Perfil' },
];

const PLAN_COLORS: Record<string, string> = {
  GRATIS:     'text-gray-400',
  PLUS:       'text-teal-400',
  FAMILIA:    'text-purple-400',
  EMPRESARIAL:'text-amber-400',
};

interface Props {
  children: React.ReactNode;
  userName: string | null | undefined;
  userPlan: string;
  userInitial: string;
  userRol?: string;
}

export default function DashboardClient({ children, userName, userPlan, userInitial, userRol }: Props) {
  const esAdmin     = userRol === 'ADMIN' || userRol === 'SUPERADMIN';
  const esPsicologo = userRol === 'PSICOLOGO';
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#080f0a] text-white" style={{ fontFamily: 'Inter,system-ui,sans-serif' }}>

      {/* ── SIDEBAR ── */}
      <aside className="fixed top-0 left-0 h-screen w-56 bg-[#0d1a12] border-r border-white/5 flex flex-col z-50">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5">
          <Link href="/" className="block">
            <span className="text-xl font-black bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              MindBridge
            </span>
            <p className="text-[10px] text-gray-600 mt-0.5 uppercase tracking-widest">Colombia</p>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                  active
                    ? 'bg-teal-500/10 text-white font-semibold'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-teal-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto text-teal-500 opacity-60" />}
              </Link>
            );
          })}
          {/* Psicólogo */}
          {esPsicologo && (
            <div className="pt-3 mt-3 border-t border-white/5">
              <p className="px-3 mb-1 text-[10px] text-gray-600 uppercase tracking-widest font-semibold">Psicólogo</p>
              {[{ href: '/dashboard/psicologo', icon: Stethoscope, label: 'Mi Panel' }].map(({ href, icon: Icon, label }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${active ? 'bg-teal-500/10 text-white font-semibold' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-teal-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
                    {label}
                    {active && <ChevronRight className="w-3 h-3 ml-auto text-teal-500 opacity-60" />}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Admin */}
          {esAdmin && (
            <div className="pt-3 mt-3 border-t border-white/5">
              <p className="px-3 mb-1 text-[10px] text-red-500/70 uppercase tracking-widest font-semibold">Administración</p>
              {[{ href: '/dashboard/admin', icon: ShieldCheck, label: 'Panel Admin' }].map(({ href, icon: Icon, label }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${active ? 'bg-red-500/10 text-red-300 font-semibold' : 'text-red-400/70 hover:text-red-300 hover:bg-red-500/5'}`}>
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-red-400' : 'text-red-500/50 group-hover:text-red-400'}`} />
                    {label}
                    {active && <ChevronRight className="w-3 h-3 ml-auto text-red-400 opacity-60" />}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* Plan badge */}
        <div className="px-3 py-3 border-t border-white/5">
          <div className="bg-white/3 rounded-lg px-3 py-2.5 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3 h-3 text-teal-400" />
              <span className={`text-xs font-bold uppercase tracking-wider ${PLAN_COLORS[userPlan] ?? 'text-gray-400'}`}>
                {userPlan === 'GRATIS' ? 'Plan Gratis' : userPlan === 'PLUS' ? 'Plan Plus' : userPlan}
              </span>
            </div>
            {userPlan === 'GRATIS' && (
              <Link href="/dashboard/perfil" className="text-[11px] text-teal-400 hover:text-teal-300 font-medium transition-colors">
                Mejorar a Plus →
              </Link>
            )}
          </div>
        </div>

        {/* Crisis */}
        <div className="px-3 py-3 bg-red-950/30 border-t border-red-900/20">
          <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-1">Crisis 24/7</p>
          <p className="text-xs font-semibold">
            <a href="tel:106" className="text-teal-400 hover:underline">Línea 106</a>
            <span className="text-red-900 mx-1">·</span>
            <a href="tel:123" className="text-red-400 hover:underline">123</a>
          </p>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="ml-56 flex-1 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="h-14 bg-[#0d1a12]/80 backdrop-blur border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs text-gray-500">
              {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all">
              <Bell className="w-4 h-4" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                  {userInitial}
                </div>
                <span className="text-sm text-gray-300 font-medium">{userName?.split(' ')[0] ?? 'Usuario'}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-10 w-44 bg-[#0d1a12] border border-white/10 rounded-xl shadow-2xl py-1 z-50">
                  <Link
                    href="/dashboard/perfil"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <User className="w-4 h-4" /> Mi perfil
                  </Link>
                  <div className="border-t border-white/5 my-1" />
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all"
                  >
                    <LogOut className="w-4 h-4" /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      <CheckInDiario />
    </div>
  );
}
