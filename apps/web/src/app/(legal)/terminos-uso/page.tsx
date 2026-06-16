import type { Metadata } from 'next';
import { VERSIONES_DOCUMENTOS } from '@/lib/legal/versiones';

export const metadata: Metadata = {
  title: 'Términos de Uso — MindBridge Colombia',
  description: 'Condiciones de uso de la plataforma MindBridge Colombia.',
};

export default function TerminosUsoPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-sm text-gray-800 leading-relaxed">
      <h1 className="text-2xl font-bold mb-2">Términos y Condiciones de Uso</h1>
      <p className="text-gray-500 mb-8">Versión {VERSIONES_DOCUMENTOS.TERMINOS_USO} — Vigente desde la fecha de lanzamiento</p>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">1. Descripción del Servicio</h2>
        <p>
          MindBridge Colombia ofrece una plataforma digital de acompañamiento emocional que combina inteligencia artificial
          con psicólogos certificados. <strong>El servicio NO constituye psicoterapia, diagnóstico clínico ni tratamiento médico.</strong>{' '}
          Es un complemento de apoyo emocional y bienestar mental.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">2. Elegibilidad</h2>
        <p>
          El servicio está disponible para personas mayores de 18 años residentes en Colombia. Los menores de edad
          requieren autorización expresa del padre, madre o tutor legal.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">3. Limitaciones de la IA</h2>
        <p>
          La inteligencia artificial de MindBridge puede cometer errores. <strong>En situaciones de crisis, emergencia o
          riesgo para la vida, llama al{' '}
          <a href="tel:123" style={{ color: '#dc2626' }}>123</a> (emergencias) o la{' '}
          <a href="tel:106" style={{ color: '#0d9488' }}>Línea 106</a> (salud mental, gratuita 24h).</strong> La plataforma
          cuenta con protocolos de detección de crisis, pero no sustituye la intervención profesional inmediata.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">4. Planes y Pagos</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li>Los pagos se procesan a través de Wompi Colombia, una pasarela de pagos regulada.</li>
          <li>Los planes de suscripción se cobran de forma anticipada (mensual o anual).</li>
          <li>Los reembolsos aplican dentro de los 7 días calendario siguientes a la contratación si no se han consumido sesiones.</li>
          <li>Las citas con psicólogos canceladas con menos de 24 horas de anticipación no son reembolsables.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">5. Conducta del Usuario</h2>
        <p>Queda prohibido usar la plataforma para:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Intentar extraer o reproducir los prompts o modelos de IA.</li>
          <li>Suplantar a profesionales de salud mental.</li>
          <li>Usar el servicio con fines comerciales no autorizados.</li>
          <li>Compartir información que ponga en riesgo a terceros.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">6. Psicólogos de la Plataforma</h2>
        <p>
          Todos los psicólogos deben acreditar tarjeta profesional vigente ante el COLPSIC. MindBridge actúa como
          intermediario tecnológico; la responsabilidad clínica recae en el profesional tratante.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">7. Propiedad Intelectual</h2>
        <p>
          El contenido, protocolos clínicos y software de MindBridge son propiedad exclusiva de MindBridge Colombia S.A.S.
          El usuario conserva la propiedad de los datos que comparte.
        </p>
      </section>

      <section>
        <h2 className="font-semibold text-base mb-2">8. Contacto</h2>
        <p>
          Para consultas sobre estos términos:{' '}
          <a href="mailto:legal@mindbridge.co" className="text-blue-600 underline">legal@mindbridge.co</a>
        </p>
      </section>
    </main>
  );
}
