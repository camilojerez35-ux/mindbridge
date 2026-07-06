import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { RATE_LIMITING, PUBLIC_PATHS, ROLE_CONFIG } from '@/lib/auth/config';

// Fallback in-memory para desarrollo / single-instance
const _memCounts = new Map<string, { count: number; resetAt: number }>();

function _memRateLimit(key: string, windowMs: number, max: number): boolean {
  const now = Date.now();
  const entry = _memCounts.get(key);
  if (!entry || now > entry.resetAt) {
    _memCounts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

// Rate limiting via Upstash REST (Edge-compatible, funciona en multi-instancia).
// Cuando UPSTASH_REDIS_REST_URL no está configurado, cae al Map en memoria.
async function checkRateLimit(ip: string, windowMs: number, maxRequests: number): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    const key = `rl:auth:${ip}`;
    const windowSec = Math.ceil(windowMs / 1000);
    try {
      const res = await fetch(`${url}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([['INCR', key], ['EXPIRE', key, windowSec]]),
      });
      if (res.ok) {
        const data = (await res.json()) as Array<{ result: number }>;
        const count = data[0]?.result ?? 1;
        return count <= maxRequests;
      }
    } catch {
      // Redis no disponible — caer a in-memory
    }
  }

  return _memRateLimit(ip, windowMs, maxRequests);
}

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'local';
  const { pathname } = request.nextUrl;

  // 1. Rate limiting en rutas de autenticación
  const authPaths = ['/login', '/registro', '/forgot-password', '/reset-password'];
  if (authPaths.some(p => pathname.startsWith(p))) {
    const { windowMs, maxRequests } = RATE_LIMITING.auth;
    const allowed = await checkRateLimit(ip, windowMs, maxRequests);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta más tarde.' },
        { status: 429 }
      );
    }
  }

  // 2. Rutas públicas — pasar sin validar
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p.replace('/*', '')))) {
    return NextResponse.next();
  }

  // 3. Validar sesión de next-auth correctamente
  // Si viene un Bearer token (app móvil), el route handler lo verifica con getAuthUser — dejar pasar
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    // Rutas de API → 401, no redirección
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autorizado. Inicie sesión.' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Verificar consentimiento de datos (obligatorio — Ley 1581/2012)
  // Usuarios de Google se crean con consentimientoDatos=false hasta que acepten
  const rutasExentasConsentimiento = ['/consentimiento', '/api/auth', '/api/usuarios/consentimiento'];
  const requiereConsentimiento = !rutasExentasConsentimiento.some(r => pathname.startsWith(r));
  if (requiereConsentimiento && token.consentimientoDatos === false) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Debes aceptar los términos de privacidad antes de continuar', codigo: 'CONSENTIMIENTO_REQUERIDO' },
        { status: 403 }
      );
    }
    const consentUrl = new URL('/consentimiento', request.url);
    consentUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(consentUrl);
  }

  // 5. Control de acceso por rol
  if (pathname.startsWith('/admin')) {
    if (!ROLE_CONFIG.ADMIN.includes(token.rol as 'ADMIN' | 'SUPERADMIN')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (pathname.startsWith('/psicologo')) {
    if (!ROLE_CONFIG.PSICOLOGO.includes(token.rol as 'ADMIN' | 'PSICOLOGO' | 'SUPERADMIN')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 6. Rutas premium
  const premiumPaths = ['/dashboard/progreso', '/dashboard/programas'];
  if (premiumPaths.some(p => pathname.startsWith(p))) {
    if (token.plan === 'GRATIS') {
      return NextResponse.redirect(new URL('/dashboard/perfil?upgrade=true', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/psicologo/:path*',
    '/api/ai/:path*',
    '/api/diario/:path*',
    '/api/animo/:path*',
    '/api/usuarios/:path*',
    '/api/programas/:path*',
    '/api/pagos/:path*',
    '/api/notificaciones/:path*',
    '/api/citas/:path*',
    '/api/admin/:path*',
    '/api/psicologos/:path*',
    '/api/resenas/:path*',
    '/api/chat/:path*',
    '/api/stats/:path*',
    '/login',
    '/registro',
    '/forgot-password',
    '/reset-password',
  ],
};
