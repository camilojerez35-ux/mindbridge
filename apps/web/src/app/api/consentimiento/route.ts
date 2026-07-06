import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { getAuthUser } from '@/lib/auth/get-auth-user';

const Schema = z.object({
  privacidad:  z.boolean(),
  terminosUso: z.boolean(),
  usaIA:       z.boolean(),
  marketing:   z.boolean().optional().default(false),
  version:     z.string().default('1.0.0'),
});

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'Datos inválidos' }, { status: 400 });

  const { privacidad, terminosUso, usaIA, marketing, version } = parsed.data;

  if (!privacidad || !terminosUso || !usaIA) {
    return Response.json({ error: 'Debes aceptar privacidad, términos y aviso de IA' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined;
  const ua = req.headers.get('user-agent') ?? undefined;
  const ahora = new Date();

  await db.$transaction([
    // Actualizar flags en Usuario
    db.usuario.update({
      where: { id: user.id },
      data: {
        consentimientoDatos:   true,
        fechaConsentimiento:   ahora,
        consentimientoIA:      true,
        fechaConsentimientoIA: ahora,
        consentimientoMarketing: marketing,
      },
    }),
    // Registrar cada consentimiento individualmente (auditoría Ley 1581)
    db.consentimiento.createMany({
      data: [
        { usuarioId: user.id, tipo: 'POLITICA_PRIVACIDAD', version, aceptado: privacidad, ipAddress: ip, userAgent: ua },
        { usuarioId: user.id, tipo: 'TERMINOS_USO',        version, aceptado: terminosUso, ipAddress: ip, userAgent: ua },
        { usuarioId: user.id, tipo: 'USO_IA',              version, aceptado: usaIA,       ipAddress: ip, userAgent: ua },
        { usuarioId: user.id, tipo: 'MARKETING',           version, aceptado: marketing,   ipAddress: ip, userAgent: ua },
      ],
      skipDuplicates: false,
    }),
  ]);

  return Response.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const usuario = await db.usuario.findUnique({
    where: { id: user.id },
    select: { consentimientoDatos: true, consentimientoIA: true, consentimientoMarketing: true },
  });

  return Response.json({ consentimientoDado: usuario?.consentimientoDatos && usuario?.consentimientoIA });
}
