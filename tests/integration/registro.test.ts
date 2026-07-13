/**
 * Tests de integración — API de Registro (/api/auth/registro)
 * Mockea: DB (Prisma)
 *
 * Nota: el endpoint actual no implementa aún rate limiting, verificación de
 * email ni tabla de consentimientos separada (ver memoria de proyecto:
 * "Email verification en registro por credenciales — pendiente"). Estos
 * tests cubren el comportamiento real, no uno aspiracional.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mocks ─────────────────────────────────────────────────────────

const mockUsuarioCreado = {
  id: 'usr-test-001',
  email: 'nuevo@mindbridge.co',
  nombre: 'Ana',
};

const dbMock = {
  usuario: {
    findUnique: vi.fn().mockResolvedValue(null), // por defecto no existe
    create: vi.fn().mockResolvedValue(mockUsuarioCreado),
  },
};

vi.mock('@/lib/db/client', () => ({ db: dbMock }));

// ── Helper ────────────────────────────────────────────────────────

const BODY_VALIDO = {
  nombre: 'Ana',
  apellido: 'García',
  email: 'nuevo@mindbridge.co',
  password: 'segura123',
  consentimientoDatos: true,
};

function hacerRequest(body: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────

describe('POST /api/auth/registro — casos exitosos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMock.usuario.findUnique.mockResolvedValue(null);
    dbMock.usuario.create.mockResolvedValue(mockUsuarioCreado);
  });

  it('crea usuario con datos válidos', async () => {
    const { POST } = await import('../../apps/web/src/app/api/auth/registro/route');
    const res = await POST(hacerRequest(BODY_VALIDO));

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.exito).toBe(true);
    expect(data.usuario).toHaveProperty('id');
  });

  it('hashea la contraseña antes de guardar', async () => {
    const { POST } = await import('../../apps/web/src/app/api/auth/registro/route');
    await POST(hacerRequest(BODY_VALIDO));

    const llamada = dbMock.usuario.create.mock.calls[0][0];
    expect(llamada.data.hashedPassword).toBeDefined();
    expect(llamada.data.hashedPassword).not.toBe(BODY_VALIDO.password);
    expect(llamada.data).not.toHaveProperty('password');
  });

  it('registra el consentimiento de datos con fecha', async () => {
    const { POST } = await import('../../apps/web/src/app/api/auth/registro/route');
    await POST(hacerRequest(BODY_VALIDO));

    expect(dbMock.usuario.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          consentimientoDatos: true,
          fechaConsentimiento: expect.any(Date),
        }),
      })
    );
  });

  it('guarda apellido null si no se envía', async () => {
    const { apellido, ...sinApellido } = BODY_VALIDO;
    const { POST } = await import('../../apps/web/src/app/api/auth/registro/route');
    await POST(hacerRequest(sinApellido));

    expect(dbMock.usuario.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ apellido: null }) })
    );
  });
});

describe('POST /api/auth/registro — validaciones', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve 400 con email inválido', async () => {
    const { POST } = await import('../../apps/web/src/app/api/auth/registro/route');
    const res = await POST(hacerRequest({ ...BODY_VALIDO, email: 'no-es-email' }));
    expect(res.status).toBe(400);
  });

  it('devuelve 400 con contraseña de menos de 8 caracteres', async () => {
    const { POST } = await import('../../apps/web/src/app/api/auth/registro/route');
    const res = await POST(hacerRequest({ ...BODY_VALIDO, password: 'corta1' }));
    expect(res.status).toBe(400);
  });

  it('devuelve 400 si no acepta el consentimiento de datos', async () => {
    const { POST } = await import('../../apps/web/src/app/api/auth/registro/route');
    const res = await POST(hacerRequest({ ...BODY_VALIDO, consentimientoDatos: false }));
    expect(res.status).toBe(400);
  });

  it('devuelve 409 si el email ya existe', async () => {
    dbMock.usuario.findUnique.mockResolvedValue({ id: 'existente' });
    const { POST } = await import('../../apps/web/src/app/api/auth/registro/route');
    const res = await POST(hacerRequest(BODY_VALIDO));
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toMatch(/existe/i);
  });

  it('devuelve 500 sin exponer detalles internos si la BD falla', async () => {
    dbMock.usuario.findUnique.mockResolvedValue(null);
    dbMock.usuario.create.mockRejectedValue(new Error('conexión perdida a Postgres'));
    const { POST } = await import('../../apps/web/src/app/api/auth/registro/route');
    const res = await POST(hacerRequest(BODY_VALIDO));

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).not.toContain('conexión perdida');
  });
});
