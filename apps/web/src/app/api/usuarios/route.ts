import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const usuario = await db.usuario.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      email: true,
      telefono: true,
      ciudadColombia: true,
      imagen: true,
      planActual: true,
      rol: true,
      suscripcionVence: true,
      createdAt: true,
      consentimientoDatos: true,
      consentimientoMarketing: true,
    },
  });

  if (!usuario) return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });

  return Response.json({ usuario });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: 'Cuerpo inválido' }, { status: 400 });

  const { nombre, apellido, telefono, ciudadColombia } = body;

  const usuario = await db.usuario.update({
    where: { id: session.user.id },
    data: {
      ...(nombre        !== undefined && { nombre }),
      ...(apellido      !== undefined && { apellido }),
      ...(telefono      !== undefined && { telefono }),
      ...(ciudadColombia !== undefined && { ciudadColombia }),
    },
    select: { id: true, nombre: true, apellido: true, email: true, telefono: true, ciudadColombia: true },
  });

  return Response.json({ usuario });
}
