/**
 * Validación de variables de entorno con Zod.
 * Se ejecuta al importar este módulo — falla rápido en startup.
 * Importar `env` en lugar de `process.env.X` en todo el servidor.
 */
import { z } from 'zod';

const schema = z.object({
  // ── Base de datos ─────────────────────────────────────────────
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL PostgreSQL válida'),
  DIRECT_URL:   z.string().url().optional(),

  // ── Autenticación ─────────────────────────────────────────────
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET debe tener al menos 32 caracteres'),
  NEXTAUTH_URL:    z.string().url().default('http://localhost:3000'),
  GOOGLE_CLIENT_ID:     z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // ── Cifrado de datos sensibles (Ley 1581/2012) ─────────────────
  ENCRYPTION_KEY: z.string().length(64, 'ENCRYPTION_KEY debe ser 64 caracteres hex (32 bytes)'),

  // ── JWT ───────────────────────────────────────────────────────
  JWT_SECRET: z.string().min(32).optional(),
  JWT_EXPIRY:  z.string().default('7d'),

  // ── IA — Anthropic Claude ─────────────────────────────────────
  // Opcional: sin ella la app corre en modo demo
  ANTHROPIC_API_KEY:    z.string().startsWith('sk-ant-').optional(),
  ANTHROPIC_MODEL:      z.string().default('claude-sonnet-4-6'),
  ANTHROPIC_MAX_TOKENS: z.coerce.number().int().min(256).max(4096).default(600),

  // ── Redis (opcional — fallback a in-memory) ───────────────────
  REDIS_URL:      z.string().url().optional(),
  REDIS_PASSWORD: z.string().optional(),

  // ── Comisiones ────────────────────────────────────────────────
  COMISION_CITAS_PORCENTAJE: z.coerce.number().int().min(0).max(100).default(20),

  // ── Rate limiting ─────────────────────────────────────────────
  RATE_LIMIT_CHAT_POR_MINUTO: z.coerce.number().int().min(1).default(10),
  RATE_LIMIT_API_POR_MINUTO:  z.coerce.number().int().min(1).default(60),

  // ── Pagos — Wompi Colombia ────────────────────────────────────
  WOMPI_PUBLIC_KEY:    z.string().optional(),
  WOMPI_PRIVATE_KEY:   z.string().optional(),
  WOMPI_EVENTS_SECRET: z.string().optional(),
  WOMPI_SANDBOX:       z.string().transform(v => v !== 'false').default(true),

  // ── Videollamada — Daily.co ───────────────────────────────────
  DAILY_API_KEY: z.string().optional(),
  DAILY_DOMAIN:  z.string().optional(),

  // ── Email — Resend ────────────────────────────────────────────
  RESEND_API_KEY:    z.string().optional(),
  EMAIL_FROM:        z.string().email().default('noreply@mentebridge.com'),
  EMAIL_FROM_NAME:   z.string().default('MenteBridge Colombia'),

  // ── Cron jobs (Vercel Cron) ───────────────────────────────────
  CRON_SECRET: z.string().min(32).optional(),

  // ── Analytics — PostHog ──────────────────────────────────────
  NEXT_PUBLIC_POSTHOG_KEY:  z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),

  // ── Monitoreo — Sentry ────────────────────────────────────────
  SENTRY_DSN:       z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG:       z.string().optional(),
  SENTRY_PROJECT:   z.string().optional(),

  // ── Entorno ───────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'staging', 'test', 'production']).default('development'),
  APP_URL:  z.string().url().default('http://localhost:3000'),
});

function validate() {
  // En tests unitarios (Vitest) saltamos la validación
  if (process.env.VITEST) {
    return schema.parse({
      DATABASE_URL:    'postgresql://test:test@localhost:5432/test',
      NEXTAUTH_SECRET: 'test-secret-32-chars-minimum-padding',
      ENCRYPTION_KEY:  '0'.repeat(64),
      NODE_ENV:        'test',
    });
  }

  // Durante el build de Next.js las vars de infra no están disponibles — skip
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return schema.parse({
      DATABASE_URL:    'postgresql://build:build@localhost:5432/build',
      NEXTAUTH_SECRET: 'build-placeholder-secret-32-chars!!',
      ENCRYPTION_KEY:  '0'.repeat(64),
      NODE_ENV:        'production',
    });
  }

  const result = schema.safeParse(process.env);

  if (!result.success) {
    const errores = result.error.issues
      .map(i => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(
      `\n[MenteBridge] Variables de entorno inválidas o faltantes:\n${errores}\n\n` +
      `Copia infrastructure/env/.env.example → apps/web/.env.local y completa los valores requeridos.\n`
    );
  }

  return result.data;
}

export const env = validate();

export type Env = typeof env;
