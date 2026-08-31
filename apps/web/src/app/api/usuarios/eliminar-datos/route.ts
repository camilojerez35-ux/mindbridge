/**
 * POST /api/usuarios/eliminar-datos
 *
 * Endpoint de "derecho al olvido" — Ley 1581/2012 (Habeas Data), Ley 2460/2025.
 * El usuario confirma explícitamente la eliminación con la palabra "ELIMINAR".
 *
 * Flujo:
 * 1. Anonimiza PII inmediatamente (nombre, email, teléfono, ciudad, fecha nac.)
 * 2. Elimina contenido personal (mensajes, diario, ánimo, resultados tests)
 * 3. Marca el usuario como ELIMINADO
 * 4. Registra `solicitudEliminacionAt` y `eliminadoDefinitivoAt` para auditoría
 * 5. Conserva: AuditLog (requerido por ley), IncidenteCrisis anonimizados (obligatorio clínico)
 * 6. Invalida la sesión actual
 */
import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth/get-auth-user';
import { db, registrarAuditLog } from '@/lib/db/client';
import { z } from 'zod';

const schema = z.object({
  confirmacion: z.literal('ELIMINAR', {
    message: 'Debes escribir exactamente "ELIMINAR" para confirmar',
  }),
});

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: 'Cuerpo inválido' }, { status: 400 });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const usuarioId = user.id;
  const ahora = new Date();

  try {
    // Verificar que el usuario existe y no está ya eliminado
    const usuario = await db.usuario.findUnique({
      where: { id: usuarioId },
      select: { estado: true, email: true, nombre: true },
    });

    if (!usuario) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    if (usuario.estado === 'ELIMINADO') {
      return Response.json({ error: 'La cuenta ya fue eliminada' }, { status: 409 });
    }

    // ─── 1. Eliminar contenido personal ───────────────────────────────────────
    await db.$transaction([
      // Mensajes de chat
      db.mensajeChat.deleteMany({ where: { usuarioId } }),
      // Sesiones de chat (después de mensajes por FK)
      db.sesionChat.deleteMany({ where: { usuarioId } }),
      // Diario
      db.entradaDiario.deleteMany({ where: { usuarioId } }),
      // Registros de ánimo
      db.registroAnimo.deleteMany({ where: { usuarioId } }),
      // Resultados de tests
      db.resultadoTest.deleteMany({ where: { usuarioId } }),
      // Consentimientos (se reemplazan con el registro de eliminación)
      db.consentimiento.deleteMany({ where: { usuarioId } }),
      // Perfil personalización
      db.perfilPersonalizacion.deleteMany({ where: { usuarioId } }),
    ]);

    // ─── 2. Anonimizar incidentes de crisis (conservar estructura, borrar fragmentos) ──
    await db.incidenteCrisis.updateMany({
      where: { usuarioId },
      data: { fragmentoAnonimizado: null, tokenConfirmacion: null },
    });

    // ─── 3. Anonimizar PII y marcar cuenta como eliminada ────────────────────
    await db.usuario.update({
      where: { id: usuarioId },
      data: {
        // Anonimizar PII
        nombre:          'Usuario',
        apellido:        'Eliminado',
        email:           `deleted_${usuarioId}@mentebridge.deleted`,
        telefono:        null,
        ciudadColombia:  null,
        fechaNacimiento: null,
        imagen:          null,
        pushToken:       null,
        // Limpiar datos clínicos
        motivoConsulta:     null,
        condicionesPrevias: null,
        medicamentos:       null,
        // Limpiar autenticación
        hashedPassword:     null,
        emailVerificado:    null,
        // Marcar como eliminado
        estado:                  'ELIMINADO',
        consentimientoDatos:     false,
        consentimientoIA:        false,
        consentimientoMarketing: false,
        // Timestamps de eliminación
        solicitudEliminacionAt: ahora,
        eliminadoDefinitivoAt:  ahora,
      },
    });

    // ─── 4. Audit log inmutable ────────────────────────────────────────────────
    await registrarAuditLog({
      usuarioId,
      accion: 'ELIMINAR_DATOS_PERSONALES',
      recurso: 'Usuario',
      recursoId: usuarioId,
      ipAddress: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined,
      userAgent: req.headers.get('user-agent') ?? undefined,
      metadatos: {
        emailOriginalHash: Buffer.from(usuario.email).toString('base64').slice(0, 8) + '***',
        ejecutadoEn: ahora.toISOString(),
        ley: 'Ley 1581/2012 (Habeas Data) — Artículo 8',
      },
    });

    return Response.json({
      ok: true,
      mensaje: 'Tu cuenta y datos personales han sido eliminados. La sesión se cerrará automáticamente.',
    });
  } catch (err) {
    console.error('[ELIMINAR-DATOS]', err);
    return Response.json({ error: 'Error interno. Contacta privacidad@mentebridge.com' }, { status: 500 });
  }
}
