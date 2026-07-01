import { psicologosService } from '@/lib/api/psicologos';
import { api } from '@/lib/api/client';

jest.mock('@/lib/api/client', () => ({
  api: { get: jest.fn() },
}));

const mockApi = api as jest.Mocked<typeof api>;

beforeEach(() => jest.clearAllMocks());

describe('psicologosService', () => {
  describe('getPsicologos', () => {
    it('mapea psicólogos de la API correctamente', async () => {
      mockApi.get.mockResolvedValue({
        psicologos: [{
          id: '1', nombreCompleto: 'Dra. Ana', especialidades: ['ansiedad'],
          tarifaCOP: 80000, calificacionPromedio: 4.8, fotoUrl: null, estado: 'VERIFICADO',
        }],
      });
      const result = await psicologosService.getPsicologos();
      expect(result[0].nombre).toBe('Dra. Ana');
      expect(result[0].tarifaSesion).toBe(80000);
      expect(result[0].verificado).toBe(true);
    });

    it('aplica filtros como query params', async () => {
      mockApi.get.mockResolvedValue({ psicologos: [] });
      await psicologosService.getPsicologos({ especialidad: 'ansiedad' });
      expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('especialidad=ansiedad'));
    });
  });

  describe('getPerfilConSlots', () => {
    it('retorna psicologo y slots disponibles', async () => {
      mockApi.get.mockResolvedValue({
        psicologo: {
          id: '2', nombreCompleto: 'Dr. Carlos', especialidades: [],
          tarifaCOP: 90000, calificacionPromedio: 4.5, estado: 'ACTIVO',
        },
        slots: [{ fecha: '2026-07-07', diaNombre: 'lunes', horas: ['09:00', '10:00'] }],
      });
      const { psicologo, slots } = await psicologosService.getPerfilConSlots('2');
      expect(psicologo.nombre).toBe('Dr. Carlos');
      expect(slots).toHaveLength(1);
      expect(slots[0].horas).toContain('09:00');
    });

    it('llama al endpoint correcto', async () => {
      mockApi.get.mockResolvedValue({ psicologo: { id: '3', nombreCompleto: 'Test', especialidades: [], tarifaCOP: 0, calificacionPromedio: 0 }, slots: [] });
      await psicologosService.getPerfilConSlots('abc-123');
      expect(mockApi.get).toHaveBeenCalledWith('/psicologos/abc-123');
    });
  });
});
