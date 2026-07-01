import { api } from './client';

export interface EntradaDiario {
  id: string;
  contenido: string;
  animo: number;
  emociones: string[];
  etiquetas: string[];
  analisisIA?: string;
  esFavorita: boolean;
  esPrivada: boolean;
  creadaEn: string;
}

export const diarioService = {
  getEntradas: (pagina = 1) =>
    api.get<{ entradas: EntradaDiario[]; total: number }>(`/diario?pagina=${pagina}&limite=20`),

  crearEntrada: (data: {
    contenido: string;
    animo: number;
    emociones?: string[];
    etiquetas?: string[];
  }) => api.post<EntradaDiario>('/diario', data),

  toggleFavorita: (id: string, esFavorita: boolean) =>
    api.patch<EntradaDiario>(`/diario/${id}`, { esFavorita }),

  eliminarEntrada: (id: string) =>
    api.delete<{ exito: boolean }>(`/diario/${id}`),
};
