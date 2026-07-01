import { useState, useEffect, useCallback } from 'react';

interface Estado<T> {
  datos: T | null;
  cargando: boolean;
  error: string;
  refrescar: () => void;
  refrescando: boolean;
}

export function useFetchData<T>(fn: () => Promise<T>): Estado<T> {
  const [datos, setDatos] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async (esRefresh = false) => {
    if (!esRefresh) setCargando(true);
    setError('');
    try {
      const resultado = await fn();
      setDatos(resultado);
    } catch (e: any) {
      setError(e?.mensaje || 'No se pudieron cargar los datos.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [fn]);

  useEffect(() => { cargar(); }, []);

  const refrescar = useCallback(() => {
    setRefrescando(true);
    cargar(true);
  }, [cargar]);

  return { datos, cargando, error, refrescar, refrescando };
}
