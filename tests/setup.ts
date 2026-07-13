/**
 * Setup global de Vitest.
 * Provee shims de Next.js para tests que importan rutas de API.
 */
import { vi } from 'vitest';

// ── Variables de entorno requeridas por módulos importados en tests ──
process.env.ENCRYPTION_KEY ??= '0'.repeat(64); // 32 bytes hex — solo para tests
process.env.NEXTAUTH_SECRET ??= 'test-secret-nextauth';
process.env.JWT_SECRET ??= 'test-secret-jwt';

// ── Shim de next/server ───────────────────────────────────────────
vi.mock('next/server', () => {
  class NextRequest extends Request {
    readonly nextUrl: URL;
    readonly ip: string | undefined;

    constructor(input: string | URL, init?: RequestInit & { ip?: string }) {
      super(input, init);
      this.nextUrl = new URL(typeof input === 'string' ? input : input.toString());
      this.ip = (init as any)?.ip;
    }
  }

  const NextResponse = {
    json(data: unknown, init?: ResponseInit) {
      return Response.json(data, init);
    },
    redirect(url: string | URL, init?: number | ResponseInit) {
      const status = typeof init === 'number' ? init : (init as ResponseInit)?.status ?? 307;
      return Response.redirect(url, status);
    },
    next(init?: ResponseInit) {
      return new Response(null, { ...init, status: init?.status ?? 200 });
    },
  };

  return { NextRequest, NextResponse };
});

// ── Shim de PostHog ───────────────────────────────────────────────
vi.mock('posthog-node', () => ({
  PostHog: vi.fn().mockImplementation(() => ({
    capture:  vi.fn(),
    identify: vi.fn(),
    flush:    vi.fn(),
    shutdown: vi.fn(),
  })),
}));
vi.mock('posthog-js', () => ({
  default: { init: vi.fn(), capture: vi.fn(), identify: vi.fn(), debug: vi.fn() },
}));
vi.mock('posthog-js/react', () => ({
  PostHogProvider: ({ children }: any) => children,
  usePostHog: vi.fn(() => ({ capture: vi.fn(), identify: vi.fn() })),
}));

// ── Shim de Sentry ────────────────────────────────────────────────
// Evita que los tests hagan llamadas reales a Sentry
vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  withScope: vi.fn((cb: (scope: any) => void) => cb({
    setLevel: vi.fn(), setTag: vi.fn(), setContext: vi.fn(), setUser: vi.fn(),
  })),
  startInactiveSpan: vi.fn(() => ({ end: vi.fn() })),
  replayIntegration: vi.fn(),
}));

// ── Shim de next/headers ──────────────────────────────────────────
// next-auth llama a headers() de Next.js internamente — lo reemplazamos
// con un Headers nativo para evitar el error "outside a request scope".
vi.mock('next/headers', () => ({
  headers: vi.fn().mockReturnValue(new Headers()),
  cookies: vi.fn().mockReturnValue({ get: vi.fn(), getAll: vi.fn(() => []) }),
}));
