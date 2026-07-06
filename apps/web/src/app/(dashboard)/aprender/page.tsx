import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/client';
import { CATALOGO_CURSOS, CATEGORIAS_APRENDER } from '@/lib/cursos/catalogo';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

export default async function AprenderPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/auth/login');

  const progresos = await db.progresoCurso.findMany({
    where: { usuarioId: session.user.id },
  }).catch(() => []);

  const progresoMap: Record<string, string[]> = {};
  for (const p of progresos) {
    progresoMap[p.cursoId] = p.itemsCompletados as string[];
  }

  // Find first in-progress course for the continue banner
  const enProgreso = CATALOGO_CURSOS.map(c => {
    const completados = progresoMap[c.id] ?? [];
    const pct = c.items.length ? Math.round((completados.length / c.items.length) * 100) : 0;
    return { ...c, pct, completados };
  }).find(c => c.pct > 0 && c.pct < 100);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">📚 Aprender</h1>
        <p className="text-sm text-gray-500">Lecciones cortas + práctica real con la IA, en Pensar, Sentir y Actuar.</p>
      </div>

      {/* Continue banner */}
      {enProgreso && (
        <Link
          href={`/aprender/${enProgreso.id}`}
          className="block rounded-2xl border p-5 transition-all hover:scale-[1.005]"
          style={{
            background: `linear-gradient(135deg, ${enProgreso.color}20, ${enProgreso.color}06)`,
            borderColor: `${enProgreso.color}35`,
          }}
        >
          <span
            className="text-[10px] font-black uppercase tracking-widest"
            style={{ color: enProgreso.color }}
          >
            Continuar curso
          </span>
          <h2 className="text-lg font-black text-white mt-2 mb-3">
            {enProgreso.icono} {enProgreso.titulo}
          </h2>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${enProgreso.pct}%`, background: enProgreso.color }}
            />
          </div>
          <span
            className="inline-block px-5 py-2 rounded-full text-sm font-bold text-[#0d1117]"
            style={{ background: enProgreso.color }}
          >
            Continuar →
          </span>
        </Link>
      )}

      {CATEGORIAS_APRENDER.map(cat => {
        const cursos = CATALOGO_CURSOS.filter(c => c.categoria === cat.id);
        return (
          <div key={cat.id}>
            <div className="mb-3">
              <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>{cat.icono}</span>{cat.titulo}
              </h2>
              <p className="text-[11px] text-gray-700 mt-0.5">{cat.descripcion}</p>
            </div>
            <div className="flex flex-col gap-3">
              {cursos.map(curso => {
                const completados: string[] = progresoMap[curso.id] ?? [];
                const total = curso.items.length;
                const pct = total ? Math.round((completados.length / total) * 100) : 0;

                return (
                  <Link
                    key={curso.id}
                    href={`/aprender/${curso.id}`}
                    className="group bg-[#0d1117] border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/3 hover:scale-[1.005] transition-all duration-200"
                  >
                    <div className="text-3xl flex-shrink-0">{curso.icono}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-bold text-white">{curso.titulo}</h3>
                        {completados.length === total && total > 0 && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-1 mb-2">{curso.descripcion}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-700">{total} pasos</span>
                        {completados.length > 0 && (
                          <span className="text-[10px] text-teal-500">{pct}% completado</span>
                        )}
                      </div>
                      {completados.length > 0 && (
                        <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
