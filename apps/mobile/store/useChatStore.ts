import { create } from 'zustand';
import { chatService, Sesion, Mensaje } from '@/lib/api/chat';

interface ChatState {
  sesiones: Sesion[];
  mensajesPorSesion: Record<string, Mensaje[]>;
  cargandoSesiones: boolean;
  enviando: boolean;

  // Acciones
  cargarSesiones: () => Promise<void>;
  crearSesion: () => Promise<Sesion>;
  cargarMensajes: (sesionId: string) => Promise<Mensaje[]>;
  enviarMensaje: (sesionId: string, texto: string) => Promise<{ crisis: boolean; nivel: string }>;
  agregarMensajeLocal: (sesionId: string, mensaje: Mensaje) => void;
  limpiar: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sesiones: [],
  mensajesPorSesion: {},
  cargandoSesiones: false,
  enviando: false,

  cargarSesiones: async () => {
    set({ cargandoSesiones: true });
    try {
      const sesiones = await chatService.getSesiones();
      set({ sesiones });
    } finally {
      set({ cargandoSesiones: false });
    }
  },

  crearSesion: async () => {
    const sesion = await chatService.crearSesion();
    set(state => ({ sesiones: [sesion, ...state.sesiones] }));
    return sesion;
  },

  cargarMensajes: async (sesionId) => {
    const cached = get().mensajesPorSesion[sesionId];
    if (cached?.length) return cached;

    const { mensajes } = await chatService.getSesion(sesionId);
    set(state => ({
      mensajesPorSesion: { ...state.mensajesPorSesion, [sesionId]: mensajes },
    }));
    return mensajes;
  },

  enviarMensaje: async (sesionId, texto) => {
    set({ enviando: true });
    try {
      const res = await chatService.enviarMensaje(sesionId, texto);
      const respuestaMensaje: Mensaje = {
        id: res.mensajeId,
        rol: 'ASSISTANT',
        contenido: res.respuesta,
        esCrisis: res.crisis,
        nivelCrisis: res.nivel,
        creadoEn: new Date().toISOString(),
      };
      set(state => ({
        mensajesPorSesion: {
          ...state.mensajesPorSesion,
          [sesionId]: [...(state.mensajesPorSesion[sesionId] ?? []), respuestaMensaje],
        },
      }));
      return { crisis: res.crisis, nivel: res.nivel };
    } finally {
      set({ enviando: false });
    }
  },

  agregarMensajeLocal: (sesionId, mensaje) => {
    set(state => ({
      mensajesPorSesion: {
        ...state.mensajesPorSesion,
        [sesionId]: [...(state.mensajesPorSesion[sesionId] ?? []), mensaje],
      },
    }));
  },

  limpiar: () => set({ sesiones: [], mensajesPorSesion: {} }),
}));
