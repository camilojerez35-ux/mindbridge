/**
 * Tests de integración — Crons de notificaciones
 * GET /api/notificaciones?job=...
 *
 * Cubre los bugs reales corregidos el 2026-08-23: recordatorios de citas
 * que no encontraban nada por ventana de tiempo estrecha, desfase de zona
 * horaria en "hoy" (Bogotá vs UTC del servidor), y falta de límite en los
 * recordatorios de inactividad (reenvío indefinido).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

process.env.CRON_SECRET = 'test-cron-secret';
process.env.APP_URL = 'http://localhost:3000';

// ── Mocks ─────────────────────────────────────────────────────────

const dbMock = {
  cita: {
    findMany: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue({}),
  },
  usuario: {
    findMany: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue({}),
  },
  senalRTC: {
    deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
  },
};

vi.mock('@/lib/db/client', () => ({ db: dbMock }));

const { enviarEmailMock } = vi.hoisted(() => ({ enviarEmailMock: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/email/confirmaciones', () => ({
  enviarEmail: enviarEmailMock,
  escapeHtml: (s: string) => s,
}));

const { enviarPushUnoMock } = vi.hoisted(() => ({ enviarPushUnoMock: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/push/expo', () => ({ enviarPushUno: enviarPushUnoMock }));

vi.mock('next-auth', () => ({
  default: vi.fn(),
  getServerSession: vi.fn().mockResolvedValue(null),
}));
vi.mock('@/lib/auth/auth-options', () => ({ authOptions: {} }));

// ── Helpers ───────────────────────────────────────────────────────

function reqGet(job: string, auth = `Bearer ${process.env.CRON_SECRET}`): Request {
  return new Request(`http://localhost:3000/api/notificaciones?job=${job}`, {
    method: 'GET',
    headers: auth ? { Authorization: auth } : {},
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  dbMock.cita.findMany.mockResolvedValue([]);
  dbMock.usuario.findMany.mockResolvedValue([]);
});

afterEach(() => {
  vi.useRealTimers();
});

// ── Autenticación del cron ──────────────────────────────────────

describe('GET /api/notificaciones — autenticación', () => {
  it('rechaza sin CRON_SECRET válido', async () => {
    const { GET } = await import('../../apps/web/src/app/api/notificaciones/route');
    const res = await GET(reqGet('citas-24h', 'Bearer incorrecto') as any);
    expect(res.status).toBe(401);
    expect(dbMock.cita.findMany).not.toHaveBeenCalled();
  });

  it('rechaza job desconocido', async () => {
    const { GET } = await import('../../apps/web/src/app/api/notificaciones/route');
    const res = await GET(reqGet('job-inexistente') as any);
    expect(res.status).toBe(400);
  });
});

// ── Recordatorios de citas (idempotencia — bug corregido) ───────

describe('GET /api/notificaciones?job=citas-24h', () => {
  it('busca citas confirmadas dentro de las próximas 24h sin recordatorio enviado', async () => {
    const { GET } = await import('../../apps/web/src/app/api/notificaciones/route');
    await GET(reqGet('citas-24h') as any);

    const where = dbMock.cita.findMany.mock.calls[0][0].where;
    expect(where.estado).toBe('CONFIRMADA');
    expect(where.recordatorio24hEnviadoEn).toBeNull();
    // Ventana: en cualquier punto entre ahora y +24h — no una franja estrecha de minutos
    const anchoVentanaMs = where.fechaHora.lte.getTime() - where.fechaHora.gt.getTime();
    expect(anchoVentanaMs).toBe(24 * 60 * 60 * 1000);
  });

  it('envía email y push, y marca recordatorio24hEnviadoEn tras el envío', async () => {
    dbMock.cita.findMany.mockResolvedValue([{
      id: 'cita1',
      fechaHora: new Date(Date.now() + 23 * 60 * 60 * 1000),
      usuario: { nombre: 'Ana', apellido: 'Ruiz', email: 'ana@test.co', pushToken: 'push-1' },
      psicologo: { nombreCompleto: 'Dr. Gómez', usuario: { email: 'psi@test.co', pushToken: null } },
    }]);

    const { GET } = await import('../../apps/web/src/app/api/notificaciones/route');
    const res = await GET(reqGet('citas-24h') as any);
    const data = await res.json();

    expect(data.enviados).toBe(1);
    expect(enviarEmailMock).toHaveBeenCalledTimes(1);
    expect(enviarPushUnoMock).toHaveBeenCalledTimes(1);
    expect(dbMock.cita.update).toHaveBeenCalledWith({
      where: { id: 'cita1' },
      data: { recordatorio24hEnviadoEn: expect.any(Date) },
    });
  });

  it('no reenvía a una cita que ya tiene recordatorio24hEnviadoEn (filtrado en el query)', async () => {
    // El filtro recordatorio24hEnviadoEn: null ya excluye estas citas en BD —
    // aquí verificamos que el query siempre lo incluye, sea cual sea el resultado.
    const { GET } = await import('../../apps/web/src/app/api/notificaciones/route');
    await GET(reqGet('citas-24h') as any);
    expect(dbMock.cita.findMany.mock.calls[0][0].where.recordatorio24hEnviadoEn).toBeNull();
  });
});

describe('GET /api/notificaciones?job=citas-1h', () => {
  it('usa una ventana de 1h y el campo de dedup recordatorio1hEnviadoEn', async () => {
    const { GET } = await import('../../apps/web/src/app/api/notificaciones/route');
    await GET(reqGet('citas-1h') as any);

    const where = dbMock.cita.findMany.mock.calls[0][0].where;
    expect(where.recordatorio1hEnviadoEn).toBeNull();
    const anchoVentanaMs = where.fechaHora.lte.getTime() - where.fechaHora.gt.getTime();
    expect(anchoVentanaMs).toBe(60 * 60 * 1000);
  });

  it('notifica a paciente y psicólogo (push + email) y marca el envío', async () => {
    dbMock.cita.findMany.mockResolvedValue([{
      id: 'cita2',
      fechaHora: new Date(Date.now() + 30 * 60 * 1000),
      usuario: { nombre: 'Ana', apellido: 'Ruiz', email: 'ana@test.co', pushToken: 'push-1' },
      psicologo: { nombreCompleto: 'Dr. Gómez', usuario: { email: 'psi@test.co', pushToken: 'push-2' } },
    }]);

    const { GET } = await import('../../apps/web/src/app/api/notificaciones/route');
    await GET(reqGet('citas-1h') as any);

    expect(enviarPushUnoMock).toHaveBeenCalledTimes(2); // paciente + psicólogo
    expect(enviarEmailMock).toHaveBeenCalledTimes(2);   // paciente + psicólogo
    expect(dbMock.cita.update).toHaveBeenCalledWith({
      where: { id: 'cita2' },
      data: { recordatorio1hEnviadoEn: expect.any(Date) },
    });
  });
});

// ── Recordatorio de ánimo (zona horaria — bug corregido) ─────────

describe('GET /api/notificaciones?job=recordatorio-animo', () => {
  it('calcula "hoy" como medianoche de Bogotá (UTC-5), no medianoche UTC del servidor', async () => {
    // 2026-08-24T03:00:00Z = 2026-08-23 22:00 hora Bogotá — sigue siendo "23 de agosto" en Bogotá.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-24T03:00:00.000Z'));

    const { GET } = await import('../../apps/web/src/app/api/notificaciones/route');
    await GET(reqGet('recordatorio-animo') as any);

    const where = dbMock.usuario.findMany.mock.calls[0][0].where;
    const hoy = where.entradasDiario.none.createdAt.gte;
    const manana = where.entradasDiario.none.createdAt.lt;

    // Medianoche Bogotá del 23 de agosto = 2026-08-23T05:00:00.000Z
    expect(hoy.toISOString()).toBe('2026-08-23T05:00:00.000Z');
    expect(manana.toISOString()).toBe('2026-08-24T05:00:00.000Z');
  });
});

// ── Inactividad IA — reintenta periódicamente (bug corregido) ───

describe('GET /api/notificaciones?job=inactividad-ia', () => {
  it('incluye usuarios sin dedup previo o con dedup vencido (7+ días)', async () => {
    const { GET } = await import('../../apps/web/src/app/api/notificaciones/route');
    await GET(reqGet('inactividad-ia') as any);

    const where = dbMock.usuario.findMany.mock.calls[0][0].where;
    expect(where.OR).toEqual([
      { ultimaInactividadIAEnviadoEn: null },
      { ultimaInactividadIAEnviadoEn: { lt: expect.any(Date) } },
    ]);
    // Ya no exige "some entrada en 7-8 días" — solo "ninguna en los últimos 7 días"
    expect(where.entradasDiario).toEqual({ none: { createdAt: { gte: expect.any(Date) } } });
  });

  it('marca ultimaInactividadIAEnviadoEn tras notificar', async () => {
    dbMock.usuario.findMany.mockResolvedValue([{ id: 'usr1', email: 'u@test.co', nombre: 'Uno' }]);
    const { GET } = await import('../../apps/web/src/app/api/notificaciones/route');
    await GET(reqGet('inactividad-ia') as any);

    expect(dbMock.usuario.update).toHaveBeenCalledWith({
      where: { id: 'usr1' },
      data: { ultimaInactividadIAEnviadoEn: expect.any(Date) },
    });
  });
});

// ── Reengagement 3 días — límite de reenvío (bug corregido) ─────

describe('GET /api/notificaciones?job=reengagement-3dias', () => {
  it('excluye usuarios notificados hace menos de 7 días (evita spam diario)', async () => {
    const { GET } = await import('../../apps/web/src/app/api/notificaciones/route');
    await GET(reqGet('reengagement-3dias') as any);

    const where = dbMock.usuario.findMany.mock.calls[0][0].where;
    expect(where.OR).toEqual([
      { ultimoReengagementEnviadoEn: null },
      { ultimoReengagementEnviadoEn: { lt: expect.any(Date) } },
    ]);
  });

  it('personaliza el push con la última emoción registrada y marca el dedup', async () => {
    dbMock.usuario.findMany.mockResolvedValue([{
      id: 'usr2',
      pushToken: 'push-3',
      nombre: 'Carlos Pérez',
      entradasDiario: [{ emociones: ['ansiedad'], sentimientos: [] }],
    }]);

    const { GET } = await import('../../apps/web/src/app/api/notificaciones/route');
    await GET(reqGet('reengagement-3dias') as any);

    expect(enviarPushUnoMock).toHaveBeenCalledWith(
      'push-3',
      'Hola Carlos 💚',
      expect.stringContaining('ansiedad'),
      { tipo: 'reengagement' },
    );
    expect(dbMock.usuario.update).toHaveBeenCalledWith({
      where: { id: 'usr2' },
      data: { ultimoReengagementEnviadoEn: expect.any(Date) },
    });
  });
});
