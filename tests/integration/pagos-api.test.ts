/**
 * Tests de integración — API de Pagos (/api/pagos)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { dbMock } = vi.hoisted(() => {
  const dbMock = {
    pago: {
      create: vi.fn().mockResolvedValue({ id: 'pago-1' }),
    },
    usuario: {
      update: vi.fn().mockResolvedValue({ id: 'usr-1', planActual: 'GRATIS' }),
    },
  };
  return { dbMock };
});

vi.mock('@/lib/db/client', () => ({ db: dbMock }));

vi.mock('@/lib/auth/get-auth-user', () => ({
  getAuthUser: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimits: {
    pagos: vi.fn().mockResolvedValue({ allowed: true }),
  },
}));

import { getAuthUser } from '@/lib/auth/get-auth-user';
import { rateLimits } from '@/lib/rate-limit';
import { POST, DELETE } from '../../apps/web/src/app/api/pagos/route';

function createRequest(url: string, method = 'POST', body?: object): NextRequest {
  return new NextRequest(`http://localhost:3000${url}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('API de Pagos — POST /api/pagos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.WOMPI_PUBLIC_KEY = 'pub_test_key';
    process.env.WOMPI_INTEGRITY_KEY = 'integrity_test_secret';
    process.env.APP_URL = 'http://localhost:3000';
  });

  it('devuelve 401 si no está autenticado', async () => {
    vi.mocked(getAuthUser).mockResolvedValueOnce(null);
    const req = createRequest('/api/pagos', 'POST', {
      plan: 'PLUS',
      metodoPago: 'PSE',
      ciclo: 'MENSUAL',
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('devuelve 429 si supera el rate limit', async () => {
    vi.mocked(getAuthUser).mockResolvedValueOnce({
      id: 'usr-1',
      email: 'user@test.co',
      nombre: 'Ana',
      plan: 'GRATIS',
      rol: 'USUARIO',
    });
    vi.mocked(rateLimits.pagos).mockResolvedValueOnce({ allowed: false } as any);

    const req = createRequest('/api/pagos', 'POST', {
      plan: 'PLUS',
      metodoPago: 'PSE',
      ciclo: 'MENSUAL',
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it('crea intención de pago para plan PLUS mensual con firma de integridad', async () => {
    vi.mocked(getAuthUser).mockResolvedValueOnce({
      id: 'usr-1',
      email: 'user@test.co',
      nombre: 'Ana',
      plan: 'GRATIS',
      rol: 'USUARIO',
    });
    vi.mocked(rateLimits.pagos).mockResolvedValueOnce({ allowed: true } as any);

    const req = createRequest('/api/pagos', 'POST', {
      plan: 'PLUS',
      metodoPago: 'NEQUI',
      ciclo: 'MENSUAL',
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.exito).toBe(true);
    expect(data.montoCOP).toBe(25900);
    expect(data.datosWidget.amountInCents).toBe(2590000);
    expect(data.datosWidget.integritySignature).toBeDefined();
    expect(data.referencia).toContain('SUBS-usr-1-PLUS-MENSUAL-');
    expect(dbMock.pago.create).toHaveBeenCalled();
  });

  it('crea intención de pago para plan PLUS anual', async () => {
    vi.mocked(getAuthUser).mockResolvedValueOnce({
      id: 'usr-1',
      email: 'user@test.co',
      nombre: 'Ana',
      plan: 'GRATIS',
      rol: 'USUARIO',
    });
    vi.mocked(rateLimits.pagos).mockResolvedValueOnce({ allowed: true } as any);

    const req = createRequest('/api/pagos', 'POST', {
      plan: 'PLUS',
      metodoPago: 'TARJETA',
      ciclo: 'ANUAL',
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.exito).toBe(true);
    expect(data.montoCOP).toBe(259000);
    expect(data.datosWidget.amountInCents).toBe(25900000);
    expect(data.referencia).toContain('SUBS-usr-1-PLUS-ANUAL-');
  });

  it('permite cancelar la suscripción mediante DELETE', async () => {
    vi.mocked(getAuthUser).mockResolvedValueOnce({
      id: 'usr-1',
      email: 'user@test.co',
      nombre: 'Ana',
      plan: 'PLUS',
      rol: 'USUARIO',
    });

    const req = createRequest('/api/pagos', 'DELETE');
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.exito).toBe(true);
    expect(dbMock.usuario.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'usr-1' },
        data: expect.objectContaining({ planActual: 'GRATIS' }),
      })
    );
  });
});
