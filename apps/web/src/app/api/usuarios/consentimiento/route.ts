import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { VERSIONES_DOCUMENTOS } from '@/lib/legal/versiones';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return Response.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const { aceptaPrivacidad, aceptaIA, aceptaMarketing } = body;

  if (!aceptaPrivacidad || !aceptaIA) {
    return Response.json(
      { error: 'Debes aceptar la política de privacidad y el uso de IA para continuar' },
      { status: 400 }
    );
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'desconocida';
  const userAgent = req.headers.get('user-agent') ?? 'desconocido';
  const ahora = new Date();

  await db.$transaction([
    db.usuario.update({
      where: { id: session.user.id },
      data: {
        consentimientoDatos: true,
        fechaConsentimiento: ahora,
        consentimientoIA: true,
        fechaConsentimientoIA: ahora,
        consentimientoMarketing: aceptaMarketing ?? false,
      },
    }),
    db.consentimiento.createMany({
      data: [
        {
          usuarioId: session.user.id,
          tipo: 'POLITICA_PRIVACIDAD',
          version: VERSIONES_DOCUMENTOS.POLITICA_PRIVACIDAD,
          aceptado: true,
          ipAddress: ip,
          userAgent,
        },
        {
          usuarioId: session.user.id,
          tipo: 'USO_IA',
          version: VERSIONES_DOCUMENTOS.AVISO_IA,
          aceptado: true,
          ipAddress: ip,
          userAgent,
        },
        {
          usuarioId: session.user.id,
          tipo: 'TERMINOS_USO',
          version: VERSIONES_DOCUMENTOS.TERMINOS_USO,
          aceptado: true,
          ipAddress: ip,
          userAgent,
        },
        ...(aceptaMarketing
          ? [
              {
                usuarioId: session.user.id,
                tipo: 'MARKETING' as const,
                version: '1.0.0',
                aceptado: true,
                ipAddress: ip,
                userAgent,
              },
            ]
          : []),
      ],
    }),
  ]);

  return Response.json({ ok: true });
}
