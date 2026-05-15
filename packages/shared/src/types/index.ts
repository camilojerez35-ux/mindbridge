/**
 * MindBridge Colombia — Tipos TypeScript Compartidos
 * packages/shared/src/types/index.ts
 */

// ── Usuarios ────────────────────────────────────────────────────

export type PlanSuscripcion = 'GRATIS' | 'PLUS' | 'FAMILIA' | 'EMPRESARIAL';
export type RolUsuario = 'USUARIO' | 'ADMIN' | 'PSICOLOGO' | 'SUPERADMIN';
export type EstadoUsuario = 'ACTIVO' | 'SUSPENDIDO' | 'ELIMINADO' | 'PENDIENTE_VERIFICACION';

export interface UsuarioPerfil {
  id: string;
  email: string;
  nombre?: string;
  apellido?: string;
  planActual: PlanSuscripcion;
  rol: RolUsuario;
  consentimientoIA: boolean;
  consentimientoDatos: boolean;
  createdAt: Date;
}

// ── IA Clínica ──────────────────────────────────────────────────

export type NivelCrisis = 'ninguno' | 'bajo' | 'moderado' | 'alto' | 'critico';
export type RolMensaje = 'user' | 'assistant';

export interface MensajeChatUI {
  id: string;
  rol: RolMensaje;
  contenido: string;
  timestamp: Date;
  esCrisis?: boolean;
  nivelCrisis?: NivelCrisis;
}

export interface ChatStreamEvent {
  chunk?: string;
  done?: boolean;
  crisis?: boolean;
  nivelCrisis?: NivelCrisis;
  error?: string;
}

export interface ChatRequest {
  mensaje: string;
  sesionId?: string;
  historial: Array<{ rol: RolMensaje; contenido: string }>;
}

export interface ChatCrisisResponse {
  respuesta: string;
  crisis: true;
  nivel: NivelCrisis;
  recursos: RecursoCrisis[];
  accion: 'MOSTRAR_MODAL_CRISIS';
}

export interface RecursoCrisis {
  nombre: string;
  numero: string;
  descripcion: string;
  disponibilidad: string;
  gratuito: boolean;
}

// ── Psicólogos ──────────────────────────────────────────────────

export type EstadoPsicologo = 'PENDIENTE_VERIFICACION' | 'VERIFICADO' | 'ACTIVO' | 'SUSPENDIDO' | 'RECHAZADO';

export interface PsicologoPublico {
  id: string;
  nombreCompleto: string;
  especialidades: string[];
  enfoqueTerapeutico: string[];
  años_experiencia: number;
  bio: string;
  tarifaCOP: number;
  calificacionPromedio?: number;
  totalResenas: number;
  fotoUrl?: string;
  ciudades: string[];
  idiomas: string[];
  disponibilidadProximos7Dias: SlotDisponible[];
}

export interface SlotDisponible {
  fechaHora: Date;
  disponible: boolean;
}

// ── Citas ───────────────────────────────────────────────────────

export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA_USUARIO' | 'CANCELADA_PSICOLOGO' | 'NO_ASISTIO';
export type TipoCita = 'PRIMERA_CONSULTA' | 'SEGUIMIENTO' | 'URGENTE';
export type MetodoPago = 'PSE' | 'TARJETA' | 'NEQUI' | 'DAVIPLATA';

export interface CitaResumen {
  id: string;
  fechaHora: Date;
  duracionMinutos: number;
  estado: EstadoCita;
  tipo: TipoCita;
  montoCOP: number;
  psicologo: {
    nombreCompleto: string;
    fotoUrl?: string;
    especialidades: string[];
  };
  salaVideollamada?: string;
}

export interface AgendarCitaRequest {
  psicologoId: string;
  fechaHora: string;
  tipo: TipoCita;
  notasPrevias?: string;
  metodoPago: MetodoPago;
  tokenPago: string;
  compartirResumenIA: boolean;
}

// ── Diario Emocional ────────────────────────────────────────────

export type Emocion =
  | 'alegria' | 'tristeza' | 'ansiedad' | 'calma'
  | 'enojo' | 'miedo' | 'esperanza' | 'agotamiento'
  | 'gratitud' | 'soledad' | 'amor' | 'frustracion';

export interface EntradaDiario {
  id: string;
  contenido: string;
  estadoAnimo: number; // 1-10
  emociones: Emocion[];
  etiquetas: string[];
  analisisIA?: string;
  createdAt: Date;
}

export interface RegistroAnimo {
  id: string;
  valor: number; // 1-10
  nota?: string;
  emociones: Emocion[];
  fecha: Date;
}

// ── Suscripciones y Pagos ───────────────────────────────────────

export interface PlanDetalle {
  id: PlanSuscripcion;
  nombre: string;
  precioCOP: number;
  sesionesSemanales: number | 'ilimitado';
  descripcion: string;
  caracteristicas: string[];
}

export const PLANES: Record<PlanSuscripcion, PlanDetalle> = {
  GRATIS: {
    id: 'GRATIS',
    nombre: 'Gratis',
    precioCOP: 0,
    sesionesSemanales: 3,
    descripcion: 'Para empezar tu camino de bienestar',
    caracteristicas: [
      '3 sesiones de chat IA por semana',
      'Diario emocional básico',
      '1 ejercicio guiado por día',
      'Recursos educativos',
      'Protocolo de crisis activo',
    ],
  },
  PLUS: {
    id: 'PLUS',
    nombre: 'Plus',
    precioCOP: 25000,
    sesionesSemanales: 'ilimitado',
    descripcion: 'Apoyo continuo cuando lo necesitas',
    caracteristicas: [
      'Chat IA ilimitado 24/7',
      'Seguimiento de estado de ánimo',
      'Programas guiados (ansiedad, sueño)',
      'Historial y análisis de progreso',
      '15% descuento en citas con psicólogos',
    ],
  },
  FAMILIA: {
    id: 'FAMILIA',
    nombre: 'Familia',
    precioCOP: 45000,
    sesionesSemanales: 'ilimitado',
    descripcion: 'Bienestar para toda tu familia',
    caracteristicas: [
      'Hasta 4 miembros del hogar',
      'Todo lo del plan Plus',
      'Dashboard familiar de bienestar',
      '20% descuento en citas',
      'Soporte prioritario',
    ],
  },
  EMPRESARIAL: {
    id: 'EMPRESARIAL',
    nombre: 'Empresarial',
    precioCOP: 0, // Variable según empresa
    sesionesSemanales: 'ilimitado',
    descripcion: 'Para equipos y empresas',
    caracteristicas: [
      'Precio por empleado: $3.500–$5.000 COP/mes',
      'Dashboard anónimo de bienestar corporativo',
      'Contratos anuales con descuento',
      'Onboarding dedicado',
      'Reporte mensual de bienestar',
    ],
  },
};

// ── Constantes Colombia ─────────────────────────────────────────

export const RECURSOS_CRISIS_COLOMBIA: RecursoCrisis[] = [
  {
    nombre: 'Línea 106 — Salud Mental Bogotá',
    numero: '106',
    descripcion: 'Orientación en salud mental del Distrito',
    disponibilidad: '24 horas, 7 días',
    gratuito: true,
  },
  {
    nombre: 'Línea Nacional de Salud Mental',
    numero: '800-1222-5555',
    descripcion: 'Ministerio de Salud y Protección Social',
    disponibilidad: 'Horario extendido',
    gratuito: true,
  },
  {
    nombre: 'Emergencias Colombia',
    numero: '123',
    descripcion: 'Para riesgo de vida inmediato',
    disponibilidad: '24 horas, 7 días',
    gratuito: true,
  },
];

export const COMISION_PLATAFORMA_PORCENTAJE = 20;
export const DURACION_CITA_MINUTOS = 45;
export const MAX_HISTORIAL_MENSAJES_SESION = 20;
export const DISCLAIMER_FRECUENCIA_MENSAJES = 10;
