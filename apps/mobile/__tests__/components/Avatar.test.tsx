import { Avatar } from '@/components/Avatar';

describe('Avatar', () => {
  it('es una función exportada', () => {
    expect(typeof Avatar).toBe('function');
  });

  it('acepta nombre, size y color sin lanzar error', () => {
    expect(() => Avatar({ nombre: 'Ana López', size: 48, color: '#10B981' })).not.toThrow();
  });

  it('acepta solo nombre', () => {
    expect(() => Avatar({ nombre: 'Carlos' })).not.toThrow();
  });

  it('maneja nombre de una sola palabra', () => {
    expect(() => Avatar({ nombre: 'Ana' })).not.toThrow();
  });
});
