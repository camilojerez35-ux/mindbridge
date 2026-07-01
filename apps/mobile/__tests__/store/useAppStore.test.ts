import { useAppStore } from '@/store/useAppStore';

beforeEach(() => {
  useAppStore.setState({ citasPendientes: 0, mensajesNoLeidos: 0, sinConexion: false });
});

describe('useAppStore', () => {
  it('estado inicial correcto', () => {
    const state = useAppStore.getState();
    expect(state.citasPendientes).toBe(0);
    expect(state.mensajesNoLeidos).toBe(0);
    expect(state.sinConexion).toBe(false);
  });

  it('setCitasPendientes actualiza el valor', () => {
    useAppStore.getState().setCitasPendientes(3);
    expect(useAppStore.getState().citasPendientes).toBe(3);
  });

  it('incrementarNoLeidos suma 1 cada vez', () => {
    useAppStore.getState().incrementarNoLeidos();
    useAppStore.getState().incrementarNoLeidos();
    expect(useAppStore.getState().mensajesNoLeidos).toBe(2);
  });

  it('limpiarNoLeidos resetea a 0', () => {
    useAppStore.getState().incrementarNoLeidos();
    useAppStore.getState().limpiarNoLeidos();
    expect(useAppStore.getState().mensajesNoLeidos).toBe(0);
  });

  it('setSinConexion cambia el flag', () => {
    useAppStore.getState().setSinConexion(true);
    expect(useAppStore.getState().sinConexion).toBe(true);
  });
});
