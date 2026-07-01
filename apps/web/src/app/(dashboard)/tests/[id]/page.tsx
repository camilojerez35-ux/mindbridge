'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { obtenerTestPorId, obtenerResultado, calcularPuntajeMaximo } from '@/lib/tests/catalogo';
import { ChevronLeft, ChevronRight, Loader2, RotateCcw, AlertTriangle, Calendar } from 'lucide-react';

export default function TestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const test = obtenerTestPorId(id);

  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [fase, setFase] = useState<'intro' | 'test' | 'resultado'>('intro');
  const [resultado, setResultado] = useState<{
    titulo: string; descripcion: string; puntajeTotal: number; puntajeMaximo: number; porcentaje: number;
  } | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (!test) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Test no encontrado.</p>
        <Link href="/tests" className="text-teal-400 hover:text-teal-300 text-sm font-semibold">← Volver a tests</Link>
      </div>
    );
  }

  const pregunta = test.preguntas[preguntaActual];
  const opciones = pregunta.opciones ?? [
    { valor: 1, texto: 'Totalmente en desacuerdo' },
    { valor: 2, texto: 'En desacuerdo' },
    { valor: 3, texto: 'Neutral' },
    { valor: 4, texto: 'De acuerdo' },
    { valor: 5, texto: 'Totalmente de acuerdo' },
  ];
  const progreso = (preguntaActual / test.preguntas.length) * 100;
  const todasRespondidas = test.preguntas.every(p => respuestas[p.id] !== undefined);

  function seleccionarRespuesta(valor: number) {
    setRespuestas(prev => ({ ...prev, [pregunta.id]: valor }));
    if (preguntaActual < test!.preguntas.length - 1) {
      setTimeout(() => setPreguntaActual(p => p + 1), 280);
    }
  }

  async function enviarTest() {
    setEnviando(true);
    try {
      const res = await fetch('/api/tests/resultado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId: test!.id, respuestas }),
      });
      const data = await res.json();
      if (data.exito) {
        setResultado(data.resultado);
        setFase('resultado');
      } else {
        throw new Error(data.error ?? 'Error');
      }
    } catch {
      alert('Error al guardar el resultado. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  function reiniciar() {
    setPreguntaActual(0);
    setRespuestas({});
    setFase('intro');
    setResultado(null);
  }

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (fase === 'intro') {
    return (
      <div className="max-w-xl mx-auto space-y-5 py-4">
        <Link href="/tests" className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400 transition-colors">
          <ChevronLeft className="w-3 h-3" />Volver
        </Link>
        <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">{test.icono}</div>
          <h1 className="text-xl font-black text-white mb-2">{test.titulo}</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">{test.descripcion}</p>
          <div className="flex justify-center gap-6 mb-8 text-sm text-gray-600">
            <span>⏱ {test.duracionMin} min</span>
            <span>📋 {test.preguntas.length} preguntas</span>
          </div>
          <button
            onClick={() => setFase('test')}
            className="px-8 py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl transition-colors"
          >
            Comenzar test
          </button>
        </div>
      </div>
    );
  }

  // ── Resultado ──────────────────────────────────────────────────────────────
  if (fase === 'resultado' && resultado) {
    const circunferencia = 2 * Math.PI * 52;
    const offset = circunferencia * (1 - resultado.porcentaje / 100);
    return (
      <div className="max-w-xl mx-auto space-y-4 py-4">
        <div className="bg-[#0d1117] border border-teal-500/20 rounded-2xl p-8 text-center">
          {/* SVG ring */}
          <div className="relative w-32 h-32 mx-auto mb-5">
            <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="52" fill="none" stroke="#2dd4bf" strokeWidth="10"
                strokeDasharray={circunferencia}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-teal-400">{resultado.porcentaje}%</span>
              <span className="text-[10px] text-gray-600">{resultado.puntajeTotal}/{resultado.puntajeMaximo}</span>
            </div>
          </div>

          <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Tu resultado</p>
          <h2 className="text-xl font-black text-white mb-3">{resultado.titulo}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">{resultado.descripcion}</p>

          {/* Disclaimer prominente — inmediatamente bajo el resultado, antes de cualquier acción */}
          <div className="mt-4 flex items-start gap-2 bg-amber-950/30 border border-amber-800/30 rounded-xl px-3 py-2.5 text-left">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-400/80 leading-relaxed">
              <strong className="text-amber-400">Este resultado es orientativo</strong> y no constituye diagnóstico clínico. Solo un profesional de salud mental puede diagnosticar. Si tienes dudas, agenda una cita.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href={`/dashboard/chat?practica=${encodeURIComponent(test.titulo)}&contexto=${encodeURIComponent(`El usuario acaba de completar el test "${test.titulo}" y obtuvo el resultado: "${resultado.titulo}". Ayúdalo a entender qué significa esto para su bienestar y qué pasos concretos puede tomar.`)}`}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold rounded-xl transition-colors"
          >
            💬 Hablar con la IA sobre este resultado
          </Link>
          <div className="flex gap-2">
            <button
              onClick={reiniciar}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/8 border border-white/8 text-gray-400 text-sm font-semibold rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />Repetir
            </button>
            <Link
              href="/tests"
              className="flex-1 flex items-center justify-center px-4 py-2.5 bg-white/5 hover:bg-white/8 border border-white/8 text-gray-400 text-sm font-semibold rounded-xl transition-colors"
            >
              Ver todos →
            </Link>
          </div>
        </div>

        {/* Alerta clínica — solo cuando el puntaje supera el umbral del test */}
        {test.umbralAlertaPct && resultado.porcentaje >= test.umbralAlertaPct && (
          <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-red-300 font-bold text-sm">Tu puntaje indica que podrías beneficiarte de apoyo profesional</p>
                <p className="text-red-400/70 text-xs mt-1 leading-relaxed">
                  Este resultado sugiere síntomas que vale la pena explorar con un psicólogo certificado. No estás solo/a.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/citas"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Agendar cita con un psicólogo
            </Link>
          </div>
        )}

      </div>
    );
  }

  // ── Test ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto space-y-4 py-4">
      {/* Barra de progreso */}
      <div className="flex items-center gap-3">
        <Link href="/tests" className="p-1.5 rounded-lg hover:bg-white/5 text-gray-600 hover:text-gray-400 transition-all">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-300"
            style={{ width: `${progreso}%` }}
          />
        </div>
        <span className="text-xs text-gray-600 tabular-nums">
          {preguntaActual + 1}/{test.preguntas.length}
        </span>
      </div>

      {/* Pregunta */}
      <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-6">
        <p className="text-[10px] text-gray-700 uppercase tracking-wider mb-3">Pregunta {preguntaActual + 1}</p>
        <h3 className="text-base font-semibold text-white mb-6 leading-relaxed">{pregunta.texto}</h3>

        <div className="space-y-2">
          {opciones.map(opcion => {
            const seleccionada = respuestas[pregunta.id] === opcion.valor;
            return (
              <button
                key={opcion.valor}
                onClick={() => seleccionarRespuesta(opcion.valor)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                  seleccionada
                    ? 'bg-teal-500/20 border-teal-500/40 text-teal-300 font-semibold'
                    : 'bg-white/3 border-white/5 text-gray-400 hover:bg-white/6 hover:text-gray-200'
                }`}
              >
                {opcion.texto}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navegación */}
      <div className="flex gap-3">
        <button
          onClick={() => setPreguntaActual(p => Math.max(0, p - 1))}
          disabled={preguntaActual === 0}
          className="flex items-center gap-1 px-4 py-2.5 bg-white/5 border border-white/8 text-gray-500 text-sm rounded-xl disabled:opacity-40 hover:bg-white/8 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />Anterior
        </button>

        {preguntaActual < test.preguntas.length - 1 ? (
          <button
            onClick={() => setPreguntaActual(p => p + 1)}
            disabled={respuestas[pregunta.id] === undefined}
            className="flex-1 flex items-center justify-center gap-1 px-4 py-2.5 bg-teal-500/20 border border-teal-500/30 text-teal-400 text-sm font-semibold rounded-xl disabled:opacity-40 hover:bg-teal-500/30 transition-all"
          >
            Siguiente<ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={enviarTest}
            disabled={!todasRespondidas || enviando}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-white text-sm font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {enviando && <Loader2 className="w-4 h-4 animate-spin" />}
            Ver resultado
          </button>
        )}
      </div>
    </div>
  );
}
