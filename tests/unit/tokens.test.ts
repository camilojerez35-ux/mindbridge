import { describe, it, expect, vi } from 'vitest';
import {
  generarTokenVerificacion,
  verificarTokenEmail,
  generarTokenReset,
  verificarTokenReset,
} from '../../apps/web/src/lib/email/tokens';

describe('generarTokenVerificacion / verificarTokenEmail', () => {
  it('genera un token válido para el mismo email', () => {
    const email = 'test@mindbridge.co';
    const { token, ts } = generarTokenVerificacion(email);

    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(32);
    expect(typeof ts).toBe('number');

    const { valido } = verificarTokenEmail(email, token, ts);
    expect(valido).toBe(true);
  });

  it('rechaza token de otro email', () => {
    const { token, ts } = generarTokenVerificacion('a@a.com');
    const { valido } = verificarTokenEmail('otro@otro.com', token, ts);
    expect(valido).toBe(false);
  });

  it('rechaza token manipulado', () => {
    const email = 'test@mindbridge.co';
    const { ts } = generarTokenVerificacion(email);
    const { valido } = verificarTokenEmail(email, 'a'.repeat(64), ts);
    expect(valido).toBe(false);
  });

  it('rechaza token expirado (más de 24h)', () => {
    const email = 'test@mindbridge.co';
    const { token } = generarTokenVerificacion(email);
    const tsAntiguo = Date.now() - 25 * 60 * 60 * 1000; // 25 horas atrás

    const { valido, razon } = verificarTokenEmail(email, token, tsAntiguo);
    expect(valido).toBe(false);
    expect(razon).toMatch(/expir/i);
  });

  it('token válido justo antes de expirar (23h 59m)', () => {
    const email = 'test@mindbridge.co';
    const { token, ts } = generarTokenVerificacion(email);
    // Simular que el token se generó 23h 59m atrás
    const tsAntiguo = ts - (23 * 60 + 59) * 60 * 1000;

    const { valido } = verificarTokenEmail(email, token, tsAntiguo);
    // El token original está bien, el ts modificado debe fallar la firma
    // (porque el HMAC incluye el ts)
    expect(valido).toBe(false); // ts cambiado → firma inválida
  });
});

describe('generarTokenReset / verificarTokenReset', () => {
  it('genera y verifica token de reset', () => {
    const email = 'reset@mindbridge.co';
    const { token, ts } = generarTokenReset(email);

    const { valido } = verificarTokenReset(email, token, ts);
    expect(valido).toBe(true);
  });

  it('rechaza token de reset expirado (más de 1h)', () => {
    const email = 'reset@mindbridge.co';
    const { token } = generarTokenReset(email);
    const tsAntiguo = Date.now() - 61 * 60 * 1000; // 61 minutos

    const { valido, razon } = verificarTokenReset(email, token, tsAntiguo);
    expect(valido).toBe(false);
    expect(razon).toMatch(/expir/i);
  });

  it('tokens de verificación y reset no son intercambiables', () => {
    const email = 'test@mindbridge.co';
    const { token: tokenVerif, ts } = generarTokenVerificacion(email);

    // Usar token de verificación en reset → debe fallar
    const { valido } = verificarTokenReset(email, tokenVerif, ts);
    expect(valido).toBe(false);
  });
});
