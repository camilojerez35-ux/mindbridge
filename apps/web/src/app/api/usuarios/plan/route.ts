import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { z } from 'zod';
import { rateLimits } from '@/lib/rate-limit';

const Schema = z.object({
  plan: z.enum(['GRATIS', 'PLUS', 'FAMILIA', 'EMPRESARIAL']),
}).strict();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { allowed } = await rateLimits.plan(session.user.id);
  if (!allowed) {
    return Response.json({ error: 'Demasiadas solicitudes. Intenta más tarde.' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Plan no válido' }, { status: 400 });
  }

  const { plan } = parsed.data;

  const vence = plan === 'GRATIS' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db.usuario.update({
    where: { id: session.user.id },
    data: {
      planActual: plan,
      suscripcionVence: vence,
    },
  });

  return Response.json({ exito: true, plan });
}
