'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Ocurrió un error en esta sección
      </h2>
      <p className="text-gray-500 mb-6 max-w-sm">
        El problema fue registrado automáticamente. Puedes intentar recargar la página.
      </p>
      {error.digest && (
        <p className="text-xs text-gray-400 mb-4 font-mono">ID: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-teal-600 text-white py-2 px-5 rounded-lg hover:bg-teal-700 transition-colors text-sm"
        >
          Reintentar
        </button>
        <a
          href="/dashboard"
          className="text-teal-600 py-2 px-5 rounded-lg border border-teal-200 hover:bg-teal-50 transition-colors text-sm"
        >
          Ir al inicio
        </a>
      </div>
    </div>
  );
}
