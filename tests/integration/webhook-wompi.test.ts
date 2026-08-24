/**
 * Tests de integración — Webhook de pagos Wompi
 * POST /api/webhooks/wompi
 *
 * Cubre: verificación de firma, protección contra manipulación de monto
 * (tampering), activación de suscripción (mensual/anual), idempotencia
 * ante duplicados, y confirmación de pago de citas.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHash } from 'crypto';

process.env.WOMPI_EVENTS_SECRET = 'test-events-secret';
process.env.APP_URL = 'http://localhost:3000';

// ── Mocks ─────────────────────────────────────────────────────────

const dbMock = {
  pago: {
    findUnique: vi.fn(),
    update: vi.fn().mockResolvedValue({}),
  },
  suscripcion: {
    create: vi.fn().mockResolvedValue({ id: 'sub-1' }),
  },
  usuario: {
    update: vi.fn().mockResolvedValue({}),
    findUnique: vi.fn().mockResolvedValue({ email: 'user@test.co', nombre: 'Test' }),
  },
  cita: {
    update: vi.fn().mockResolvedValue({
      id: 'cita1',
      fechaHora: new Date('2026-09-01T15:00:00Z'),
      duracionMinutos: 45,
      usuario: { email: 'paciente@test.co', nombre: 'Paciente', apellido: 'Uno' },
      psicologo: { nombreCompleto: 'Dra. Ana', usuarioId: 'psi-usr-1' },
    }),
  },
};

vi.mock('@/lib/db/client', () => ({ db: dbMock }));

vi.mock('@/lib/monitoring/sentry', () => ({
  capturarErrorApi: vi.fn(),
}));

const { enviarEmailMock } = vi.hoisted(() => ({ enviarEmailMock: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/email/confirmaciones', () => ({ enviarEmail: enviarEmailMock }));

const { capturarEventoMock } = vi.hoisted(() => ({ capturarEventoMock: vi.fn() }));
vi.mock('@/lib/analytics/posthog', () => ({ capturarEvento: capturarEventoMock }));

// ── Helpers ───────────────────────────────────────────────────────

const SIGNATURE_PROPS = ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'];

function firmar(tx: { id: string; status: string; amount_in_cents: number }, timestamp: number): string {
  const cadena = tx.id + tx.status + String(tx.amount_in_cents) + timestamp + process.env.WOMPI_EVENTS_SECRET;
  return createHash('sha256').update(cadena).digest('hex');
}

function evento(tx: Partial<{
  id: string; status: string; reference: string; amount_in_cents: number;
}>, opts: { firmaValida?: boolean; eventType?: string } = {}) {
  const transaction = {
    id: tx.id ?? 'wompi-tx-1',
    status: tx.status ?? 'APPROVED',
    reference: tx.reference ?? 'SUBS-usrabc-PLUS-MENSUAL-1700000000',
    amount_in_cents: tx.amount_in_cents ?? 2590000,
    currency: 'COP',
    payment_method_type: 'CARD',
  };
  const timestamp = 1700000000;
  const checksum = opts.firmaValida === false ? 'f'.repeat(64) : firmar(transaction, timestamp);

  return {
    event: opts.eventType ?? 'transaction.updated',
    data: { transaction },
    environment: 'test',
    signature: { properties: SIGNATURE_PROPS, checksum },
    timestamp,
  };
}

function req(body: unknown): Request {
  return new Request('http://localhost:3000/api/webhooks/wompi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  dbMock.pago.findUnique.mockResolvedValue(null); // por defecto: pago no existe aún (sin duplicado)
});

// ── Verificación de firma ───────────────────────────────────────

describe('POST /api/webhooks/wompi — firma', () => {
  it('rechaza con 401 si la firma no coincide', async () => {
    const { POST } = await import('../../apps/web/src/app/api/webhooks/wompi/route');
    const res = await POST(req(evento({}, { firmaValida: false })) as any);
    expect(res.status).toBe(401);
    expect(dbMock.pago.update).not.toHaveBeenCalled();
  });

  it('ignora eventos que no son transaction.updated', async () => {
    const { POST } = await import('../../apps/web/src/app/api/webhooks/wompi/route');
    const res = await POST(req(evento({}, { eventType: 'transaction.created' })) as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ignorado).toBe(true);
  });
});

// ── Protección contra manipulación de monto ─────────────────────

describe('POST /api/webhooks/wompi — validación de monto (anti-tampering)', () => {
  it('rechaza activar el plan si el monto no coincide con el precio esperado', async () => {
    const { POST } = await import('../../apps/web/src/app/api/webhooks/wompi/route');
    // PLUS mensual real cuesta 2.590.000 centavos — se envía manipulado a 100 centavos
    const res = await POST(req(evento({
      reference: 'SUBS-usrabc-PLUS-MENSUAL-1700000000',
      amount_in_cents: 100,
    })) as any);

    expect(res.status).toBe(200);
    expect(dbMock.suscripcion.create).not.toHaveBeenCalled();
    expect(dbMock.usuario.update).not.toHaveBeenCalled();
  });
});

// ── Activación de suscripción ────────────────────────────────────

describe('POST /api/webhooks/wompi — activación de suscripción', () => {
  it('activa el plan BASICO mensual con el monto correcto', async () => {
    const { POST } = await import('../../apps/web/src/app/api/webhooks/wompi/route');
    const res = await POST(req(evento({
      reference: 'SUBS-usrabc-BASICO-MENSUAL-1700000000',
      amount_in_cents: 1490000,
    })) as any);

    expect(res.status).toBe(200);
    expect(dbMock.suscripcion.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ usuarioId: 'usrabc', plan: 'BASICO' }) })
    );
    expect(dbMock.usuario.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'usrabc' }, data: expect.objectContaining({ planActual: 'BASICO' }) })
    );
    expect(capturarEventoMock).toHaveBeenCalledWith('plan_upgrade', expect.objectContaining({ usuarioId: 'usrabc', plan: 'BASICO' }));
    expect(enviarEmailMock).toHaveBeenCalled();
  });

  it('activa el plan PLUS anual con vencimiento a 12 meses', async () => {
    const { POST } = await import('../../apps/web/src/app/api/webhooks/wompi/route');
    await POST(req(evento({
      reference: 'SUBS-usrabc-PLUS-ANUAL-1700000000',
      amount_in_cents: 25900000, // 259.000 COP en centavos
    })) as any);

    const dataCreada = dbMock.suscripcion.create.mock.calls[0][0].data;
    const inicio = new Date(dataCreada.fechaInicio);
    const vence  = new Date(dataCreada.fechaVencimiento);
    const mesesDiff = (vence.getFullYear() - inicio.getFullYear()) * 12 + (vence.getMonth() - inicio.getMonth());
    expect(mesesDiff).toBe(12);
  });

  it('no activa el plan si el pago fue rechazado (DECLINED)', async () => {
    const { POST } = await import('../../apps/web/src/app/api/webhooks/wompi/route');
    await POST(req(evento({ status: 'DECLINED' })) as any);

    expect(dbMock.suscripcion.create).not.toHaveBeenCalled();
    expect(dbMock.usuario.update).not.toHaveBeenCalled();
    expect(dbMock.pago.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ estado: 'RECHAZADO' }) })
    );
  });

  it('es idempotente — no reprocesa una transacción ya registrada', async () => {
    dbMock.pago.findUnique.mockResolvedValue({ id: 'pago-existente' });
    const { POST } = await import('../../apps/web/src/app/api/webhooks/wompi/route');
    await POST(req(evento({})) as any);

    expect(dbMock.pago.update).not.toHaveBeenCalled();
    expect(dbMock.suscripcion.create).not.toHaveBeenCalled();
  });
});

// ── Pago de citas ─────────────────────────────────────────────────

describe('POST /api/webhooks/wompi — confirmación de cita', () => {
  it('confirma la cita y notifica a paciente y psicólogo cuando el pago es aprobado', async () => {
    const { POST } = await import('../../apps/web/src/app/api/webhooks/wompi/route');
    const res = await POST(req(evento({ reference: 'CITA-cita1-1700000000' })) as any);

    expect(res.status).toBe(200);
    expect(dbMock.cita.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cita1' },
        data: expect.objectContaining({ estado: 'CONFIRMADA', estadoPago: 'APROBADO' }),
      })
    );
    expect(enviarEmailMock).toHaveBeenCalledTimes(2); // paciente + psicólogo
  });
});
