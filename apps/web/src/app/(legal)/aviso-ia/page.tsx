import type { Metadata } from 'next';
import { VERSIONES_DOCUMENTOS } from '@/lib/legal/versiones';

export const metadata: Metadata = {
  title: 'Aviso sobre Uso de IA — MenteBridge Colombia',
  description: 'Información sobre el uso de inteligencia artificial en MenteBridge, conforme a la Resolución 2654/2019 y Ley 2460/2025.',
};

export default function AvisoIAPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-sm text-gray-800 leading-relaxed">
      <h1 className="text-2xl font-bold mb-2">Aviso sobre el Uso de Inteligencia Artificial</h1>
      <p className="text-gray-500 mb-8">Versión {VERSIONES_DOCUMENTOS.AVISO_IA} — Resolución 2654/2019 · Ley 2460/2025</p>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
        <p className="font-semibold text-amber-800">Aviso importante</p>
        <p className="text-amber-700 mt-1">
          La inteligencia artificial de MenteBridge <strong>no es un médico, psicólogo ni terapeuta.</strong>{' '}
          No puede diagnosticar enfermedades mentales ni prescribir tratamientos. En caso de emergencia,
          llama al <a href="tel:123" className="font-bold text-red-700 hover:underline">123</a> (emergencias)
          o a la <a href="tel:106" className="font-bold text-amber-700 hover:underline">Línea 106</a> (salud mental, gratuita 24h).
        </p>
      </div>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">¿Qué IA usamos?</h2>
        <p>
          MenteBridge utiliza <strong>Claude</strong>, un modelo de lenguaje desarrollado por Anthropic, Inc. (EE.UU.).
          Este modelo ha sido configurado con protocolos clínicos validados por psicólogos colombianos
          especializados en salud mental.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">Qué puede hacer la IA</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li>Ofrecer acompañamiento emocional y escucha activa.</li>
          <li>Enseñar técnicas de regulación emocional (respiración, grounding, mindfulness).</li>
          <li>Aplicar ejercicios de Terapia Cognitivo-Conductual (TCC) y ACT.</li>
          <li>Detectar señales de crisis y activar protocolos de emergencia.</li>
          <li>Sugerir cuándo es recomendable consultar con un psicólogo.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">Qué NO puede hacer la IA</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li><strong>Diagnosticar</strong> trastornos mentales (depresión, ansiedad, etc.).</li>
          <li><strong>Prescribir</strong> medicamentos ni recomendar dosis.</li>
          <li><strong>Reemplazar</strong> la psicoterapia profesional.</li>
          <li><strong>Garantizar</strong> resultados clínicos.</li>
          <li>Responder por errores derivados de información incompleta o imprecisa proporcionada por el usuario.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">Supervisión Humana</h2>
        <p>
          Conforme a la <strong>Resolución 2654 de 2019</strong> del Ministerio de Salud, todos los procesos de
          IA clínica en MenteBridge están supervisados por psicólogos certificados. Los psicólogos de la plataforma
          pueden revisar resúmenes de sesión con tu consentimiento previo para garantizar la calidad del servicio.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">Tus Derechos frente a la IA (Ley 2460/2025)</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li><strong>Derecho a saber:</strong> siempre sabrás que estás interactuando con una IA, no con un humano.</li>
          <li><strong>Derecho a la revisión humana:</strong> puedes solicitar que un psicólogo revise cualquier respuesta de la IA.</li>
          <li><strong>Derecho a no ser evaluado solo por IA:</strong> las decisiones clínicas relevantes siempre involucran un profesional.</li>
          <li><strong>Derecho a revocar:</strong> puedes desactivar el uso de IA en tu cuenta en cualquier momento desde Configuración.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-semibold text-base mb-2">Preguntas o Reclamos</h2>
        <p>
          <a href="mailto:ia@mentebridge.com" className="text-blue-600 underline">ia@mentebridge.com</a>
        </p>
      </section>
    </main>
  );
}
