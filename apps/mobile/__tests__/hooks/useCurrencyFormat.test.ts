import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';

describe('useCurrencyFormat', () => {
  const { cop, copCorto } = useCurrencyFormat();

  describe('cop', () => {
    it('formatea número con símbolo COP', () => {
      expect(cop(49900)).toContain('COP');
      expect(cop(49900)).toContain('$');
    });

    it('acepta string numérico', () => {
      expect(cop('89900')).toContain('COP');
    });

    it('formatea cero correctamente', () => {
      expect(cop(0)).toContain('$0');
    });

    it('formatea números grandes', () => {
      const res = cop(1500000);
      expect(res).toContain('COP');
    });
  });

  describe('copCorto', () => {
    it('abrevia millones con M', () => {
      expect(copCorto(1_500_000)).toContain('M');
    });

    it('abrevia miles con k', () => {
      expect(copCorto(49_900)).toContain('k');
    });

    it('muestra valor sin abreviar para menores de 1000', () => {
      expect(copCorto(500)).toBe('$500');
    });

    it('maneja exactamente 1000', () => {
      expect(copCorto(1000)).toContain('k');
    });
  });
});
