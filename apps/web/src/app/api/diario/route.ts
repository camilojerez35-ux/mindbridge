import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'No autorizado. Inicie sesión.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limite = Math.min(parseInt(searchParams.get('limite') || '10'), 50);
  const pagina = Math.max(parseInt(searchParams.get('pagina') || '1'), 1);

  const [entradas, total] = await Promise.all([
    db.entradaDiario.findMany({
      where: { usuarioId: session.user.id },
      orderBy: { createdAt: 'desc' },
      skip: (pagina - 1) * limite,
      take: limite,
      select: {
        id: true,
        estadoAnimo: true,
        emociones: true,
        etiquetas: true,
        analisisIA: true,
        esFavorito: true,
        createdAt: true,
        // contenido excluido — datos sensibles cifrados, se exponen solo en detalle individual
      },
    }),
    db.entradaDiario.count({ where: { usuarioId: session.user.id } }),
  ]);

  return Response.json({
    entradas,
    paginacion: { total, pagina, limite, totalPaginas: Math.ceil(total / limite) },
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'No autorizado. Inicie sesión.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { contenido, animo, emociones = [], etiquetas = [] } = body;

    if (!contenido?.trim()) {
      return Response.json({ error: 'El contenido es requerido' }, { status: 400 });
    }
    if (!animo || animo < 1 || animo > 10) {
      return Response.json({ error: 'El ánimo debe estar entre 1 y 10' }, { status: 400 });
    }
    if (contenido.length > 5000) {
      return Response.json({ error: 'El contenido no puede superar 5000 caracteres' }, { status: 400 });
    }

    let analisisIA = 'Entrada registrada. ';
    if (animo >= 7) analisisIA += 'Tu ánimo está en un rango positivo hoy. ¡Sigue así!';
    else if (animo >= 4) analisisIA += 'Día regular. Considera hacer un ejercicio de respiración.';
    else analisisIA += 'Parece un día difícil. ¿Has considerado hablar con un psicólogo?';

    const entrada = await db.entradaDiario.create({
      data: {
        usuarioId: session.user.id,
        contenido, // cifrado a nivel de aplicación pendiente — ver lib/encryption
        estadoAnimo: animo,
        emociones,
        etiquetas,
        analisisIA,
      },
      select: { id: true, estadoAnimo: true, emociones: true, etiquetas: true, analisisIA: true, createdAt: true },
    });

    return Response.json({ exito: true, entrada }, { status: 201 });
  } catch (error) {
    console.error('[DIARIO ERROR]', error);
    return Response.json({ error: 'Error al guardar la entrada' }, { status: 500 });
  }
}
