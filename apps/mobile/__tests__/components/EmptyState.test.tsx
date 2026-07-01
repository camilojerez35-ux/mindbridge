import { EmptyState } from '@/components/EmptyState';

jest.mock('@/constants/colors', () => ({
  Colors: { primary: '#6366F1', border: '#E5E7EB', textPrimary: '#111', textSecondary: '#6B7280' },
}));

describe('EmptyState — lógica de props', () => {
  it('módulo exporta la función EmptyState', () => {
    expect(typeof EmptyState).toBe('function');
  });

  it('acepta icono y titulo sin lanzar error', () => {
    expect(() => EmptyState({ icono: 'calendar-outline' as any, titulo: 'Sin citas' })).not.toThrow();
  });

  it('acepta accionTexto y onAccion opcionales sin lanzar error', () => {
    const onAccion = jest.fn();
    expect(() =>
      EmptyState({ icono: 'calendar-outline' as any, titulo: 'Sin citas', accionTexto: 'Nueva', onAccion })
    ).not.toThrow();
  });
});
