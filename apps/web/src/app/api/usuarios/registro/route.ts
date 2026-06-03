import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { enviarEmail } from '@/lib/email/confirmaciones';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { rateLimits } from '@/lib/rate-limit';

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
  aceptaPoliticaPrivacidad: z.literal(true, { errorMap: () => ({ message: 'Requerido' }) }),
  aceptaUsoIA: z.literal(true, { errorMap: () => ({ message: 'Requerido' }) }),
  aceptaMarketing: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  const ip = req.ip ?? req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  const { allowed } = await rateLimits.registro(ip);
  if (!allowed) {
    return Response.json(
      { error: 'Demasiados intentos de registro desde esta IP. Intenta más tarde.' },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: 'Cuerpo inválido' }, { status: 400 });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { nombre, apellido, email, password, aceptaMarketing } = parsed.data;

  try {
    const existente = await db.usuario.findUnique({ where: { email }, select: { id: true } });
    if (existente) {
      return Response.json({ error: 'Este correo ya está registrado' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const ahora = new Date();

    await db.usuario.create({
      data: {
        nombre,
        apellido,
        email,
        hashedPassword,
        estado: 'PENDIENTE_VERIFICACION',
        planActual: 'GRATIS',
        consentimientoDatos: true,
        fechaConsentimiento: ahora,
        consentimientoIA: true,
        fechaConsentimientoIA: ahora,
        consentimientoMarketing: aceptaMarketing,
      },
    });

    await enviarEmail({
      to: email,
      subject: 'Bienvenido a MindBridge — verifica tu cuenta',
      text: `Hola ${nombre}, gracias por registrarte en MindBridge. En breve recibirás el enlace de verificación.`,
      html: `<p>Hola <strong>${nombre}</strong>, gracias por registrarte en MindBridge Colombia.<br>Pronto recibirás el enlace para verificar tu cuenta.</p>`,
    });

    return Response.json(
      { message: 'Registro exitoso. Revisa tu correo para verificar tu cuenta.' },
      { status: 201 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[REGISTRO]', msg);
    return Response.json(
      { error: 'Error interno. Intenta nuevamente.' },
      { status: 500 }
    );
  }
}
