import { Button } from '@/components/Button';

jest.mock('@/constants/colors', () => ({
  Colors: { primary: '#6366F1', secondary: '#3B82F6', error: '#EF4444', border: '#E5E7EB', textPrimary: '#111', textSecondary: '#6B7280' },
}));

describe('Button — lógica de props', () => {
  it('módulo exporta la función Button', () => {
    expect(typeof Button).toBe('function');
  });

  it('Button acepta variantes válidas sin lanzar error', () => {
    const variantes = ['primary', 'secondary', 'destructive', 'outline'] as const;
    variantes.forEach(v => {
      expect(() => Button({ onPress: () => {}, children: 'ok', variante: v })).not.toThrow();
    });
  });
});
