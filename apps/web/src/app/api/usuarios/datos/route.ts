import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db, registrarAuditLog } from '@/lib/db/client';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as typeof import('pdfkit');

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }

  await registrarAuditLog({
    usuarioId: session.user.id,
    accion: 'EXPORTAR_DATOS_PERSONALES',
    recurso: 'Usuario',
    recursoId: session.user.id,
    ipAddress: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined,
    userAgent: req.headers.get('user-agent') ?? undefined,
  });

  try {
    const usuario = await db.usuario.findUnique({
      where: { id: session.user.id },
      select: {
        id: true, email: true, nombre: true, apellido: true,
        telefono: true, ciudadColombia: true, planActual: true,
        rol: true, estado: true, createdAt: true,
        consentimientoDatos: true, fechaConsentimiento: true,
        consentimientoIA: true, fechaConsentimientoIA: true,
        sesionesChat: {
          select: {
            id: true, createdAt: true,
            mensajes: {
              select: { rol: true, contenido: true, createdAt: true },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
        entradasDiario: {
          select: { id: true, estadoAnimo: true, emociones: true, etiquetas: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 200,
        },
        consentimientos: {
          select: { tipo: true, version: true, aceptado: true, ipAddress: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!usuario) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const fecha = new Date().toISOString().split('T')[0];
    const pdfBuffer = await generarPDF(usuario, fecha);

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="mentebridge-mis-datos-${fecha}.pdf"`,
      },
    });
  } catch (error) {
    console.error('[DATOS USUARIO ERROR]', error);
    return Response.json({ error: 'Error al exportar los datos' }, { status: 500 });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const COLOR_TEAL   = '#2dd4bf';
const COLOR_DARK   = '#0d1a12';
const COLOR_GRAY   = '#5a8a6a';
const COLOR_WHITE  = '#ffffff';
const COLOR_ACCENT = '#1a6b4a';

function fmt(date: Date | string) {
  return new Date(date).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generarPDF(usuario: any, fecha: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4', compress: true });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = doc.page.width - 100;

    // ── Encabezado ─────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 80).fill(COLOR_DARK);
    doc.fillColor(COLOR_TEAL).fontSize(22).font('Helvetica-Bold')
       .text('MenteBridge Colombia', 50, 22);
    doc.fillColor(COLOR_GRAY).fontSize(10).font('Helvetica')
       .text('Exportación de datos personales — Ley 1581/2012 (Habeas Data)', 50, 50);
    doc.fillColor(COLOR_WHITE).fontSize(9)
       .text(`Generado el ${fmt(fecha)}`, 50, 62, { align: 'right', width: W });

    doc.moveDown(3);

    function seccion(titulo: string) {
      doc.moveDown(0.5);
      const y = doc.y;
      doc.rect(50, y, W, 22).fill(COLOR_ACCENT);
      doc.fillColor(COLOR_WHITE).fontSize(11).font('Helvetica-Bold')
         .text(titulo, 58, y + 5);
      doc.moveDown(0.8);
    }

    function fila(label: string, valor: string | null | undefined | boolean | Date) {
      const v = valor instanceof Date ? fmt(valor)
        : valor === null || valor === undefined ? '—'
        : String(valor);
      const y = doc.y;
      doc.fillColor(COLOR_GRAY).fontSize(9).font('Helvetica-Bold')
         .text(label + ':', 50, y, { continued: false, width: 155 });
      doc.fillColor('#cccccc').font('Helvetica').fontSize(9)
         .text(v, 210, y, { width: W - 160 });
      doc.moveDown(0.15);
    }

    function paginaNuevaSiNecesario(reserva = 80) {
      if (doc.y > doc.page.height - reserva) doc.addPage();
    }

    // ── 1. Datos personales ────────────────────────────────────────────────
    seccion('1. Datos Personales');
    fila('Nombre', `${usuario.nombre ?? ''} ${usuario.apellido ?? ''}`.trim() || '—');
    fila('Email', usuario.email);
    fila('Teléfono', usuario.telefono);
    fila('Ciudad', usuario.ciudadColombia);
    fila('Plan', usuario.planActual);
    fila('Rol', usuario.rol);
    fila('Estado', usuario.estado);
    fila('Fecha de registro', usuario.createdAt);

    // ── 2. Consentimientos ─────────────────────────────────────────────────
    paginaNuevaSiNecesario();
    seccion('2. Consentimientos');
    fila('Política de privacidad',
      usuario.consentimientoDatos
        ? `Aceptado el ${usuario.fechaConsentimiento ? fmt(usuario.fechaConsentimiento) : '—'}`
        : 'No aceptado');
    fila('Uso de Inteligencia Artificial',
      usuario.consentimientoIA
        ? `Aceptado el ${usuario.fechaConsentimientoIA ? fmt(usuario.fechaConsentimientoIA) : '—'}`
        : 'No aceptado');

    if (usuario.consentimientos?.length > 0) {
      doc.moveDown(0.3);
      doc.fillColor(COLOR_GRAY).fontSize(8).font('Helvetica-Bold').text('Historial:', 50);
      for (const c of usuario.consentimientos) {
        paginaNuevaSiNecesario(30);
        doc.fillColor('#aaaaaa').font('Helvetica').fontSize(8)
           .text(`• ${c.tipo} v${c.version} — ${c.aceptado ? 'Aceptado' : 'Revocado'} — ${fmt(c.createdAt)}`, 60);
      }
    }

    // ── 3. Sesiones de chat ────────────────────────────────────────────────
    paginaNuevaSiNecesario(100);
    seccion('3. Historial de Conversaciones con IA');

    if (!usuario.sesionesChat?.length) {
      doc.fillColor(COLOR_GRAY).fontSize(9).text('Sin sesiones registradas.', 50);
    } else {
      doc.fillColor(COLOR_GRAY).fontSize(9)
         .text(`Total: ${usuario.sesionesChat.length} sesiones`, 50);
      doc.moveDown(0.3);

      for (let idx = 0; idx < usuario.sesionesChat.length; idx++) {
        const sesion = usuario.sesionesChat[idx];
        paginaNuevaSiNecesario(80);
        doc.fillColor(COLOR_TEAL).fontSize(9).font('Helvetica-Bold')
           .text(`Sesión ${idx + 1} — ${fmt(sesion.createdAt)} (${sesion.mensajes.length} mensajes)`, 50);

        for (const m of sesion.mensajes) {
          paginaNuevaSiNecesario(35);
          const esIA = m.rol === 'assistant';
          const prefijo = esIA ? 'IA: ' : 'Tú: ';
          const texto = (m.contenido ?? '').slice(0, 500) + ((m.contenido?.length ?? 0) > 500 ? '…' : '');
          doc.fillColor(esIA ? '#8aab96' : '#ccddcc').font('Helvetica').fontSize(8)
             .text(prefijo + texto, 62, doc.y, { width: W - 20 });
        }
        doc.moveDown(0.4);
      }
    }

    // ── 4. Diario emocional ────────────────────────────────────────────────
    paginaNuevaSiNecesario(100);
    seccion('4. Diario Emocional');

    if (!usuario.entradasDiario?.length) {
      doc.fillColor(COLOR_GRAY).fontSize(9).text('Sin entradas registradas.', 50);
    } else {
      doc.fillColor(COLOR_GRAY).fontSize(9)
         .text(`Total: ${usuario.entradasDiario.length} entradas`, 50);
      doc.moveDown(0.3);

      for (const e of usuario.entradasDiario) {
        paginaNuevaSiNecesario(30);
        const emociones = Array.isArray(e.emociones) ? (e.emociones as string[]).join(', ') : '—';
        const etiquetas = Array.isArray(e.etiquetas) ? (e.etiquetas as string[]).join(', ') : '—';
        doc.fillColor('#aaaaaa').fontSize(8).font('Helvetica')
           .text(`${fmt(e.createdAt)}  |  Estado: ${e.estadoAnimo ?? '—'}  |  ${emociones}  |  ${etiquetas}`, 50, doc.y, { width: W });
      }
    }

    // ── Pie legal ──────────────────────────────────────────────────────────
    paginaNuevaSiNecesario(70);
    doc.moveDown(1);
    doc.rect(50, doc.y, W, 1).fill(COLOR_ACCENT);
    doc.moveDown(0.5);
    doc.fillColor(COLOR_GRAY).fontSize(7.5).font('Helvetica')
       .text(
         'Documento generado en cumplimiento de la Ley 1581 de 2012 (Habeas Data) y la Resolución 2654/2019 del ' +
         'Ministerio de Salud de Colombia. Para ejercer derechos de acceso, rectificación, cancelación u oposición: ' +
         'privacidad@mentebridge.com — Tiempo de respuesta: 10-15 días hábiles.',
         50, doc.y, { width: W, align: 'justify' },
       );

    doc.end();
  });
}
