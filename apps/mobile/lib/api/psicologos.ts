import { api } from './client';

export interface Psicologo {
  id: string;
  nombre: string;
  foto?: string;
  bio?: string;
  especialidades: string[];
  tarifaSesion: number;
  calificacionPromedio: number;
  totalSesiones: number;
  modalidades: string[];
  verificado: boolean;
}

interface PsicologoAPI {
  id: string;
  nombreCompleto: string;
  fotoUrl?: string;
  bio?: string;
  especialidades: string[];
  tarifaCOP: number;
  calificacionPromedio: number;
  anosExperiencia?: number;
  modalidad?: string[];
  estado?: string;
}

function mapPsicologo(p: PsicologoAPI): Psicologo {
  return {
    id: p.id,
    nombre: p.nombreCompleto,
    foto: p.fotoUrl,
    bio: p.bio,
    especialidades: p.especialidades ?? [],
    tarifaSesion: p.tarifaCOP,
    calificacionPromedio: p.calificacionPromedio ?? 0,
    totalSesiones: 0,
    modalidades: p.modalidad ?? [],
    verificado: p.estado === 'VERIFICADO',
  };
}

export const psicologosService = {
  getPsicologos: async (filtros?: { ciudad?: string; especialidad?: string }): Promise<Psicologo[]> => {
    const params = new URLSearchParams(filtros as Record<string, string>).toString();
    const res = await api.get<{ psicologos: PsicologoAPI[] }>(`/psicologos${params ? `?${params}` : ''}`);
    return (res.psicologos ?? []).map(mapPsicologo);
  },

  getPsicologo: async (id: string): Promise<Psicologo | null> => {
    const res = await api.get<{ psicologos: PsicologoAPI[] }>(`/psicologos?id=${id}`);
    const p = res.psicologos?.[0];
    return p ? mapPsicologo(p) : null;
  },
};
