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
}

export const LINEAS_EMERGENCIA: LineaEmergencia[] = [
  {
    nombre: 'Línea 106 — Salud Mental Bogotá',
    numero: '106',
    descripcion: 'Línea de orientación en salud mental del Distrito de Bogotá. Psicólogos disponibles.',
    disponibilidad: '24 horas, 7 días a la semana',
    gratuito: true,
    cobertura: 'bogota',
    ultimaVerificacion: '2026-07-01',
    proximaVerificacion: '2026-10-01',
    activa: true,
  },
  {
    nombre: 'Línea Nacional de Salud Mental — MinSalud',
    numero: '800-1222-5555',
    descripcion: 'Línea gratuita del Ministerio de Salud y Protección Social.',
    disponibilidad: 'Lunes a sábado 6am–10pm (hora Colombia)',
    gratuito: true,
    cobertura: 'nacional',
    ultimaVerificacion: '2026-07-01',
    proximaVerificacion: '2026-10-01',
    activa: true,
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

/** Líneas regionales por ciudad — verificar mensualmente */
export const LINEAS_REGIONALES: Record<string, { nombre: string; numero: string; ultimaVerificacion: string }> = {
  bogota:       { nombre: 'Línea Salud Mental Bogotá',     numero: '106',         ultimaVerificacion: '2026-07-01' },
  medellin:     { nombre: 'Línea 106 Antioquia',            numero: '106',         ultimaVerificacion: '2026-07-01' },
  cali:         { nombre: 'Secretaría Salud Valle',          numero: '6026200000',  ultimaVerificacion: '2026-07-01' },
  barranquilla: { nombre: 'Línea 106 Barranquilla',          numero: '106',         ultimaVerificacion: '2026-07-01' },
  bucaramanga:  { nombre: 'Línea Salud Mental Santander',    numero: '6076436363',  ultimaVerificacion: '2026-07-01' },
  otra:         { nombre: 'Línea Nacional Salud Mental',     numero: '8001225555',  ultimaVerificacion: '2026-07-01' },
};

/** Solo las activas, para uso en crisis-protocol y emails */
export const LINEAS_ACTIVAS = LINEAS_EMERGENCIA.filter(l => l.activa);

/** Retorna líneas vencidas (ultimaVerificacion > 90 días) — para CI/alertas */
export function lineasVencidas(): LineaEmergencia[] {
  const hoy = new Date();
  const NOVENTA_DIAS = 90 * 24 * 60 * 60 * 1000;
  return LINEAS_EMERGENCIA.filter(l => {
    const ultima = new Date(l.ultimaVerificacion);
    return (hoy.getTime() - ultima.getTime()) > NOVENTA_DIAS;
  });
}

/** String compacto para disclaimer banners */
export const LINEAS_DISCLAIMER = 'Crisis: 106 · 800-1222-5555 · 123';

/** Para el cuerpo de emails de alerta clínica */
export function lineasParaEmail(): string {
  return LINEAS_ACTIVAS
    .map(l => `• ${l.nombre}: <strong>${l.numero}</strong> (${l.disponibilidad})`)
    .join('\n              ');
}
