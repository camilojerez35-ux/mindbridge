import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { generarFirmaIntegridad } from '@/lib/pagos/wompi';

const PRECIOS: Record<string, number> = {
  PLUS: 25000,
  FAMILIA: 45000,
};

const SuscripcionSchema = z.object({
  plan: z.enum(['PLUS', 'FAMILIA']),
  metodoPago: z.enum(['PSE', 'NEQUI', 'TARJETA', 'DAVIPLATA']),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'No autorizado. Inicie sesión.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const resultado = SuscripcionSchema.safeParse(body);
    if (!resultado.success) {
      return Response.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const { plan, metodoPago } = resultado.data;
    const { id: usuarioId, email: emailUsuario, name: nombreUsuario } = session.user;

    const montoCOP = PRECIOS[plan];
    const referencia = `SUBS-${usuarioId}-${plan}-${Date.now()}`;
    const montoCentavos = montoCOP * 100;

    const firma = generarFirmaIntegridad({ referencia, amountInCents: montoCentavos, currency: 'COP' });

    await db.pago.create({
      data: {
        montoCOP,
        metodoPago,
        referencia,
        pasarela: 'WOMPI',
        estado: 'PENDIENTE',
      },
    });

    const datosWidget = {
      publicKey: process.env.WOMPI_PUBLIC_KEY,
      currency: 'COP',
      amountInCents: montoCentavos,
      reference: referencia,
      integritySignature: firma,
      redirectUrl: `${process.env.APP_URL}/dashboard/perfil?pago=exitoso&plan=${plan}`,
      customerData: { email: emailUsuario, fullName: nombreUsuario ?? '' },
    };

    return Response.json({ exito: true, referencia, datosWidget, montoCOP, plan });

  } catch (error: any) {
    console.error('[SUSCRIPCION ERROR]', error);
    return Response.json({ error: 'Error al iniciar el pago' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'No autorizado. Inicie sesión.' }, { status: 401 });
  }

  try {
    await db.usuario.update({
      where: { id: session.user.id },
      data: {
        planActual: 'GRATIS',
        suscripcionVence: undefined,
      },
    });

    return Response.json({
      exito: true,
      mensaje: 'Suscripción cancelada. Sigue activa hasta el final del período pagado.',
    });
  } catch (error) {
    console.error('[CANCELAR SUSCRIPCION ERROR]', error);
    return Response.json({ error: 'Error al cancelar' }, { status: 500 });
  }
}
