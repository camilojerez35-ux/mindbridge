/**
 * POST /api/psicologos/verificar  — Verificación COLPSIC de psicólogos
 * Solo accesible para rol ADMIN.
 *
 * Flujo:
 *  1. Admin consulta el registro COLPSIC manualmente (web de COLPSIC o su API si disponible)
 *  2. Admin aprueba/rechaza en el panel con notas
 *  3. Esta ruta actualiza el estado y notifica al psicólogo por email
 *
 * Cumplimiento: Resolución 2654/2019 — todo profesional de salud mental
 * que use IA clínica debe estar habilitado por la entidad competente (COLPSIC).
 */
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db, registrarAuditLog } from '@/lib/db/client';
import { z } from 'zod';
import { capturarErrorApi } from '@/lib/monitoring/sentry';
import {
  verificarTarjetaCOLPSIC,
  COLPSIC_CONSULTA_URL,
} from '@/lib/colpsic/verificacion';

const VerificarSchema = z.object({
  psicologoId:       z.string().min(1),
  accion:            z.enum(['APROBAR', 'RECHAZAR', 'SUSPENDER']),
  notasAdmin:        z.string().max(1000).optional(),
  // Datos verificados manualmente contra el registro COLPSIC
  tarjetaConfirmada: z.boolean().optional(),
  tarjetaVencimiento: z.string().datetime().optional(),
}).strict();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }
    if (session.user.rol !== 'ADMIN') {
      return Response.json({ error: 'Acceso restringido a administradores' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = VerificarSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: 'Datos inválidos', detalles: parsed.error.flatten() }, { status: 400 });
    }

    const { psicologoId, accion, notasAdmin, tarjetaConfirmada, tarjetaVencimiento } = parsed.data;

    const psicologo = await db.psicologo.findUnique({
      where: { id: psicologoId },
      select: { id: true, nombreCompleto: true, tarjetaProfesionalId: true, estado: true, usuarioId: true },
    });

    if (!psicologo) {
      return Response.json({ error: 'Psicólogo no encontrado' }, { status: 404 });
    }

    // Consultar COLPSIC (automático si API configurada, manual en otro caso)
    const resultadoCOLPSIC = await verificarTarjetaCOLPSIC(
      psicologo.tarjetaProfesionalId,
      psicologo.nombreCompleto,
    );

    const nuevoEstado = accion === 'APROBAR'
      ? 'VERIFICADO'
      : accion === 'RECHAZAR'
      ? 'RECHAZADO'
      : 'SUSPENDIDO';

    const ahora = new Date();

    await db.psicologo.update({
      where: { id: psicologoId },
      data: {
        estado:            nuevoEstado,
        tarjetaVerificada: accion === 'APROBAR' && (tarjetaConfirmada ?? false),
        fechaVerificacion: accion === 'APROBAR' ? ahora : null,
        activo:            accion === 'APROBAR',
        ...(tarjetaVencimiento
          ? { tarjetaVencimiento: new Date(tarjetaVencimiento) }
          : resultadoCOLPSIC.fechaVencimiento
          ? { tarjetaVencimiento: resultadoCOLPSIC.fechaVencimiento }
          : {}),
      },
    });

    // Audit log real (reemplaza el workaround con tabla consentimientos)
    await registrarAuditLog({
      adminId:   session.user.id,
      usuarioId: psicologo.usuarioId,
      accion:    `COLPSIC_${accion}`,
      recurso:   'Psicologo',
      recursoId: psicologoId,
      ipAddress: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined,
      userAgent: req.headers.get('user-agent') ?? undefined,
      metadatos: {
        tarjetaId:       psicologo.tarjetaProfesionalId,
        fuenteColpsic:   resultadoCOLPSIC.fuente,
        estadoColpsic:   resultadoCOLPSIC.estadoTarjeta,
        notasAdmin:      notasAdmin ?? null,
        consultaManual:  resultadoCOLPSIC.fuente === 'manual_pendiente'
          ? COLPSIC_CONSULTA_URL
          : null,
      },
    });

    // Notificar al psicólogo (async, no bloquea)
    notificarPsicologoAsync(psicologo, accion, notasAdmin).catch(console.error);

    return Response.json({
      ok: true,
      psicologoId,
      estadoNuevo: nuevoEstado,
      mensaje: `Psicólogo ${accion === 'APROBAR' ? 'verificado y activado' : accion === 'RECHAZAR' ? 'rechazado' : 'suspendido'} correctamente`,
      colpsic: {
        fuente: resultadoCOLPSIC.fuente,
        estadoTarjeta: resultadoCOLPSIC.estadoTarjeta ?? null,
        ...(resultadoCOLPSIC.fuente === 'manual_pendiente'
          ? { consultaManualUrl: COLPSIC_CONSULTA_URL }
          : {}),
      },
    });

  } catch (error) {
    capturarErrorApi(error, { ruta: '/api/psicologos/verificar', metodo: 'POST' });
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

async function notificarPsicologoAsync(
  psicologo: { usuarioId: string; nombreCompleto: string },
  accion: 'APROBAR' | 'RECHAZAR' | 'SUSPENDER',
  notas?: string
) {
  const usuario = await db.usuario.findUnique({
    where: { id: psicologo.usuarioId },
    select: { email: true },
  });
  if (!usuario) return;

  const { enviarEmail } = await import('@/lib/email/confirmaciones');

  const mensajes = {
    APROBAR:   '¡Tu perfil ha sido verificado! Ya puedes recibir citas a través de MenteBridge.',
    RECHAZAR:  'Tu solicitud de verificación no pudo ser aprobada en este momento.',
    SUSPENDER: 'Tu perfil ha sido suspendido temporalmente. Contáctanos para más información.',
  };

  await enviarEmail({
    to:      usuario.email,
    subject: 'MenteBridge — Actualización de tu verificación COLPSIC',
    html: `<p>Hola ${psicologo.nombreCompleto},</p><p>${mensajes[accion]}</p>${notas ? `<p><strong>Notas:</strong> ${notas}</p>` : ''}<p>— Equipo MenteBridge</p>`,
    text: `Hola ${psicologo.nombreCompleto}, ${mensajes[accion]}${notas ? ` Notas: ${notas}` : ''} — Equipo MenteBridge`,
  });
}

// ── GET /api/psicologos/verificar — Lista pendientes de verificación ──────────

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.rol !== 'ADMIN') {
      return Response.json({ error: 'No autorizado' }, { status: session ? 403 : 401 });
    }

    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado') ?? 'PENDIENTE_VERIFICACION';

    const psicologos = await db.psicologo.findMany({
      where: { estado: estado as any },
      select: {
        id:                   true,
        nombreCompleto:       true,
        tarjetaProfesionalId: true,
        tarjetaVencimiento:   true,
        tarjetaVerificada:    true,
        estado:               true,
        especialidades:       true,
        anosExperiencia:      true,
        usuarioId:            true,
        createdAt:            true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Enriquecer con datos del usuario (email) — join manual porque Psicologo no tiene relación directa
    const usuarioIds = psicologos.map(p => p.usuarioId);
    const usuarios = await db.usuario.findMany({
      where: { id: { in: usuarioIds } },
      select: { id: true, email: true, createdAt: true },
    });
    const usuarioMap = Object.fromEntries(usuarios.map(u => [u.id, u]));

    const resultado = psicologos.map(p => ({
      ...p,
      usuario: usuarioMap[p.usuarioId] ?? { email: 'desconocido', createdAt: p.createdAt },
    }));

    return Response.json({ psicologos: resultado, total: resultado.length });

  } catch (error) {
    capturarErrorApi(error, { ruta: '/api/psicologos/verificar', metodo: 'GET' });
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}
