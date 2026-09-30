import type { Metadata } from 'next';
import { VERSIONES_DOCUMENTOS } from '@/lib/legal/versiones';

export const metadata: Metadata = {
  title: 'Aviso sobre Uso de IA — MenteBridge Colombia',
  description: 'Información sobre el uso de inteligencia artificial en MenteBridge, conforme a la Resolución 2654/2019 y Ley 2460/2025.',
};

export default function AvisoIAPage() {
  return (
    <main className="max-w-3xl mx-auto px-5 py-16 text-sm text-gray-300 leading-relaxed">
      <h1 className="text-3xl font-black text-white mb-2">Aviso sobre el Uso de Inteligencia Artificial</h1>
      <p className="text-ink-subtle mb-8">Versión {VERSIONES_DOCUMENTOS.AVISO_IA} — Resolución 2654/2019 · Ley 2460/2025</p>

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-8">
        <p className="font-semibold text-amber-300">Aviso importante</p>
        <p className="text-amber-100/90 mt-1">
          La inteligencia artificial de MenteBridge <strong className="text-white">no es un médico, psicólogo ni terapeuta.</strong>{' '}
          No puede diagnosticar enfermedades mentales ni prescribir tratamientos. En caso de emergencia,
          llama al <a href="tel:123" className="font-bold text-red-400 underline underline-offset-2">123</a> (emergencias)
          o a la <a href="tel:106" className="font-bold text-teal-300 underline underline-offset-2">Línea 106</a> (salud mental, nacional, gratuita 24h).
        </p>
      </div>

      <section className="mb-6">
        <h2 className="font-bold text-base text-white mb-2">¿Qué IA usamos?</h2>
        <p>
          MenteBridge utiliza <strong className="text-white">Claude</strong>, un modelo de lenguaje desarrollado por Anthropic, Inc. (EE.UU.).
          Este modelo ha sido configurado con protocolos clínicos validados por psicólogos colombianos
          especializados en salud mental.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-bold text-base text-white mb-2">Qué puede hacer la IA</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li>Ofrecer acompañamiento emocional y escucha activa.</li>
          <li>Enseñar técnicas de regulación emocional (respiración, grounding, mindfulness).</li>
          <li>Aplicar ejercicios de Terapia Cognitivo-Conductual (TCC) y ACT.</li>
          <li>Detectar señales de crisis y activar protocolos de emergencia.</li>
          <li>Sugerir cuándo es recomendable consultar con un psicólogo.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-bold text-base text-white mb-2">Qué NO puede hacer la IA</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li><strong className="text-white">Diagnosticar</strong> trastornos mentales (depresión, ansiedad, etc.).</li>
          <li><strong className="text-white">Prescribir</strong> medicamentos ni recomendar dosis.</li>
          <li><strong className="text-white">Reemplazar</strong> la psicoterapia profesional.</li>
          <li><strong className="text-white">Garantizar</strong> resultados clínicos.</li>
          <li>Responder por errores derivados de información incompleta o imprecisa proporcionada por el usuario.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-bold text-base text-white mb-2">Supervisión Humana</h2>
        <p>
          Conforme a la <strong className="text-white">Resolución 2654 de 2019</strong> del Ministerio de Salud, todos los procesos de
          IA clínica en MenteBridge están supervisados por psicólogos certificados. Los psicólogos de la plataforma
          pueden revisar resúmenes de sesión con tu consentimiento previo para garantizar la calidad del servicio.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-bold text-base text-white mb-2">Tus Derechos frente a la IA (Ley 2460/2025)</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li><strong className="text-white">Derecho a saber:</strong> siempre sabrás que estás interactuando con una IA, no con un humano.</li>
          <li><strong className="text-white">Derecho a la revisión humana:</strong> puedes solicitar que un psicólogo revise cualquier respuesta de la IA.</li>
          <li><strong className="text-white">Derecho a no ser evaluado solo por IA:</strong> las decisiones clínicas relevantes siempre involucran un profesional.</li>
          <li><strong className="text-white">Derecho a revocar:</strong> puedes desactivar el uso de IA en tu cuenta en cualquier momento desde Configuración.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-bold text-base text-white mb-2">Preguntas o Reclamos</h2>
        <p>
          <a href="mailto:ia@mentebridge.com" className="text-teal-400 underline underline-offset-2">ia@mentebridge.com</a>
        </p>
      </section>
    </main>
  );
}
