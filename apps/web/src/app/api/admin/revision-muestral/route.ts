/**
 * GET  /api/admin/revision-muestral  — Obtener sesiones para revisión
 * POST /api/admin/revision-muestral  — Marcar sesiones como muestreadas (iniciar ronda)
 * PATCH /api/admin/revision-muestral — Marcar sesión como revisada por supervisor clínico
 *
 * Propósito: Res. 2654/2019 — supervisión humana de conversaciones IA para detectar
 * drift del modelo, respuestas inadecuadas y casos sub-diagnosticados.
 *
 * La muestra incluye sesiones con nivel de crisis BAJO/NINGUNO porque las sesiones
 * ALTO/CRÍTICO ya tienen supervisión obligatoria vía protocolo de escalación.
 */
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db, registrarAuditLog } from '@/lib/db/client';
import { z } from 'zod';

const ROLES_ADMIN = ['ADMIN', 'SUPERADMIN'];
const PORCENTAJE_MUESTRA = 0.10; // 10% de sesiones del período
const DIAS_PERIODO = 7;

async function verificarAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  if (!ROLES_ADMIN.includes(session.user.rol)) return null;
  return session;
}

/** GET — Lista sesiones muestreadas pendientes de revisión */
export async function GET(req: NextRequest) {
  const session = await verificarAdmin(req);
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const estado = searchParams.get('estado') ?? 'pendiente'; // pendiente | revisada | todas

  const sesiones = await db.sesionChat.findMany({
    where: {
      muestreadaEn: { not: null },
      ...(estado === 'pendiente' ? { revisadaEn: null } : {}),
      ...(estado === 'revisada' ? { revisadaEn: { not: null } } : {}),
      // Solo sesiones sin crisis alto/crítico
      huboEventoCrisis: false,
    },
    select: {
      id: true,
      titulo: true,
      createdAt: true,
      cerradaEn: true,
      muestreadaEn: true,
      revisadaEn: true,
      revisadaPorId: true,
      usuario: { select: { id: true, nombre: true } },
      _count: { select: { mensajes: true } },
    },
    orderBy: { muestreadaEn: 'desc' },
    take: 50,
  });

  const pendientes = await db.sesionChat.count({
    where: { muestreadaEn: { not: null }, revisadaEn: null, huboEventoCrisis: false },
  });

  return Response.json({ sesiones, pendientes });
}

/** POST — Ejecuta una ronda de muestreo (10% de sesiones del último período) */
export async function POST(req: NextRequest) {
  const session = await verificarAdmin(req);
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 403 });

  const desde = new Date(Date.now() - DIAS_PERIODO * 24 * 60 * 60 * 1000);

  // Sesiones candidatas: sin crisis, cerradas, no muestreadas recientemente
  const candidatas = await db.sesionChat.findMany({
    where: {
      createdAt: { gte: desde },
      cerradaEn: { not: null },
      huboEventoCrisis: false,
      muestreadaEn: null, // No muestreadas antes
    },
    select: { id: true },
  });

  if (candidatas.length === 0) {
    return Response.json({ ok: true, muestreadas: 0, mensaje: 'No hay sesiones candidatas en el período.' });
  }

  // Calcular tamaño de muestra (mínimo 1, máximo 20)
  const tamanoMuestra = Math.max(1, Math.min(20, Math.ceil(candidatas.length * PORCENTAJE_MUESTRA)));

  // Selección aleatoria
  const seleccionadas = candidatas
    .sort(() => Math.random() - 0.5)
    .slice(0, tamanoMuestra)
    .map(s => s.id);

  const ahora = new Date();
  await db.sesionChat.updateMany({
    where: { id: { in: seleccionadas } },
    data: { muestreadaEn: ahora },
  });

  await registrarAuditLog({
    usuarioId: session.user.id,
    accion: 'REVISION_MUESTRAL_INICIADA',
    recurso: 'SesionChat',
    metadatos: {
      candidatas: candidatas.length,
      muestreadas: seleccionadas.length,
      porcentaje: `${(PORCENTAJE_MUESTRA * 100).toFixed(0)}%`,
      periodoDias: DIAS_PERIODO,
    },
  });

  return Response.json({
    ok: true,
    muestreadas: seleccionadas.length,
    candidatas: candidatas.length,
    mensaje: `${seleccionadas.length} sesiones seleccionadas para revisión clínica.`,
  });
}

const PatchSchema = z.object({
  sesionId:      z.string().min(1),
  hallazgos:     z.string().max(2000).optional(),
  derivar:       z.boolean().optional().default(false), // ¿Requiere acción sobre el usuario?
  driftDetectado: z.boolean().optional().default(false), // ¿Respuesta inadecuada del modelo?
});

/** PATCH — Supervisor clínico marca una sesión como revisada */
export async function PATCH(req: NextRequest) {
  const session = await verificarAdmin(req);
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: 'Cuerpo inválido' }, { status: 400 });

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { sesionId, hallazgos, driftDetectado } = parsed.data;
  const ahora = new Date();

  await db.sesionChat.update({
    where: { id: sesionId },
    data: {
      revisadaEn: ahora,
      revisadaPorId: session.user.id,
    },
  });

  await registrarAuditLog({
    usuarioId: session.user.id,
    accion: driftDetectado ? 'REVISION_MUESTRAL_DRIFT_DETECTADO' : 'REVISION_MUESTRAL_COMPLETADA',
    recurso: 'SesionChat',
    recursoId: sesionId,
    metadatos: { hallazgos: hallazgos ?? null, driftDetectado, revisadaEn: ahora.toISOString() },
  });

  return Response.json({ ok: true, mensaje: 'Revisión registrada.' });
}
