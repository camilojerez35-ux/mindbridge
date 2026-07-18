'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import {
  Home, MessageCircle, BookOpen, TrendingUp, Wind,
  Calendar, User, LogOut, Bell, ChevronRight, Zap,
  ShieldCheck, Stethoscope, FlaskConical, GraduationCap,
  Phone, X, AlertTriangle, Menu,
} from 'lucide-react';
import CheckInDiario from '@/components/checkin/CheckInDiario';

const RECURSOS_CRISIS = [
  { nombre: 'Línea 106 — Línea de la Vida', numero: '106', descripcion: 'Atención en crisis, ideación suicida y emergencias de salud mental', disponibilidad: '24/7', gratuito: true },
  { nombre: 'Línea de Emergencias', numero: '123', descripcion: 'Emergencias médicas y policiales', disponibilidad: '24/7', gratuito: true },
  { nombre: 'Línea Nacional de Salud Mental', numero: '800-1222-5555', descripcion: 'Apoyo psicológico y orientación en salud mental', disponibilidad: '24/7', gratuito: true },
  { nombre: 'Cruz Roja Colombia', numero: '132', descripcion: 'Atención de urgencias y primeros auxilios', disponibilidad: '24/7', gratuito: true },
];

function ModalCrisis({ onCerrar }: { onCerrar: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-[#0d1a12] border border-red-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-white font-black text-lg">¿Necesitas ayuda ahora?</h2>
              <p className="text-red-400 text-xs">Recursos de crisis disponibles 24/7</p>
            </div>
          </div>
          <button onClick={onCerrar} className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-5 leading-relaxed">
          Si estás en una situación de crisis, habla con alguien ahora mismo. No estás solo/a.
        </p>

        <div className="space-y-3 mb-5">
          {RECURSOS_CRISIS.map((r) => (
            <a
              key={r.numero}
              href={`tel:${r.numero.replace(/-/g, '')}`}
              className="flex items-center gap-4 p-3.5 bg-red-500/5 border border-red-500/20 rounded-xl hover:bg-red-500/10 hover:border-red-500/40 transition-all group"
            >
              <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/25 transition-colors">
                <Phone className="w-4 h-4 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">{r.nombre}</p>
                <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{r.descripcion}</p>
              </div>
              <span className="text-red-400 font-black text-lg flex-shrink-0">{r.numero}</span>
            </a>
          ))}
        </div>

        <div className="border-t border-white/5 pt-4">
          <p className="text-gray-600 text-xs text-center leading-relaxed">
            Si estás en peligro inmediato, llama al <strong className="text-red-400">123</strong> o pide a alguien de confianza que te acompañe.
          </p>
        </div>
      </div>
    </div>
  );
}

const navItems = [
  { href: '/dashboard',            icon: Home,           label: 'Inicio',     mobileShow: true },
  { href: '/dashboard/chat',       icon: MessageCircle,  label: 'Chat IA',    mobileShow: true },
  { href: '/dashboard/diario',     icon: BookOpen,       label: 'Diario',     mobileShow: true },
  { href: '/tests',                icon: FlaskConical,   label: 'Tests',      mobileShow: false },
  { href: '/aprender',             icon: GraduationCap,  label: 'Aprender',   mobileShow: false },
  { href: '/dashboard/progreso',   icon: TrendingUp,     label: 'Progreso',   mobileShow: false },
  { href: '/dashboard/ejercicios', icon: Wind,           label: 'Ejercicios', mobileShow: true },
  { href: '/dashboard/citas',      icon: Calendar,       label: 'Citas',      mobileShow: true },
  { href: '/dashboard/perfil',     icon: User,           label: 'Perfil',     mobileShow: false },
];

const PLAN_COLORS: Record<string, string> = {
  GRATIS:      'text-gray-400',
  PLUS:        'text-teal-400',
  FAMILIA:     'text-purple-400',
  EMPRESARIAL: 'text-amber-400',
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
  const [userMenuOpen, setUserMenuOpen]   = useState(false);
  const [crisisOpen, setCrisisOpen]       = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(false);

  const mobileNavItems = navItems.filter(i => i.mobileShow);

  return (
    <div className="flex min-h-screen bg-[#080f0a] text-white">

      {/* ── SIDEBAR (desktop + mobile overlay) ── */}

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 h-screen w-56 bg-[#0d1a12] border-r border-white/5 flex flex-col z-50 transition-transform duration-200 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5 flex items-center justify-between">
          <Link href="/" onClick={() => setSidebarOpen(false)}>
            <span className="text-xl font-black bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              MenteBridge
            </span>
            <p className="text-[10px] text-gray-600 mt-0.5 uppercase tracking-widest">Colombia</p>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
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
                  <Link key={href} href={href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${active ? 'bg-teal-500/10 text-white font-semibold' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
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
                  <Link key={href} href={href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${active ? 'bg-red-500/10 text-red-300 font-semibold' : 'text-red-400/70 hover:text-red-300 hover:bg-red-500/5'}`}>
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

        {/* Crisis — sidebar */}
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
      <div className="md:ml-56 flex-1 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="h-14 bg-[#0d1a12]/80 backdrop-blur border-b border-white/5 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {/* Hamburger — solo mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-all"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo mobile */}
            <span className="md:hidden text-base font-black bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              MenteBridge
            </span>

            {/* Fecha — desktop */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-xs text-gray-500">
                {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
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
                <span className="hidden sm:inline text-sm text-gray-300 font-medium">{userName?.split(' ')[0] ?? 'Usuario'}</span>
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

        {/* Content — con padding-bottom extra en mobile para la barra inferior */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* ── BOTTOM NAV (solo mobile) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d1a12]/95 backdrop-blur-md border-t border-white/8">
        <div className="grid grid-cols-5 h-16">
          {mobileNavItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  active ? 'text-teal-400' : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <CheckInDiario />

      {/* Botón flotante de crisis — desktop only (mobile tiene bottom nav) */}
      <button
        onClick={() => setCrisisOpen(true)}
        className="hidden md:flex fixed bottom-6 right-6 z-50 items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-full shadow-lg shadow-red-900/40 transition-all hover:scale-105 active:scale-95"
        aria-label="Recursos de crisis"
      >
        <Phone className="w-4 h-4" />
        ¿Estás en crisis?
      </button>

      {/* Botón crisis mobile — dentro del bottom nav area no cabe, ponemos encima */}
      <button
        onClick={() => setCrisisOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-50 flex items-center justify-center w-11 h-11 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-lg shadow-red-900/40 transition-all active:scale-95"
        aria-label="Recursos de crisis"
      >
        <Phone className="w-4 h-4" />
      </button>

      {/* Modal de crisis */}
      {crisisOpen && <ModalCrisis onCerrar={() => setCrisisOpen(false)} />}
    </div>
  );
}
