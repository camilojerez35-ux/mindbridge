import { citasService } from '@/lib/api/citas';
import { api } from '@/lib/api/client';

jest.mock('@/lib/api/client', () => ({
  api: { get: jest.fn(), post: jest.fn() },
}));

const mockApi = api as jest.Mocked<typeof api>;
beforeEach(() => jest.clearAllMocks());

describe('citasService', () => {
  describe('getCitas', () => {
    it('retorna citas del usuario', async () => {
      mockApi.get.mockResolvedValue({ citas: [{ id: 'c1', estado: 'CONFIRMADA' }], paginacion: { total: 1 } });
      const res = await citasService.getCitas();
      expect(res.citas).toHaveLength(1);
      expect(mockApi.get).toHaveBeenCalledWith('/citas');
    });

    it('aplica filtro de estado', async () => {
      mockApi.get.mockResolvedValue({ citas: [], paginacion: { total: 0 } });
      await citasService.getCitas('PENDIENTE');
      expect(mockApi.get).toHaveBeenCalledWith('/citas?estado=PENDIENTE');
    });
  });

  describe('agendarCita', () => {
    it('envía los datos correctos al backend', async () => {
      mockApi.post.mockResolvedValue({ citaId: 'new-1', referencia: 'REF001', montoCOP: 80000 });
      const input = { psicologoId: 'p1', fechaHora: '2026-07-10T10:00:00Z', metodoPago: 'NEQUI' as const };
      const res = await citasService.agendarCita(input);
      expect(mockApi.post).toHaveBeenCalledWith('/citas', input);
      expect(res.citaId).toBe('new-1');
      expect(res.montoCOP).toBe(80000);
    });
  });
});
