import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (!dsn && process.env.NODE_ENV === 'production') {
  console.error('[sentry] SENTRY_DSN no configurado — los errores no serán capturados en producción.');
}

Sentry.init({
  dsn,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  includeLocalVariables: false,
  ignoreErrors: ['NEXT_NOT_FOUND', 'NEXT_REDIRECT'],
  beforeSend(event) {
    if (event.request?.data) event.request.data = '[SCRUBBED]';
    if (event.request?.cookies) event.request.cookies = {};
    if (event.extra) {
      delete event.extra.mensaje;
      delete event.extra.contenido;
      delete event.extra.motivoConsulta;
      delete event.extra.condicionesPrevias;
      delete event.extra.medicamentos;
      delete event.extra.fragmentoAnonimizado;
    }
    return event;
  },
});
