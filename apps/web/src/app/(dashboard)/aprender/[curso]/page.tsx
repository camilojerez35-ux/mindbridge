import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db/client';
import { obtenerCursoPorId } from '@/lib/cursos/catalogo';
import { ChevronLeft, ChevronRight, CheckCircle2, BookOpen, MessageCircle, HelpCircle, Lock } from 'lucide-react';

const TIPO_CONFIG = {
  leccion:  { label: 'Lección',  Icon: BookOpen,       color: 'text-violet-400' },
  practica: { label: 'Práctica', Icon: MessageCircle,  color: 'text-amber-400'  },
} as const;

export default async function CursoPage({ params }: { params: { curso: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/auth/login');

  const curso = obtenerCursoPorId(params.curso);
  if (!curso) notFound();

  const progreso = await db.progresoCurso.findUnique({
    where: { usuarioId_cursoId: { usuarioId: session.user.id, cursoId: curso.id } },
  }).catch(() => null);

  const completados = new Set((progreso?.itemsCompletados ?? []) as string[]);
  const total = curso.items.length;
  const pct = total ? Math.round((completados.size / total) * 100) : 0;

  return (
    <div className="max-w-xl space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href="/aprender" className="p-1.5 rounded-lg hover:bg-white/5 text-gray-600 hover:text-gray-400 transition-all">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <span className="text-xs text-gray-600">Aprender</span>
      </div>

      {/* Hero */}
      <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="text-4xl">{curso.icono}</div>
          <div className="flex-1">
            <h1 className="text-lg font-black text-white mb-1">{curso.titulo}</h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">{curso.descripcion}</p>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span>{total} pasos</span>
              <span>{completados.size}/{total} completados</span>
            </div>
          </div>
        </div>
        {completados.size > 0 && (
          <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>

      {/* Lista de items */}
      <div className="bg-[#0d1117] border border-white/5 rounded-2xl overflow-hidden">
        {curso.items.map((item, idx) => {
          const hecho = completados.has(item.id);
          // Locked if not the first item and the previous is not completed
          const bloqueado = idx > 0 && !completados.has(curso.items[idx - 1].id);
          const cfg = TIPO_CONFIG[item.tipo];
          const esQuiz = item.tipo === 'practica' && !!item.quiz;
          const IconItem = esQuiz ? HelpCircle : cfg.Icon;

          const inner = (
            <div className={`flex items-center gap-3 px-5 py-4 border-b border-white/3 last:border-0 transition-all group ${
              bloqueado ? 'opacity-40 cursor-not-allowed' : hecho ? 'opacity-70 hover:bg-white/3' : 'hover:bg-white/3'
            }`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                hecho      ? 'bg-teal-500/20 text-teal-400' :
                bloqueado  ? 'bg-white/3 text-gray-700' :
                             'bg-white/5 text-gray-600'
              }`}>
                {hecho      ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                 bloqueado  ? <Lock className="w-3 h-3" /> :
                              <span className="text-[10px] font-bold">{idx + 1}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${hecho ? 'text-gray-500' : bloqueado ? 'text-gray-700' : 'text-gray-300'}`}>
                  {item.titulo}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <IconItem className={`w-3 h-3 ${cfg.color}`} />
                  <span className={`text-[10px] ${cfg.color}`}>
                    {esQuiz ? 'Quiz' : cfg.label}
                  </span>
                </div>
              </div>
              {!bloqueado && (
                <ChevronRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-500 transition-colors flex-shrink-0" />
              )}
            </div>
          );

          return bloqueado ? (
            <div key={item.id}>{inner}</div>
          ) : (
            <Link key={item.id} href={`/aprender/${curso.id}/${item.id}`} className="block">
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
