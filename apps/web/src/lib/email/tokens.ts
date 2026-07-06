/**
 * Tokens HMAC stateless para verificación de email y reset de contraseña.
 * No requieren tabla en BD — el servidor puede verificarlos recalculando el HMAC.
 * TTL: 24 horas para verificación de email, 1 hora para reset de contraseña.
 */
import crypto from 'crypto';

const SECRET = process.env.NEXTAUTH_SECRET ?? 'dev-secret-change-in-production';

function firmar(payload: string): string {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
}

// ── Verificación de email ─────────────────────────────────────

const EMAIL_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

export function generarTokenVerificacion(email: string): { token: string; ts: number } {
  const ts = Date.now();
  const token = firmar(`verify:${email}:${ts}`);
  return { token, ts };
}

export function verificarTokenEmail(
  email: string,
  token: string,
  ts: number
): { valido: boolean; razon?: string } {
  if (Date.now() - ts > EMAIL_TTL_MS) {
    return { valido: false, razon: 'El enlace ha expirado. Solicita uno nuevo.' };
  }
  const esperado = firmar(`verify:${email}:${ts}`);
  const tokenBuf = Buffer.from(token, 'hex');
  const esperadoBuf = Buffer.from(esperado, 'hex');
  if (tokenBuf.length !== esperadoBuf.length) {
    return { valido: false, razon: 'Enlace inválido o manipulado.' };
  }
  const valido = crypto.timingSafeEqual(tokenBuf, esperadoBuf);
  return valido ? { valido: true } : { valido: false, razon: 'Enlace inválido o manipulado.' };
}

// ── Reset de contraseña ───────────────────────────────────────

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hora

export function generarTokenReset(email: string): { token: string; ts: number } {
  const ts = Date.now();
  const token = firmar(`reset:${email}:${ts}`);
  return { token, ts };
}

export function verificarTokenReset(
  email: string,
  token: string,
  ts: number
): { valido: boolean; razon?: string } {
  if (Date.now() - ts > RESET_TTL_MS) {
    return { valido: false, razon: 'El enlace ha expirado (válido 1 hora). Solicita uno nuevo.' };
  }
  const esperado = firmar(`reset:${email}:${ts}`);
  const tokenBuf = Buffer.from(token, 'hex');
  const esperadoBuf = Buffer.from(esperado, 'hex');
  if (tokenBuf.length !== esperadoBuf.length) {
    return { valido: false, razon: 'Enlace inválido o manipulado.' };
  }
  const valido = crypto.timingSafeEqual(tokenBuf, esperadoBuf);
  return valido ? { valido: true } : { valido: false, razon: 'Enlace inválido o manipulado.' };
}
