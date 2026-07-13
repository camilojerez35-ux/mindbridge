import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import { db } from '@/lib/db/client';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  plan: string;
  rol: string;
}

/**
 * Un token/sesión emitido antes de un cambio de contraseña queda invalidado,
 * sin importar su fecha de expiración (logout forzado en todos los dispositivos).
 */
async function emitidoAntesDeCambioPassword(userId: string, iatSegundos?: number): Promise<boolean> {
  if (!iatSegundos) return false;
  const usuario = await db.usuario.findUnique({
    where: { id: userId },
    select: { passwordChangedAt: true },
  }).catch(() => null);
  if (!usuario?.passwordChangedAt) return false;
  return iatSegundos * 1000 < usuario.passwordChangedAt.getTime();
}

/**
 * Acepta autenticación por Bearer JWT (app móvil) o sesión NextAuth (web).
 * Retorna null si no hay autenticación válida.
 */
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  // 1. Intentar Bearer token (app móvil)
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as AuthUser & { iat?: number };
      if (payload.id !== 'dev-admin-id' && await emitidoAntesDeCambioPassword(payload.id, payload.iat)) {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }

  // 2. Fallback a sesión NextAuth (web) — la invalidación tras cambio de contraseña
  // se aplica en el refresco periódico del callback jwt (auth-options.ts)
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  return {
    id: session.user.id,
    email: session.user.email!,
    nombre: session.user.name ?? '',
    plan: session.user.plan,
    rol: session.user.rol,
  };
}
