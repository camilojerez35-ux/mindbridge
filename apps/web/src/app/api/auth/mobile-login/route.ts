import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { mensaje: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const usuario = await db.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        hashedPassword: true,
        planActual: true,
        rol: true,
        estado: true,
        emailVerificado: true,
      },
    });

    if (!usuario || !usuario.hashedPassword) {
      return NextResponse.json({ mensaje: 'Credenciales inválidas' }, { status: 401 });
    }

    if (usuario.estado === 'SUSPENDIDO' || usuario.estado === 'ELIMINADO') {
      return NextResponse.json({ mensaje: 'Cuenta suspendida o eliminada' }, { status: 401 });
    }

    if (!usuario.emailVerificado) {
      return NextResponse.json({ mensaje: 'Verifica tu correo antes de iniciar sesión' }, { status: 401 });
    }

    const passwordValida = await bcrypt.compare(password, usuario.hashedPassword);
    if (!passwordValida) {
      return NextResponse.json({ mensaje: 'Credenciales inválidas' }, { status: 401 });
    }

    const nombre = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ') || usuario.email;

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nombre,
        plan: usuario.planActual,
        rol: usuario.rol,
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '30d' }
    );

    // Actualizar último acceso
    await db.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAcceso: new Date() },
    }).catch(() => null);

    return NextResponse.json({
      token,
      usuario: {
        id: usuario.id,
        nombre,
        email: usuario.email,
        plan: usuario.planActual,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error('[POST /api/auth/mobile-login]', error);
    return NextResponse.json({ mensaje: 'Error interno del servidor' }, { status: 500 });
  }
}
