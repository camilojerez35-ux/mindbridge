import { api } from './client';

export interface Cita {
  id: string;
  fechaHora: string;
  duracionMinutos: number;
  estado: string;
  tipo: string;
  modalidad: string;
  montoCOP: number;
  estadoPago: string;
  psicologo: {
    nombreCompleto: string;
    especialidades: string[];
    fotoUrl?: string;
    calificacionPromedio?: number;
  };
  resena?: { id: string; calificacion: number } | null;
}

export interface AgendarCitaInput {
  psicologoId: string;
  fechaHora: string;
  metodoPago: 'PSE' | 'TARJETA' | 'NEQUI' | 'DAVIPLATA';
}

export const citasService = {
  getCitas: (estado?: string) => {
    const params = estado ? `?estado=${estado}` : '';
    return api.get<{ citas: Cita[]; paginacion: { total: number } }>(`/citas${params}`);
  },

  agendarCita: (data: AgendarCitaInput) =>
    api.post<{ citaId: string; referencia: string; montoCOP: number }>('/citas', data),
};
