/**
 * Tests de integración — API de Citas (/api/citas)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mocks ─────────────────────────────────────────────────────────

const { dbMock, mockPsicologo, mockUsuario } = vi.hoisted(() => {
  const mockPsicologo = {
    id: 'clpsic000000000000000001',
    nombreCompleto: 'Dra. María González',
    tarifaCOP: 90000,
    usuarioId: 'usr-psi-1',
    activo: true,
    estado: 'ACTIVO',
  };

  const mockUsuario = {
    id: 'usr-paciente-1',
    email: 'paciente@test.com',
    nombre: 'Carlos',
    apellido: 'Pérez',
  };

  const dbMock = {
    cita: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(({ data }: any) => Promise.resolve({ id: 'clcita00000000000000001', ...data })),
    },
    psicologo: {
      findFirst: vi.fn().mockResolvedValue(mockPsicologo),
    },
    usuario: {
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        if (where.id === 'usr-paciente-1') return Promise.resolve(mockUsuario);
        if (where.id === 'usr-psi-1') return Promise.resolve({ email: 'psi@test.com' });
        return Promise.resolve(null);
      }),
    },
  };

  return { dbMock, mockPsicologo, mockUsuario };
});

vi.mock('@/lib/db/client', () => ({ db: dbMock }));

vi.mock('@/lib/auth/get-auth-user', () => ({
  getAuthUser: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimits: {
    citas: vi.fn().mockResolvedValue({ allowed: true }),
  },
}));

vi.mock('@/lib/analytics/posthog', () => ({
  capturarEvento: vi.fn(),
}));

vi.mock('@/lib/email/confirmaciones', () => ({
  enviarEmail: vi.fn().mockResolvedValue(true),
  escapeHtml: (s: string) => s,
}));

import { getAuthUser } from '@/lib/auth/get-auth-user';
import { rateLimits } from '@/lib/rate-limit';
import { GET, POST } from '../../apps/web/src/app/api/citas/route';

function createRequest(url: string, method = 'GET', body?: object): NextRequest {
  return new NextRequest(`http://localhost:3000${url}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('API de Citas — GET /api/citas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve 401 si no está autenticado', async () => {
    vi.mocked(getAuthUser).mockResolvedValueOnce(null);
    const req = createRequest('/api/citas');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('lista citas del usuario autenticado', async () => {
    vi.mocked(getAuthUser).mockResolvedValueOnce({
      id: 'usr-paciente-1',
      email: 'paciente@test.com',
      nombre: 'Carlos',
      plan: 'GRATIS',
      rol: 'USUARIO',
    });

    const citasMock = [
      {
        id: 'cita-1',
        fechaHora: new Date(),
        estado: 'CONFIRMADA',
        psicologo: { nombreCompleto: 'Dra. María González' },
      },
    ];
    dbMock.cita.findMany.mockResolvedValueOnce(citasMock as any);
    dbMock.cita.count.mockResolvedValueOnce(1);

    const req = createRequest('/api/citas');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.citas).toHaveLength(1);
    expect(data.paginacion.total).toBe(1);
  });
});

describe('API de Citas — POST /api/citas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.WOMPI_PUBLIC_KEY = 'pub_test_123';
    process.env.WOMPI_INTEGRITY_KEY = 'integrity_test_456';
  });

  it('devuelve 401 si no está autenticado', async () => {
    vi.mocked(getAuthUser).mockResolvedValueOnce(null);
    const req = createRequest('/api/citas', 'POST', {
      psicologoId: 'clpsic000000000000000001',
      fechaHora: new Date(Date.now() + 86400000).toISOString(),
      metodoPago: 'PSE',
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('devuelve 429 si se excede el rate limit', async () => {
    vi.mocked(getAuthUser).mockResolvedValueOnce({
      id: 'usr-paciente-1',
      email: 'paciente@test.com',
      nombre: 'Carlos',
      plan: 'GRATIS',
      rol: 'USUARIO',
    });
    vi.mocked(rateLimits.citas).mockResolvedValueOnce({ allowed: false } as any);

    const req = createRequest('/api/citas', 'POST', {
      psicologoId: 'clpsic000000000000000001',
      fechaHora: new Date(Date.now() + 86400000).toISOString(),
      metodoPago: 'PSE',
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it('rechaza citas con fechas en el pasado', async () => {
    vi.mocked(getAuthUser).mockResolvedValueOnce({
      id: 'usr-paciente-1',
      email: 'paciente@test.com',
      nombre: 'Carlos',
      plan: 'GRATIS',
      rol: 'USUARIO',
    });
    vi.mocked(rateLimits.citas).mockResolvedValueOnce({ allowed: true } as any);

    const req = createRequest('/api/citas', 'POST', {
      psicologoId: 'clpsic000000000000000001',
      fechaHora: new Date(Date.now() - 3600000).toISOString(),
      metodoPago: 'PSE',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('futuro');
  });

  it('crea cita pendiente y calcula la comisión del 20% correctamente con firma Wompi', async () => {
    vi.mocked(getAuthUser).mockResolvedValueOnce({
      id: 'usr-paciente-1',
      email: 'paciente@test.com',
      nombre: 'Carlos',
      plan: 'GRATIS',
      rol: 'USUARIO',
    });
    vi.mocked(rateLimits.citas).mockResolvedValueOnce({ allowed: true } as any);

    const fechaFutura = new Date(Date.now() + 2 * 86400000).toISOString();
    const req = createRequest('/api/citas', 'POST', {
      psicologoId: 'clpsic000000000000000001',
      fechaHora: fechaFutura,
      metodoPago: 'NEQUI',
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();

    expect(data.montoCOP).toBe(90000);
    expect(data.datosWidget.amountInCents).toBe(9000000);
    expect(data.datosWidget.integritySignature).toBeDefined();
    expect(data.datosWidget.reference).toContain('CITA-');

    expect(dbMock.cita.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          montoCOP: 90000,
          comisionCOP: 18000, // 20% de 90.000
          montoPsicologoCOP: 72000, // 80% de 90.000
          estado: 'PENDIENTE',
        }),
      })
    );
  });
});
