import type { Metadata } from 'next';
import { VERSIONES_DOCUMENTOS } from '@/lib/legal/versiones';

export const metadata: Metadata = {
  title: 'Política de Privacidad — MindBridge Colombia',
  description: 'Tratamiento de datos personales conforme a la Ley 1581 de 2012 y sus decretos reglamentarios.',
};

export default function PoliticaPrivacidadPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-sm text-gray-800 leading-relaxed">
      <h1 className="text-2xl font-bold mb-2">Política de Privacidad y Tratamiento de Datos Personales</h1>
      <p className="text-gray-500 mb-8">Versión {VERSIONES_DOCUMENTOS.POLITICA_PRIVACIDAD} — Vigente desde la fecha de lanzamiento</p>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">1. Responsable del Tratamiento</h2>
        <p>
          <strong>MindBridge Colombia S.A.S.</strong><br />
          NIT: <span className="text-amber-600 font-medium">[PENDIENTE — completar antes del lanzamiento]</span><br />
          Domicilio: <span className="text-amber-600 font-medium">[PENDIENTE — completar antes del lanzamiento]</span>, Colombia<br />
          Correo de contacto: <a href="mailto:privacidad@mindbridge.co" className="text-blue-600 underline">privacidad@mindbridge.co</a>
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">2. Marco Legal</h2>
        <p>
          Esta política se rige por la <strong>Ley 1581 de 2012</strong>, el Decreto 1074 de 2015, la{' '}
          <strong>Resolución 2654 de 2019</strong> (Ministerio de Salud — Telesalud e IA clínica) y la{' '}
          <strong>Ley 2460 de 2025</strong> (Inteligencia Artificial en Colombia).
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">3. Datos que Recopilamos</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li><strong>Datos de identificación:</strong> nombre, apellido, correo electrónico.</li>
          <li><strong>Datos sensibles de salud mental:</strong> conversaciones con la IA, registros de ánimo, entradas de diario emocional. Tratados con cifrado AES-256-GCM.</li>
          <li><strong>Datos de uso:</strong> dirección IP (anonimizada), agente de usuario, marcas de tiempo de sesión.</li>
          <li><strong>Datos de pago:</strong> procesados exclusivamente por Wompi Colombia — MindBridge no almacena datos de tarjetas.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">4. Finalidades del Tratamiento</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li>Prestación del servicio de acompañamiento emocional con IA.</li>
          <li>Detección de crisis de salud mental y activación de protocolos de emergencia.</li>
          <li>Coordinación de citas con psicólogos registrados ante el COLPSIC.</li>
          <li>Análisis clínico agregado y anonimizado para mejora del servicio (nunca a nivel individual).</li>
          <li>Cumplimiento de obligaciones legales y regulatorias.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">5. Uso de Inteligencia Artificial</h2>
        <p>
          MindBridge utiliza modelos de lenguaje (Claude de Anthropic) para el acompañamiento emocional.{' '}
          <strong>La IA no reemplaza la psicoterapia ni el diagnóstico clínico.</strong> Los psicólogos de la plataforma
          pueden acceder a resúmenes de sesión únicamente con tu consentimiento explícito previo.
          Las conversaciones se procesan bajo los acuerdos de procesamiento de datos de Anthropic, Inc.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">6. Derechos del Titular (Art. 8, Ley 1581/2012)</h2>
        <p className="mb-2">Puedes ejercer los derechos de <strong>Conocer, Actualizar, Rectificar, Suprimir, Revocar y presentar Quejas</strong> escribiendo a:</p>
        <p>
          <a href="mailto:privacidad@mindbridge.co" className="text-blue-600 underline">privacidad@mindbridge.co</a><br />
          Tiempo de respuesta: 15 días hábiles (prorrogables 8 días adicionales con aviso previo).
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">7. Retención y Eliminación de Datos</h2>
        <p>
          Los datos de salud se conservan por <strong>5 años</strong> contados desde el último uso activo de la cuenta,
          conforme a los estándares de historia clínica colombiana. Al solicitar eliminación, los datos se
          anonimizarán en un plazo máximo de 30 días.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">8. Transferencias Internacionales</h2>
        <p>
          Los datos de conversación se transfieren a servidores de Anthropic, Inc. (EE.UU.) bajo cláusulas
          contractuales tipo que garantizan niveles de protección equivalentes a la Ley 1581/2012.
        </p>
      </section>

      <section>
        <h2 className="font-semibold text-base mb-2">9. Contacto y Autoridad de Control</h2>
        <p>
          Para ejercer tus derechos o presentar reclamaciones:{' '}
          <a href="mailto:privacidad@mindbridge.co" className="text-blue-600 underline">privacidad@mindbridge.co</a><br />
          Si no obtienes respuesta satisfactoria, puedes acudir a la{' '}
          <strong>Superintendencia de Industria y Comercio (SIC)</strong>:{' '}
          <a href="https://www.sic.gov.co" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">www.sic.gov.co</a>
        </p>
      </section>
    </main>
  );
}
