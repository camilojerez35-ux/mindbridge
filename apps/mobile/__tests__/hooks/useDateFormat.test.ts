import { useDateFormat } from '@/hooks/useDateFormat';

describe('useDateFormat', () => {
  const hook = useDateFormat();

  describe('hora', () => {
    it('formatea hora en formato HH:MM', () => {
      const resultado = hook.hora('2026-07-01T14:30:00.000Z');
      expect(resultado).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('fechaCorta', () => {
    it('devuelve una cadena no vacía', () => {
      const resultado = hook.fechaCorta('2026-07-01T00:00:00.000Z');
      expect(typeof resultado).toBe('string');
      expect(resultado.length).toBeGreaterThan(0);
    });
  });

  describe('relativo', () => {
    it('devuelve "Ahora" para fechas muy recientes', () => {
      const hace30s = new Date(Date.now() - 30_000).toISOString();
      expect(hook.relativo(hace30s)).toBe('Ahora');
    });

    it('devuelve minutos para fechas recientes', () => {
      const hace5min = new Date(Date.now() - 5 * 60_000).toISOString();
      expect(hook.relativo(hace5min)).toBe('Hace 5 min');
    });

    it('devuelve horas para fechas de hoy', () => {
      const hace2h = new Date(Date.now() - 2 * 60 * 60_000).toISOString();
      expect(hook.relativo(hace2h)).toBe('Hace 2h');
    });

    it('devuelve días para fechas recientes', () => {
      const hace3d = new Date(Date.now() - 3 * 24 * 60 * 60_000).toISOString();
      expect(hook.relativo(hace3d)).toBe('Hace 3d');
    });
  });
});
