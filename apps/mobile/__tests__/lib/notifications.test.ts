import { manejarTapNotificacion } from '@/lib/notifications';
import { router } from 'expo-router';

jest.mock('expo-constants', () => ({
  default: { executionEnvironment: 'storeClient' },
  ExecutionEnvironment: { StoreClient: 'storeClient', Bare: 'bare', Standalone: 'standalone' },
}));
jest.mock('@/lib/api/client', () => ({ api: { post: jest.fn() } }));

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn() } }));

beforeEach(() => jest.clearAllMocks());

describe('manejarTapNotificacion', () => {
  function mkRespuesta(data: Record<string, string>) {
    return { notification: { request: { content: { data } } } };
  }

  it('navega a /citas para tipo "cita"', () => {
    manejarTapNotificacion(mkRespuesta({ tipo: 'cita' }));
    expect(router.push).toHaveBeenCalledWith('/citas');
  });

  it('navega al chat para tipo "chat"', () => {
    manejarTapNotificacion(mkRespuesta({ tipo: 'chat' }));
    expect(router.push).toHaveBeenCalledWith('/(tabs)/chat');
  });

  it('navega a videollamada con citaId válido', () => {
    manejarTapNotificacion(mkRespuesta({ tipo: 'videollamada', citaId: 'abc-123' }));
    expect(router.push).toHaveBeenCalledWith('/videollamada/abc-123');
  });

  it('no navega a videollamada sin citaId', () => {
    manejarTapNotificacion(mkRespuesta({ tipo: 'videollamada' }));
    expect(router.push).not.toHaveBeenCalled();
  });

  it('navega al diario para tipo "diario"', () => {
    manejarTapNotificacion(mkRespuesta({ tipo: 'diario' }));
    expect(router.push).toHaveBeenCalledWith('/(tabs)/diario');
  });

  it('ignora notificaciones sin tipo', () => {
    manejarTapNotificacion(mkRespuesta({}));
    expect(router.push).not.toHaveBeenCalled();
  });

  it('ignora data nula', () => {
    manejarTapNotificacion({ notification: { request: { content: { data: undefined } } } });
    expect(router.push).not.toHaveBeenCalled();
  });
});
