/**
 * POST /api/admin/psicologos
 * Crea un usuario con rol PSICOLOGO y su perfil de psicólogo asociado.
 * Solo accesible para ADMIN / SUPERADMIN.
 *
 * GET /api/admin/psicologos
 * Lista todos los psicólogos con sus datos de usuario.
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const CrearPsicologoSchema = z.object({
  email:                z.string().email('Email inválido'),
  password:             z.string().min(8, 'Mínimo 8 caracteres'),
  nombreCompleto:       z.string().min(2),
  tarjetaProfesionalId: z.string().min(3, 'Número COLPSIC requerido'),
  especialidades:       z.array(z.string()).default([]),
  enfoqueTerapeutico:   z.array(z.string()).default([]),
  formacion:            z.string().default(''),
  anosExperiencia:      z.number().int().min(0).default(0),
  tarifaCOP:            z.number().int().min(0).default(0),
  ciudades:             z.array(z.string()).default([]),
  modalidad:            z.array(z.string()).default(['VIDEOLLAMADA']),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.rol !== 'ADMIN' && session.user.rol !== 'SUPERADMIN') {
    return Response.json({ error: 'Solo administradores pueden crear psicólogos' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = CrearPsicologoSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Datos inválidos', detalles: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, nombreCompleto, tarjetaProfesionalId, ...perfilData } = parsed.data;

  const existe = await db.usuario.findUnique({ where: { email }, select: { id: true } });
  if (existe) return Response.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 });

  const tarjetaExiste = await db.psicologo.findUnique({ where: { tarjetaProfesionalId }, select: { id: true } });
  if (tarjetaExiste) return Response.json({ error: 'El número COLPSIC ya está registrado' }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);

  const [nombre, ...resto] = nombreCompleto.trim().split(' ');
  const apellido = resto.join(' ') || '';

  const usuario = await db.usuario.create({
    data: {
      email,
      hashedPassword: passwordHash,
      nombre,
      apellido,
      rol: 'PSICOLOGO',
      estado: 'ACTIVO',
      emailVerificado: new Date(),
      consentimientoDatos: true,
    },
  });

  const psicologo = await db.psicologo.create({
    data: {
      usuarioId:            usuario.id,
      nombreCompleto,
      tarjetaProfesionalId,
      estado:               'PENDIENTE_VERIFICACION',
      activo:               false,
      disponibilidad:       {},
      tarifaCOP:            perfilData.tarifaCOP ?? 0,
      especialidades:       perfilData.especialidades ?? [],
      enfoqueTerapeutico:   perfilData.enfoqueTerapeutico ?? [],
      formacion:            perfilData.formacion ?? '',
      bio:                  '',
      anosExperiencia:      perfilData.anosExperiencia ?? 0,
      ciudades:             perfilData.ciudades ?? [],
      modalidad:            perfilData.modalidad ?? ['VIDEOLLAMADA'],
    },
  });

  return Response.json({
    ok: true,
    usuario: { id: usuario.id, email: usuario.email },
    psicologo: { id: psicologo.id, estado: psicologo.estado },
    mensaje: `Psicólogo ${nombreCompleto} creado. Pendiente verificación COLPSIC.`,
  }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.rol !== 'ADMIN' && session.user.rol !== 'SUPERADMIN') {
    return Response.json({ error: 'Solo administradores' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const estado = searchParams.get('estado');

  const psicologos = await db.psicologo.findMany({
    where: estado ? { estado: estado as any } : undefined,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      nombreCompleto: true,
      tarjetaProfesionalId: true,
      tarjetaVerificada: true,
      estado: true,
      activo: true,
      especialidades: true,
      ciudades: true,
      tarifaCOP: true,
      anosExperiencia: true,
      createdAt: true,
      usuarioId: true,
    },
  });

  const usuarioIds = psicologos.map(p => p.usuarioId);
  const usuarios = await db.usuario.findMany({
    where: { id: { in: usuarioIds } },
    select: { id: true, email: true },
  });
  const usuarioMap = Object.fromEntries(usuarios.map(u => [u.id, u]));

  return Response.json({
    psicologos: psicologos.map(p => ({ ...p, email: usuarioMap[p.usuarioId]?.email ?? '' })),
  });
}
