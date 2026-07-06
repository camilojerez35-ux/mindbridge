/**
 * PATCH /api/admin/psicologos/[id]/verificar
 * Verifica manualmente la tarjeta COLPSIC de un psicólogo.
 * Solo accesible para ADMIN / SUPERADMIN.
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { z } from 'zod';
import { enviarEmail } from '@/lib/email/confirmaciones';

const VerificarSchema = z.object({
  tarjetaVerificada:    z.boolean(),
  // Rechazar requiere motivo
  motivoRechazo:        z.string().min(10).max(500).optional(),
  // Campos opcionales para completar/corregir al verificar
  tarjetaProfesionalId: z.string().min(3).optional(),
  tarjetaVencimiento:   z.string().datetime().optional(),
  notas:                z.string().max(500).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (session.user.rol !== 'ADMIN' && session.user.rol !== 'SUPERADMIN') {
    return Response.json({ error: 'Solo administradores' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = VerificarSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Datos inválidos', detalles: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { tarjetaVerificada, motivoRechazo, tarjetaProfesionalId, tarjetaVencimiento, notas } = parsed.data;

  if (!tarjetaVerificada && !motivoRechazo) {
    return Response.json(
      { error: 'Se requiere motivoRechazo al rechazar la verificación' },
      { status: 400 },
    );
  }

  const psicologo = await db.psicologo.findUnique({
    where: { id: params.id },
    include: {
      usuario: { select: { id: true, email: true, nombre: true } },
    },
  });

  if (!psicologo) {
    return Response.json({ error: 'Psicólogo no encontrado' }, { status: 404 });
  }

  const ahora = new Date();

  if (tarjetaVerificada) {
    // Aprobar → activar psicólogo
    await db.psicologo.update({
      where: { id: params.id },
      data: {
        tarjetaVerificada: true,
        fechaVerificacion: ahora,
        estado: 'ACTIVO',
        ...(tarjetaProfesionalId && { tarjetaProfesionalId }),
        ...(tarjetaVencimiento && { tarjetaVencimiento: new Date(tarjetaVencimiento) }),
      },
    });

    // Activar cuenta de usuario
    await db.usuario.update({
      where: { id: psicologo.usuarioId },
      data: { activo: true },
    });

    // Notificar al psicólogo
    if (psicologo.usuario.email) {
      await enviarEmail({
        to: psicologo.usuario.email,
        subject: '✅ Tu perfil en MindBridge fue verificado',
        text: `Hola ${psicologo.usuario.nombre},\n\nTu tarjeta profesional COLPSIC ha sido verificada. Ya puedes recibir citas en MindBridge.\n\nEquipo MindBridge`,
        html: `<div style="font-family:sans-serif;max-width:520px;margin:auto">
          <h2 style="color:#0d9488">✅ ¡Perfil verificado!</h2>
          <p>Hola <strong>${psicologo.usuario.nombre}</strong>,</p>
          <p>Tu tarjeta profesional COLPSIC ha sido verificada exitosamente. Tu cuenta está activa y puedes comenzar a recibir citas en MindBridge.</p>
          <div style="background:#f0fdf4;border-left:4px solid #0d9488;padding:14px 18px;border-radius:6px;margin:16px 0">
            <p style="margin:0;font-weight:bold">Tarjeta: ${psicologo.tarjetaProfesionalId}</p>
            <p style="margin:6px 0 0;color:#555">Verificada el ${ahora.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <a href="${process.env.APP_URL}/dashboard/psicologo" style="display:inline-block;background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Ir a mi panel →</a>
          <p style="color:#888;font-size:12px;margin-top:24px">Si tienes preguntas, escríbenos a soporte@mindbridge.co</p>
        </div>`,
      }).catch(console.error);
    }

    return Response.json({
      ok: true,
      mensaje: 'Psicólogo verificado y activado correctamente',
      psicologoId: params.id,
      verificadoPor: session.user.id,
      fechaVerificacion: ahora,
    });

  } else {
    // Rechazar → mantener PENDIENTE_VERIFICACION y notificar
    await db.psicologo.update({
      where: { id: params.id },
      data: {
        tarjetaVerificada: false,
        estado: 'PENDIENTE_VERIFICACION',
      },
    });

    if (psicologo.usuario.email) {
      await enviarEmail({
        to: psicologo.usuario.email,
        subject: '⚠️ Verificación COLPSIC — acción requerida — MindBridge',
        text: `Hola ${psicologo.usuario.nombre},\n\nHemos revisado tu solicitud de verificación COLPSIC y necesitamos información adicional.\n\nMotivo: ${motivoRechazo}\n\nPor favor escríbenos a soporte@mindbridge.co para continuar.\n\nEquipo MindBridge`,
        html: `<div style="font-family:sans-serif;max-width:520px;margin:auto">
          <h2 style="color:#dc2626">⚠️ Verificación — acción requerida</h2>
          <p>Hola <strong>${psicologo.usuario.nombre}</strong>,</p>
          <p>Hemos revisado tu solicitud de verificación COLPSIC y necesitamos información adicional antes de activar tu cuenta.</p>
          <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:14px 18px;border-radius:6px;margin:16px 0">
            <p style="margin:0;font-weight:bold;color:#dc2626">Motivo:</p>
            <p style="margin:6px 0 0;color:#333">${motivoRechazo}</p>
            ${notas ? `<p style="margin:8px 0 0;color:#555;font-size:13px">${notas}</p>` : ''}
          </div>
          <p>Por favor responde a este correo o escríbenos a <a href="mailto:soporte@mindbridge.co">soporte@mindbridge.co</a> para continuar con el proceso.</p>
        </div>`,
      }).catch(console.error);
    }

    return Response.json({
      ok: true,
      mensaje: 'Verificación rechazada. Psicólogo notificado.',
      psicologoId: params.id,
    });
  }
}

// GET — Estado de verificación de un psicólogo
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.rol !== 'ADMIN' && session.user.rol !== 'SUPERADMIN') {
    return Response.json({ error: 'Solo administradores' }, { status: 403 });
  }

  const psicologo = await db.psicologo.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      tarjetaProfesionalId: true,
      tarjetaVerificada: true,
      fechaVerificacion: true,
      tarjetaVencimiento: true,
      estado: true,
      usuario: { select: { email: true, nombre: true, activo: true } },
    },
  });

  if (!psicologo) return Response.json({ error: 'No encontrado' }, { status: 404 });
  return Response.json(psicologo);
}
