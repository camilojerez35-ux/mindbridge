/**
 * GET /api/citas/[citaId]/sala
 * Devuelve (o crea) la sala de videollamada Daily.co para una cita.
 * El token que devuelve es específico del rol (paciente o psicólogo).
 *
 * Solo accesible para el paciente de la cita o el psicólogo asignado.
 * La sala se crea la primera vez que alguien la solicita y los tokens
 * expiran 15 minutos después del fin de la cita para dar margen.
 */

import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth/get-auth-user';
import { db } from '@/lib/db/client';
import { crearSala } from '@/lib/videollamada/daily';
import { capturarErrorApi } from '@/lib/monitoring/sentry';

export async function GET(
  req: NextRequest,
  { params }: { params: { citaId: string } },
) {
  const user = await getAuthUser(req);
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const cita = await db.cita.findUnique({
    where: { id: params.citaId },
    include: {
      psicologo: { select: { usuarioId: true, nombreCompleto: true } },
    },
  });

  if (!cita) return Response.json({ error: 'Cita no encontrada' }, { status: 404 });

  // Verificar que el usuario es el paciente o el psicólogo
  const esPaciente   = cita.usuarioId === user.id;
  const esPsicologo  = cita.psicologo.usuarioId === user.id;

  if (!esPaciente && !esPsicologo) {
    return Response.json({ error: 'No tienes acceso a esta cita' }, { status: 403 });
  }

  // Solo citas confirmadas o en curso pueden acceder
  if (!['CONFIRMADA', 'EN_CURSO'].includes(cita.estado)) {
    return Response.json(
      { error: `La cita está en estado ${cita.estado} y no puede iniciarse` },
      { status: 400 },
    );
  }

  // Verificar pago
  if (cita.estadoPago !== 'APROBADO') {
    return Response.json({ error: 'La cita no ha sido pagada' }, { status: 402 });
  }

  // Verificar que no hayan pasado más de (duración + 30 min) desde que empezó
  const finCita = new Date(cita.fechaHora.getTime() + (cita.duracionMinutos + 30) * 60_000);
  if (new Date() > finCita) {
    return Response.json({ error: 'La cita ya finalizó' }, { status: 410 });
  }

  try {
    let salaUrl: string;
    let token: string;
    const expiraEn = new Date(cita.fechaHora.getTime() + (cita.duracionMinutos + 15) * 60_000);

    if (!cita.salaVideollamada) {
      // Crear sala por primera vez
      const nombreSala = `mb-${cita.id}`;
      const sala = await crearSala({ nombre: nombreSala, expiraEn });

      // Guardar sala y token del psicólogo en DB
      await db.cita.update({
        where: { id: cita.id },
        data: {
          salaVideollamada: nombreSala,
          tokenPsicologo: sala.tokenPsicologo,
          tokenUsuario: sala.tokenUsuario,
          estado: 'EN_CURSO',
        },
      });

      salaUrl = sala.url;
      token = esPsicologo ? sala.tokenPsicologo : sala.tokenUsuario;
    } else {
      // Sala ya existe — generar token fresco para este usuario
      const DAILY_DOMAIN = process.env.DAILY_DOMAIN ?? '';
      salaUrl = `https://${DAILY_DOMAIN}/${cita.salaVideollamada}`;

      if (esPsicologo && cita.tokenPsicologo) {
        token = cita.tokenPsicologo;
      } else if (!esPsicologo && cita.tokenUsuario) {
        token = cita.tokenUsuario;
      } else {
        // Generar token nuevo (fallback si no está en DB)
        const DAILY_API_KEY = process.env.DAILY_API_KEY ?? '';
        const expTs = Math.floor(expiraEn.getTime() / 1000);
        const res = await fetch('https://api.daily.co/v1/meeting-tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DAILY_API_KEY}`,
          },
          body: JSON.stringify({
            properties: {
              room_name: cita.salaVideollamada,
              user_name: esPsicologo ? 'psicologo' : 'paciente',
              exp: expTs,
              is_owner: esPsicologo,
            },
          }),
        });
        const data = await res.json();
        token = data.token;
      }

      // Marcar como EN_CURSO si aún era CONFIRMADA
      if (cita.estado === 'CONFIRMADA') {
        await db.cita.update({
          where: { id: cita.id },
          data: { estado: 'EN_CURSO' },
        }).catch(() => {});
      }
    }

    return Response.json({
      url: salaUrl,
      token,
      nombreSala: cita.salaVideollamada ?? `mb-${cita.id}`,
      expiraEn: expiraEn.toISOString(),
      rol: esPsicologo ? 'psicologo' : 'paciente',
    });

  } catch (error) {
    capturarErrorApi(error, { ruta: `/api/citas/${params.citaId}/sala`, metodo: 'GET' });
    return Response.json({ error: 'Error al preparar la videollamada' }, { status: 500 });
  }
}
