'use client';

import { useEffect, useState } from 'react';
import { getProviders } from 'next-auth/react';

/**
 * IDs de los proveedores de NextAuth realmente configurados en el servidor
 * (p. ej. 'google' solo si hay credenciales, 'dev-bypass' solo en desarrollo con el flag).
 * `null` mientras carga: los botones opcionales no se muestran hasta saberlo.
 */
export function useProveedoresActivos(): Set<string> | null {
  const [ids, setIds] = useState<Set<string> | null>(null);
  useEffect(() => {
    getProviders()
      .then(p => setIds(new Set(Object.keys(p ?? {}))))
      .catch(() => setIds(new Set()));
  }, []);
  return ids;
}
