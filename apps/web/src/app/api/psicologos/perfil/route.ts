/**
 * GET  /api/psicologos/perfil  → perfil propio del psicólogo autenticado
 * PATCH /api/psicologos/perfil → actualizar campos editables del perfil
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { capturarErrorApi } from '@/lib/monitoring/sentry';

const SELECT_PROPIO = {
  id:                   true,
  nombreCompleto:       true,
  tarjetaProfesionalId: true,
  tarjetaVerificada:    true,
  tarjetaVencimiento:   true,
  estado:               true,
  activo:               true,
  especialidades:       true,
  enfoqueTerapeutico:   true,
  formacion:            true,
  anosExperiencia:      true,
  bio:                  true,
  tarifaCOP:            true,
  disponibilidad:       true,
  ciudades:             true,
  modalidad:            true,
  idiomas:              true,
  fotoUrl:              true,
  calificacionPromedio: true,
  totalCitas:           true,
} as const;

async function sesionPsicologo(req?: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: 'No autorizado', status: 401 } as const;
  if (session.user.rol !== 'PSICOLOGO') return { error: 'Acceso solo para psicólogos', status: 403 } as const;
  return { session };
}

export async function GET() {
  try {
    const auth = await sesionPsicologo();
    if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });

    const psicologo = await db.psicologo.findUnique({
      where:  { usuarioId: auth.session.user.id },
      select: SELECT_PROPIO,
    });

    if (!psicologo) return Response.json({ error: 'Perfil de psicólogo no encontrado' }, { status: 404 });

    return Response.json({ psicologo });
  } catch (error) {
    capturarErrorApi(error, { ruta: '/api/psicologos/perfil', metodo: 'GET' });
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}

const PatchSchema = z.object({
  nombreCompleto:     z.string().min(2).max(120).optional(),
  bio:                z.string().max(1000).optional(),
  formacion:          z.string().max(500).optional(),
  especialidades:     z.array(z.string().max(60)).max(10).optional(),
  enfoqueTerapeutico: z.array(z.string().max(60)).max(10).optional(),
  anosExperiencia:    z.number().int().min(0).max(60).optional(),
  tarifaCOP:          z.number().int().min(10_000).max(2_000_000).optional(),
  ciudades:           z.array(z.string().max(60)).max(5).optional(),
  modalidad:          z.array(z.enum(['VIDEOLLAMADA', 'TELEFONICA', 'PRESENCIAL'])).optional(),
  idiomas:            z.array(z.string().max(30)).max(5).optional(),
  disponibilidad:     z.record(z.array(z.string())).optional(),
}).strict();

export async function PATCH(req: NextRequest) {
  try {
    const auth = await sesionPsicologo(req);
    if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });

    let body: unknown;
    try { body = await req.json(); }
    catch { return Response.json({ error: 'Body inválido' }, { status: 400 }); }

    const resultado = PatchSchema.safeParse(body);
    if (!resultado.success) {
      return Response.json({ error: resultado.error.errors[0].message }, { status: 400 });
    }

    if (Object.keys(resultado.data).length === 0) {
      return Response.json({ error: 'No se enviaron campos para actualizar' }, { status: 400 });
    }

    const psicologo = await db.psicologo.update({
      where:  { usuarioId: auth.session.user.id },
      data:   resultado.data,
      select: SELECT_PROPIO,
    });

    return Response.json({ exito: true, psicologo });
  } catch (error) {
    capturarErrorApi(error, { ruta: '/api/psicologos/perfil', metodo: 'PATCH' });
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}
