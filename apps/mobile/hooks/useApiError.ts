import { Alert } from 'react-native';

export function useApiError() {
  function manejarError(error: unknown, mensajeFallback = 'Ocurrió un error. Intenta de nuevo.') {
    const e = error as any;
    const msg = e?.mensaje || e?.message || mensajeFallback;
    Alert.alert('Error', msg);
  }

  function mensajeError(error: unknown, fallback = 'Error desconocido'): string {
    const e = error as any;
    return e?.mensaje || e?.message || fallback;
  }

  return { manejarError, mensajeError };
}
