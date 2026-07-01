import { api } from './client';

export interface Stats {
  diasActivo: number;
  sesionesIA: number;
  entradasDiario: number;
  entradasMes: number;
  animoPromedio: string | null;
}

export const statsService = {
  getStats: () => api.get<Stats>('/stats'),
  getAnimo: (dias = 30) =>
    api.get<{ registros: { valor: number; fecha: string }[]; estadisticas: { promedio: number; mejor: number; peor: number } }>(`/animo?dias=${dias}`),
};
