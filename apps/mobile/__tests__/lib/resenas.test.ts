import { resenasService } from '@/lib/api/resenas';
import { api } from '@/lib/api/client';

jest.mock('@/lib/api/client', () => ({
  api: { post: jest.fn() },
}));

const mockApi = api as jest.Mocked<typeof api>;
beforeEach(() => jest.clearAllMocks());

describe('resenasService', () => {
  it('envía calificación y comentario', async () => {
    mockApi.post.mockResolvedValue({ resena: { id: 'r1' } });
    const res = await resenasService.crearResena('cita-1', 5, 'Excelente sesión');
    expect(mockApi.post).toHaveBeenCalledWith('/resenas', { citaId: 'cita-1', calificacion: 5, comentario: 'Excelente sesión' });
    expect(res.resena.id).toBe('r1');
  });

  it('funciona sin comentario', async () => {
    mockApi.post.mockResolvedValue({ resena: { id: 'r2' } });
    await resenasService.crearResena('cita-2', 4);
    expect(mockApi.post).toHaveBeenCalledWith('/resenas', { citaId: 'cita-2', calificacion: 4, comentario: undefined });
  });
});
