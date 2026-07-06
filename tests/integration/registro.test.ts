/**
 * Tests de integración — API de Registro (/api/auth/registro)
 * Mockea: DB (Prisma), rate limiting, envío de email
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mocks ─────────────────────────────────────────────────────────

vi.mock('@/lib/rate-limit', () => ({
  rateLimits: {
    registro: vi.fn().mockResolvedValue({ allowed: true, remaining: 4 }),
  },
}));

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
  consentimiento: {
    createMany: vi.fn().mockResolvedValue({ count: 3 }),
  },
};

vi.mock('@/lib/db/client', () => ({ db: dbMock }));

vi.mock('@/lib/email/tokens', () => ({
  generarTokenVerificacion: vi.fn().mockReturnValue({ token: 'tok123', ts: Date.now() }),
}));

vi.mock('@/lib/email/confirmaciones', () => ({
  enviarVerificacionEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/legal/versiones', () => ({
  VERSIONES_DOCUMENTOS: {
    POLITICA_PRIVACIDAD: '1.0.0',
    TERMINOS_USO: '1.0.0',
    AVISO_IA: '1.0.0',
  },
}));

// ── Helper ────────────────────────────────────────────────────────

const BODY_VALIDO = {
  nombre: 'Ana',
  apellido: 'García',
  email: 'nuevo@mindbridge.co',
  password: 'Segura123!',
  aceptaPoliticaPrivacidad: true,
  aceptaUsoIA: true,
  aceptaMarketing: false,
};

function hacerRequest(body: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.4' },
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
    expect(data.mensaje).toMatch(/email/i);
  });

  it('crea usuario con estado PENDIENTE_VERIFICACION', async () => {
    const { POST } = await import('../../apps/web/src/app/api/auth/registro/route');
    await POST(hacerRequest(BODY_VALIDO));

    expect(dbMock.usuario.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ estado: 'PENDIENTE_VERIFICACION' }),
      })
    );
  });

  it('hashea la contraseña antes de guardar', async () => {
    const { POST } = await import('../../apps/web/src/app/api/auth/registro/route');
    await POST(hacerRequest(BODY_VALIDO));

    const llamada = dbMock.usuario.create.mock.calls[0][0];
    expect(llamada.data.hashedPassword).toBeDefined();
    expect(llamada.data.hashedPassword).not.toBe(BODY_VALIDO.password);
    expect(llamada.data).not.toHaveProperty('password');
  });

  it('registra consentimientos auditables', async () => {
    const { POST } = await import('../../apps/web/src/app/api/auth/registro/route');
    await POST(hacerRequest(BODY_VALIDO));

    expect(dbMock.consentimiento.createMany).toHaveBeenCalledOnce();
    const { data } = dbMock.consentimiento.createMany.mock.calls[0][0];
    expect(data.some((c: any) => c.tipo === 'POLITICA_PRIVACIDAD')).toBe(true);
    expect(data.some((c: any) => c.tipo === 'USO_IA')).toBe(true);
    expect(data.some((c: any) => c.tipo === 'TERMINOS_USO')).toBe(true);
  });

  it('envía email de verificación', async () => {
    const { enviarVerificacionEmail } = await import('@/lib/email/confirmaciones');
    const { POST } = await import('../../apps/web/src/app/api/auth/registro/route');
    await POST(hacerRequest(BODY_VALIDO));

    // El email se envía de forma async — esperamos que haya sido llamado
    await vi.waitFor(() => {
      expect(enviarVerificacionEmail).toHaveBeenCalledOnce();
    });
  });
});

describe('POST /api/auth/registro — validaciones', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve 400 con email inválido', async () => {
    const { POST } = await import('../../apps/web/src/app/api/auth/registro/route');
    const res = await POST(hacerRequest({ ...BODY_VALIDO, email: 'no-es-email' }));
    expect(res.status).toBe(400);
  });

  it('devuelve 400 con contraseña débil (sin mayúscula)', async () => {
    const { POST } = await import('../../apps/web/src/app/api/auth/registro/route');
    const res = await POST(hacerRequest({ ...BODY_VALIDO, password: 'sinmayuscula123!' }));
    expect(res.status).toBe(400);
  });

  it('devuelve 400 si no acepta política de privacidad', async () => {
    const { POST } = await import('../../apps/web/src/app/api/auth/registro/route');
    const res = await POST(hacerRequest({ ...BODY_VALIDO, aceptaPoliticaPrivacidad: false }));
    expect(res.status).toBe(400);
  });

  it('devuelve 400 si no acepta uso de IA', async () => {
    const { POST } = await import('../../apps/web/src/app/api/auth/registro/route');
    const res = await POST(hacerRequest({ ...BODY_VALIDO, aceptaUsoIA: false }));
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

  it('devuelve 429 si rate limit superado', async () => {
    const { rateLimits } = await import('@/lib/rate-limit');
    vi.mocked(rateLimits.registro).mockResolvedValueOnce({ allowed: false, remaining: 0, resetAt: new Date() });

    const { POST } = await import('../../apps/web/src/app/api/auth/registro/route');
    const res = await POST(hacerRequest(BODY_VALIDO));
    expect(res.status).toBe(429);
  });

  it('rechaza campos extra (strict schema)', async () => {
    const { POST } = await import('../../apps/web/src/app/api/auth/registro/route');
    const res = await POST(hacerRequest({ ...BODY_VALIDO, campoExtra: 'hack' }));
    expect(res.status).toBe(400);
  });
});
