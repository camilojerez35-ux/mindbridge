/**
 * MindBridge — Fuente canónica de líneas de emergencia en salud mental Colombia
 *
 * MANTENIMIENTO OBLIGATORIO: Verificar vigencia de cada número cada 90 días.
 * Cambiar el campo `ultimaVerificacion` al verificar.
 * Cualquier número en el codebase debe importar desde este archivo — jamás hardcodear.
 *
 * Responsable de verificación: equipo clínico / psicólogo co-fundador
 * Procedimiento: llamar al número, confirmar que contesta servicio de salud mental.
 */

export interface LineaEmergencia {
  nombre: string;
  numero: string;
  descripcion: string;
  disponibilidad: string;
  gratuito: boolean;
  cobertura: 'nacional' | 'bogota' | 'antioquia' | 'valle' | 'santander';
  ultimaVerificacion: string; // YYYY-MM-DD — actualizar al verificar
  proximaVerificacion: string; // YYYY-MM-DD — 90 días desde última
  activa: boolean;
  /** Fuente oficial donde se confirmó el número (no reemplaza la verificación telefónica) */
  fuente?: string;
}

export const LINEAS_EMERGENCIA: LineaEmergencia[] = [
  {
    nombre: 'Línea 106 — Salud Mental',
    numero: '106',
    descripcion:
      'Línea nacional de orientación en salud mental del Ministerio de Salud. Desde cualquier fijo o celular. ' +
      'Donde existe línea 106 territorial (p. ej. Bogotá, Medellín, Cali) la atiende la secretaría de salud local.',
    disponibilidad: '24 horas, 7 días a la semana',
    gratuito: true,
    cobertura: 'nacional',
    fuente: 'https://www.minsalud.gov.co/salud/publica/salud-mental/Paginas/linea-106.aspx',
    ultimaVerificacion: '2026-07-01',
    proximaVerificacion: '2026-10-01',
    activa: true,
  },
  {
    // DESACTIVADA 2026-09-30: este número no aparece en ninguna fuente oficial (MinSalud publica la
    // Línea 106 como línea nacional). Además el código usaba 3 variantes distintas. No reactivar sin
    // confirmarlo por teléfono y con fuente oficial.
    nombre: 'Línea Nacional de Salud Mental — MinSalud (NO VERIFICADA)',
    numero: '800-1222-5555',
    descripcion: 'Línea gratuita del Ministerio de Salud y Protección Social.',
    disponibilidad: 'Lunes a sábado 6am–10pm (hora Colombia)',
    gratuito: true,
    cobertura: 'nacional',
    ultimaVerificacion: '2026-07-01',
    proximaVerificacion: '2026-10-01',
    activa: false,
  },
  {
    nombre: 'Emergencias Colombia',
    numero: '123',
    descripcion: 'Número único de emergencias. Para riesgo de vida inmediato.',
    disponibilidad: '24 horas, 7 días a la semana',
    gratuito: true,
    cobertura: 'nacional',
    ultimaVerificacion: '2026-07-01',
    proximaVerificacion: '2026-10-01',
    activa: true,
  },
  {
    nombre: 'Cruz Roja Colombiana',
    numero: '132',
    descripcion: 'Atención de emergencias y apoyo psicosocial.',
    disponibilidad: '24 horas, 7 días a la semana',
    gratuito: true,
    cobertura: 'nacional',
    ultimaVerificacion: '2026-07-01',
    proximaVerificacion: '2026-10-01',
    activa: true,
  },
];

/**
 * Líneas regionales por ciudad — verificar mensualmente.
 * Actualizado 2026-09-30 con fuentes oficiales/prensa (campo `fuente`); los números anteriores de
 * Cali (6026200000), Bucaramanga (6076436363) y "otra" (8001225555) no tenían respaldo público.
 * `ultimaVerificacion` se mantiene: la verificación telefónica sigue pendiente.
 */
export const LINEAS_REGIONALES: Record<string, { nombre: string; numero: string; ultimaVerificacion: string; fuente?: string }> = {
  bogota:       { nombre: 'Línea 106 — Salud Mental Bogotá',          numero: '106',        ultimaVerificacion: '2026-07-01', fuente: 'https://literalmente.saludcapital.gov.co/salud-mental/que-tipo-de-ayuda-necesitas/lineas-de-atencion/' },
  medellin:     { nombre: 'Línea Amiga Saludable — Medellín (24/7)',  numero: '6044444448', ultimaVerificacion: '2026-07-01', fuente: 'https://www.medellin.gov.co/es/secretaria-de-salud/linea-amiga/' },
  cali:         { nombre: 'Línea 106 — Salud Mental Cali',            numero: '106',        ultimaVerificacion: '2026-07-01', fuente: 'https://www.cali.gov.co/salud/publicaciones/160736/linea-106-para-atencion-en-salud-mental/' },
  barranquilla: { nombre: 'Línea de la Vida — Barranquilla (24/7)',   numero: '6053399999', ultimaVerificacion: '2026-07-01', fuente: 'https://barranquilla.gov.co/mi-barranquilla/con-hablemos-y-linea-de-la-vida-distrito-atiende-la-salud-mental-de-los-barranquilleros' },
  bucaramanga:  { nombre: 'Línea Espérame — Bucaramanga (24/7, también WhatsApp)', numero: '3229643755', ultimaVerificacion: '2026-07-01', fuente: 'https://www.vanguardia.com/area-metropolitana/bucaramanga/2026/04/28/bucaramanga-ahora-cuenta-con-la-linea-esperame-orientacion-y-escucha-en-salud-mental/' },
  otra:         { nombre: 'Línea 106 — Salud Mental (nacional)',      numero: '106',        ultimaVerificacion: '2026-07-01', fuente: 'https://www.minsalud.gov.co/salud/publica/salud-mental/Paginas/linea-106.aspx' },
};

/** Solo las activas, para uso en crisis-protocol y emails */
export const LINEAS_ACTIVAS = LINEAS_EMERGENCIA.filter(l => l.activa);

/** Retorna líneas vencidas (ultimaVerificacion > 90 días) — para CI/alertas */
export function lineasVencidas(): LineaEmergencia[] {
  const hoy = new Date();
  const NOVENTA_DIAS = 90 * 24 * 60 * 60 * 1000;
  return LINEAS_EMERGENCIA.filter(l => {
    if (!l.activa) return false; // las desactivadas no se muestran a usuarios
    const ultima = new Date(l.ultimaVerificacion);
    return (hoy.getTime() - ultima.getTime()) > NOVENTA_DIAS;
  });
}

/** String compacto para disclaimer banners */
export const LINEAS_DISCLAIMER = 'Crisis: 106 (salud mental, 24/7) · 123 (emergencias)';

/** Para el cuerpo de emails de alerta clínica */
export function lineasParaEmail(): string {
  return LINEAS_ACTIVAS
    .map(l => `• ${l.nombre}: <strong>${l.numero}</strong> (${l.disponibilidad})`)
    .join('\n              ');
}
