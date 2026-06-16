'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {

  return (
    <html lang="es">
      <body className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center p-8">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Algo salió mal
          </h1>
          <p className="text-gray-600 mb-6">
            Ocurrió un error inesperado. El equipo ha sido notificado automáticamente.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 mb-4 font-mono">
              ID: {error.digest}
            </p>
          )}
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Intentar de nuevo
            </button>
            <a
              href="/"
              className="block w-full text-teal-600 py-2 px-4 rounded-lg border border-teal-200 hover:bg-teal-50 transition-colors"
            >
              Volver al inicio
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            Si necesitas apoyo inmediato, llama a la{' '}
            <a href="tel:106" className="font-bold text-teal-600 hover:underline">Línea 106</a>
            {' '}(24 horas, gratuita) o al{' '}
            <a href="tel:123" className="font-bold text-red-500 hover:underline">123</a>
            {' '}(emergencias).
          </p>
        </div>
      </body>
    </html>
  );
}
