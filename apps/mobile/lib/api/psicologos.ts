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
  tarjetaVerificada: boolean;
  tarjetaProfesionalId?: string | null;
}

export interface SlotDisponible {
  fecha: string;      // YYYY-MM-DD
  diaNombre: string;
  horas: string[];    // ['09:00', '10:00', ...]
}

interface PsicologoAPI {
  id: string;
  nombreCompleto: string;
  fotoUrl?: string;
  bio?: string;
  especialidades: string[];
  tarifaCOP: number;
  calificacionPromedio: number;
  totalCitas?: number;
  anosExperiencia?: number;
  modalidad?: string[];
  estado?: string;
  tarjetaVerificada?: boolean;
  tarjetaProfesionalId?: string | null;
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
    totalSesiones: p.totalCitas ?? 0,
    modalidades: p.modalidad ?? [],
    verificado: p.estado === 'VERIFICADO',
    tarjetaVerificada: p.tarjetaVerificada ?? false,
    tarjetaProfesionalId: p.tarjetaProfesionalId ?? null,
  };
}

export const psicologosService = {
  getPsicologos: async (filtros?: { ciudad?: string; especialidad?: string }): Promise<Psicologo[]> => {
    const params = new URLSearchParams(filtros as Record<string, string>).toString();
    const res = await api.get<{ psicologos: PsicologoAPI[] }>(`/psicologos${params ? `?${params}` : ''}`);
    return (res.psicologos ?? []).map(mapPsicologo);
  },

  getPsicologo: async (id: string): Promise<Psicologo> => {
    const res = await api.get<{ psicologo: PsicologoAPI; slots?: SlotDisponible[] }>(`/psicologos/${id}`);
    return mapPsicologo(res.psicologo);
  },

  getPerfilConSlots: async (id: string): Promise<{ psicologo: Psicologo; slots: SlotDisponible[] }> => {
    const res = await api.get<{ psicologo: PsicologoAPI; slots: SlotDisponible[] }>(`/psicologos/${id}`);
    return { psicologo: mapPsicologo(res.psicologo), slots: res.slots ?? [] };
  },
};
