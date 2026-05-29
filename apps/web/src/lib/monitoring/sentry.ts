/**
 * Stub de monitoreo para MindBridge.
 * Reemplazar con @sentry/nextjs cuando se configure el DSN en producción.
 * Mantiene la misma interfaz para no cambiar los call-sites.
 */

async function alertarSlack(mensaje: string): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_CRISIS;
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: mensaje }),
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    // No propagar — el alerting no debe romper el flujo clínico
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
  if (meta.nivel === 'critico' || meta.nivel === 'alto') {
    const emoji = meta.nivel === 'critico' ? '🚨' : '⚠️';
    alertarSlack(
      `${emoji} *Crisis ${meta.nivel.toUpperCase()}* detectada en MindBridge\n` +
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
  console.error(`[API Error] ${meta.metodo} ${meta.ruta}`, error);
}

export function capturarErrorPersistencia(error: unknown, contexto: {
  operacion: string;
  usuarioId?: string;
  sesionId?: string;
}): void {
  console.error(`[DB Error] ${contexto.operacion}`, error);
}

export function capturarErrorEmail(error: unknown, tipo: string): void {
  console.error(`[Email Error] ${tipo}`, error);
}

export function iniciarSpanClaude(_modelo: string) {
  return { end: () => {} };
}
