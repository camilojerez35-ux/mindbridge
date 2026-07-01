import { api } from './client';

export interface TestItem {
  id: string;
  categoria: string;
  titulo: string;
  descripcion: string;
  icono: string;
  color: string;
  duracionMin: number;
  numPreguntas: number;
  completado: boolean;
  resultado?: { puntajeTotal: number; resultadoTitulo: string; createdAt: string } | null;
}

export const testsService = {
  getTests: () =>
    api.get<{ tests: TestItem[]; completados: number; total: number }>('/tests'),
};
