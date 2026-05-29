import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  const checks: Record<string, 'ok' | 'error'> = {};

  // DB check — query liviana sin tocar datos de usuarios
  try {
    await db.$queryRaw`SELECT 1`;
    checks.db = 'ok';
  } catch {
    checks.db = 'error';
  }

  // Redis check — opcional, solo si está configurado
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      const { checkRateLimit } = await import('@/lib/rate-limit');
      await checkRateLimit({ key: 'health:ping', limit: 9999, windowSec: 1 });
      checks.redis = 'ok';
    } catch {
      checks.redis = 'error';
    }
  }

  const allOk = Object.values(checks).every(v => v === 'ok');
  const latencyMs = Date.now() - start;

  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      checks,
      latencyMs,
      timestamp: new Date().toISOString(),
    },
    { status: allOk ? 200 : 503 }
  );
}
