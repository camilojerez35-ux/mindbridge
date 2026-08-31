import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth/get-auth-user';
import { db } from '@/lib/db/client';
import { generarFirmaIntegridad } from '@/lib/pagos/wompi';
import { rateLimits } from '@/lib/rate-limit';

const PRECIOS_MENSUAL: Record<string, number> = {
  BASICO: 14900,
  PLUS: 25900,
  FAMILIA: 44900,
};

// Plan anual: 10 meses de precio, 2 meses de regalo. Por ahora solo Plus.
const PRECIOS_ANUAL: Record<string, number> = {
  PLUS: 259000,
};

const SuscripcionSchema = z.object({
  plan: z.enum(['BASICO', 'PLUS', 'FAMILIA']),
  metodoPago: z.enum(['PSE', 'NEQUI', 'TARJETA', 'DAVIPLATA']),
  ciclo: z.enum(['MENSUAL', 'ANUAL']).default('MENSUAL'),
});

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return Response.json({ error: 'No autorizado. Inicie sesión.' }, { status: 401 });
  }

  const { allowed } = await rateLimits.pagos(user.id);
  if (!allowed) {
    return Response.json(
      { error: 'Demasiados intentos de pago. Intenta más tarde.' },
      { status: 429 },
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) return Response.json({ error: 'Body inválido' }, { status: 400 });

    const resultado = SuscripcionSchema.safeParse(body);
    if (!resultado.success) {
      return Response.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const { plan, metodoPago, ciclo } = resultado.data;
    const { id: usuarioId, email: emailUsuario, nombre: nombreUsuario } = user;

    if (ciclo === 'ANUAL' && !PRECIOS_ANUAL[plan]) {
      return Response.json({ error: 'Este plan no tiene modalidad anual' }, { status: 400 });
    }

    const montoCOP = ciclo === 'ANUAL' ? PRECIOS_ANUAL[plan] : PRECIOS_MENSUAL[plan];
    const referencia = `SUBS-${usuarioId}-${plan}-${ciclo}-${Date.now()}`;
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
  const user = await getAuthUser(req);
  if (!user) {
    return Response.json({ error: 'No autorizado. Inicie sesión.' }, { status: 401 });
  }

  try {
    await db.usuario.update({
      where: { id: user.id },
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
