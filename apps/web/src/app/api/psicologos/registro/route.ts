import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { enviarEmail } from '@/lib/email/confirmaciones';
import { rateLimits } from '@/lib/rate-limit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const schema = z.object({
  nombre: z.string().min(2).max(50),
  apellido: z.string().min(2).max(50),
  email: z.string().email().max(255),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, 'Debe tener mayúscula')
    .regex(/[a-z]/, 'Debe tener minúscula')
    .regex(/[0-9]/, 'Debe tener número')
    .regex(/[^A-Za-z0-9]/, 'Debe tener carácter especial'),
  tarjetaProfesionalId: z.string().min(3).max(50),
  especialidades: z.array(z.string().min(1)).min(1, 'Agrega al menos una especialidad'),
  enfoqueTerapeutico: z.array(z.string().min(1)).min(1, 'Agrega al menos un enfoque'),
  formacion: z.string().min(10).max(500),
  bio: z.string().min(20).max(1000),
  anosExperiencia: z.number().int().min(0).max(60),
  tarifaCOP: z.number().int().min(10000).max(1000000),
  ciudades: z.array(z.string().min(1)).min(1, 'Agrega al menos una ciudad'),
  modalidad: z.array(z.enum(['VIDEOLLAMADA', 'TELEFONICA', 'PRESENCIAL'])).min(1),
  aceptaPoliticaPrivacidad: z.literal(true, { errorMap: () => ({ message: 'Requerido' }) }),
});

export async function POST(req: NextRequest) {
  const ip = req.ip ?? req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  const { allowed } = await rateLimits.registro(ip);
  if (!allowed) {
    return Response.json(
      { error: 'Demasiados intentos. Intenta más tarde.' },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: 'Cuerpo inválido' }, { status: 400 });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const {
    nombre, apellido, email, password,
    tarjetaProfesionalId, especialidades, enfoqueTerapeutico,
    formacion, bio, anosExperiencia, tarifaCOP, ciudades, modalidad,
  } = parsed.data;

  try {
    const emailExiste = await db.usuario.findUnique({ where: { email }, select: { id: true } });
    if (emailExiste) {
      return Response.json({ error: 'Este correo ya está registrado' }, { status: 409 });
    }

    const tarjetaExiste = await db.psicologo.findUnique({
      where: { tarjetaProfesionalId },
      select: { id: true },
    });
    if (tarjetaExiste) {
      return Response.json(
        { error: 'Este número de tarjeta COLPSIC ya está registrado' },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const ahora = new Date();

    const usuario = await db.usuario.create({
      data: {
        nombre,
        apellido,
        email,
        hashedPassword,
        rol: 'PSICOLOGO',
        estado: 'PENDIENTE_VERIFICACION',
        planActual: 'GRATIS',
        consentimientoDatos: true,
        fechaConsentimiento: ahora,
        consentimientoIA: false,
      },
      select: { id: true, email: true },
    });

    await db.psicologo.create({
      data: {
        usuarioId: usuario.id,
        nombreCompleto: `${nombre} ${apellido}`.trim(),
        tarjetaProfesionalId,
        especialidades,
        enfoqueTerapeutico,
        formacion,
        bio,
        anosExperiencia,
        tarifaCOP,
        ciudades,
        modalidad,
        disponibilidad: {},
        estado: 'PENDIENTE_VERIFICACION',
        activo: false,
      },
    });

    // Notificar al psicólogo
    enviarEmail({
      to: email,
      subject: 'MindBridge — Solicitud recibida, en revisión',
      text: `Hola ${nombre}, recibimos tu solicitud para unirte a MindBridge como psicólogo. Revisaremos tu información y tarjeta COLPSIC (${tarjetaProfesionalId}) en los próximos 2-3 días hábiles. Te notificaremos por email cuando tu perfil esté aprobado. — Equipo MindBridge`,
      html: `<p>Hola <strong>${nombre}</strong>,</p><p>Recibimos tu solicitud para unirte a MindBridge como psicólogo.</p><p>Revisaremos tu información y tarjeta COLPSIC <strong>${tarjetaProfesionalId}</strong> en los próximos <strong>2–3 días hábiles</strong>. Te notificaremos por email cuando tu perfil esté aprobado.</p><p>— Equipo MindBridge</p>`,
    }).catch(console.error);

    // Notificar al equipo admin
    const adminEmail = process.env.SENDGRID_FROM_EMAIL;
    if (adminEmail) {
      enviarEmail({
        to: adminEmail,
        subject: `MindBridge — Nuevo psicólogo pendiente: ${nombre} ${apellido}`,
        text: `Nuevo psicólogo solicita verificación.\nNombre: ${nombre} ${apellido}\nEmail: ${email}\nCOLPSIC: ${tarjetaProfesionalId}\nEspecialidades: ${especialidades.join(', ')}\n\nRevisa en: /dashboard/admin/verificacion`,
        html: `<p><strong>Nuevo psicólogo solicita verificación</strong></p><ul><li>Nombre: ${nombre} ${apellido}</li><li>Email: ${email}</li><li>COLPSIC: <code>${tarjetaProfesionalId}</code></li><li>Especialidades: ${especialidades.join(', ')}</li></ul><p><a href="/dashboard/admin/verificacion">Ver en panel admin →</a></p>`,
      }).catch(console.error);
    }

    return Response.json(
      { message: 'Solicitud enviada. Revisaremos tu información y te contactaremos en 2–3 días hábiles.' },
      { status: 201 },
    );
  } catch (err) {
    console.error('[REGISTRO_PSICOLOGO]', err);
    return Response.json({ error: 'Error interno. Intenta nuevamente.' }, { status: 500 });
  }
}
