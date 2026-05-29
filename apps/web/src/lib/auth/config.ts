// src/lib/auth/config.ts
// Configuración centralizada de autenticación y autorización

// ─── Rutas Públicas ────────────────────────────────────────────
export const PUBLIC_PATHS = [
  '/login',
  '/registro',
  '/forgot-password',
  '/reset-password',
  '/api/auth/*',
  '/api/usuarios/registro',
  '/api/usuarios/consentimiento',
  '/_next/*',
  '/favicon.ico',
];

// ─── Configuración de Rate Limiting ──────────────────────────
export const RATE_LIMITING = {
  // Login/Registro: 5 intentos por minuto
  auth: { windowMs: 60_000, maxRequests: 5 },
  // APIs generales: 100 requests por minuto
  api: { windowMs: 60_000, maxRequests: 100 },
  // Reset del contador
  cleanupInterval: 5 * 60_000,
} as const;

// ─── Configuración de Roles ────────────────────────────────
export const ROLE_CONFIG = {
  ADMIN: ['ADMIN', 'SUPERADMIN'],
  PSICOLOGO: ['PSICOLOGO', 'ADMIN', 'SUPERADMIN'],
  USUARIO: ['USUARIO', 'PSICOLOGO', 'ADMIN', 'SUPERADMIN'],
} as const;

// ─── Configuración de Tokens ────────────────────────────────
export const TOKEN_CONFIG = {
  ACCESS_EXPIRES_IN: '1h',
  REFRESH_EXPIRES_IN: '7d',
  SECRET: process.env.NEXTAUTH_SECRET,
} as const;

// ─── Configuración de Sesión ────────────────────────────────
export const SESSION_CONFIG = {
  STRATEGY: 'jwt' as const,
  MAX_AGE: 3600, // 1 hora
  SECURE_COOKIE: process.env.NODE_ENV === 'production',
} as const;
