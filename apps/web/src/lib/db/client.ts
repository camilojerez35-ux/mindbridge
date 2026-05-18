// src/lib/db/client.ts
// RUTA: Importado en todas las APIs que necesitan base de datos
// Instalar: npm install prisma @prisma/client
// Configurar: npx prisma init → editar schema.prisma → npx prisma migrate dev

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
export async function obtenerUsuario(id: string) {
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

  return {
    ...usuario,
    condicionesPrevias: usuario.condicionesPrevias ? encryption.decrypt(usuario.condicionesPrevias) : null,
    medicamentos: usuario.medicamentos ? encryption.decrypt(usuario.medicamentos) : null,
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
