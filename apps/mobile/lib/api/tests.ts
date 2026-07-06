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

export interface Pregunta {
  id: string;
  texto: string;
  opciones: { valor: number; texto: string }[];
}

export interface TestDetalle extends TestItem {
  preguntas: Pregunta[];
}

export interface ResultadoTest {
  titulo: string;
  descripcion: string;
  puntajeTotal: number;
  puntajeMaximo: number;
  porcentaje: number;
}

export const testsService = {
  getTests: () =>
    api.get<{ tests: TestItem[]; completados: number; total: number }>('/tests'),

  getTest: (id: string) =>
    api.get<{ test: TestDetalle }>(`/tests/${id}`),

  enviarRespuestas: (testId: string, respuestas: Record<string, number>) =>
    api.post<{ resultado: ResultadoTest }>('/tests/resultado', { testId, respuestas }),
};
