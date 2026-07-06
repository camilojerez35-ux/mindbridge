import { describe, it, expect } from 'vitest';
import { encryption } from '../../apps/web/src/lib/encryption';

describe('encryption — AES-256-GCM', () => {
  it('cifra y descifra texto corto', () => {
    const original = 'Hipertensión arterial, diabetes tipo 2';
    const cifrado = encryption.encrypt(original);
    expect(cifrado).not.toBe(original);
    expect(encryption.decrypt(cifrado)).toBe(original);
  });

  it('cifra y descifra texto con caracteres especiales', () => {
    const original = 'Medicamento: Metformín 500mg / Ácido fólico — dosis: ½ pastilla';
    expect(encryption.decrypt(encryption.encrypt(original))).toBe(original);
  });

  it('cifra y descifra texto largo', () => {
    const original = 'x'.repeat(2000);
    expect(encryption.decrypt(encryption.encrypt(original))).toBe(original);
  });

  it('produce textos cifrados distintos cada vez (IV aleatorio)', () => {
    const original = 'mismo texto';
    const c1 = encryption.encrypt(original);
    const c2 = encryption.encrypt(original);
    expect(c1).not.toBe(c2); // IVs distintos
    // Pero ambos descifran al mismo valor
    expect(encryption.decrypt(c1)).toBe(original);
    expect(encryption.decrypt(c2)).toBe(original);
  });

  it('formato de salida es iv:tag:data (3 partes hex)', () => {
    const cifrado = encryption.encrypt('datos sensibles');
    const partes = cifrado.split(':');
    expect(partes.length).toBe(3);
    // Cada parte es hex válido
    for (const parte of partes) {
      expect(parte).toMatch(/^[0-9a-f]+$/i);
    }
  });

  it('lanza error con formato inválido', () => {
    expect(() => encryption.decrypt('malformado')).toThrow();
    expect(() => encryption.decrypt('solo:dos')).toThrow();
  });

  it('lanza error si el tag de autenticación está corrupto', () => {
    const cifrado = encryption.encrypt('datos importantes');
    const partes = cifrado.split(':');
    // Corromper el tag
    partes[1] = '0'.repeat(partes[1].length);
    expect(() => encryption.decrypt(partes.join(':'))).toThrow();
  });

  it('cifra y descifra string vacío', () => {
    expect(encryption.decrypt(encryption.encrypt(''))).toBe('');
  });
});
