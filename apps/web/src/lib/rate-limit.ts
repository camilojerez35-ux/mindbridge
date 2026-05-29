/**
 * Rate limiting centralizado: Redis sliding-window con fallback in-memory.
 * - Con Redis: preciso entre instancias (producción multi-pod)
 * - Sin Redis: Map por proceso (dev / single-instance)
 * Usar: const { allowed, remaining } = await checkRateLimit({ key, limit, windowSec })
 */
import type { Redis } from 'ioredis';

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowSec: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

// ── Fallback in-memory ────────────────────────────────────────────
interface MemEntry { count: number; resetAt: number }
const memStore = new Map<string, MemEntry>();

// Limpieza periódica para evitar memory leaks en procesos de larga vida
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [k, e] of Array.from(memStore)) {
      if (e.resetAt <= now) memStore.delete(k);
    }
  }, 60_000).unref?.();
}

function memCheck({ key, limit, windowSec }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const entry = memStore.get(key);

  if (!entry || entry.resetAt <= now) {
    const resetAt = now + windowSec * 1_000;
    memStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt: new Date(resetAt) };
  }

  entry.count++;
  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: new Date(entry.resetAt),
  };
}

// ── Redis singleton ───────────────────────────────────────────────
let redisClient: Redis | null = null;
let redisInitialized = false;

function getRedis(): Redis | null {
  if (redisInitialized) return redisClient;
  redisInitialized = true;

  const url = process.env.REDIS_URL;
  if (!url) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: Redis } = require('ioredis') as { default: new (...a: unknown[]) => Redis };
    redisClient = new Redis(url, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 2_000,
    });
    redisClient.on('error', (err: Error) => {
      console.warn('[RateLimit] Redis no disponible, usando fallback in-memory:', err.message);
      redisClient = null;
      redisInitialized = false; // permite reconectar en el próximo ciclo
    });
  } catch {
    redisClient = null;
  }

  return redisClient;
}

async function redisCheck({ key, limit, windowSec }: RateLimitOptions): Promise<RateLimitResult | null> {
  const client = getRedis();
  if (!client) return null;

  try {
    // Atomic increment + set TTL on first request
    const count = await client.incr(key);
    if (count === 1) await client.expire(key, windowSec);
    const ttl = await client.ttl(key);
    const resetAt = new Date(Date.now() + Math.max(ttl, 0) * 1_000);

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt,
    };
  } catch {
    return null; // Redis falló en esta request — caer a memoria
  }
}

// ── API pública ───────────────────────────────────────────────────

export async function checkRateLimit(opts: RateLimitOptions): Promise<RateLimitResult> {
  const result = await redisCheck(opts);
  return result ?? memCheck(opts);
}

/** Helpers preconfigurados para los endpoints principales */
export const rateLimits = {
  chat: (userId: string) =>
    checkRateLimit({
      key: `rl:chat:${userId}`,
      limit: Number(process.env.RATE_LIMIT_CHAT_POR_MINUTO ?? 10),
      windowSec: 60,
    }),

  api: (identifier: string) =>
    checkRateLimit({
      key: `rl:api:${identifier}`,
      limit: Number(process.env.RATE_LIMIT_API_POR_MINUTO ?? 60),
      windowSec: 60,
    }),

  registro: (ip: string) =>
    checkRateLimit({
      key: `rl:registro:${ip}`,
      limit: 5,
      windowSec: 3_600, // 5 registros por IP por hora
    }),

  login: (ip: string) =>
    checkRateLimit({
      key: `rl:login:${ip}`,
      limit: 10,
      windowSec: 900, // 10 intentos por IP cada 15 min
    }),

  diario: (userId: string) =>
    checkRateLimit({
      key: `rl:diario:${userId}`,
      limit: 30,
      windowSec: 3_600, // 30 entradas por usuario por hora
    }),

  citas: (userId: string) =>
    checkRateLimit({
      key: `rl:citas:${userId}`,
      limit: 5,
      windowSec: 3_600, // 5 citas agendadas por usuario por hora
    }),

  pagos: (userId: string) =>
    checkRateLimit({
      key: `rl:pagos:${userId}`,
      limit: 10,
      windowSec: 3_600, // 10 intentos de pago por usuario por hora
    }),

  // 5 cambios de plan por hora — evita abuso financiero por fuerza bruta
  plan: (userId: string) =>
    checkRateLimit({
      key: `rl:plan:${userId}`,
      limit: 5,
      windowSec: 3_600,
    }),

  // 60 requests/min por IP para el directorio de psicólogos — evita enumeration
  psicologos: (ip: string) =>
    checkRateLimit({
      key: `rl:psicologos:${ip}`,
      limit: 60,
      windowSec: 60,
    }),
} as const;
