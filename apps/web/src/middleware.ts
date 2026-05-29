import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { RATE_LIMITING, PUBLIC_PATHS, ROLE_CONFIG } from '@/lib/auth/config';

// Rate limiter en memoria — solo válido para single-instance.
// En producción con múltiples instancias, reemplazar por Redis.
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, windowMs: number, maxRequests: number): boolean {
  const now = Date.now();
  const data = requestCounts.get(ip);

  if (!data || now > data.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (data.count >= maxRequests) return false;

  data.count++;
  return true;
}

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'local';
  const { pathname } = request.nextUrl;

  // 1. Rate limiting en rutas de autenticación
  const authPaths = ['/login', '/registro', '/forgot-password', '/reset-password'];
  if (authPaths.some(p => pathname.startsWith(p))) {
    const { windowMs, maxRequests } = RATE_LIMITING.auth;
    if (!checkRateLimit(ip, windowMs, maxRequests)) {
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
    '/login',
    '/registro',
    '/forgot-password',
    '/reset-password',
  ],
};
