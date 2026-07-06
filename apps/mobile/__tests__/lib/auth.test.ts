import { authService } from '@/lib/api/auth';
import { api } from '@/lib/api/client';
import * as SecureStore from 'expo-secure-store';

jest.mock('@/lib/api/client', () => ({
  api: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;
const mockStore = SecureStore as jest.Mocked<typeof SecureStore>;

beforeEach(() => jest.clearAllMocks());

describe('authService', () => {
  describe('login', () => {
    it('guarda token y retorna datos del usuario', async () => {
      mockApi.post.mockResolvedValue({ token: 'tok123', usuario: { id: '1', nombre: 'Ana', email: 'a@b.co', plan: 'GRATIS', rol: 'PACIENTE' } });
      mockStore.setItemAsync.mockResolvedValue();
      const res = await authService.login('a@b.co', 'pass123');
      expect(res.token).toBe('tok123');
      expect(mockStore.setItemAsync).toHaveBeenCalledWith('session_token', 'tok123');
    });

    it('llama al endpoint correcto', async () => {
      mockApi.post.mockResolvedValue({ token: 'x', usuario: { id: '1', plan: 'GRATIS' } });
      mockStore.setItemAsync.mockResolvedValue();
      await authService.login('user@test.co', 'secret');
      expect(mockApi.post).toHaveBeenCalledWith('/auth/signin', { email: 'user@test.co', password: 'secret' });
    });
  });

  describe('logout', () => {
    it('elimina el token del SecureStore', async () => {
      mockStore.deleteItemAsync.mockResolvedValue();
      await authService.logout();
      expect(mockStore.deleteItemAsync).toHaveBeenCalledWith('session_token');
    });
  });

  describe('getUsuario', () => {
    it('retorna datos del usuario combinando nombre y apellido', async () => {
      mockApi.get.mockResolvedValue({ usuario: { id: '1', nombre: 'Carlos', apellido: 'López', email: 'c@c.co', planActual: 'PRO', rol: 'PACIENTE' } });
      const u = await authService.getUsuario();
      expect(u.nombre).toBe('Carlos López');
      expect(u.plan).toBe('PRO');
      expect(mockApi.get).toHaveBeenCalledWith('/usuarios');
    });

    it('maneja apellido nulo', async () => {
      mockApi.get.mockResolvedValue({ usuario: { id: '2', nombre: 'Ana', apellido: null, email: 'a@b.co', planActual: 'GRATIS', rol: 'PACIENTE' } });
      const u = await authService.getUsuario();
      expect(u.nombre).toBe('Ana');
    });
  });
});
