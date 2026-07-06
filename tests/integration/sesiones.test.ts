/**
 * Tests de integración — API de Sesiones de Chat
 * GET/POST /api/chat/sesiones
 * GET/PATCH /api/chat/sesiones/[id]
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────

vi.mock('next-auth', () => ({
  default: vi.fn(),
  getServerSession: vi.fn().mockResolvedValue(null),
}));
vi.mock('@/lib/auth/auth-options', () => ({ authOptions: {} }));
vi.mock('next/headers', () => ({
  headers: vi.fn().mockReturnValue(new Headers()),
  cookies: vi.fn().mockReturnValue({ get: vi.fn(), getAll: vi.fn(() => []) }),
}));

const SESION_USUARIO = {
  user: { id: 'usr-abc', email: 'test@mindbridge.co', plan: 'GRATIS', rol: 'USUARIO' },
};

const sesionDb = {
  id: 'ses-001',
  titulo: 'Mi primera sesión',
  createdAt: new Date('2026-05-20T10:00:00Z'),
  _count: { mensajes: 5 },
};

const mensajesDb = [
  { id: 'msg-1', rol: 'user', contenido: 'Hola', esCrisis: false, createdAt: new Date() },
  { id: 'msg-2', rol: 'assistant', contenido: 'Hola, ¿cómo te sientes?', esCrisis: false, createdAt: new Date() },
];

const dbMock = {
  sesionChat: {
    findMany: vi.fn().mockResolvedValue([sesionDb]),
    create: vi.fn().mockResolvedValue({ id: 'ses-nueva', titulo: null, createdAt: new Date() }),
    findUnique: vi.fn().mockResolvedValue({
      id: 'ses-001',
      titulo: 'Sesión test',
      usuarioId: 'usr-abc',
      mensajes: mensajesDb,
    }),
    update: vi.fn().mockResolvedValue({}),
  },
};

vi.mock('@/lib/db/client', () => ({ db: dbMock }));

// ── Helpers ───────────────────────────────────────────────────────

import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

function req(url: string, method = 'GET', body?: object): NextRequest {
  return new NextRequest(`http://localhost:3000${url}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ── GET /api/chat/sesiones ────────────────────────────────────────

describe('GET /api/chat/sesiones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(SESION_USUARIO as any);
  });

  it('devuelve lista de sesiones del usuario', async () => {
    const { GET } = await import('../../apps/web/src/app/api/chat/sesiones/route');
    const res = await GET(req('/api/chat/sesiones'));

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('titulo');
    expect(data[0]).toHaveProperty('fecha');
    expect(data[0]).toHaveProperty('mensajes');
  });

  it('devuelve 401 sin sesión', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { GET } = await import('../../apps/web/src/app/api/chat/sesiones/route');
    const res = await GET(req('/api/chat/sesiones'));
    expect(res.status).toBe(401);
  });

  it('solo busca sesiones del usuario autenticado', async () => {
    const { GET } = await import('../../apps/web/src/app/api/chat/sesiones/route');
    await GET(req('/api/chat/sesiones'));

    expect(dbMock.sesionChat.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ usuarioId: 'usr-abc' }),
      })
    );
  });
});

// ── POST /api/chat/sesiones ───────────────────────────────────────

describe('POST /api/chat/sesiones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(SESION_USUARIO as any);
    dbMock.sesionChat.create.mockResolvedValue({ id: 'ses-nueva', titulo: 'test', createdAt: new Date() });
  });

  it('crea sesión y devuelve 201', async () => {
    const { POST } = await import('../../apps/web/src/app/api/chat/sesiones/route');
    const res = await POST(req('/api/chat/sesiones', 'POST', { titulo: 'Sesión de ansiedad' }));

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toHaveProperty('id');
  });

  it('crea sesión sin título (titulo null)', async () => {
    const { POST } = await import('../../apps/web/src/app/api/chat/sesiones/route');
    await POST(req('/api/chat/sesiones', 'POST', {}));

    expect(dbMock.sesionChat.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ usuarioId: 'usr-abc' }),
      })
    );
  });

  it('devuelve 401 sin sesión', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { POST } = await import('../../apps/web/src/app/api/chat/sesiones/route');
    const res = await POST(req('/api/chat/sesiones', 'POST', {}));
    expect(res.status).toBe(401);
  });
});

// ── GET /api/chat/sesiones/[id] ───────────────────────────────────

describe('GET /api/chat/sesiones/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(SESION_USUARIO as any);
    dbMock.sesionChat.findUnique.mockResolvedValue({
      id: 'ses-001',
      titulo: 'Sesión test',
      usuarioId: 'usr-abc',
      mensajes: mensajesDb,
    });
  });

  it('devuelve mensajes de la sesión', async () => {
    const { GET } = await import('../../apps/web/src/app/api/chat/sesiones/[id]/route');
    const res = await GET(req('/api/chat/sesiones/ses-001'), { params: { id: 'ses-001' } });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('mensajes');
    expect(data.mensajes.length).toBe(2);
    expect(data.mensajes[0]).toHaveProperty('rol');
    expect(data.mensajes[0]).toHaveProperty('contenido');
    expect(data.mensajes[0]).toHaveProperty('timestamp');
  });

  it('devuelve 404 para sesión de otro usuario', async () => {
    dbMock.sesionChat.findUnique.mockResolvedValue({
      id: 'ses-ajena',
      titulo: 'Ajena',
      usuarioId: 'otro-usuario',
      mensajes: [],
    });

    const { GET } = await import('../../apps/web/src/app/api/chat/sesiones/[id]/route');
    const res = await GET(req('/api/chat/sesiones/ses-ajena'), { params: { id: 'ses-ajena' } });
    expect(res.status).toBe(404);
  });

  it('devuelve 404 si la sesión no existe', async () => {
    dbMock.sesionChat.findUnique.mockResolvedValue(null);
    const { GET } = await import('../../apps/web/src/app/api/chat/sesiones/[id]/route');
    const res = await GET(req('/api/chat/sesiones/inexistente'), { params: { id: 'inexistente' } });
    expect(res.status).toBe(404);
  });
});

// ── PATCH /api/chat/sesiones/[id] ────────────────────────────────

describe('PATCH /api/chat/sesiones/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(SESION_USUARIO as any);
    dbMock.sesionChat.findUnique.mockResolvedValue({ usuarioId: 'usr-abc' });
    dbMock.sesionChat.update.mockResolvedValue({});
  });

  it('actualiza el título de la sesión', async () => {
    const { PATCH } = await import('../../apps/web/src/app/api/chat/sesiones/[id]/route');
    const res = await PATCH(
      req('/api/chat/sesiones/ses-001', 'PATCH', { titulo: 'Nuevo título' }),
      { params: { id: 'ses-001' } }
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it('no permite actualizar sesión de otro usuario', async () => {
    dbMock.sesionChat.findUnique.mockResolvedValue({ usuarioId: 'otro-usuario' });
    const { PATCH } = await import('../../apps/web/src/app/api/chat/sesiones/[id]/route');
    const res = await PATCH(
      req('/api/chat/sesiones/ses-ajena', 'PATCH', { titulo: 'Hack' }),
      { params: { id: 'ses-ajena' } }
    );
    expect(res.status).toBe(404);
  });
});
