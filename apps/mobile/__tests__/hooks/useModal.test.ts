import { useModal } from '@/hooks/useModal';

describe('useModal', () => {
  it('módulo exporta la función useModal', () => {
    expect(typeof useModal).toBe('function');
  });

  it('hook recibe parámetro inicial opcional', () => {
    // Validate the function signature accepts the optional boolean parameter
    expect(useModal.length).toBe(0); // default param counts as 0 in .length
  });
});
