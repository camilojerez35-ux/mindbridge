import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  plan: string;
  rol: string;
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
      const payload = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as AuthUser;
      return payload;
    } catch {
      return null;
    }
  }

  // 2. Fallback a sesión NextAuth (web)
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
