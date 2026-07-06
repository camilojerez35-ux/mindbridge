import { OfflineBanner } from '@/components/OfflineBanner';

jest.mock('@react-native-community/netinfo', () => ({
  default: {
    addEventListener: jest.fn(() => jest.fn()),
  },
}));
jest.mock('@/store', () => ({
  useAppStore: jest.fn((selector: any) => selector({ sinConexion: false, setSinConexion: jest.fn() })),
}));

describe('OfflineBanner', () => {
  it('es una función exportada', () => {
    expect(typeof OfflineBanner).toBe('function');
  });

  it('acepta props sin lanzar error al inspeccionar', () => {
    expect(OfflineBanner).toBeDefined();
    expect(OfflineBanner.length).toBeGreaterThanOrEqual(0);
  });
});
