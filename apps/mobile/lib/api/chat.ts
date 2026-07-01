import { api } from './client';

export interface Mensaje {
  id: string;
  rol: 'USER' | 'ASSISTANT';
  contenido: string;
  esCrisis: boolean;
  nivelCrisis: string;
  creadoEn: string;
}

export interface Sesion {
  id: string;
  titulo?: string;
  estado: string;
  creadaEn: string;
}

export const chatService = {
  getSesiones: () =>
    api.get<Sesion[] | { sesiones: Sesion[] }>('/chat/sesiones').then(r =>
      Array.isArray(r) ? r : (r as { sesiones: Sesion[] }).sesiones ?? []
    ),

  crearSesion: () =>
    api.post<Sesion | { sesion: Sesion }>('/chat/sesiones', {}).then(r =>
      'id' in r ? (r as Sesion) : (r as { sesion: Sesion }).sesion
    ),

  getSesion: (id: string) =>
    api.get<{ sesion: Sesion; mensajes: Mensaje[] }>(`/chat/sesiones/${id}`),

  enviarMensaje: (sesionId: string, mensaje: string) =>
    api.post<{
      respuesta: string;
      sesionId: string;
      mensajeId: string;
      crisis: boolean;
      nivel: string;
    }>('/ai/chat', { mensaje, sesionId }),
};
