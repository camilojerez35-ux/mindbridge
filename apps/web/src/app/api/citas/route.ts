/**
 * MindBridge — API Route: Citas con Psicólogos
 * GET  /api/citas  → listar citas del usuario
 * POST /api/citas  → crear cita pendiente y devolver datos para widget Wompi
 */

import { NextRequest } from 'next/server';
import { createHash } from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { z } from 'zod';

const AgendarCitaSchema = z.object({
  psicologoId: z.string().cuid(),
  fechaHora:   z.string().datetime(),
  metodoPago:  z.enum(['PSE', 'TARJETA', 'NEQUI', 'DAVIPLATA']),
});

// GET — Listar citas del usuario autenticado
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const estado  = searchParams.get('estado');
  const limite  = Math.min(parseInt(searchParams.get('limite') || '10'), 50);
  const pagina  = parseInt(searchParams.get('pagina') || '1');

  try {
    const where: Record<string, unknown> = { usuarioId: session.user.id };
    if (estado) where.estado = estado;

    const [citas, total] = await Promise.all([
      db.cita.findMany({
        where,
        include: {
          psicologo: {
            select: { nombreCompleto: true, especialidades: true, fotoUrl: true, calificacionPromedio: true },
          },
          pago: { select: { metodoPago: true } },
        },
        orderBy: { fechaHora: 'desc' },
        take: limite,
        skip: (pagina - 1) * limite,
      }),
      db.cita.count({ where }),
    ]);

    return Response.json({
      citas,
      paginacion: { total, pagina, limite, totalPaginas: Math.ceil(total / limite) },
    });
  } catch (error) {
    console.error('[CITAS GET ERROR]', error);
    return Response.json({ error: 'Error al obtener citas' }, { status: 500 });
  }
}

// POST — Crear cita pendiente + devolver parámetros del widget Wompi
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  const usuarioId = session.user.id;

  try {
    const body = await req.json().catch(() => null);
    if (!body) return Response.json({ error: 'Body inválido' }, { status: 400 });

    const parsed = AgendarCitaSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.errors[0]?.message ?? 'Datos inválidos' },
        { status: 400 },
      );
    }

    const { psicologoId, fechaHora, metodoPago } = parsed.data;
    const fechaCita = new Date(fechaHora);

    if (fechaCita <= new Date()) {
      return Response.json({ error: 'La fecha de la cita debe ser en el futuro' }, { status: 400 });
    }

    // Verificar psicólogo activo
    const psicologo = await db.psicologo.findFirst({
      where: { id: psicologoId, activo: true, estado: { in: ['ACTIVO', 'VERIFICADO'] } },
      select: { id: true, nombreCompleto: true, tarifaCOP: true },
    });
    if (!psicologo) {
      return Response.json({ error: 'Psicólogo no disponible' }, { status: 404 });
    }

    // Verificar disponibilidad (prevenir double-booking)
    const citaExistente = await db.cita.findFirst({
      where: {
        psicologoId,
        fechaHora: {
          gte: new Date(fechaCita.getTime() - 30 * 60 * 1000),
          lte: new Date(fechaCita.getTime() + 75 * 60 * 1000),
        },
        estado: { notIn: ['CANCELADA_USUARIO', 'CANCELADA_PSICOLOGO'] },
      },
      select: { id: true },
    });
    if (citaExistente) {
      return Response.json({ error: 'El psicólogo no está disponible en ese horario' }, { status: 409 });
    }

    const comisionPct = parseInt(process.env.COMISION_CITAS_PORCENTAJE || '20');
    const montoCOP = psicologo.tarifaCOP;
    const comisionCOP = Math.round(montoCOP * comisionPct / 100);
    const montoPsicologoCOP = montoCOP - comisionCOP;

    const referencia = `CITA-${usuarioId.slice(-6)}-${Date.now()}`;

    // Crear cita en estado PENDIENTE (se confirma tras webhook de Wompi)
    const cita = await db.cita.create({
      data: {
        usuarioId,
        psicologoId,
        fechaHora: fechaCita,
        duracionMinutos: 45,
        estado: 'PENDIENTE',
        tipo: 'PRIMERA_CONSULTA',
        modalidad: 'VIDEOLLAMADA',
        montoCOP,
        comisionCOP,
        montoPsicologoCOP,
        estadoPago: 'PENDIENTE',
      },
    });

    // Construir datos para el widget Wompi
    const publicKey   = process.env.WOMPI_PUBLIC_KEY  ?? '';
    const eventsSecret = process.env.WOMPI_EVENTS_SECRET ?? '';
    const amountInCents = montoCOP * 100;
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
    const redirectUrl = `${appUrl}/dashboard/citas?pago=exitoso&citaId=${cita.id}`;

    // Firma de integridad SHA256: concatenar reference + amount + currency + secret
    let integritySignature = '';
    if (eventsSecret) {
      const data = `${referencia}${amountInCents}COP${eventsSecret}`;
      integritySignature = createHash('sha256').update(data).digest('hex');
    }

    const usuario = await db.usuario.findUnique({
      where: { id: usuarioId },
      select: { nombre: true, apellido: true, email: true },
    });

    return Response.json({
      citaId:     cita.id,
      referencia,
      psicologo:  psicologo.nombreCompleto,
      montoCOP,
      datosWidget: {
        publicKey,
        currency:          'COP',
        amountInCents,
        reference:         referencia,
        integritySignature,
        redirectUrl,
        customerData: {
          email:    usuario?.email    ?? session.user.email ?? '',
          fullName: `${usuario?.nombre ?? ''} ${usuario?.apellido ?? ''}`.trim() || session.user.name || '',
        },
      },
    }, { status: 201 });

  } catch (error) {
    console.error('[CITAS POST ERROR]', error);
    return Response.json({ error: 'Error al agendar la cita' }, { status: 500 });
  }
}
