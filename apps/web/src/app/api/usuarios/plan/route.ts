import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { z } from 'zod';
import { rateLimits } from '@/lib/rate-limit';

const Schema = z.object({
  plan: z.literal('GRATIS'),
}).strict();

// Solo permite cancelar/degradar a GRATIS.
// Los upgrades a planes pagos se activan exclusivamente via webhook de Wompi (/api/pagos/webhook).
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
    return Response.json({ error: 'Solo se permite cancelar la suscripción (plan GRATIS). Para actualizar tu plan, realiza el pago correspondiente.' }, { status: 400 });
  }

  await db.usuario.update({
    where: { id: session.user.id },
    data: {
      planActual: 'GRATIS',
      suscripcionVence: null,
    },
  });

  return Response.json({ exito: true, plan: 'GRATIS' });
}
