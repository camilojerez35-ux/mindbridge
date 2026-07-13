/**
 * Tests de integración — API de Registro real (/api/usuarios/registro)
 * Este es el endpoint que consume el frontend ((auth)/registro/page.tsx).
 * Cubre: rate limiting por IP, validación de edad mínima, complejidad de
 * contraseña, y el envío del email de verificación con token real
 * (bug encontrado: antes se enviaba un email genérico sin enlace).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const dbMock = {
  usuario: {
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ id: 'usr-001' }),
  },
};
vi.mock('@/lib/db/client', () => ({ db: dbMock }));

const rateLimitRegistroMock = vi.fn().mockResolvedValue({ allowed: true, remaining: 4, resetAt: new Date() });
vi.mock('@/lib/rate-limit', () => ({
  rateLimits: { registro: rateLimitRegistroMock },
}));

const enviarVerificacionEmailMock = vi.fn().mockResolvedValue(undefined);
vi.mock('@/lib/email/confirmaciones', () => ({
  enviarVerificacionEmail: enviarVerificacionEmailMock,
}));

vi.mock('@/lib/email/tokens', () => ({
  generarTokenVerificacion: vi.fn().mockReturnValue({ token: 'tok-abc', ts: 1234567890 }),
}));

vi.mock('@/lib/env', () => ({ env: { APP_URL: 'https://mindbridge.co' } }));

const BODY_VALIDO = {
  nombre: 'Ana',
  apellido: 'García',
  email: 'nueva@mindbridge.co',
  password: 'Segura123!',
  fechaNacimiento: '1990-05-15',
  aceptaPoliticaPrivacidad: true,
  aceptaUsoIA: true,
  aceptaMarketing: false,
};

function req(body: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/usuarios/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.4' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  dbMock.usuario.findUnique.mockResolvedValue(null);
  dbMock.usuario.create.mockResolvedValue({ id: 'usr-001' });
  rateLimitRegistroMock.mockResolvedValue({ allowed: true, remaining: 4, resetAt: new Date() });
});

describe('POST /api/usuarios/registro — casos exitosos', () => {
  it('crea usuario en estado PENDIENTE_VERIFICACION', async () => {
    const { POST } = await import('../../apps/web/src/app/api/usuarios/registro/route');
    const res = await POST(req(BODY_VALIDO));

    expect(res.status).toBe(201);
    expect(dbMock.usuario.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ estado: 'PENDIENTE_VERIFICACION' }),
      })
    );
  });

  it('envía el email de verificación con un token y enlace real (no genérico)', async () => {
    const { POST } = await import('../../apps/web/src/app/api/usuarios/registro/route');
    await POST(req(BODY_VALIDO));

    expect(enviarVerificacionEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'nueva@mindbridge.co',
        token: 'tok-abc',
        url: expect.stringContaining('/api/auth/verificar-email?'),
      })
    );
  });

  it('registra los consentimientos con fecha', async () => {
    const { POST } = await import('../../apps/web/src/app/api/usuarios/registro/route');
    await POST(req(BODY_VALIDO));

    expect(dbMock.usuario.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          consentimientoDatos: true,
          consentimientoIA: true,
          consentimientoMarketing: false,
          fechaConsentimiento: expect.any(Date),
        }),
      })
    );
  });

  it('hashea la contraseña antes de guardar', async () => {
    const { POST } = await import('../../apps/web/src/app/api/usuarios/registro/route');
    await POST(req(BODY_VALIDO));

    const llamada = dbMock.usuario.create.mock.calls[0][0];
    expect(llamada.data.hashedPassword).toBeDefined();
    expect(llamada.data.hashedPassword).not.toBe(BODY_VALIDO.password);
    expect(llamada.data).not.toHaveProperty('password');
  });
});

describe('POST /api/usuarios/registro — rate limiting', () => {
  it('devuelve 429 si se supera el límite de intentos por IP', async () => {
    rateLimitRegistroMock.mockResolvedValue({ allowed: false, remaining: 0, resetAt: new Date() });
    const { POST } = await import('../../apps/web/src/app/api/usuarios/registro/route');
    const res = await POST(req(BODY_VALIDO));

    expect(res.status).toBe(429);
    expect(dbMock.usuario.create).not.toHaveBeenCalled();
  });

  it('consulta el rate limit usando la IP de x-forwarded-for', async () => {
    const { POST } = await import('../../apps/web/src/app/api/usuarios/registro/route');
    await POST(req(BODY_VALIDO));
    expect(rateLimitRegistroMock).toHaveBeenCalledWith('1.2.3.4');
  });
});

describe('POST /api/usuarios/registro — validaciones', () => {
  it('rechaza contraseña sin carácter especial', async () => {
    const { POST } = await import('../../apps/web/src/app/api/usuarios/registro/route');
    const res = await POST(req({ ...BODY_VALIDO, password: 'Segura1234' }));
    expect(res.status).toBe(400);
  });

  it('rechaza menores de 18 años', async () => {
    const hace10Anios = new Date();
    hace10Anios.setFullYear(hace10Anios.getFullYear() - 10);
    const fecha = hace10Anios.toISOString().slice(0, 10);

    const { POST } = await import('../../apps/web/src/app/api/usuarios/registro/route');
    const res = await POST(req({ ...BODY_VALIDO, fechaNacimiento: fecha }));

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.codigo).toBe('MENOR_DE_EDAD');
    expect(dbMock.usuario.create).not.toHaveBeenCalled();
  });

  it('devuelve 409 si el email ya existe', async () => {
    dbMock.usuario.findUnique.mockResolvedValue({ id: 'existente' });
    const { POST } = await import('../../apps/web/src/app/api/usuarios/registro/route');
    const res = await POST(req(BODY_VALIDO));
    expect(res.status).toBe(409);
  });

  it('devuelve 500 sin exponer detalles internos si la BD falla', async () => {
    dbMock.usuario.create.mockRejectedValue(new Error('conexión perdida a Postgres'));
    const { POST } = await import('../../apps/web/src/app/api/usuarios/registro/route');
    const res = await POST(req(BODY_VALIDO));

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).not.toContain('conexión perdida');
  });
});
