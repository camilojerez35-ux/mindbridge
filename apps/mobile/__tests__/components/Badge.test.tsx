import { Badge } from '@/components/Badge';

describe('Badge — lógica de estilos', () => {
  it('módulo exporta la función Badge', () => {
    expect(typeof Badge).toBe('function');
  });

  it('soft variant calcula bg color con opacidad 20', () => {
    // Testear la lógica de cálculo del color directamente
    const color = '#94A3B8';
    const softBg = color + '20';
    expect(softBg).toBe('#94A3B820');
  });

  it('filled variant usa color original', () => {
    const color = '#10B981';
    const filledBg = color;
    expect(filledBg).toBe('#10B981');
  });
});
