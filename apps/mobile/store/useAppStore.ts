import { create } from 'zustand';

interface AppState {
  // Notificaciones / badges
  citasPendientes: number;
  mensajesNoLeidos: number;

  // Estado de red
  sinConexion: boolean;

  // Acciones
  setCitasPendientes: (n: number) => void;
  setMensajesNoLeidos: (n: number) => void;
  setSinConexion: (v: boolean) => void;
  incrementarNoLeidos: () => void;
  limpiarNoLeidos: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  citasPendientes: 0,
  mensajesNoLeidos: 0,
  sinConexion: false,

  setCitasPendientes: (n) => set({ citasPendientes: n }),
  setMensajesNoLeidos: (n) => set({ mensajesNoLeidos: n }),
  setSinConexion: (v) => set({ sinConexion: v }),
  incrementarNoLeidos: () => set(s => ({ mensajesNoLeidos: s.mensajesNoLeidos + 1 })),
  limpiarNoLeidos: () => set({ mensajesNoLeidos: 0 }),
}));
