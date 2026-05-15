/**
 * MindBridge — API Route: Citas con Psicólogos
 * GET  /api/citas         → listar citas del usuario
 * POST /api/citas         → agendar nueva cita
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { z } from 'zod';
import { crearSalaVideollamada } from '@/lib/videollamada/daily';
import { procesarPagoCita } from '@/lib/pagos/wompi';
import { enviarConfirmacionCita } from '@/lib/email/confirmaciones';

const AgendarCitaSchema = z.object({
  psicologoId: z.string().cuid(),
  fechaHora: z.string().datetime(),
  tipo: z.enum(['PRIMERA_CONSULTA', 'SEGUIMIENTO', 'URGENTE']).default('PRIMERA_CONSULTA'),
  notasPrevias: z.string().max(1000).optional(),
  metodoPago: z.enum(['PSE', 'TARJETA', 'NEQUI', 'DAVIPLATA']),
  tokenPago: z.string(), // Token de la pasarela de pagos
  compartirResumenIA: z.boolean().default(false),
});

// GET — Listar citas del usuario autenticado
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const estado = searchParams.get('estado');
  const limite = Math.min(parseInt(searchParams.get('limite') || '10'), 50);
  const pagina = parseInt(searchParams.get('pagina') || '1');

  try {
    const where: Record<string, unknown> = { usuarioId: session.user.id };
    if (estado) where.estado = estado;

    const [citas, total] = await Promise.all([
      db.cita.findMany({
        where,
        include: {
          psicologo: {
            select: {
              nombreCompleto: true,
              especialidades: true,
              fotoUrl: true,
              calificacionPromedio: true,
            },
          },
          resena: { select: { calificacion: true, comentario: true } },
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

// POST — Agendar nueva cita
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  const usuarioId = session.user.id;

  try {
    const body = await req.json();
    const parseResult = AgendarCitaSchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json({ error: 'Datos inválidos', detalles: parseResult.error.issues }, { status: 400 });
    }

    const datos = parseResult.data;
    const fechaCita = new Date(datos.fechaHora);

    // ── Verificar que la fecha está en el futuro ────────────────
    if (fechaCita <= new Date()) {
      return Response.json({ error: 'La fecha de la cita debe ser en el futuro' }, { status: 400 });
    }

    // ── Verificar que el psicólogo existe y está activo ────────
    const psicologo = await db.psicologo.findUnique({
      where: { id: datos.psicologoId, activo: true, estado: 'ACTIVO' },
    });

    if (!psicologo) {
      return Response.json({ error: 'Psicólogo no disponible' }, { status: 404 });
    }

    // ── Verificar que el horario está disponible ───────────────
    const citaExistente = await db.cita.findFirst({
      where: {
        psicologoId: datos.psicologoId,
        fechaHora: {
          gte: new Date(fechaCita.getTime() - 30 * 60 * 1000),
          lte: new Date(fechaCita.getTime() + 75 * 60 * 1000),
        },
        estado: { notIn: ['CANCELADA_USUARIO', 'CANCELADA_PSICOLOGO'] },
      },
    });

    if (citaExistente) {
      return Response.json({ error: 'El psicólogo no está disponible en ese horario' }, { status: 409 });
    }

    // ── Calcular montos ────────────────────────────────────────
    const comisionPorcentaje = parseInt(process.env.COMISION_CITAS_PORCENTAJE || '20');
    const montoCOP = psicologo.tarifaCOP;
    const comisionCOP = Math.round(montoCOP * comisionPorcentaje / 100);
    const montoPsicologoCOP = montoCOP - comisionCOP;

    // ── Procesar pago ──────────────────────────────────────────
    const resultadoPago = await procesarPagoCita({
      token: datos.tokenPago,
      montoCOP,
      metodoPago: datos.metodoPago,
      referencia: `CITA-${usuarioId}-${Date.now()}`,
    });

    if (!resultadoPago.aprobado) {
      return Response.json({
        error: 'Pago no aprobado',
        detalle: resultadoPago.mensaje,
      }, { status: 402 });
    }

    // ── Crear sala de videollamada ─────────────────────────────
    const sala = await crearSalaVideollamada({
      nombre: `cita-${Date.now()}`,
      expiraEn: new Date(fechaCita.getTime() + 90 * 60 * 1000),
    });

    // ── Obtener resumen de IA si aplica ───────────────────────
    let notasPrevias = datos.notasPrevias;
    if (datos.compartirResumenIA) {
      const ultimasSesiones = await db.sesionChat.findMany({
        where: { usuarioId, estado: 'CERRADA' },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { resumen: true },
      });
      if (ultimasSesiones.length > 0) {
        notasPrevias = `Resumen de sesiones con IA (${ultimasSesiones.length} sesiones recientes):\n` +
          ultimasSesiones.map(s => s.resumen).filter(Boolean).join('\n---\n');
      }
    }

    // ── Crear registro en base de datos ───────────────────────
    const [pago, cita] = await db.$transaction(async (tx) => {
      const pago = await tx.pago.create({
        data: {
          montoCOP,
          metodoPago: datos.metodoPago,
          referencia: resultadoPago.referencia,
          pasarela: 'WOMPI',
          idTransaccionPasarela: resultadoPago.idTransaccion,
          estadoPasarela: 'APROBADO',
          respuestaPasarela: resultadoPago.respuestaCompleta as object,
          estado: 'APROBADO',
          fechaPago: new Date(),
        },
      });

      const cita = await tx.cita.create({
        data: {
          usuarioId,
          psicologoId: datos.psicologoId,
          fechaHora: fechaCita,
          duracionMinutos: 45,
          estado: 'CONFIRMADA',
          tipo: datos.tipo,
          modalidad: 'VIDEOLLAMADA',
          montoCOP,
          comisionCOP,
          montoPsicologoCOP,
          estadoPago: 'APROBADO',
          pagoId: pago.id,
          notasPrevias,
          salaVideollamada: sala.url,
          tokenPsicologo: sala.tokenPsicologo,
          tokenUsuario: sala.tokenUsuario,
        },
        include: {
          psicologo: {
            select: { nombreCompleto: true, email: true, fotoUrl: true },
          },
        },
      });

      return [pago, cita];
    });

    // ── Enviar confirmaciones por email ────────────────────────
    await enviarConfirmacionCita({
      cita,
      emailUsuario: session.user.email!,
      nombreUsuario: session.user.name || 'Usuario',
    }).catch(console.error);

    return Response.json({
      exito: true,
      cita: {
        id: cita.id,
        fechaHora: cita.fechaHora,
        psicologo: cita.psicologo,
        salaVideollamada: cita.salaVideollamada,
        montoCOP: cita.montoCOP,
        estado: cita.estado,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('[CITAS POST ERROR]', error);
    return Response.json({ error: 'Error al agendar la cita' }, { status: 500 });
  }
}
