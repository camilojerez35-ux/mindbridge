'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { obtenerItemDeCurso } from '@/lib/cursos/catalogo';
import { ChevronLeft, CheckCircle2, Loader2, MessageCircle, HelpCircle, Send } from 'lucide-react';

// ── Markdown renderer ─────────────────────────────────────────────────────────
function renderContenido(texto: string) {
  return texto.split('\n').map((line, i) => {
    if (line.startsWith('## '))
      return <h2 key={i} className="text-base font-bold text-white mt-5 mb-2">{line.slice(3)}</h2>;
    if (line.startsWith('- '))
      return <li key={i} className="text-sm text-gray-400 leading-relaxed ml-3">{renderBold(line.slice(2))}</li>;
    if (line === '')
      return <div key={i} className="h-2" />;
    const parts = line.split(/\*\*(.*?)\*\*/g);
    if (parts.length === 1)
      return <p key={i} className="text-sm text-gray-400 leading-relaxed">{line}</p>;
    return (
      <p key={i} className="text-sm text-gray-400 leading-relaxed">
        {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-gray-200 font-semibold">{p}</strong> : p)}
      </p>
    );
  });
}

function renderBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="text-gray-200 font-semibold">{p}</strong> : p);
}

// ── Inline practice chat ──────────────────────────────────────────────────────
interface Msg { rol: 'user' | 'assistant'; contenido: string; }

function PracticaChat({
  promptPractica,
  titulo,
  onCompletar,
  marcando,
  completado,
}: {
  promptPractica: string;
  titulo: string;
  onCompletar: () => void;
  marcando: boolean;
  completado: boolean;
}) {
  const [mensajes, setMensajes] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [intercambios, setIntercambios] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    iniciar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [mensajes, cargando]);

  async function iniciar() {
    setCargando(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: '[INICIO_PRACTICA]', contextoPractica: promptPractica }),
      });
      const data = await res.json();
      setMensajes([{ rol: 'assistant', contenido: data.respuesta }]);
    } catch {
      setMensajes([{ rol: 'assistant', contenido: '¡Hola! Empecemos esta práctica. ¿Cómo te sientes respecto a lo que acabas de leer?' }]);
    } finally {
      setCargando(false);
    }
  }

  async function enviar() {
    if (!input.trim() || cargando) return;
    const userMsg: Msg = { rol: 'user', contenido: input.trim() };
    setMensajes(prev => [...prev, userMsg]);
    setInput('');
    setCargando(true);
    setIntercambios(n => n + 1);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: userMsg.contenido, contextoPractica: promptPractica }),
      });
      const data = await res.json();
      setMensajes(prev => [...prev, { rol: 'assistant', contenido: data.respuesta }]);
    } catch {
      setMensajes(prev => [...prev, { rol: 'assistant', contenido: 'Hubo un problema. ¿Puedes intentar de nuevo?' }]);
    } finally {
      setCargando(false);
    }
  }

  const puedeCompletar = intercambios >= 3;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <MessageCircle className="w-4 h-4 text-amber-400" />
        <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Práctica con IA</p>
      </div>
      <h1 className="text-base font-black text-white">{titulo}</h1>

      {/* Chat window */}
      <div
        ref={scrollRef}
        className="bg-[#080f0a] border border-white/5 rounded-2xl p-4 h-80 overflow-y-auto flex flex-col gap-3"
      >
        {mensajes.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              m.rol === 'user'
                ? 'self-end bg-teal-600 text-white rounded-tr-sm'
                : 'self-start bg-white/5 text-gray-300 rounded-tl-sm'
            }`}
          >
            {m.contenido}
          </div>
        ))}
        {cargando && (
          <div className="self-start flex gap-1 px-4 py-3 bg-white/5 rounded-2xl rounded-tl-sm">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviar()}
          placeholder="Escribe tu respuesta..."
          disabled={cargando}
          className="flex-1 bg-white/3 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-700 outline-none focus:border-teal-500/30 transition-colors disabled:opacity-50"
        />
        <button
          onClick={enviar}
          disabled={cargando || !input.trim()}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Complete button */}
      <button
        onClick={onCompletar}
        disabled={!puedeCompletar || marcando || completado}
        className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors"
      >
        {marcando && <Loader2 className="w-4 h-4 animate-spin" />}
        {completado
          ? '¡Completado!'
          : puedeCompletar
          ? 'Completar práctica →'
          : `Conversa un poco más (${intercambios}/3 intercambios)`}
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ItemPage() {
  const { curso: cursoId, leccion: itemId } = useParams<{ curso: string; leccion: string }>();
  const router = useRouter();

  const result = obtenerItemDeCurso(cursoId, itemId);
  const [marcando, setMarcando] = useState(false);
  const [completado, setCompletado] = useState(false);
  const [quizRespuestas, setQuizRespuestas] = useState<Record<number, number>>({});
  const [quizEnviado, setQuizEnviado] = useState(false);

  if (!result) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Lección no encontrada.</p>
        <Link href="/aprender" className="text-teal-400 hover:text-teal-300 text-sm font-semibold">← Aprender</Link>
      </div>
    );
  }

  const { curso, item, index } = result;
  const siguiente = curso.items[index + 1];
  const anterior = curso.items[index - 1];

  async function marcarCompletado() {
    setMarcando(true);
    try {
      await fetch('/api/cursos/progreso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cursoId, itemId }),
      });
      setCompletado(true);
      setTimeout(() => {
        if (siguiente) router.push(`/aprender/${cursoId}/${siguiente.id}`);
        else router.push(`/aprender/${cursoId}`);
      }, 500);
    } catch {
      alert('Error al guardar el progreso.');
    } finally {
      setMarcando(false);
    }
  }

  const navAnterior = anterior ? (
    <Link href={`/aprender/${cursoId}/${anterior.id}`} className="flex items-center gap-1 px-4 py-2.5 bg-white/5 border border-white/8 text-gray-500 text-sm rounded-xl hover:bg-white/8 transition-all">
      <ChevronLeft className="w-4 h-4" />Anterior
    </Link>
  ) : (
    <Link href={`/aprender/${cursoId}`} className="flex items-center gap-1 px-4 py-2.5 bg-white/5 border border-white/8 text-gray-500 text-sm rounded-xl hover:bg-white/8 transition-all">
      <ChevronLeft className="w-4 h-4" />Volver
    </Link>
  );

  // ── Quiz ───────────────────────────────────────────────────────────────────
  if (item.tipo === 'practica' && item.quiz) {
    const quiz = item.quiz;
    const todasRespondidas = quiz.every((_, i) => quizRespuestas[i] !== undefined);
    const correctas = quizEnviado ? quiz.filter((q, i) => quizRespuestas[i] === q.correctaIndex).length : 0;

    return (
      <div className="max-w-xl space-y-4 pb-8">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Link href={`/aprender/${cursoId}`} className="hover:text-gray-400 transition-colors">{curso.titulo}</Link>
          <span>/</span><span className="text-gray-500">{item.titulo}</span>
        </div>

        <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Quiz</p>
          </div>
          <h1 className="text-base font-black text-white mb-5">{item.titulo}</h1>

          <div className="space-y-5">
            {quiz.map((q, qi) => (
              <div key={qi}>
                <p className="text-sm text-gray-300 font-medium mb-2">{q.pregunta}</p>
                <div className="space-y-1.5">
                  {q.opciones.map((op, oi) => {
                    const seleccionada = quizRespuestas[qi] === oi;
                    const esCorrecta = oi === q.correctaIndex;
                    let cls = 'bg-white/3 border-white/5 text-gray-400 hover:bg-white/6 hover:text-gray-200';
                    if (quizEnviado) {
                      if (esCorrecta) cls = 'bg-teal-500/20 border-teal-500/40 text-teal-300';
                      else if (seleccionada) cls = 'bg-red-500/20 border-red-500/30 text-red-300';
                    } else if (seleccionada) {
                      cls = 'bg-teal-500/20 border-teal-500/40 text-teal-300';
                    }
                    return (
                      <button
                        key={oi}
                        disabled={quizEnviado}
                        onClick={() => setQuizRespuestas(prev => ({ ...prev, [qi]: oi }))}
                        className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${cls}`}
                      >
                        {op}{quizEnviado && esCorrecta && ' ✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {quizEnviado && (
            <div className={`mt-5 p-3 rounded-xl ${correctas === quiz.length ? 'bg-teal-500/10 border border-teal-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
              <p className="text-sm font-bold text-white">{correctas}/{quiz.length} correctas</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {correctas === quiz.length ? '¡Perfecto! Ya puedes continuar.' : 'Revisa las respuestas correctas y continúa.'}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {navAnterior}
          {!quizEnviado ? (
            <button onClick={() => setQuizEnviado(true)} disabled={!todasRespondidas}
              className="flex-1 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all">
              Verificar respuestas
            </button>
          ) : (
            <button onClick={marcarCompletado} disabled={marcando || completado}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-70 text-white text-sm font-bold rounded-xl transition-all">
              {marcando ? <Loader2 className="w-4 h-4 animate-spin" /> : completado ? <CheckCircle2 className="w-4 h-4" /> : null}
              {completado ? '¡Completado!' : siguiente ? 'Continuar' : 'Finalizar curso'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Práctica con IA (inline chat) ─────────────────────────────────────────
  if (item.tipo === 'practica' && item.promptPractica) {
    return (
      <div className="max-w-xl space-y-4 pb-8">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Link href={`/aprender/${cursoId}`} className="hover:text-gray-400 transition-colors">{curso.titulo}</Link>
          <span>/</span><span className="text-gray-500">{item.titulo}</span>
        </div>

        <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-5">
          <PracticaChat
            promptPractica={item.promptPractica}
            titulo={item.titulo}
            onCompletar={marcarCompletado}
            marcando={marcando}
            completado={completado}
          />
        </div>

        <div className="flex gap-3">{navAnterior}</div>
      </div>
    );
  }

  // ── Lección de texto ──────────────────────────────────────────────────────
  return (
    <div className="max-w-xl space-y-4 pb-8">
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <Link href="/aprender" className="hover:text-gray-400 transition-colors">Aprender</Link>
        <span>/</span>
        <Link href={`/aprender/${cursoId}`} className="hover:text-gray-400 transition-colors">{curso.titulo}</Link>
        <span>/</span>
        <span className="text-gray-500">{item.titulo}</span>
      </div>

      <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-6 space-y-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-2xl">{curso.icono}</div>
          <div>
            <p className="text-[10px] text-gray-700 uppercase tracking-wider">Lección {index + 1}</p>
            <h1 className="text-base font-black text-white">{item.titulo}</h1>
          </div>
        </div>
        {item.contenido && renderContenido(item.contenido)}
      </div>

      <div className="flex gap-3">
        {navAnterior}
        <button
          onClick={marcarCompletado}
          disabled={marcando || completado}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-70 text-white text-sm font-bold rounded-xl transition-all"
        >
          {marcando ? <Loader2 className="w-4 h-4 animate-spin" /> : completado ? <CheckCircle2 className="w-4 h-4" /> : null}
          {completado ? '¡Completado!' : siguiente ? 'Marcar y continuar' : 'Finalizar curso'}
        </button>
      </div>
    </div>
  );
}
