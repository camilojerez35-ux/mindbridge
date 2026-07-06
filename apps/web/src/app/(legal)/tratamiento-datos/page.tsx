import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aviso de Privacidad y Tratamiento de Datos — MindBridge Colombia',
  description: 'Aviso de privacidad conforme a la Ley 1581 de 2012. Autorización para el tratamiento de datos personales y de salud.',
};

export default function TratamientoDatosPage() {
  return (
    <main className="max-w-3xl mx-auto px-5 py-16">
      <h1 className="text-3xl font-black text-white mb-2">
        Aviso de Privacidad y Autorización de Tratamiento de Datos
      </h1>
      <p className="text-sm text-gray-500 mb-3">
        Vigente desde: 1 de enero de 2026
      </p>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-lg mb-10">
        <span className="text-xs text-teal-400 font-semibold">⚖️ Ley 1581/2012 · Decreto 1377/2013 · Resolución 2654/2019</span>
      </div>

      <div className="space-y-8 text-sm text-gray-300 leading-relaxed">

        <Seccion titulo="Identificación del Responsable">
          <p>
            <strong className="text-white">MindBridge Colombia S.A.S.</strong><br />
            Domicilio: Bogotá D.C., Colombia<br />
            Correo:{' '}
            <a href="mailto:privacidad@mindbridge.co" className="text-teal-400 hover:underline">privacidad@mindbridge.co</a>
          </p>
        </Seccion>

        <Seccion titulo="Objeto del Aviso">
          <p>
            En cumplimiento del artículo 15 de la <strong className="text-white">Ley 1581 de 2012</strong> y el Decreto 1377 de 2013,
            MindBridge informa al titular sobre el tratamiento que dará a sus datos personales, incluyendo los datos
            sensibles de salud mental recopilados en el uso de la plataforma.
          </p>
        </Seccion>

        <Seccion titulo="Datos Objeto de Tratamiento">
          <div className="space-y-3">
            <div className="p-3.5 bg-white/2 border border-white/6 rounded-xl">
              <p className="font-semibold text-gray-200 text-xs mb-1">Datos generales</p>
              <p className="text-xs text-gray-400">Nombre, correo electrónico, fecha de nacimiento, ciudad de residencia, dirección IP anonimizada.</p>
            </div>
            <div className="p-3.5 bg-amber-500/5 border border-amber-500/15 rounded-xl">
              <p className="font-semibold text-amber-300 text-xs mb-1">⚠️ Datos sensibles de salud (art. 5 Ley 1581/2012)</p>
              <p className="text-xs text-gray-400">
                Conversaciones con la IA clínica, entradas del diario emocional, registros de estado de ánimo,
                historial de ejercicios, notas de sesiones psicológicas. Protegidos con cifrado AES-256-GCM.
              </p>
            </div>
            <div className="p-3.5 bg-white/2 border border-white/6 rounded-xl">
              <p className="font-semibold text-gray-200 text-xs mb-1">Datos de transacciones</p>
              <p className="text-xs text-gray-400">Referencias de pago y plan activo. No se almacenan datos de tarjetas.</p>
            </div>
          </div>
        </Seccion>

        <Seccion titulo="Finalidades del Tratamiento">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 pr-4 text-gray-400 font-semibold">Finalidad</th>
                  <th className="text-left py-2 text-gray-400 font-semibold">Base legal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ['Prestación del servicio de apoyo emocional con IA', 'Ejecución de contrato'],
                  ['Conexión con psicólogos para videocitas', 'Ejecución de contrato'],
                  ['Detección y respuesta ante crisis de salud mental', 'Interés vital'],
                  ['Análisis estadístico con datos anonimizados', 'Interés legítimo'],
                  ['Mejora de modelos de IA', 'Consentimiento expreso'],
                  ['Notificaciones del servicio', 'Ejecución de contrato'],
                  ['Contenido educativo (si fue autorizado)', 'Consentimiento'],
                  ['Obligaciones legales y tributarias', 'Obligación legal'],
                ].map(([fin, base]) => (
                  <tr key={fin}>
                    <td className="py-2.5 pr-4 text-gray-300">{fin}</td>
                    <td className="py-2.5 text-teal-400 whitespace-nowrap">{base}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Seccion>

        <Seccion titulo="Encargados del Tratamiento">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 pr-4 text-gray-400 font-semibold">Encargado</th>
                  <th className="text-left py-2 pr-4 text-gray-400 font-semibold">Finalidad</th>
                  <th className="text-left py-2 text-gray-400 font-semibold">País</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ['Anthropic (Claude API)', 'Respuestas de IA', 'EE.UU.'],
                  ['Supabase Inc.', 'Base de datos cifrada', 'EE.UU.'],
                  ['Resend Inc.', 'Envío de emails', 'EE.UU.'],
                  ['Wompi S.A.S.', 'Procesamiento de pagos', 'Colombia'],
                  ['Upstash Inc.', 'Rate limiting (Redis)', 'EE.UU.'],
                  ['PostHog Inc.', 'Analytics (con consentimiento)', 'EE.UU.'],
                ].map(([enc, fin, pais]) => (
                  <tr key={enc}>
                    <td className="py-2.5 pr-4 text-gray-300 font-medium">{enc}</td>
                    <td className="py-2.5 pr-4 text-gray-400">{fin}</td>
                    <td className="py-2.5 text-gray-500">{pais}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Las transferencias a EE.UU. se realizan bajo cláusulas contractuales que garantizan protección equivalente a la Ley 1581/2012.
          </p>
        </Seccion>

        <Seccion titulo="Derechos del Titular (Art. 8 Ley 1581/2012)">
          <ul className="grid sm:grid-cols-2 gap-2">
            {[
              ['📋', 'Conocer', 'Acceder a sus datos personales'],
              ['✏️', 'Actualizar', 'Corregir datos inexactos'],
              ['🗑️', 'Suprimir', 'Eliminar datos innecesarios'],
              ['↩️', 'Revocar', 'Retirar el consentimiento'],
              ['📤', 'Portabilidad', 'Recibir sus datos (JSON/CSV)'],
              ['🏛️', 'Quejarse', 'Ante la SIC si no hay respuesta'],
            ].map(([icon, titulo, desc]) => (
              <li key={titulo} className="flex items-start gap-2.5 p-3 bg-white/2 border border-white/5 rounded-lg list-none">
                <span className="text-base flex-shrink-0">{icon}</span>
                <div>
                  <p className="font-semibold text-white text-xs">{titulo}</p>
                  <p className="text-gray-500 text-xs">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4">
            Para ejercer sus derechos:{' '}
            <a href="mailto:privacidad@mindbridge.co" className="text-teal-400 hover:underline">privacidad@mindbridge.co</a>
            {' '}— Respondemos en máximo <strong className="text-white">10 días hábiles</strong>.
          </p>
        </Seccion>

        <Seccion titulo="Autoridad de Control">
          <p>
            <strong className="text-white">Superintendencia de Industria y Comercio (SIC)</strong><br />
            🌐{' '}<a href="https://www.sic.gov.co" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">www.sic.gov.co</a>
            {' '}· 📞{' '}<a href="tel:6017920777" className="text-teal-400 hover:underline">601 792 0777</a>
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
