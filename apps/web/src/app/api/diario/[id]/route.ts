/**
 * GET    /api/diario/[id]  → entrada individual con contenido descifrado
 * PATCH  /api/diario/[id]  → actualizar favorito o etiquetas
 * DELETE /api/diario/[id]  → eliminar entrada (derecho al olvido — Ley 1581/2012)
 */
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { encryption } from '@/lib/encryption';
import { getAuthUser } from '@/lib/auth/get-auth-user';

type Params = { params: { id: string } };

// ── GET ───────────────────────────────────────────────────────

export async function GET(req: NextRequest, { params }: Params) {
  const user = await getAuthUser(req);
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const entrada = await db.entradaDiario.findFirst({
    where: { id: params.id, usuarioId: user.id },
  });

  if (!entrada) return Response.json({ error: 'Entrada no encontrada' }, { status: 404 });

  let contenido: string | null = null;
  try {
    contenido = entrada.contenido ? encryption.decrypt(entrada.contenido) : null;
  } catch {
    return Response.json({ error: 'Error al descifrar la entrada' }, { status: 500 });
  }

  return Response.json({ entrada: { ...entrada, contenido } });
}

// ── PATCH ─────────────────────────────────────────────────────

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getAuthUser(req);
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const existente = await db.entradaDiario.findFirst({
    where: { id: params.id, usuarioId: user.id },
    select: { id: true },
  });
  if (!existente) return Response.json({ error: 'Entrada no encontrada' }, { status: 404 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return Response.json({ error: 'Body inválido' }, { status: 400 }); }

  const { esFavorito, etiquetas } = body as { esFavorito?: boolean; etiquetas?: string[] };

  const actualizada = await db.entradaDiario.update({
    where: { id: params.id },
    data: {
      ...(esFavorito !== undefined ? { esFavorito } : {}),
      ...(etiquetas  !== undefined ? { etiquetas  } : {}),
    },
    select: { id: true, esFavorito: true, etiquetas: true, updatedAt: true },
  });

  return Response.json({ exito: true, entrada: actualizada });
}

// ── DELETE ────────────────────────────────────────────────────

export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await getAuthUser(req);
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const existente = await db.entradaDiario.findFirst({
    where: { id: params.id, usuarioId: user.id },
    select: { id: true },
  });
  if (!existente) return Response.json({ error: 'Entrada no encontrada' }, { status: 404 });

  await db.entradaDiario.delete({ where: { id: params.id } });

  return Response.json({ exito: true });
}
