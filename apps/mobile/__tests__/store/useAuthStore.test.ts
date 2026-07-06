import { useAuthStore } from '@/store/useAuthStore';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
jest.mock('@/lib/notifications', () => ({
  registrarPushToken: jest.fn().mockResolvedValue(null),
}));
jest.mock('@/lib/api/client', () => ({
  api: { delete: jest.fn().mockResolvedValue({}) },
}));
jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

beforeEach(() => {
  useAuthStore.setState({ usuario: null, token: null, cargando: false });
  jest.clearAllMocks();
});

describe('useAuthStore', () => {
  it('estado inicial correcto', () => {
    const state = useAuthStore.getState();
    expect(state.usuario).toBeNull();
    expect(state.token).toBeNull();
    expect(state.cargando).toBe(false);
  });

  it('actualizarUsuario modifica el usuario en el store', () => {
    useAuthStore.setState({ usuario: { id: '1', nombre: 'Ana', email: 'a@b.co', plan: 'GRATIS', rol: 'PACIENTE' } });
    useAuthStore.getState().actualizarUsuario({ nombre: 'Ana María' });
    expect(useAuthStore.getState().usuario?.nombre).toBe('Ana María');
  });

  it('logout limpia usuario y token', async () => {
    useAuthStore.setState({ usuario: { id: '1', nombre: 'Test', email: 't@t.co', plan: 'GRATIS', rol: 'PACIENTE' }, token: 'abc' });
    await useAuthStore.getState().logout();
    expect(useAuthStore.getState().usuario).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
