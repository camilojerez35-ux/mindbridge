/**
 * GET /api/psicologos/[psicologoId]
 * Perfil público de un psicólogo + slots disponibles para los próximos 14 días hábiles.
 */
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { getAuthUser } from '@/lib/auth/get-auth-user';
import { capturarErrorApi } from '@/lib/monitoring/sentry';

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

function getFechasHabiles(dias = 14): Date[] {
  const fechas: Date[] = [];
  const hoy = new Date();
  let offset = 1;
  while (fechas.length < dias) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + offset);
    d.setHours(0, 0, 0, 0);
    if (d.getDay() !== 0 && d.getDay() !== 6) fechas.push(d);
    offset++;
  }
  return fechas;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { psicologoId: string } }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const psicologo = await db.psicologo.findUnique({
      where: { id: params.psicologoId, activo: true },
      select: {
        id: true,
        nombreCompleto: true,
        especialidades: true,
        anosExperiencia: true,
        tarifaCOP: true,
        calificacionPromedio: true,
        totalCitas: true,
        fotoUrl: true,
        bio: true,
        idiomas: true,
        modalidad: true,
        ciudades: true,
        enfoqueTerapeutico: true,
        disponibilidad: true,
      },
    });

    if (!psicologo) return Response.json({ error: 'Psicólogo no encontrado' }, { status: 404 });

    // Construir slots disponibles
    const disponibilidad = (psicologo.disponibilidad ?? {}) as Record<string, string[]>;
    const fechasHabiles = getFechasHabiles(14);

    // Citas ya agendadas en ese rango
    const desde = fechasHabiles[0];
    const hasta = new Date(fechasHabiles[fechasHabiles.length - 1]);
    hasta.setHours(23, 59, 59, 999);

    const citasOcupadas = await db.cita.findMany({
      where: {
        psicologoId: params.psicologoId,
        fechaHora: { gte: desde, lte: hasta },
        estado: { in: ['PENDIENTE', 'CONFIRMADA', 'EN_CURSO'] },
      },
      select: { fechaHora: true },
    });

    const ocupadasSet = new Set(
      citasOcupadas.map(c => c.fechaHora.toISOString().slice(0, 16))
    );

    const slots = fechasHabiles.map(fecha => {
      const diaNombre = DIAS_SEMANA[fecha.getDay()];
      const horarios: string[] = disponibilidad[diaNombre] ?? [];

      const horasDisponibles = horarios.filter(hora => {
        const [h, m] = hora.split(':').map(Number);
        const dt = new Date(fecha);
        dt.setHours(h, m, 0, 0);
        return !ocupadasSet.has(dt.toISOString().slice(0, 16));
      });

      return {
        fecha: fecha.toISOString().split('T')[0],
        diaNombre,
        horas: horasDisponibles,
      };
    }).filter(s => s.horas.length > 0);

    return Response.json({
      psicologo: { ...psicologo, disponibilidad: undefined },
      slots,
    });
  } catch (err) {
    capturarErrorApi(err, { ruta: '/api/psicologos/[psicologoId]', metodo: 'GET' });
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}
