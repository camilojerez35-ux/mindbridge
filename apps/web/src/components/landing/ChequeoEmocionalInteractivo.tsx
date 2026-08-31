'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Emocion {
  id: string;
  emoji: string;
  label: string;
  titulo: string;
  descripcion: string;
  tecnica: string;
  ejemploChat: {
    usuario: string;
    ia: string;
  };
}

const EMOCIONES: Emocion[] = [
  {
    id: 'ansiedad',
    emoji: '😰',
    label: 'Ansiedad o pánico',
    titulo: 'Cuando el pecho se aprieta y los pensamientos no paran',
    descripcion: 'La ansiedad es una señal de alarma del cuerpo. No tienes que enfrentarla solo/a ni forzarte a "pensar positivo".',
    tecnica: 'Técnica de respiración diafragmática 4-4-6 y Grounding 5-4-3-2-1 para calmar tu sistema nervioso.',
    ejemploChat: {
      usuario: 'Siento mucha presión en el pecho y no puedo concentrarme, tengo miedo de fallar.',
      ia: 'Esa presión en el pecho es muy real y agotadora. Vamos a darte un respiro juntos. ¿Te gustaría probar un ejercicio de respiración suave de un minuto antes de analizar el resto?',
    },
  },
  {
    id: 'sobrecarga',
    emoji: '💼',
    label: 'Sobrecarga laboral / estrés',
    titulo: 'Cuando todo es urgente y sientes que vas a colapsar',
    descripcion: 'El burnout no se cura siendo más productivo; se alivia poniendo límites y reconociendo tus señales de agotamiento.',
    tecnica: 'Reestructuración Cognitiva (TCC) para desarmar la exigencia destructiva y activar micro-pausas reparadoras.',
    ejemploChat: {
      usuario: 'Llevo semanas trabajando 12 horas diarias y siento que todo depende de mí.',
      ia: 'Cargar con el peso de todo termina pasando factura. Reconozco tu esfuerzo, pero tu bienestar no es negociable. ¿Qué es lo que hoy sí está bajo tu control soltar?',
    },
  },
  {
    id: 'tristeza',
    emoji: '😔',
    label: 'Tristeza o soledad',
    titulo: 'Cuando no tienes ganas de nada y nadie parece entenderte',
    descripcion: 'La tristeza merece ser escuchada sin prisas. No eres una carga por sentirte así.',
    tecnica: 'Activación Conductual y Acompañamiento Empático sin juicios ni positivismo tóxico.',
    ejemploChat: {
      usuario: 'Siento que si desaparezco a nadie le importaría realmente...',
      ia: 'Qué doloroso debe ser cargar con ese sentimiento de soledad. Quiero que sepas que aquí estoy contigo. No tienes que fingir que estás bien. ¿Cuánto tiempo llevas guardándote esto?',
    },
  },
  {
    id: 'insomnio',
    emoji: '🌙',
    label: 'No puedo dormir',
    titulo: 'Cuando apagas la luz pero tu mente se enciende',
    descripcion: 'Rumiar en la cama activa el estado de alerta. Necesitas desacelerar tu mente con pasos guiados.',
    tecnica: 'Higiene del sueño + Escaneo corporal guiado de Mindfulness para inducir el descanso.',
    ejemploChat: {
      usuario: 'Son las 2:00 AM, tengo que madrugar y sigo dándole vueltas a lo que hice hoy.',
      ia: 'Tranquilo/a. Forzarte a dormir solo genera más alerta. Vamos a despejar tu mente con un escaneo corporal suave para que tu cuerpo empiece a soltar la tensión.',
    },
  },
  {
    id: 'duelo',
    emoji: '💔',
    label: 'Ruptura o duelo',
    titulo: 'Cuando una pérdida duele tanto que no sabes cómo seguir',
    descripcion: 'Sanar no es olvidar; es aprender a procesar el vacío paso a paso y con compasión hacia ti.',
    tecnica: 'Terapia de Aceptación y Compromiso (ACT) para abrazar el proceso sin perder tu rumbo.',
    ejemploChat: {
      usuario: 'Terminé una relación de años y siento que mi vida perdió el sentido por completo.',
      ia: 'El duelo por una relación duele profundamente en el cuerpo y en la rutina. Es completamente normal sentirte desorientado/a hoy. Cuéntame, ¿qué es lo que más te pesa en este momento?',
    },
  },
];

export default function ChequeoEmocionalInteractivo() {
  const [seleccionado, setSeleccionado] = useState<Emocion>(EMOCIONES[0]);

  return (
    <div className="bg-[#0b1610] border border-teal-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full">
            Prueba rápida interactiva
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-3">
            ¿Qué es lo que más te está pesando hoy?
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Haz clic en una opción para ver cómo MenteBridge te ayuda en tiempo real:
          </p>
        </div>

        {/* Emotion Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {EMOCIONES.map((emo) => {
            const activo = seleccionado.id === emo.id;
            return (
              <button
                key={emo.id}
                onClick={() => setSeleccionado(emo)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activo
                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25 scale-[1.02]'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/8 hover:border-white/15'
                }`}
              >
                <span>{emo.emoji}</span>
                <span>{emo.label}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Preview Card */}
        <div className="grid md:grid-cols-2 gap-6 items-center bg-[#070e0a] border border-white/8 rounded-2xl p-5 sm:p-6">
          {/* Left: Psychological explanation & technique */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{seleccionado.emoji}</span>
              <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                {seleccionado.titulo}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4">
              {seleccionado.descripcion}
            </p>

            <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3.5 mb-5">
              <p className="text-xs font-bold text-teal-300 mb-1">💡 Herramienta aplicada:</p>
              <p className="text-xs text-gray-300 leading-relaxed">{seleccionado.tecnica}</p>
            </div>

            <Link
              href="/registro"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02]"
            >
              Hablar sobre esto ahora — Gratis →
            </Link>
          </div>

          {/* Right: Simulated chat box */}
          <div className="bg-[#0d1a12] border border-white/10 rounded-xl p-4 space-y-3 shadow-inner">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-[11px] font-bold text-gray-300">Respuesta de tu Acompañante IA</span>
              </div>
              <span className="text-[10px] text-gray-500">24/7 Confidencial</span>
            </div>

            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-teal-500/20 border border-teal-500/30 rounded-2xl rounded-tr-none px-3.5 py-2 max-w-[85%]">
                <p className="text-xs text-gray-200 leading-relaxed">{seleccionado.ejemploChat.usuario}</p>
              </div>
            </div>

            {/* AI message */}
            <div className="flex justify-start gap-2">
              <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-xs flex-shrink-0 mt-1">
                🤖
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-3.5 py-2.5 max-w-[88%]">
                <p className="text-xs text-gray-300 leading-relaxed">{seleccionado.ejemploChat.ia}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
