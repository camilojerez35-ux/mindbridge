/**
 * PostHog Analytics — MenteBridge
 *
 * PRIVACIDAD: Nunca enviar contenido de mensajes, datos clínicos ni PII sensible.
 * Solo se trackean eventos de producto (navegación, features usadas, conversiones).
 */
import { PostHog } from 'posthog-node';

// ── Cliente servidor (Node.js API routes) ─────────────────────────

let _client: PostHog | null = null;

export function getPostHogServer(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  if (!_client) {
    _client = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
      flushAt: 1,   // Flush inmediato en serverless
      flushInterval: 0,
    });
  }
  return _client;
}

// ── Eventos de producto ───────────────────────────────────────────

export type EventoProducto =
  | 'usuario_registrado'
  | 'sesion_chat_iniciada'
  | 'mensaje_enviado'
  | 'crisis_detectada'
  | 'cita_agendada'
  | 'plan_upgrade'
  | 'psicologo_contactado'
  | 'email_verificado'
  | 'login_exitoso'
  | 'perfil_completado';

interface PropiedadesEvento {
  usuarioId: string;
  plan?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Captura un evento de producto desde el servidor.
 * Las propiedades no deben incluir datos clínicos.
 */
export function capturarEvento(
  evento: EventoProducto,
  props: PropiedadesEvento
): void {
  const ph = getPostHogServer();
  if (!ph) return;

  const { usuarioId, ...resto } = props;
  ph.capture({
    distinctId: usuarioId,
    event: evento,
    properties: {
      ...resto,
      $set_once: { primera_sesion: new Date().toISOString() },
    },
  });
}

/**
 * Identifica al usuario en PostHog con propiedades de plan (sin PII sensible).
 */
export function identificarUsuario(usuarioId: string, props: {
  plan: string;
  rol: string;
  createdAt?: string;
}): void {
  const ph = getPostHogServer();
  if (!ph) return;

  ph.identify({
    distinctId: usuarioId,
    properties: {
      plan: props.plan,
      rol: props.rol,
      created_at: props.createdAt,
    },
  });
}
