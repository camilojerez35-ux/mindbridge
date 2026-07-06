import { useApiError } from '@/hooks/useApiError';

jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
}));

import { Alert } from 'react-native';
const mockAlert = Alert as jest.Mocked<typeof Alert>;

beforeEach(() => jest.clearAllMocks());

describe('useApiError', () => {
  const { mensajeError, manejarError } = useApiError();

  describe('mensajeError', () => {
    it('extrae campo mensaje', () => {
      expect(mensajeError({ mensaje: 'Credenciales inválidas' })).toBe('Credenciales inválidas');
    });

    it('extrae campo message como fallback', () => {
      expect(mensajeError({ message: 'Server error' })).toBe('Server error');
    });

    it('retorna fallback por defecto para error vacío', () => {
      expect(mensajeError({})).toBe('Error desconocido');
    });

    it('usa fallback personalizado', () => {
      expect(mensajeError(null, 'Fallo de red')).toBe('Fallo de red');
    });
  });

  describe('manejarError', () => {
    it('muestra Alert con el mensaje del error', () => {
      manejarError({ mensaje: 'Token expirado' });
      expect(mockAlert.alert).toHaveBeenCalledWith('Error', 'Token expirado');
    });

    it('usa mensajeFallback cuando no hay mensaje en el error', () => {
      manejarError({}, 'Sin conexión');
      expect(mockAlert.alert).toHaveBeenCalledWith('Error', 'Sin conexión');
    });
  });
});
