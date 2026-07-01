import { api } from './client';

export interface ConsejoDiario {
  id: string;
  categoria: string;
  icono: string;
  titulo: string;
  contenido: string;
  calificacion?: number;
}

export interface RegistroAnimo {
  id: string;
  valor: number;
  nota?: string;
  fecha: string;
}

export const homeService = {
  getConsejo: () => api.get<ConsejoDiario>('/consejo-dia'),

  calificarConsejo: (id: string, calificacion: number) =>
    api.patch<void>(`/consejo-dia`, { calificacion }),

  registrarAnimo: (valor: number, nota?: string) =>
    api.post<RegistroAnimo>('/animo', { valor, nota }),

  getUsuario: () =>
    api.get<{ usuario: { nombre: string; apellido: string | null; planActual: string } }>('/usuarios')
      .then(r => ({ nombre: [r.usuario.nombre, r.usuario.apellido].filter(Boolean).join(' '), plan: r.usuario.planActual })),
};
