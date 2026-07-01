import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/client';
import { CATALOGO_TESTS } from '@/lib/tests/catalogo';
import TestsSearch from '@/components/tests/TestsSearch';

export default async function TestsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/auth/login');

  const resultados = await db.resultadoTest.findMany({
    where: { usuarioId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: { testId: true, resultadoTitulo: true },
  }).catch(() => []);

  const ultimoPorTest: Record<string, string> = {};
  for (const r of resultados) {
    if (!ultimoPorTest[r.testId]) ultimoPorTest[r.testId] = r.resultadoTitulo;
  }

  const completados = new Set(Object.keys(ultimoPorTest));

  const tests = CATALOGO_TESTS.map(t => ({
    id: t.id,
    categoria: t.categoria,
    titulo: t.titulo,
    descripcion: t.descripcion,
    icono: t.icono,
    color: t.color,
    duracionMin: t.duracionMin,
    numPreguntas: t.preguntas.length,
    hecho: completados.has(t.id),
    resultadoTitulo: ultimoPorTest[t.id],
  }));

  // First incomplete test as featured, fallback to first
  const destacado = tests.find(t => !t.hecho) ?? tests[0];

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white mb-1">🧪 Autoevaluaciones</h1>
        <p className="text-sm text-gray-500">
          {completados.size}/{CATALOGO_TESTS.length} completados · Los resultados personalizan tu Consejo del día y el Chat IA
        </p>
      </div>

      {/* Featured test */}
      {destacado && (
        <div
          className="rounded-2xl border p-6"
          style={{
            background: `linear-gradient(135deg, ${destacado.color}18, ${destacado.color}06)`,
            borderColor: `${destacado.color}35`,
          }}
        >
          <span
            className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: `${destacado.color}20`, color: destacado.color }}
          >
            {destacado.hecho ? 'Repetir' : 'Siguiente recomendado'}
          </span>
          <h2 className="text-xl font-black text-white mt-3 mb-1">
            {destacado.icono} {destacado.titulo}
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-2">
            {destacado.descripcion}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href={`/tests/${destacado.id}`}
              className="px-5 py-2.5 rounded-full text-sm font-bold text-[#0d1117] transition-opacity hover:opacity-90"
              style={{ background: destacado.color }}
            >
              {destacado.hecho ? 'Repetir test' : 'Comenzar test'} →
            </Link>
            <span className="text-xs text-gray-600">⏱ {destacado.duracionMin} min · {destacado.numPreguntas} preguntas</span>
          </div>
        </div>
      )}

      {/* Search + category list (client island) */}
      <TestsSearch tests={tests} />

      {/* Disclaimer */}
      <div className="bg-amber-950/20 border border-amber-900/20 rounded-xl px-4 py-3">
        <p className="text-xs text-amber-400/60 leading-relaxed">
          ⚠️ Herramientas de auto-evaluación con fines informativos. No constituyen diagnóstico clínico. Consulta con un profesional si tienes preocupaciones sobre tu salud mental.
        </p>
      </div>
    </div>
  );
}
