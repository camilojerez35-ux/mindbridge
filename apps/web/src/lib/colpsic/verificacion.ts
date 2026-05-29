/**
 * Servicio de verificación de licencias COLPSIC.
 *
 * COLPSIC (Colegio Colombiano de Psicólogos) es la entidad que expide y
 * regula las tarjetas profesionales de psicólogos en Colombia (Ley 1090/2006).
 *
 * Estrategia:
 * 1. Si COLPSIC_API_URL está configurado → llamada a su API.
 * 2. Fallback → flujo de verificación manual con audit trail completo.
 *    El admin accede a https://www.colpsic.org.co/consulta-tarjeta-profesional
 *    y registra el resultado en la plataforma.
 */

export interface ResultadoVerificacionCOLPSIC {
  verificado: boolean;
  /** Fuente del resultado */
  fuente: 'api' | 'manual_pendiente';
  nombreRegistrado?: string;
  estadoTarjeta?: 'VIGENTE' | 'VENCIDA' | 'CANCELADA' | 'SUSPENDIDA';
  fechaExpedicion?: Date;
  fechaVencimiento?: Date;
  error?: string;
}

/**
 * Intenta verificar una tarjeta profesional COLPSIC.
 *
 * Si la API de COLPSIC está disponible (COLPSIC_API_URL configurado),
 * hace una consulta automatizada. En caso contrario devuelve
 * `fuente: 'manual_pendiente'` para que el admin complete la verificación.
 */
export async function verificarTarjetaCOLPSIC(
  tarjetaId: string,
  nombrePsicologo: string,
): Promise<ResultadoVerificacionCOLPSIC> {
  const apiUrl = process.env.COLPSIC_API_URL;

  if (apiUrl) {
    return verificarViaCOLPSICApi(apiUrl, tarjetaId, nombrePsicologo);
  }

  return {
    verificado: false,
    fuente: 'manual_pendiente',
    error: 'COLPSIC_API_URL no configurado — verificación manual requerida por el admin.',
  };
}

async function verificarViaCOLPSICApi(
  apiUrl: string,
  tarjetaId: string,
  nombrePsicologo: string,
): Promise<ResultadoVerificacionCOLPSIC> {
  try {
    const url = new URL('/consulta', apiUrl);
    url.searchParams.set('tarjeta', tarjetaId);
    url.searchParams.set('nombre', nombrePsicologo);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.COLPSIC_API_KEY ?? ''}`,
      },
      signal: AbortSignal.timeout(10_000), // 10 segundos máximo
    });

    if (!response.ok) {
      return {
        verificado: false,
        fuente: 'api',
        error: `COLPSIC API respondió con status ${response.status}`,
      };
    }

    const data = await response.json();

    // Mapear la respuesta de COLPSIC al formato interno.
    // ⚑ Ajustar campos según la documentación real de la API de COLPSIC.
    return {
      verificado: data.estado === 'VIGENTE',
      fuente: 'api',
      nombreRegistrado: data.nombre_completo,
      estadoTarjeta: data.estado,
      fechaExpedicion: data.fecha_expedicion ? new Date(data.fecha_expedicion) : undefined,
      fechaVencimiento: data.fecha_vencimiento ? new Date(data.fecha_vencimiento) : undefined,
    };
  } catch (error: any) {
    console.error('[COLPSIC] Error en verificación automática:', error.message);
    return {
      verificado: false,
      fuente: 'api',
      error: `Error de conexión con COLPSIC: ${error.message}`,
    };
  }
}

/**
 * URL pública de consulta manual en el sitio de COLPSIC.
 * El admin la usa cuando la API no está disponible.
 */
export const COLPSIC_CONSULTA_URL =
  'https://www.colpsic.org.co/consulta-tarjeta-profesional';
