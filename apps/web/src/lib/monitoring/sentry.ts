import * as Sentry from '@sentry/nextjs';

const REINTENTOS_SLACK = 3;

async function alertarSlack(mensaje: string): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_CRISIS;
  if (!url) return;

  for (let intento = 1; intento <= REINTENTOS_SLACK; intento++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: mensaje }),
        signal: AbortSignal.timeout(5_000),
      });
      if (res.ok) return;
      throw new Error(`Slack respondió ${res.status}`);
    } catch (error) {
      if (intento === REINTENTOS_SLACK) {
        // Se agotaron los reintentos — que quede registrado en Sentry, no en silencio
        Sentry.captureException(error, { tags: { alertChannel: 'slack-crisis' } });
        return;
      }
      await new Promise((r) => setTimeout(r, intento * 500));
    }
  }
}

export type NivelCrisis = 'ninguno' | 'bajo' | 'moderado' | 'alto' | 'critico';

interface CrisisEventMeta {
  nivel: NivelCrisis;
  usuarioId: string;
  sesionId?: string;
  cantidadIndicadores: number;
  escaloAPsicologo: boolean;
}

interface ApiErrorMeta {
  ruta: string;
  metodo: string;
  statusCode?: number;
  usuarioId?: string;
}

export function capturarEventoCrisis(meta: CrisisEventMeta): void {
  Sentry.captureMessage(`Crisis ${meta.nivel}`, {
    level: meta.nivel === 'critico' ? 'fatal' : meta.nivel === 'alto' ? 'error' : 'warning',
    tags: { nivel: meta.nivel, escaloAPsicologo: String(meta.escaloAPsicologo) },
    extra: {
      usuarioId: meta.usuarioId,
      sesionId: meta.sesionId,
      cantidadIndicadores: meta.cantidadIndicadores,
    },
  });

  if (meta.nivel === 'critico' || meta.nivel === 'alto') {
    const emoji = meta.nivel === 'critico' ? '🚨' : '⚠️';
    alertarSlack(
      `${emoji} *Crisis ${meta.nivel.toUpperCase()}* detectada en MenteBridge\n` +
      `• Indicadores: ${meta.cantidadIndicadores}\n` +
      `• Escaló a psicólogo: ${meta.escaloAPsicologo ? 'Sí' : 'No'}\n` +
      `• Sesión: \`${meta.sesionId ?? 'desconocida'}\``
    ).catch(() => {});
  }
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[Crisis ${meta.nivel}]`, meta);
  }
}

export function capturarErrorApi(error: unknown, meta: ApiErrorMeta): void {
  Sentry.captureException(error, {
    tags: { ruta: meta.ruta, metodo: meta.metodo, statusCode: meta.statusCode },
    extra: { usuarioId: meta.usuarioId },
  });
  console.error(`[API Error] ${meta.metodo} ${meta.ruta}`, error);
}

export function capturarErrorPersistencia(error: unknown, contexto: {
  operacion: string;
  usuarioId?: string;
  sesionId?: string;
}): void {
  Sentry.captureException(error, {
    tags: { operacion: contexto.operacion },
    extra: { usuarioId: contexto.usuarioId, sesionId: contexto.sesionId },
  });
  console.error(`[DB Error] ${contexto.operacion}`, error);
}

export function capturarErrorEmail(error: unknown, tipo: string): void {
  Sentry.captureException(error, { tags: { tipo } });
  console.error(`[Email Error] ${tipo}`, error);
}

export function iniciarSpanClaude(_modelo: string) {
  return { end: () => {} };
}
