import { useState, useCallback } from 'react';

export function useRefresh(onRefresh: () => Promise<void> | void) {
  const [refrescando, setRefrescando] = useState(false);

  const refrescar = useCallback(async () => {
    setRefrescando(true);
    try {
      await onRefresh();
    } finally {
      setRefrescando(false);
    }
  }, [onRefresh]);

  return { refrescando, refrescar };
}
