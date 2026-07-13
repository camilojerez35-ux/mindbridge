import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { enviarVerificacionEmail } from '@/lib/email/confirmaciones';
import { generarTokenVerificacion } from '@/lib/email/tokens';
import { env } from '@/lib/env';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { rateLimits } from '@/lib/rate-limit';

const EDAD_MINIMA = 18;

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
  fechaNacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (AAAA-MM-DD)'),
  aceptaPoliticaPrivacidad: z.literal(true, { errorMap: () => ({ message: 'Requerido' }) }),
  aceptaUsoIA: z.literal(true, { errorMap: () => ({ message: 'Requerido' }) }),
  aceptaMarketing: z.boolean().optional().default(false),
});

function calcularEdad(fechaNacimiento: Date): number {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const cumpleaniosEsteAnio = new Date(hoy.getFullYear(), fechaNacimiento.getMonth(), fechaNacimiento.getDate());
  if (hoy < cumpleaniosEsteAnio) edad--;
  return edad;
}

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

  const { nombre, apellido, email, password, fechaNacimiento: fnStr, aceptaMarketing } = parsed.data;

  // Verificación de edad mínima (Ley 1581/2012 — datos de menores requieren autorización parental)
  const fechaNacimiento = new Date(fnStr);
  if (isNaN(fechaNacimiento.getTime())) {
    return Response.json({ error: 'Fecha de nacimiento inválida' }, { status: 400 });
  }
  const edad = calcularEdad(fechaNacimiento);
  if (edad < EDAD_MINIMA) {
    return Response.json(
      {
        error: `MindBridge está disponible solo para personas mayores de ${EDAD_MINIMA} años. Si necesitas apoyo emocional, llama a la Línea 106 (gratuita, 24/7).`,
        codigo: 'MENOR_DE_EDAD',
      },
      { status: 400 },
    );
  }

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
        fechaNacimiento,
        estado: 'PENDIENTE_VERIFICACION',
        planActual: 'GRATIS',
        consentimientoDatos: true,
        fechaConsentimiento: ahora,
        consentimientoIA: true,
        fechaConsentimientoIA: ahora,
        consentimientoMarketing: aceptaMarketing,
      },
    });

    const { token, ts } = generarTokenVerificacion(email);
    const params = new URLSearchParams({ email, token, ts: String(ts) });
    const urlVerificacion = `${env.APP_URL}/api/auth/verificar-email?${params}`;

    await enviarVerificacionEmail({
      email,
      nombre,
      token,
      url: urlVerificacion,
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
