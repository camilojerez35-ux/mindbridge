import type { Metadata } from 'next';
import { VERSIONES_DOCUMENTOS } from '@/lib/legal/versiones';

export const metadata: Metadata = {
  title: 'Términos de Uso — MindBridge Colombia',
  description: 'Términos y condiciones de uso de la plataforma MindBridge Colombia.',
};

export default function TerminosUsoPage() {
  return (
    <main className="max-w-3xl mx-auto px-5 py-16">
      <h1 className="text-3xl font-black text-white mb-2">Términos y Condiciones de Uso</h1>
      <p className="text-sm text-gray-500 mb-10">
        Versión {VERSIONES_DOCUMENTOS.TERMINOS_USO} · Última actualización: 1 de enero de 2026
      </p>

      <div className="space-y-8 text-sm text-gray-300 leading-relaxed">

        <Seccion titulo="1. Descripción del Servicio">
          <p>
            MindBridge Colombia ofrece una plataforma digital de acompañamiento emocional que combina inteligencia artificial
            con psicólogos certificados.{' '}
            <strong className="text-white">El servicio NO constituye psicoterapia, diagnóstico clínico ni tratamiento médico.</strong>{' '}
            Es un complemento de apoyo emocional y bienestar mental.
          </p>
          <div className="p-3.5 bg-amber-500/5 border border-amber-500/15 rounded-xl mt-3">
            <p className="text-amber-300 font-semibold text-xs mb-1">⚠️ En caso de emergencia</p>
            <p className="text-xs text-gray-400">
              En situaciones de riesgo para la vida, llame al{' '}
              <a href="tel:123" className="text-red-400 font-bold hover:underline">123</a> (emergencias) o la{' '}
              <a href="tel:106" className="text-teal-400 font-bold hover:underline">Línea 106</a> (salud mental, gratuita 24h).
              MindBridge cuenta con protocolos de detección de crisis, pero no sustituye la intervención profesional inmediata.
            </p>
          </div>
        </Seccion>

        <Seccion titulo="2. Elegibilidad">
          <p>
            El servicio está disponible para personas mayores de <strong className="text-white">18 años</strong> residentes en Colombia.
            Los menores de edad requieren autorización expresa y verificable del padre, madre o tutor legal.
          </p>
        </Seccion>

        <Seccion titulo="3. Limitaciones de la IA">
          <p>
            La inteligencia artificial de MindBridge aplica técnicas basadas en evidencia (TCC, ACT, mindfulness) para brindar
            apoyo emocional, pero puede cometer errores.{' '}
            <strong className="text-white">No reemplaza el diagnóstico ni el tratamiento de un profesional de salud mental.</strong>
          </p>
        </Seccion>

        <Seccion titulo="4. Planes y Pagos">
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Los pagos se procesan a través de <strong className="text-white">Wompi Colombia</strong>, pasarela autorizada por el Banco de la República</li>
            <li>Los precios están en Pesos Colombianos (COP) e incluyen IVA cuando aplique</li>
            <li>Las suscripciones se renuevan automáticamente cada mes hasta ser canceladas</li>
            <li>Puede cancelar en cualquier momento desde Configuración → Suscripción, sin penalizaciones</li>
            <li>Reembolsos disponibles dentro de los 7 días calendario si no se han consumido sesiones</li>
            <li>Las citas con psicólogos canceladas con menos de 24 horas de anticipación no son reembolsables</li>
            <li>MindBridge se reserva el derecho de modificar precios con 30 días de aviso previo por email</li>
          </ul>
        </Seccion>

        <Seccion titulo="5. Conducta del Usuario">
          <p>Está prohibido usar la Plataforma para:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Suplantar la identidad de otras personas o profesionales de salud mental</li>
            <li>Intentar extraer o reproducir los prompts o modelos de IA</li>
            <li>Usar el servicio con fines comerciales no autorizados o revender el acceso</li>
            <li>Enviar contenido que promueva violencia, discriminación o actividades ilegales</li>
            <li>Intentar acceder sin autorización a sistemas o datos de otros usuarios</li>
          </ul>
        </Seccion>

        <Seccion titulo="6. Psicólogos de la Plataforma">
          <p>
            Todos los psicólogos deben acreditar tarjeta profesional vigente ante el{' '}
            <strong className="text-white">COLPSIC (Colegio Colombiano de Psicólogos)</strong>.
            MindBridge actúa como intermediario tecnológico; la responsabilidad clínica recae en el profesional tratante.
          </p>
        </Seccion>

        <Seccion titulo="7. Propiedad Intelectual">
          <p>
            El contenido, protocolos clínicos y software de MindBridge son propiedad exclusiva de MindBridge Colombia S.A.S.
            El usuario conserva la propiedad de los datos que comparte en la plataforma.
          </p>
        </Seccion>

        <Seccion titulo="8. Limitación de Responsabilidad">
          <p>
            MindBridge no será responsable por daños indirectos, incidentales o consecuentes derivados del uso de la Plataforma.
            La responsabilidad total no excederá el valor pagado por el usuario en los últimos 3 meses.
          </p>
        </Seccion>

        <Seccion titulo="9. Modificaciones">
          <p>
            MindBridge puede modificar estos Términos en cualquier momento. Los cambios materiales serán notificados
            por email con al menos <strong className="text-white">15 días de anticipación</strong>.
            El uso continuado implica aceptación de los nuevos términos.
          </p>
        </Seccion>

        <Seccion titulo="10. Ley Aplicable">
          <p>
            Estos Términos se rigen por las leyes de la República de Colombia. Cualquier disputa se someterá
            a los tribunales competentes de <strong className="text-white">Bogotá D.C.</strong>
          </p>
        </Seccion>

        <Seccion titulo="11. Contacto">
          <p>
            <a href="mailto:legal@mindbridge.co" className="text-teal-400 hover:underline">legal@mindbridge.co</a>
            {' '}· MindBridge Colombia S.A.S. · Bogotá D.C., Colombia
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
