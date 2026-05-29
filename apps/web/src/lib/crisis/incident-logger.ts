import {
  capturarErrorPersistencia,
  capturarEventoCrisis,
  type NivelCrisis,
} from '@/lib/monitoring/sentry';
import { encryption } from '@/lib/encryption';

export interface DatosIncidente {
  usuarioId: string;
  sesionId: string;
  nivel: string;
  indicadoresDetectados: string[];
  fragmentoAnonimizado: string;
  timestampDeteccion: Date;
  protocoloActivado: boolean;
  psicologoNotificado: boolean;
}

const MAX_INTENTOS = 3;
const DELAY_BASE_MS = 200;

async function persistirIncidente(datos: DatosIncidente): Promise<void> {
  const { db } = await import('@/lib/db/client');
  // Cifrar fragmento antes de persistir — Ley 1581/2012 (dato sensible de salud)
  const datosCifrados = {
    ...datos,
    fragmentoAnonimizado: datos.fragmentoAnonimizado
      ? encryption.encrypt(datos.fragmentoAnonimizado)
      : null,
  };
  await db.incidenteCrisis.create({ data: datosCifrados });
}

/**
 * Registra un incidente de crisis con hasta 3 reintentos (backoff lineal).
 * Si todos fallan, captura en Sentry para mantener el audit trail clínico.
 * Cumple Resolución 2654/2019: toda detección de riesgo debe quedar registrada.
 */
export async function registrarIncidente(datos: DatosIncidente): Promise<void> {
  let ultimoError: unknown;

  for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
    try {
      await persistirIncidente(datos);
      capturarEventoCrisis({
        nivel: datos.nivel as NivelCrisis,
        usuarioId: datos.usuarioId,
        sesionId: datos.sesionId,
        cantidadIndicadores: datos.indicadoresDetectados.length,
        escaloAPsicologo: datos.psicologoNotificado,
      });
      return;
    } catch (error) {
      ultimoError = error;
      if (intento < MAX_INTENTOS) {
        await new Promise(r => setTimeout(r, DELAY_BASE_MS * intento));
      }
    }
  }

  // Fallback: si BD falla, Sentry mantiene el rastro para auditoría
  capturarErrorPersistencia(ultimoError, {
    operacion: 'registrar_incidente_crisis',
    usuarioId: datos.usuarioId,
    sesionId: datos.sesionId,
  });
  console.error('[INCIDENTE CRISIS] Fallo permanente. Capturado en Sentry.', {
    nivel: datos.nivel,
    usuarioId: datos.usuarioId,
  });
}

/**
 * Versión no-bloqueante para niveles BAJO/MODERADO.
 * No usar para CRITICO/ALTO — esos requieren await.
 */
export function registrarIncidenteAsync(datos: DatosIncidente): void {
  registrarIncidente(datos).catch(() => {
    // Reintentos y Sentry ya manejados dentro de registrarIncidente
  });
}
