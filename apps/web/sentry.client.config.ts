// Sentry cliente — carga condicional: no falla si @sentry/nextjs no está instalado
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Sentry = require('@sentry/nextjs');

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_APP_ENV ?? 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.5,
    integrations: [
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
    ],
    beforeSend(event: { request?: { data?: unknown }; extra?: Record<string, unknown> }) {
      if (event.request?.data) event.request.data = '[SCRUBBED - datos clínicos]';
      if (event.extra) {
        delete event.extra.mensaje;
        delete event.extra.contenido;
        delete event.extra.historial;
      }
      return event;
    },
  });
} catch {
  // @sentry/nextjs no instalado — monitoreo deshabilitado
}
