/**
 * Tests de integración — Reset Password (/api/auth/reset-password)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { dbMock } = vi.hoisted(() => {
  const dbMock = {
    usuario: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'usr-123',
        estado: 'ACTIVO',
      }),
      update: vi.fn().mockResolvedValue({ id: 'usr-123' }),
    },
  };
  return { dbMock };
});

vi.mock('@/lib/db/client', () => ({ db: dbMock }));

vi.mock('@/lib/rate-limit', () => ({
  rateLimits: {
    resetPassword: vi.fn().mockResolvedValue({ allowed: true }),
  },
}));

vi.mock('@/lib/email/tokens', () => ({
  verificarTokenReset: vi.fn().mockReturnValue({ valido: true }),
}));

vi.mock('@/lib/monitoring/sentry', () => ({
  capturarErrorApi: vi.fn(),
}));

import { rateLimits } from '@/lib/rate-limit';
import { verificarTokenReset } from '@/lib/email/tokens';
import { POST } from '../../apps/web/src/app/api/auth/reset-password/route';

function createRequest(body?: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('API Auth — POST /api/auth/reset-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validToken = 'a'.repeat(64);

  it('devuelve 429 si se excede el rate limit de IP', async () => {
    vi.mocked(rateLimits.resetPassword).mockResolvedValueOnce({ allowed: false } as any);

    const req = createRequest({
      email: 'user@test.com',
      token: validToken,
      ts: Date.now(),
      password: 'StrongPassword123!',
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it('rechaza contraseñas que no cumplen la política de complejidad', async () => {
    vi.mocked(rateLimits.resetPassword).mockResolvedValueOnce({ allowed: true } as any);

    const req = createRequest({
      email: 'user@test.com',
      token: validToken,
      ts: Date.now(),
      password: 'simplepassword', // sin mayúscula, número ni caracter especial
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('rechaza si el token HMAC es inválido o expiró', async () => {
    vi.mocked(rateLimits.resetPassword).mockResolvedValueOnce({ allowed: true } as any);
    vi.mocked(verificarTokenReset).mockReturnValueOnce({ valido: false, razon: 'Token expirado o manipulado' });

    const req = createRequest({
      email: 'user@test.com',
      token: validToken,
      ts: Date.now(),
      password: 'StrongPassword123!',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Token expirado');
  });

  it('actualiza la contraseña y registra passwordChangedAt para invalidar sesiones previas', async () => {
    vi.mocked(rateLimits.resetPassword).mockResolvedValueOnce({ allowed: true } as any);
    vi.mocked(verificarTokenReset).mockReturnValueOnce({ valido: true });

    const req = createRequest({
      email: 'user@test.com',
      token: validToken,
      ts: Date.now(),
      password: 'StrongPassword123!',
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);

    expect(dbMock.usuario.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'usr-123' },
        data: expect.objectContaining({
          passwordChangedAt: expect.any(Date),
        }),
      })
    );
  });
});
