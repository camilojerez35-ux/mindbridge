import { useAvatarInitials } from '@/hooks/useAvatarInitials';

describe('useAvatarInitials', () => {
  const { iniciales } = useAvatarInitials();

  it('extrae iniciales de nombre completo', () => {
    expect(iniciales('Camilo Jerez')).toBe('CJ');
  });

  it('maneja nombre de una sola palabra', () => {
    expect(iniciales('Camilo')).toBe('C');
  });

  it('convierte a mayúsculas', () => {
    expect(iniciales('camilo jerez')).toBe('CJ');
  });

  it('limita al número de iniciales indicado', () => {
    expect(iniciales('María del Carmen López', 2)).toBe('MD');
  });

  it('maneja espacios extra', () => {
    expect(iniciales('  Camilo   Jerez  ')).toBe('CJ');
  });

  it('maneja nombre con tres palabras y límite 2', () => {
    expect(iniciales('Ana María García')).toBe('AM');
  });
});
