import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export function useSecureToken(clave: string) {
  const [valor, setValor] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(clave)
      .then(setValor)
      .finally(() => setCargando(false));
  }, [clave]);

  async function guardar(nuevoValor: string) {
    await SecureStore.setItemAsync(clave, nuevoValor);
    setValor(nuevoValor);
  }

  async function eliminar() {
    await SecureStore.deleteItemAsync(clave);
    setValor(null);
  }

  return { valor, cargando, guardar, eliminar };
}
