import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) throw new Error('ENCRYPTION_KEY no está definido en las variables de entorno');
  const key = Buffer.from(secret, 'hex');
  if (key.length !== KEY_LENGTH) {
    throw new Error('ENCRYPTION_KEY debe ser una cadena hexadecimal de 64 caracteres (32 bytes)');
  }
  return key;
}

export const encryption = {
  encrypt(texto: string): string {
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(texto, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Formato: iv(hex):tag(hex):data(hex)
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
  },

  decrypt(cifrado: string): string {
    const key = getKey();
    const partes = cifrado.split(':');
    if (partes.length !== 3) throw new Error('Formato de datos cifrados inválido');

    const [ivHex, tagHex, dataHex] = partes;
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const data = Buffer.from(dataHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    return decipher.update(data).toString('utf8') + decipher.final('utf8');
  },
};
