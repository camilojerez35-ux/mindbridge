import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import SalaVideollamada from '../../videollamada/SalaVideollamada';

interface Props {
  params: { citaId: string };
}

export default async function VideollamadaPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;
  const cita = await db.cita.findUnique({
    where: { id: params.citaId },
    select: {
      id: true,
      estado: true,
      usuarioId: true,
      psicologo: { select: { usuarioId: true, nombreCompleto: true } },
      usuario: { select: { nombre: true, apellido: true } },
    },
  });

  if (!cita) redirect('/dashboard/citas');

  const esPaciente   = cita.usuarioId === userId;
  const esPsicologo  = cita.psicologo.usuarioId === userId;
  if (!esPaciente && !esPsicologo) redirect('/dashboard/citas');

  if (!['CONFIRMADA', 'EN_CURSO'].includes(cita.estado)) {
    redirect('/dashboard/citas?error=cita-no-confirmada');
  }

  const nombreUsuario = esPaciente
    ? [cita.usuario.nombre, cita.usuario.apellido].filter(Boolean).join(' ') || 'Paciente'
    : cita.psicologo.nombreCompleto;

  return (
    <SalaVideollamada
      citaId={params.citaId}
      nombreUsuario={nombreUsuario}
      esIniciador={esPaciente}
    />
  );
}
