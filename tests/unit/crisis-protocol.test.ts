/**
 * Tests unitarios — Registro de incidentes de crisis (apps/web/src/lib/crisis/incident-logger.ts)
 *
 * La detección del nivel de crisis (packages/ai-clinical) ya tiene cobertura 100%
 * en tests/ai-clinical/crisis-protocol.test.ts. Este archivo cubre el registro
 * del incidente: reintentos, cifrado antes de persistir, y fallback a Sentry.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { createMock, capturarEventoCrisisMock, capturarErrorPersistenciaMock, encryptMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  capturarEventoCrisisMock: vi.fn(),
  capturarErrorPersistenciaMock: vi.fn(),
  encryptMock: vi.fn((texto: string) => `cifrado(${texto})`),
}));

vi.mock('@/lib/db/client', () => ({ db: { incidenteCrisis: { create: createMock } } }));
vi.mock('@/lib/monitoring/sentry', () => ({
  capturarEventoCrisis: capturarEventoCrisisMock,
  capturarErrorPersistencia: capturarErrorPersistenciaMock,
}));
vi.mock('@/lib/encryption', () => ({ encryption: { encrypt: encryptMock } }));

import { registrarIncidente, registrarIncidenteAsync, type DatosIncidente } from '../../apps/web/src/lib/crisis/incident-logger';

const datosBase: DatosIncidente = {
  usuarioId: 'usr-1',
  sesionId: 'ses-1',
  nivel: 'critico',
  indicadoresDetectados: ['me quiero matar'],
  fragmentoAnonimizado: 'fragmento de prueba',
  timestampDeteccion: new Date('2026-07-08T00:00:00Z'),
  protocoloActivado: true,
  psicologoNotificado: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  createMock.mockResolvedValue({ id: 'inc-1' });
});

describe('registrarIncidente', () => {
  it('cifra el fragmento anonimizado antes de persistir', async () => {
    await registrarIncidente(datosBase);

    expect(encryptMock).toHaveBeenCalledWith('fragmento de prueba');
    expect(createMock).toHaveBeenCalledWith({
      data: expect.objectContaining({ fragmentoAnonimizado: 'cifrado(fragmento de prueba)' }),
    });
  });

  it('no intenta cifrar si no hay fragmento', async () => {
    await registrarIncidente({ ...datosBase, fragmentoAnonimizado: '' });
    expect(encryptMock).not.toHaveBeenCalled();
    expect(createMock).toHaveBeenCalledWith({
      data: expect.objectContaining({ fragmentoAnonimizado: null }),
    });
  });

  it('reporta el evento de crisis a monitoring tras persistir con éxito', async () => {
    await registrarIncidente(datosBase);
    expect(capturarEventoCrisisMock).toHaveBeenCalledWith(
      expect.objectContaining({ nivel: 'critico', usuarioId: 'usr-1', sesionId: 'ses-1' })
    );
  });

  it('reintenta hasta 3 veces si la persistencia falla', async () => {
    createMock
      .mockRejectedValueOnce(new Error('timeout'))
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce({ id: 'inc-1' });

    await registrarIncidente(datosBase);

    expect(createMock).toHaveBeenCalledTimes(3);
    expect(capturarEventoCrisisMock).toHaveBeenCalled();
  });

  it('tras agotar los 3 reintentos, captura el error en Sentry en vez de fallar en silencio', async () => {
    createMock.mockRejectedValue(new Error('BD caída'));

    await registrarIncidente(datosBase);

    expect(createMock).toHaveBeenCalledTimes(3);
    expect(capturarErrorPersistenciaMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ operacion: 'registrar_incidente_crisis', usuarioId: 'usr-1', sesionId: 'ses-1' })
    );
    expect(capturarEventoCrisisMock).not.toHaveBeenCalled();
  });
});

describe('registrarIncidenteAsync', () => {
  it('no lanza excepción aunque la persistencia falle', async () => {
    createMock.mockRejectedValue(new Error('BD caída'));
    expect(() => registrarIncidenteAsync(datosBase)).not.toThrow();

    await new Promise((r) => setTimeout(r, 800));
    expect(capturarErrorPersistenciaMock).toHaveBeenCalled();
  });

  it('registra correctamente cuando la BD responde bien', async () => {
    registrarIncidenteAsync(datosBase);
    await new Promise((r) => setTimeout(r, 20));
    expect(createMock).toHaveBeenCalled();
    expect(capturarEventoCrisisMock).toHaveBeenCalled();
  });
});
