/**
 * POST /api/ai/crisis — Notificación al psicólogo cuando se detecta crisis
 *
 * Llamado internamente por el sistema de detección de crisis (chat, diario, ánimo).
 * También puede usarse desde el cliente cuando el usuario activa el botón de pánico.
 */
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { registrarAuditLog } from '@/lib/db/client';
import { z } from 'zod';
import { capturarErrorApi } from '@/lib/monitoring/sentry';
import { registrarIncidente } from '@/lib/crisis/incident-logger';
import { notificarPsicologoAsignado } from '@/lib/crisis/notificar-psicologo';
import crypto from 'crypto';

const CrisisSchema = z.object({
  nivel:                  z.enum(['CRITICO', 'ALTO', 'MODERADO', 'BAJO']),
  sesionId:               z.string().min(1),
  indicadoresDetectados:  z.array(z.string()).default([]),
  fragmentoAnonimizado:   z.string().max(500).default(''),
  fuente:                 z.enum(['chat', 'diario', 'animo', 'panico_manual']).default('chat'),
}).strict();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CrisisSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: 'Datos inválidos', detalles: parsed.error.flatten() }, { status: 400 });
    }

    const { nivel, sesionId, indicadoresDetectados, fragmentoAnonimizado, fuente } = parsed.data;
    const usuarioId = session.user.id;

    // Token de confirmación — solo para CRITICO/ALTO (requieren respuesta del psicólogo)
    const tokenConfirmacion = (nivel === 'CRITICO' || nivel === 'ALTO')
      ? crypto.randomBytes(32).toString('hex')
      : undefined;

    await registrarIncidente({
      usuarioId,
      sesionId,
      nivel,
      indicadoresDetectados,
      fragmentoAnonimizado,
      timestampDeteccion: new Date(),
      protocoloActivado: true,
      psicologoNotificado: false,
      tokenConfirmacion,
    });

    let psicologoNotificado = false;
    if (nivel === 'CRITICO' || nivel === 'ALTO') {
      psicologoNotificado = await notificarPsicologoAsignado(
        usuarioId, nivel, fragmentoAnonimizado, fuente, tokenConfirmacion!,
      );
    }

    await registrarAuditLog({
      usuarioId,
      accion: `CRISIS_${nivel}_DETECTADA`,
      recurso: 'CrisisIncidente',
      recursoId: sesionId,
      ipAddress: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined,
      userAgent: req.headers.get('user-agent') ?? undefined,
      metadatos: { nivel, fuente, indicadoresDetectados, psicologoNotificado },
    });

    return Response.json({ ok: true, nivel, psicologoNotificado });

  } catch (error) {
    capturarErrorApi(error, { ruta: '/api/ai/crisis', metodo: 'POST' });
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}

