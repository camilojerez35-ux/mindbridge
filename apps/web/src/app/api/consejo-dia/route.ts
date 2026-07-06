import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { generarConsejoConIA, type ContextoUsuario } from '@/lib/consejos/generador';
import { getAuthUser } from '@/lib/auth/get-auth-user';

async function construirContexto(usuarioId: string, nombre: string): Promise<ContextoUsuario> {
  const hace7Dias = new Date(Date.now() - 7 * 86_400_000);

  const [registrosAnimo, entradasDiario, resultadosTests, mensajesChat] = await Promise.all([
    db.registroAnimo.findMany({
      where: { usuarioId, fecha: { gte: hace7Dias } },
      select: { valor: true },
    }).catch(() => []),

    db.entradaDiario.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { sentimientos: true, influidoPor: true, emociones: true, etiquetas: true, createdAt: true },
    }).catch(() => []),

    db.resultadoTest.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      select: { testId: true, resultadoTitulo: true },
    }).catch(() => []),

    db.mensajeChat.findMany({
      where: { usuarioId, rol: 'user' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { contenido: true },
    }).catch(() => []),
  ]);

  const animoPromedio7Dias = registrosAnimo.length
    ? parseFloat(
        ((registrosAnimo as { valor: number }[]).reduce((a, r) => a + r.valor, 0) / registrosAnimo.length).toFixed(1)
      )
    : null;

  const perfilPersonalidad: Record<string, string> = {};
  const vistos = new Set<string>();
  for (const r of resultadosTests) {
    if (!vistos.has(r.testId)) {
      perfilPersonalidad[r.testId] = r.resultadoTitulo;
      vistos.add(r.testId);
    }
  }

  const entradasRecientes = entradasDiario.map(e => ({
    sentimientos: [
      ...((e.sentimientos as string[]) ?? []),
      ...((e.emociones as string[]) ?? []),
    ],
    influidoPor: [
      ...((e.influidoPor as string[]) ?? []),
      ...((e.etiquetas as string[]) ?? []),
    ],
    fecha: new Date(e.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
  }));

  const stopwords = new Set(['que', 'me', 'de', 'el', 'la', 'en', 'y', 'a', 'los', 'las', 'un', 'una', 'no', 'se', 'mi', 'por', 'con', 'más', 'es']);
  const frecuencia: Record<string, number> = {};
  for (const m of mensajesChat) {
    const palabras = m.contenido.toLowerCase().match(/[a-záéíóúñü]{4,}/g) ?? [];
    for (const p of palabras) {
      if (!stopwords.has(p)) frecuencia[p] = (frecuencia[p] ?? 0) + 1;
    }
  }
  const temasChatRecientes = Object.entries(frecuencia)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([palabra]) => palabra);

  return { nombre, perfilPersonalidad, entradasRecientes, animoPromedio7Dias, temasChatRecientes };
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    let nombre = 'amigo/a';
    let contexto: ContextoUsuario;

    if (user?.id) {
      const usuario = await db.usuario.findUnique({
        where: { id: user.id },
        select: { nombre: true, apellido: true },
      }).catch(() => null);

      nombre = usuario?.nombre ?? user.nombre?.split(' ')[0] ?? 'amigo/a';
      contexto = await construirContexto(user.id, nombre);
    } else {
      contexto = { nombre, perfilPersonalidad: {}, entradasRecientes: [], animoPromedio7Dias: null, temasChatRecientes: [] };
    }

    const consejo = await generarConsejoConIA(contexto);

    let id: string | undefined;
    if (user?.id) {
      const guardado = await db.consejoDiario.create({
        data: {
          usuarioId: user.id,
          categoria: consejo.categoria,
          icono: consejo.icono,
          titulo: consejo.titulo,
          contenido: consejo.contenido,
        },
      }).catch(() => null);
      id = guardado?.id;
    }

    return NextResponse.json({
      id,
      titulo: consejo.titulo,
      contenido: consejo.contenido,
      texto: consejo.contenido,
      categoria: consejo.categoria,
      icono: consejo.icono,
    });
  } catch {
    return NextResponse.json({ error: 'No se pudo generar el consejo' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { consejoId, calificacion } = await req.json();
  if (!consejoId || typeof calificacion !== 'number' || calificacion < 1 || calificacion > 5) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const result = await db.consejoDiario.updateMany({
    where: { id: consejoId, usuarioId: user.id },
    data: { calificacion },
  });

  return NextResponse.json({ ok: true, updated: result.count });
}
