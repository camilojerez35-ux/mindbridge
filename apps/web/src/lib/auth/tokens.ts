import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[startup] Variable de entorno requerida no definida: ${name}. ` +
      'Revisa tu archivo .env.local o las variables de entorno del servidor.'
    );
  }
  return value;
}

const JWT_SECRET: string = requireEnv('JWT_SECRET');
const JWT_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateAccessToken(userId: string, email: string): string {
  return jwt.sign(
    { sub: userId, email, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { sub: userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
}

export function verifyToken(token: string): jwt.JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
  } catch {
    return null;
  }
}

export function generatePasswordResetToken(): string {
  return jwt.sign(
    { type: 'password-reset', timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

export function generateEmailVerificationToken(email: string): string {
  return jwt.sign(
    { type: 'email-verification', email, timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function generate2FASecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  // chars.length === 32 = 2^5, y 256 % 32 === 0 → sin sesgo
  const bytes = require('crypto').randomBytes(32) as Buffer;
  return Array.from(bytes).map((b: number) => chars[b % chars.length]).join('');
}
