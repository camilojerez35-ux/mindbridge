import type { Metadata } from 'next';
import { VERSIONES_DOCUMENTOS } from '@/lib/legal/versiones';

export const metadata: Metadata = {
  title: 'Política de Privacidad — MindBridge Colombia',
  description: 'Tratamiento de datos personales conforme a la Ley 1581 de 2012 y sus decretos reglamentarios.',
};

export default function PoliticaPrivacidadPage() {
  return (
    <main className="max-w-3xl mx-auto px-5 py-16">
      <h1 className="text-3xl font-black text-white mb-2">Política de Privacidad</h1>
      <p className="text-sm text-gray-500 mb-3">
        Versión {VERSIONES_DOCUMENTOS.POLITICA_PRIVACIDAD} · Última actualización: 1 de enero de 2026
      </p>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-lg mb-10">
        <span className="text-xs text-teal-400 font-semibold">🔒 Ley 1581/2012 · Resolución 2654/2019 · Ley 2460/2025</span>
      </div>

      <div className="space-y-8 text-sm text-gray-300 leading-relaxed">

        <Seccion titulo="1. Responsable del Tratamiento">
          <p>
            <strong className="text-white">MindBridge Colombia S.A.S.</strong><br />
            Domicilio: Bogotá D.C., Colombia<br />
            Correo de contacto:{' '}
            <a href="mailto:privacidad@mindbridge.co" className="text-teal-400 hover:underline">privacidad@mindbridge.co</a>
          </p>
        </Seccion>

        <Seccion titulo="2. Marco Legal">
          <p>
            Esta política se rige por la <strong className="text-white">Ley 1581 de 2012</strong>, el Decreto 1074 de 2015, la{' '}
            <strong className="text-white">Resolución 2654 de 2019</strong> (Ministerio de Salud — Telesalud e IA clínica) y la{' '}
            <strong className="text-white">Ley 2460 de 2025</strong> (Inteligencia Artificial en Colombia).
          </p>
        </Seccion>

        <Seccion titulo="3. Datos que Recopilamos">
          <div className="space-y-3">
            <Bloque titulo="Datos de identificación">
              Nombre, apellido, correo electrónico, ciudad de residencia, fecha de nacimiento.
            </Bloque>
            <Bloque titulo="Datos sensibles de salud mental (art. 5 Ley 1581/2012)" resaltado>
              Conversaciones con la IA, registros de ánimo, entradas del diario emocional, notas de sesiones con psicólogos.
              Tratados con cifrado <strong className="text-white">AES-256-GCM</strong>. Solo el titular puede acceder a ellos.
            </Bloque>
            <Bloque titulo="Datos de uso">
              Dirección IP (anonimizada a los 30 días), agente de usuario, marcas de tiempo de sesión, páginas visitadas.
            </Bloque>
            <Bloque titulo="Datos de pago">
              Referencia de transacción y plan activo. MindBridge <strong className="text-white">no almacena</strong> datos de tarjetas —
              procesados exclusivamente por Wompi Colombia.
            </Bloque>
          </div>
        </Seccion>

        <Seccion titulo="4. Finalidades del Tratamiento">
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Prestación del servicio de acompañamiento emocional con IA (base: ejecución de contrato)</li>
            <li>Detección de crisis de salud mental y activación de protocolos de emergencia (base: interés vital)</li>
            <li>Coordinación de citas con psicólogos certificados por COLPSIC (base: ejecución de contrato)</li>
            <li>Análisis clínico agregado y anonimizado para mejora del servicio (base: interés legítimo)</li>
            <li>Mejora de modelos de IA con datos anonimizados (base: consentimiento expreso)</li>
            <li>Envío de comunicaciones del servicio (base: ejecución de contrato)</li>
            <li>Envío de contenido educativo, solo si fue autorizado (base: consentimiento)</li>
            <li>Cumplimiento de obligaciones legales y tributarias (base: obligación legal)</li>
          </ul>
        </Seccion>

        <Seccion titulo="5. Uso de Inteligencia Artificial">
          <p>
            MindBridge utiliza modelos de lenguaje (Claude de Anthropic) para el acompañamiento emocional.{' '}
            <strong className="text-white">La IA no reemplaza la psicoterapia ni el diagnóstico clínico.</strong>{' '}
            Los psicólogos de la plataforma pueden acceder a resúmenes de sesión únicamente con tu consentimiento explícito previo.
            Las conversaciones se procesan bajo los acuerdos de procesamiento de datos de Anthropic, Inc.
          </p>
        </Seccion>

        <Seccion titulo="6. Compartición de Datos">
          <p className="mb-3">Solo compartimos datos con:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-white">Psicólogos de la plataforma:</strong> datos necesarios para prestar el servicio</li>
            <li><strong className="text-white">Anthropic (Claude API):</strong> contenido de chat para generar respuestas de IA</li>
            <li><strong className="text-white">Wompi:</strong> datos de transacción para procesar pagos</li>
            <li><strong className="text-white">Resend:</strong> correo para notificaciones del servicio</li>
            <li><strong className="text-white">Neon:</strong> almacenamiento cifrado de datos</li>
            <li><strong className="text-white">PostHog:</strong> analytics (solo con consentimiento)</li>
          </ul>
          <p className="mt-3 text-amber-400 font-medium">Nunca vendemos datos personales a terceros con fines publicitarios.</p>
        </Seccion>

        <Seccion titulo="7. Derechos del Titular (Art. 8, Ley 1581/2012)">
          <p className="mb-3">
            Puedes ejercer los derechos de <strong className="text-white">Conocer, Actualizar, Rectificar, Suprimir, Revocar y presentar Quejas</strong>{' '}
            escribiendo a{' '}
            <a href="mailto:privacidad@mindbridge.co" className="text-teal-400 hover:underline">privacidad@mindbridge.co</a>.
            Tiempo de respuesta: <strong className="text-white">10 días hábiles</strong>.
          </p>
          <p>
            También puedes acudir a la <strong className="text-white">Superintendencia de Industria y Comercio (SIC)</strong>:{' '}
            <a href="https://www.sic.gov.co" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">www.sic.gov.co</a>
          </p>
        </Seccion>

        <Seccion titulo="8. Retención y Eliminación de Datos">
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Datos de salud: 5 años desde el último uso activo (historia clínica colombiana)</li>
            <li>Al solicitar eliminación: anonimizados en máximo 30 días</li>
            <li>Datos de transacciones: 10 años (obligación tributaria)</li>
            <li>Logs técnicos anonimizados: 90 días</li>
          </ul>
        </Seccion>

        <Seccion titulo="9. Transferencias Internacionales">
          <p>
            Los datos de conversación se transfieren a servidores de Anthropic Inc. y Neon Inc. (EE.UU.)
            bajo cláusulas contractuales tipo que garantizan niveles de protección equivalentes a la Ley 1581/2012.
          </p>
        </Seccion>

        <Seccion titulo="10. Seguridad">
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Cifrado AES-256-GCM para datos en reposo</li>
            <li>TLS 1.3 para datos en tránsito</li>
            <li>Autenticación de dos factores disponible</li>
            <li>Rate limiting y auditorías de seguridad periódicas</li>
          </ul>
        </Seccion>

        <Seccion titulo="11. Cambios a esta Política">
          <p>
            Notificaremos cambios materiales con al menos <strong className="text-white">15 días de anticipación</strong> por email.
            La versión vigente estará siempre en <strong className="text-white">mindbridge.co/politica-privacidad</strong>.
          </p>
        </Seccion>

      </div>
    </main>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold text-white mb-3">{titulo}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Bloque({ titulo, children, resaltado }: { titulo: string; children: React.ReactNode; resaltado?: boolean }) {
  return (
    <div className={`p-3.5 border rounded-xl ${resaltado ? 'bg-teal-500/5 border-teal-500/15' : 'bg-white/2 border-white/6'}`}>
      <p className={`font-semibold mb-1 text-xs ${resaltado ? 'text-teal-300' : 'text-gray-200'}`}>{titulo}</p>
      <p className="text-gray-400 text-xs leading-relaxed">{children}</p>
    </div>
  );
}
