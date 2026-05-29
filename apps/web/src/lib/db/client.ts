import { PrismaClient } from '@prisma/client';
import { encryption } from '@/lib/encryption';

// Patrón singleton para evitar múltiples conexiones en desarrollo
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definido en las variables de entorno');
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// ── Helpers de usuario ─────────────────────────────────────────
export async function obtenerUsuario(id: string, solicitanteId?: string) {
  const usuario = await db.usuario.findUnique({
    where: { id },
    select: {
      id: true, email: true, nombre: true, apellido: true,
      planActual: true, rol: true, estado: true,
      consentimientoIA: true, consentimientoDatos: true,
      condicionesPrevias: true,
      medicamentos: true,
    },
  });

  if (!usuario) return null;

  // Auditar lectura de datos clínicos — Ley 1581/2012
  if (usuario.condicionesPrevias || usuario.medicamentos) {
    registrarAuditLog({
      usuarioId: solicitanteId ?? id,
      accion: 'LEER_DATOS_CLINICOS',
      recurso: 'Usuario',
      recursoId: id,
    }).catch(() => {}); // No bloquear — fire and forget
  }

  return {
    ...usuario,
    condicionesPrevias: usuario.condicionesPrevias
      ? (() => { try { return encryption.decrypt(usuario.condicionesPrevias!); } catch { return usuario.condicionesPrevias; } })()
      : null,
    medicamentos: usuario.medicamentos
      ? (() => { try { return encryption.decrypt(usuario.medicamentos!); } catch { return usuario.medicamentos; } })()
      : null,
  };
}

export async function verificarSuscripcionActiva(usuarioId: string) {
  const usuario = await db.usuario.findUnique({
    where: { id: usuarioId },
    select: { planActual: true, suscripcionVence: true },
  });
  if (!usuario) return false;
  if (usuario.planActual === 'GRATIS') return true;
  if (!usuario.suscripcionVence) return false;
  return usuario.suscripcionVence > new Date();
}

export async function contarSesionesSemana(usuarioId: string): Promise<number> {
  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
  inicioSemana.setHours(0, 0, 0, 0);

  return db.sesionChat.count({
    where: {
      usuarioId,
      createdAt: { gte: inicioSemana },
    },
  });
}

// ── Cifrado de notas clínicas (Cita.notasClinicas) ─────────────────────────
// Ley 1581/2012 — datos sensibles de salud deben cifrarse en reposo.
// Solo el psicólogo asignado y admins pueden leer/escribir este campo.

/** Cifra las notas clínicas antes de persistir en BD. */
export function cifrarNotasClinicas(notas: string): string {
  return encryption.encrypt(notas);
}

/** Descifra notas clínicas leídas de BD. Retorna null si el valor es nulo o falla. */
export function descifrarNotasClinicas(cifrado: string | null): string | null {
  if (!cifrado) return null;
  try {
    return encryption.decrypt(cifrado);
  } catch {
    // Dato legacy no cifrado — retornar como texto plano (solo durante migración)
    return cifrado;
  }
}

// ── Audit Log — Ley 1581/2012 Art. 17 ─────────────────────────────────────
// Registra quién accedió o modificó datos sensibles de salud.
// Append-only: nunca actualizar ni eliminar registros de auditoría.

import type { Prisma } from '@prisma/client';

interface DatosAudit {
  usuarioId?: string;
  adminId?: string;
  accion: string;
  recurso: string;
  recursoId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadatos?: Prisma.InputJsonValue;
}

/**
 * Registra un evento de acceso o modificación a datos sensibles.
 * No lanza excepción — un fallo de audit log no debe interrumpir la operación principal.
 */
export async function registrarAuditLog(datos: DatosAudit): Promise<void> {
  try {
    await db.auditLog.create({ data: datos });
  } catch (error) {
    // Fallo silencioso con log estructurado — no interrumpir la operación principal
    console.error('[AUDIT LOG] Error al registrar evento de auditoría:', {
      accion: datos.accion,
      recurso: datos.recurso,
      usuarioId: datos.usuarioId,
      error,
    });
  }
}
