import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

export async function GET(
  _req: NextRequest,
  { params }: { params: { usuarioId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.rol !== 'PSICOLOGO') return Response.json({ error: 'Solo psicólogos' }, { status: 403 });

  const psicologo = await db.psicologo.findUnique({
    where: { usuarioId: session.user.id },
    select: { id: true },
  });
  if (!psicologo) return Response.json({ error: 'Perfil no encontrado' }, { status: 404 });

  // Verificar que tiene al menos una cita con este paciente
  const citaVerif = await db.cita.findFirst({
    where: { psicologoId: psicologo.id, usuarioId: params.usuarioId },
  });
  if (!citaVerif) return Response.json({ error: 'Sin acceso a este paciente' }, { status: 403 });

  const [citas, incidentes, resultadosTest, tareas, usuario] = await Promise.all([
    db.cita.findMany({
      where: { psicologoId: psicologo.id, usuarioId: params.usuarioId },
      select: {
        id: true, fechaHora: true, duracionMinutos: true, estado: true, tipo: true,
        modalidad: true, notasClinicas: true, notasPrevias: true,
        resena: { select: { calificacion: true, comentario: true } },
      },
      orderBy: { fechaHora: 'desc' },
    }),
    db.incidenteCrisis.findMany({
      where: { usuarioId: params.usuarioId },
      select: {
        id: true, nivel: true, indicadoresDetectados: true,
        protocoloActivado: true, resolucion: true,
        timestampDeteccion: true, timestampResolucion: true,
      },
      orderBy: { timestampDeteccion: 'desc' },
      take: 10,
    }),
    db.resultadoTest.findMany({
      where: { usuarioId: params.usuarioId },
      select: { testId: true, puntajeTotal: true, resultadoTitulo: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    db.tareaSesion.findMany({
      where: { psicologoId: psicologo.id, usuarioId: params.usuarioId },
      select: { titulo: true, tipo: true, estado: true, createdAt: true, completadaEn: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.usuario.findUnique({
      where: { id: params.usuarioId },
      select: {
        nombre: true, apellido: true, email: true,
        fechaNacimiento: true, ciudadColombia: true,
        motivoConsulta: true, planActual: true, createdAt: true,
      },
    }),
  ]);

  return Response.json({
    paciente: usuario,
    citas,
    incidentes,
    resultadosTest,
    tareas,
  });
}
