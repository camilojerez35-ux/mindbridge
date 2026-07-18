import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import PrimerosPasos from '@/components/onboarding/PrimerosPasos';
import ConsejoDelDia from '@/components/inicio/ConsejoDelDia';
import RachaBienestar from '@/components/progreso/RachaBienestar';
import WidgetTareas from '@/components/tareas/WidgetTareas';
import BannersAdherencia from '@/components/inicio/BannersAdherencia';
import {
  MessageCircle, BookOpen, Wind, Calendar,
  BookMarked, TrendingUp, Flame, Bot, Heart, Smile,
} from 'lucide-react';

const accesos = [
  { href: '/dashboard/chat',       Icon: MessageCircle, color: 'from-teal-500/20 to-teal-600/5',   border: 'border-teal-500/20',   iconColor: 'text-teal-400',   title: 'Chat con IA',    desc: 'Apoyo 24/7, sin juicios' },
  { href: '/dashboard/diario',     Icon: BookOpen,      color: 'from-indigo-500/20 to-indigo-600/5', border: 'border-indigo-500/20', iconColor: 'text-indigo-400', title: 'Mi diario',      desc: 'Registra cómo te sientes' },
  { href: '/dashboard/ejercicios', Icon: Wind,          color: 'from-amber-500/20 to-amber-600/5',  border: 'border-amber-500/20',  iconColor: 'text-amber-400',  title: 'Ejercicios',     desc: 'Respiración y grounding' },
  { href: '/dashboard/citas',      Icon: Calendar,      color: 'from-rose-500/20 to-rose-600/5',    border: 'border-rose-500/20',   iconColor: 'text-rose-400',   title: 'Agendar cita',   desc: 'Psicólogos verificados' },
  { href: '/dashboard/progreso',   Icon: TrendingUp,    color: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20', iconColor: 'text-purple-400', title: 'Mi progreso',    desc: 'Seguimiento emocional' },
  { href: '/dashboard/diario',     Icon: BookMarked,    color: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/20', iconColor: 'text-emerald-400', title: 'Programas',   desc: 'TCC, ansiedad y sueño' },
];

const TIPS = [
  { texto: 'La respiración 4-4-6 activa el sistema parasimpático y reduce el cortisol en minutos. Inhala 4 seg, sostén 4, exhala 6.', href: '/dashboard/ejercicios', cta: 'Practicar ahora' },
  { texto: 'Escribir 3 cosas por las que estás agradecido/a cada noche mejora el estado de ánimo en 2 semanas según estudios TCC.', href: '/dashboard/diario', cta: 'Abrir diario' },
  { texto: 'El grounding 5-4-3-2-1 interrumpe los ciclos de ansiedad en segundos. Nombra 5 cosas que ves, 4 que tocas...', href: '/dashboard/ejercicios', cta: 'Ver técnica' },
];

const ANIMOS = [
  { emoji: '😔', label: 'Mal',      valor: 2 },
  { emoji: '😐', label: 'Regular',  valor: 5 },
  { emoji: '🙂', label: 'Bien',     valor: 7 },
  { emoji: '😄', label: 'Excelente',valor: 10 },
];

async function obtenerDatos(usuarioId: string) {
  const ahora = new Date();
  const [sesionesTotal, entradasTotal, estadosAnimo, citasTotal, usuario, tareasPendientes] = await Promise.all([
    db.sesionChat.count({ where: { usuarioId } }),
    db.entradaDiario.count({ where: { usuarioId } }),
    db.entradaDiario.findMany({
      where: { usuarioId },
      select: { estadoAnimo: true },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    db.cita.count({ where: { usuarioId } }),
    db.usuario.findUnique({
      where: { id: usuarioId },
      select: { createdAt: true, nombre: true, apellido: true },
    }),
    db.tareaSesion.findMany({
      where: { usuarioId, estado: { not: 'COMPLETADA' } },
      include: {
        psicologo: { include: { usuario: { select: { nombre: true, apellido: true } } } },
      },
      orderBy: [{ fechaLimite: 'asc' }, { createdAt: 'desc' }],
      take: 5,
    }).catch(() => []),
  ]);

  const diasActivo = usuario
    ? Math.max(1, Math.ceil((ahora.getTime() - usuario.createdAt.getTime()) / 86_400_000))
    : 1;

  const animoPromedio = estadosAnimo.length
    ? (estadosAnimo.reduce((a, e) => a + e.estadoAnimo, 0) / estadosAnimo.length).toFixed(1)
    : null;

  const nombre = usuario ? [usuario.nombre, usuario.apellido].filter(Boolean).join(' ') : null;
  const completadosDB: string[] = [];
  if (sesionesTotal > 0) completadosDB.push('chat');
  if (entradasTotal > 0) completadosDB.push('diario');
  if (citasTotal > 0)    completadosDB.push('cita');

  return { diasActivo, sesionesIA: sesionesTotal, entradasDiario: entradasTotal, animoPromedio, nombre, completadosDB, tareasPendientes };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  const datos = session?.user?.id
    ? await obtenerDatos(session.user.id).catch(() => null)
    : null;

  const nombre = datos?.nombre || session?.user?.name || null;
  const primerNombre = nombre?.split(' ')[0] ?? null;
  const tip = TIPS[new Date().getDate() % TIPS.length];

  const stats = [
    { label: 'Días activo',     value: datos ? String(datos.diasActivo)     : '–', Icon: Flame,  color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { label: 'Sesiones IA',     value: datos ? String(datos.sesionesIA)     : '–', Icon: Bot,    color: 'text-teal-400',   bg: 'bg-teal-400/10'   },
    { label: 'Entradas diario', value: datos ? String(datos.entradasDiario) : '–', Icon: Heart,  color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { label: 'Ánimo promedio',  value: datos?.animoPromedio ? `${datos.animoPromedio}/10` : '–', Icon: Smile, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">

      <OnboardingWizard />

      <ConsejoDelDia />

      {/* ── BANNERS DE ADHERENCIA ── */}
      <BannersAdherencia />

      {/* ── HERO ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-900/30 via-[#0d1a12] to-emerald-900/10 border border-teal-500/15 p-7">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-teal-500/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-emerald-500/5 blur-xl pointer-events-none" />

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="flex-1 min-w-64">
            <p className="text-xs text-teal-600 font-medium mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse inline-block" />
              {saludo}
            </p>
            <h1 className="text-3xl font-black text-white mb-2 leading-tight">
              {primerNombre ? `Hola, ${primerNombre} 💚` : '¿Cómo estás hoy? 💚'}
            </h1>
            <p className="text-sm text-gray-500 max-w-md leading-relaxed">
              Este es tu espacio seguro. Aquí puedes hablar con la IA, escribir en tu diario o conectar con un psicólogo.
            </p>
            <Link
              href="/dashboard/chat"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Iniciar conversación
            </Link>
          </div>

          {/* Check-in rápido */}
          <div className="bg-black/20 rounded-xl p-4 border border-white/5 min-w-48">
            <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-3">¿Cómo estás ahora?</p>
            <div className="grid grid-cols-2 gap-2">
              {ANIMOS.map(({ emoji, label, valor }) => (
                <Link
                  key={label}
                  href={`/dashboard/diario?animo=${valor}`}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/3 border border-white/5 hover:bg-white/8 hover:border-teal-500/20 transition-all"
                >
                  <span className="text-base">{emoji}</span>
                  <span className="text-xs text-gray-400">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-[#0d1a12] border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className={`text-2xl font-black ${color} leading-none`}>{value}</p>
              <p className="text-xs text-gray-600 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── RACHA Y RESUMEN SEMANAL ── */}
      <RachaBienestar />

      {/* ── TAREAS DEL PSICÓLOGO ── */}
      {datos?.tareasPendientes && datos.tareasPendientes.length > 0 && (
        <WidgetTareas tareas={datos.tareasPendientes} />
      )}

      {/* ── ACCESOS RÁPIDOS ── */}
      <div>
        <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Acceso rápido</h2>
        <div className="grid grid-cols-3 gap-3">
          {accesos.map(({ href, Icon, color, border, iconColor, title, desc }) => (
            <Link
              key={href + title}
              href={href}
              className={`group relative overflow-hidden bg-gradient-to-br ${color} border ${border} rounded-xl p-4 flex items-center gap-3 hover:scale-[1.02] transition-all duration-200`}
            >
              <div className={`w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-xs text-gray-500 truncate">{desc}</p>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-gray-600 group-hover:text-gray-400 flex-shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* ── PRIMEROS PASOS + TIP ── */}
      <div className="grid grid-cols-2 gap-4">
        <PrimerosPasos completadosDB={datos?.completadosDB ?? []} />

        {/* Tip del día */}
        <div className="bg-[#0d1a12] border border-white/5 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-base">💡</div>
            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Tip del día</p>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed flex-1">{tip.texto}</p>
          <Link href={tip.href} className="text-sm text-teal-400 hover:text-teal-300 font-semibold transition-colors inline-flex items-center gap-1">
            {tip.cta} →
          </Link>
        </div>
      </div>

      {/* ── AVISO LEGAL ── */}
      <div className="bg-red-950/20 border border-red-900/20 rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="text-sm flex-shrink-0">⚠️</span>
        <p className="text-xs text-red-900/80 leading-relaxed text-red-400/60">
          MenteBridge es una herramienta de bienestar emocional, no sustituye la atención profesional.
          Crisis: <strong className="text-red-400">106 · 800-112-5555 · 123</strong>
        </p>
      </div>
    </div>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
