import { useChatStore } from '@/store/useChatStore';
import { chatService } from '@/lib/api/chat';

jest.mock('@/lib/api/chat', () => ({
  chatService: {
    getSesiones: jest.fn(),
    crearSesion: jest.fn(),
    getSesion: jest.fn(),
    enviarMensaje: jest.fn(),
  },
}));

const mockChatService = chatService as jest.Mocked<typeof chatService>;

beforeEach(() => {
  useChatStore.setState({ sesiones: [], mensajesPorSesion: {}, cargandoSesiones: false, enviando: false });
  jest.clearAllMocks();
});

describe('useChatStore', () => {
  it('estado inicial correcto', () => {
    const state = useChatStore.getState();
    expect(state.sesiones).toEqual([]);
    expect(state.mensajesPorSesion).toEqual({});
    expect(state.cargandoSesiones).toBe(false);
  });

  it('cargarSesiones guarda sesiones en store', async () => {
    const sesiones = [{ id: '1', creadaEn: '2026-01-01' }] as any;
    mockChatService.getSesiones.mockResolvedValue(sesiones);
    await useChatStore.getState().cargarSesiones();
    expect(useChatStore.getState().sesiones).toEqual(sesiones);
  });

  it('crearSesion agrega sesión al inicio', async () => {
    const nueva = { id: '2', creadaEn: '2026-01-02' } as any;
    useChatStore.setState({ sesiones: [{ id: '1', creadaEn: '2026-01-01' } as any] });
    mockChatService.crearSesion.mockResolvedValue(nueva);
    await useChatStore.getState().crearSesion();
    expect(useChatStore.getState().sesiones[0].id).toBe('2');
  });

  it('cargarMensajes usa caché si ya hay mensajes', async () => {
    const msgs = [{ id: 'm1', rol: 'USER', contenido: 'hola' }] as any;
    useChatStore.setState({ mensajesPorSesion: { 'sesion-1': msgs } });
    const result = await useChatStore.getState().cargarMensajes('sesion-1');
    expect(result).toEqual(msgs);
    expect(mockChatService.getSesion).not.toHaveBeenCalled();
  });

  it('cargarMensajes llama API si no hay caché', async () => {
    mockChatService.getSesion.mockResolvedValue({ mensajes: [{ id: 'm2' }] } as any);
    await useChatStore.getState().cargarMensajes('sesion-2');
    expect(mockChatService.getSesion).toHaveBeenCalledWith('sesion-2');
    expect(useChatStore.getState().mensajesPorSesion['sesion-2']).toHaveLength(1);
  });

  it('agregarMensajeLocal agrega mensaje sin API call', () => {
    const msg = { id: 'local-1', rol: 'USER', contenido: 'test', creadoEn: '' } as any;
    useChatStore.getState().agregarMensajeLocal('sesion-3', msg);
    expect(useChatStore.getState().mensajesPorSesion['sesion-3']).toContain(msg);
  });

  it('limpiar resetea sesiones y mensajes', () => {
    useChatStore.setState({ sesiones: [{ id: '1' } as any], mensajesPorSesion: { x: [] } });
    useChatStore.getState().limpiar();
    expect(useChatStore.getState().sesiones).toEqual([]);
    expect(useChatStore.getState().mensajesPorSesion).toEqual({});
  });
});
