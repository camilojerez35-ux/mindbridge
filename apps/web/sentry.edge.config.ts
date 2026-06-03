// Sentry edge — carga condicional: no falla si @sentry/nextjs no está instalado
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Sentry = require('@sentry/nextjs');

  Sentry.init({
    dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
    beforeSend(event: { request?: { data?: unknown } }) {
      if (event.request?.data) event.request.data = '[SCRUBBED]';
      return event;
    },
  });
} catch {
  // @sentry/nextjs no instalado — monitoreo deshabilitado
}
