'use client';

import { useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Brain, Shield, AlertCircle } from 'lucide-react';

function ConsentimientoForm() {
  const { update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';

  const [checks, setChecks] = useState({ privacidad: false, ia: false, marketing: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const toggle = (k: keyof typeof checks) => setChecks(p => ({ ...p, [k]: !p[k] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!checks.privacidad) errs.privacidad = 'Requerido para continuar (Ley 1581/2012)';
    if (!checks.ia) errs.ia = 'Requerido para continuar (Resolución 2654/2019)';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/usuarios/consentimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aceptaPrivacidad: checks.privacidad,
          aceptaIA: checks.ia,
          aceptaMarketing: checks.marketing,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors({ general: data.error ?? 'Error al guardar. Intenta de nuevo.' });
        return;
      }

      await update();
      router.push(callbackUrl);
    } catch {
      setErrors({ general: 'Error de conexión. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1a12] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
              MindBridge
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Tu privacidad, primero</h1>
          <p className="text-gray-400 text-sm">
            MindBridge trata datos sensibles de salud mental. La ley colombiana exige tu consentimiento explícito.
          </p>
        </div>

        {/* Legal notice */}
        <div className="mb-6 p-4 bg-teal-500/5 border border-teal-500/15 rounded-xl">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400 leading-relaxed">
              Tus conversaciones contienen información de salud protegida por la{' '}
              <strong className="text-teal-400">Ley 1581/2012</strong> y la{' '}
              <strong className="text-teal-400">Resolución 2654/2019</strong>.
              Necesitamos tu autorización expresa para tratarla.
            </p>
          </div>
        </div>

        {errors.general && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Privacidad */}
          <ConsentCheck
            id="privacidad"
            checked={checks.privacidad}
            onChange={() => toggle('privacidad')}
            error={errors.privacidad}
            required
          >
            Acepto la{' '}
            <Link href="/privacidad" target="_blank" className="text-teal-400 hover:underline">
              Política de Privacidad
            </Link>{' '}
            y los{' '}
            <Link href="/terminos" target="_blank" className="text-teal-400 hover:underline">
              Términos de Servicio
            </Link>
            , y autorizo el tratamiento de mis datos personales y de salud según la Ley 1581/2012.
          </ConsentCheck>

          {/* IA */}
          <ConsentCheck
            id="ia"
            checked={checks.ia}
            onChange={() => toggle('ia')}
            error={errors.ia}
            required
          >
            Autorizo el uso de Inteligencia Artificial para brindarme apoyo emocional. Entiendo que{' '}
            <strong className="text-gray-300">no sustituye atención profesional</strong> y que mis
            conversaciones son confidenciales (Resolución 2654/2019).
          </ConsentCheck>

          {/* Marketing — opcional */}
          <ConsentCheck
            id="marketing"
            checked={checks.marketing}
            onChange={() => toggle('marketing')}
          >
            Acepto recibir contenido educativo sobre salud mental por email{' '}
            <span className="text-gray-600">(opcional)</span>
          </ConsentCheck>

          <button
            type="submit"
            disabled={loading || !checks.privacidad || !checks.ia}
            className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
          >
            {loading ? 'Guardando...' : 'Aceptar y continuar →'}
          </button>
        </form>

        <p className="text-xs text-gray-600 text-center mt-6 leading-relaxed">
          Puedes retirar tu consentimiento en Configuración → Privacidad.
          <br />
          Crisis:{' '}
            <a href="tel:106" className="text-teal-600 font-bold hover:underline">106</a>
            {' · '}
            <a href="tel:8001225555" className="text-indigo-500 font-bold hover:underline">800-112-5555</a>
            {' · '}
            <a href="tel:123" className="text-red-500 font-bold hover:underline">123</a>
        </p>
      </div>
    </div>
  );
}

export default function ConsentimientoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0d1a12] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConsentimientoForm />
    </Suspense>
  );
}

function ConsentCheck({
  id, checked, onChange, error, required, children,
}: {
  id: string;
  checked: boolean;
  onChange: () => void;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className={`flex gap-3 items-start cursor-pointer p-4 rounded-xl border transition-all ${
          checked
            ? 'bg-teal-500/8 border-teal-500/25'
            : 'bg-white/3 border-white/10 hover:border-white/20'
        }`}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-teal-500 focus:ring-teal-500/50 flex-shrink-0"
          aria-required={required}
        />
        <span className="text-sm text-gray-400 leading-relaxed">
          {children}
          {required && <span className="text-red-400"> *</span>}
        </span>
      </label>
      {error && <p className="text-xs text-red-400 mt-1 ml-1">{error}</p>}
    </div>
  );
}
