import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));

jest.mock('../../store/useAuthStore', () => ({
  useAuthStore: { setState: jest.fn() },
}));

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('api client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSecureStore.getItemAsync.mockResolvedValue(null);
  });

  it('retorna datos en respuesta exitosa', async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      ok: true,
      json: jest.fn().mockResolvedValue({ nombre: 'Test' }),
    });
    const { api } = await import('@/lib/api/client');
    const result = await api.get('/test');
    expect(result).toEqual({ nombre: 'Test' });
  });

  it('agrega Authorization header si hay token', async () => {
    mockSecureStore.getItemAsync.mockResolvedValue('mi-token');
    mockFetch.mockResolvedValue({
      status: 200,
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });
    const { api } = await import('@/lib/api/client');
    await api.get('/protegido');
    const callHeaders = mockFetch.mock.calls[0][1].headers;
    expect(callHeaders.Authorization).toBe('Bearer mi-token');
  });

  it('lanza error con status y mensaje en respuesta no OK', async () => {
    mockFetch.mockResolvedValue({
      status: 404,
      ok: false,
      json: jest.fn().mockResolvedValue({ mensaje: 'No encontrado' }),
    });
    const { api } = await import('@/lib/api/client');
    await expect(api.get('/inexistente')).rejects.toMatchObject({ status: 404, mensaje: 'No encontrado' });
  });

  it('en 401 limpia SecureStore y redirige a login', async () => {
    mockFetch.mockResolvedValue({ status: 401, ok: false });
    const { router } = await import('expo-router');
    const { api } = await import('@/lib/api/client');
    await expect(api.get('/privado')).rejects.toMatchObject({ status: 401 });
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('session_token');
    expect(router.replace).toHaveBeenCalledWith('/(auth)/login');
  });
});
