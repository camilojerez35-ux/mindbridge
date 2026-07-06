import { useChatStore } from '@/store/useChatStore';
import * as chatApi from '@/lib/api/chat';

jest.mock('@/lib/api/chat', () => ({
  chatService: {
    getSesiones: jest.fn(),
    crearSesion: jest.fn(),
    getSesion: jest.fn(),
    enviarMensaje: jest.fn(),
  },
}));

const mock = chatApi.chatService as jest.Mocked<typeof chatApi.chatService>;

beforeEach(() => {
  useChatStore.setState({ sesiones: [], mensajesPorSesion: {}, cargandoSesiones: false, enviando: false });
  jest.clearAllMocks();
});

describe('useChatStore — flujos integrados', () => {
  it('crea sesión y la agrega al inicio de la lista', async () => {
    const sesion = { id: 's1', titulo: 'Nueva', creadaEn: new Date().toISOString() };
    mock.crearSesion.mockResolvedValue(sesion as any);
    useChatStore.setState({ sesiones: [{ id: 's0', titulo: 'Vieja', creadaEn: '' } as any] });
    const nueva = await useChatStore.getState().crearSesion();
    const { sesiones } = useChatStore.getState();
    expect(sesiones[0].id).toBe('s1');
    expect(sesiones).toHaveLength(2);
    expect(nueva.id).toBe('s1');
  });

  it('enviarMensaje agrega la respuesta al cache de mensajes', async () => {
    mock.enviarMensaje.mockResolvedValue({
      mensajeId: 'm99',
      respuesta: 'Hola, ¿cómo estás?',
      crisis: false,
      nivel: 'NINGUNO',
    } as any);
    const resultado = await useChatStore.getState().enviarMensaje('s1', 'Hola');
    const msgs = useChatStore.getState().mensajesPorSesion['s1'];
    expect(msgs).toHaveLength(1);
    expect(msgs[0].contenido).toBe('Hola, ¿cómo estás?');
    expect(msgs[0].rol).toBe('ASSISTANT');
    expect(resultado.crisis).toBe(false);
  });

  it('enviarMensaje detecta crisis correctamente', async () => {
    mock.enviarMensaje.mockResolvedValue({
      mensajeId: 'm100', respuesta: 'Veo que estás en crisis', crisis: true, nivel: 'ALTO',
    } as any);
    const { crisis, nivel } = await useChatStore.getState().enviarMensaje('s1', 'quiero morirme');
    expect(crisis).toBe(true);
    expect(nivel).toBe('ALTO');
  });

  it('cargarMensajes usa cache en segunda llamada', async () => {
    mock.getSesion.mockResolvedValue({ mensajes: [{ id: 'm1', rol: 'USER', contenido: 'Hola', esCrisis: false, nivelCrisis: 'NINGUNO', creadoEn: '' }] } as any);
    await useChatStore.getState().cargarMensajes('s1');
    await useChatStore.getState().cargarMensajes('s1');
    expect(mock.getSesion).toHaveBeenCalledTimes(1);
  });

  it('limpiar resetea el estado', () => {
    useChatStore.setState({ sesiones: [{ id: 's1' } as any], mensajesPorSesion: { s1: [] } });
    useChatStore.getState().limpiar();
    const { sesiones, mensajesPorSesion } = useChatStore.getState();
    expect(sesiones).toHaveLength(0);
    expect(Object.keys(mensajesPorSesion)).toHaveLength(0);
  });
});
