import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db/client';

const RegistroSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  nombre: z.string().min(1, 'El nombre es requerido').max(100),
  apellido: z.string().max(100).optional(),
  consentimientoDatos: z.literal(true, {
    message: 'Debes aceptar la política de privacidad',
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resultado = RegistroSchema.safeParse(body);

    if (!resultado.success) {
      return Response.json(
        { error: resultado.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, nombre, apellido, consentimientoDatos } = resultado.data;

    const existe = await db.usuario.findUnique({ where: { email } });
    if (existe) {
      return Response.json(
        { error: 'Ya existe una cuenta con este email' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const usuario = await db.usuario.create({
      data: {
        email,
        nombre,
        apellido: apellido ?? null,
        hashedPassword,
        consentimientoDatos,
        fechaConsentimiento: new Date(),
      },
      select: { id: true, email: true, nombre: true },
    });

    return Response.json(
      { exito: true, usuario },
      { status: 201 }
    );

  } catch (error) {
    console.error('[REGISTRO ERROR]', error);
    return Response.json({ error: 'Error al crear la cuenta' }, { status: 500 });
  }
}
