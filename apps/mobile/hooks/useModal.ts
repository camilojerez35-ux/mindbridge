import { useState, useCallback } from 'react';

export function useModal(inicial = false) {
  const [visible, setVisible] = useState(inicial);

  const abrir = useCallback(() => setVisible(true), []);
  const cerrar = useCallback(() => setVisible(false), []);
  const toggle = useCallback(() => setVisible(v => !v), []);

  return { visible, abrir, cerrar, toggle };
}
