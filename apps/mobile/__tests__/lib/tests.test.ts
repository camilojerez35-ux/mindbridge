import { testsService } from '@/lib/api/tests';
import { api } from '@/lib/api/client';

jest.mock('@/lib/api/client', () => ({
  api: { get: jest.fn(), post: jest.fn() },
}));

const mockApi = api as jest.Mocked<typeof api>;

beforeEach(() => jest.clearAllMocks());

describe('testsService', () => {
  describe('getTests', () => {
    it('retorna lista de tests', async () => {
      mockApi.get.mockResolvedValue({ tests: [{ id: '1', titulo: 'PHQ-9', completado: false }], completados: 0, total: 1 });
      const res = await testsService.getTests();
      expect(res.tests).toHaveLength(1);
      expect(res.tests[0].titulo).toBe('PHQ-9');
      expect(mockApi.get).toHaveBeenCalledWith('/tests');
    });
  });

  describe('getTest', () => {
    it('llama al endpoint correcto', async () => {
      mockApi.get.mockResolvedValue({ test: { id: 'abc', titulo: 'PHQ-9', preguntas: [] } });
      const res = await testsService.getTest('abc');
      expect(mockApi.get).toHaveBeenCalledWith('/tests/abc');
      expect(res.test.id).toBe('abc');
    });
  });

  describe('enviarRespuestas', () => {
    it('envía testId y respuestas al backend', async () => {
      mockApi.post.mockResolvedValue({ resultado: { titulo: 'Leve', porcentaje: 30, puntajeTotal: 6, puntajeMaximo: 20, descripcion: 'OK' } });
      const respuestas = { 'p1': 1, 'p2': 2 };
      const res = await testsService.enviarRespuestas('test-1', respuestas);
      expect(mockApi.post).toHaveBeenCalledWith('/tests/resultado', { testId: 'test-1', respuestas });
      expect(res.resultado.titulo).toBe('Leve');
    });
  });
});
