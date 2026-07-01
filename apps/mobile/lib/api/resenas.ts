import { api } from './client';

export const resenasService = {
  crearResena: (citaId: string, calificacion: number, comentario?: string) =>
    api.post<{ resena: { id: string } }>('/resenas', { citaId, calificacion, comentario }),
};
