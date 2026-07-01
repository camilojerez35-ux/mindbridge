import { useColorMapping } from '@/hooks/useColorMapping';

describe('useColorMapping', () => {
  const { color } = useColorMapping();

  describe('plan', () => {
    it('devuelve color para GRATIS', () => {
      expect(color('plan', 'GRATIS')).toBe('#94A3B8');
    });

    it('devuelve color para PLUS', () => {
      expect(color('plan', 'PLUS')).toBe('#10B981');
    });

    it('devuelve color para FAMILIA', () => {
      expect(color('plan', 'FAMILIA')).toBe('#3B82F6');
    });
  });

  describe('estado_cita', () => {
    it('devuelve color para CONFIRMADA', () => {
      expect(color('estado_cita', 'CONFIRMADA')).toBe('#10B981');
    });

    it('devuelve color para CANCELADA', () => {
      expect(color('estado_cita', 'CANCELADA')).toBe('#EF4444');
    });

    it('devuelve color para PENDIENTE', () => {
      expect(color('estado_cita', 'PENDIENTE')).toBe('#F59E0B');
    });
  });

  describe('animo', () => {
    it('devuelve rojo para animo 1', () => {
      expect(color('animo', '1')).toBe('#EF4444');
    });

    it('devuelve verde para animo 5', () => {
      expect(color('animo', '5')).toBe('#10B981');
    });
  });

  describe('fallback', () => {
    it('devuelve fallback para tipo desconocido', () => {
      expect(color('plan', 'DESCONOCIDO')).toBe('#94A3B8');
    });

    it('acepta fallback personalizado', () => {
      expect(color('plan', 'INEXISTENTE', '#FF0000')).toBe('#FF0000');
    });
  });
});
