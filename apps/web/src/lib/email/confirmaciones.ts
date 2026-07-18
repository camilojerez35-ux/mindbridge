/**
 * Envío de emails via Resend HTTP API — sin dependencias de Node.
 * https://resend.com — 3.000 emails/mes gratis.
 */

const FROM_EMAIL = process.env.EMAIL_FROM      ?? 'noreply@mentebridge.com';
const FROM_NAME  = process.env.EMAIL_FROM_NAME ?? 'MenteBridge Colombia';

/** Escapa caracteres HTML para evitar XSS en templates de email. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log('\n📧 [EMAIL DEV] ─────────────────────────────');
    console.log('  Para:', params.to);
    console.log('  Asunto:', params.subject);
    console.log('  Texto:', params.text);
    console.log('────────────────────────────────────────────\n');
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to:   [params.to],
      subject: params.subject,
      text: params.text,
      ...(params.html ? { html: params.html } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('[EMAIL ERROR]', res.status, body);
  }
}

// ── Funciones públicas ────────────────────────────────────────────────────────

export async function enviarEmail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  await sendEmail(params);
}

export async function enviarEmailBienvenida(params: {
  email: string;
  nombre: string;
}): Promise<void> {
  await sendEmail({
    to: params.email,
    subject: '¡Bienvenido/a a MenteBridge! 💚',
    text: `Hola ${params.nombre},\n\nTu cuenta en MenteBridge Colombia ha sido creada exitosamente.\n\nCuida tu bienestar mental con nosotros.\n\nEquipo MenteBridge`,
    html: `<p>Hola <strong>${params.nombre}</strong>,</p><p>Tu cuenta en <strong>MenteBridge Colombia</strong> ha sido creada exitosamente.</p><p>Cuida tu bienestar mental con nosotros. 💚</p>`,
  });
}

export async function enviarVerificacionEmail(params: {
  email: string;
  nombre: string;
  token: string;
  url: string;
}): Promise<void> {
  await sendEmail({
    to: params.email,
    subject: 'Verifica tu email — MenteBridge',
    text: `Hola ${params.nombre},\n\nVerifica tu email haciendo clic en este enlace:\n${params.url}\n\nEl enlace expira en 24 horas.`,
    html: `<p>Hola <strong>${params.nombre}</strong>,</p><p>Haz clic para verificar tu email:</p><p><a href="${params.url}">${params.url}</a></p><p>Expira en 24 horas.</p>`,
  });
}

export async function enviarRecuperacionPassword(params: {
  email: string;
  nombre: string;
  url: string;
}): Promise<void> {
  await sendEmail({
    to: params.email,
    subject: 'Recuperar contraseña — MenteBridge',
    text: `Hola ${params.nombre},\n\nRecupera tu contraseña aquí:\n${params.url}\n\nSi no solicitaste esto, ignora este email.`,
    html: `<p>Hola <strong>${params.nombre}</strong>,</p><p>Haz clic para restablecer tu contraseña:</p><p><a href="${params.url}">${params.url}</a></p><p>Si no lo solicitaste, ignora este mensaje.</p>`,
  });
}

export async function enviarConfirmacionCita(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cita: any;
  emailUsuario: string;
  nombreUsuario: string;
}): Promise<void> {
  const fecha = new Date(params.cita.fechaHora).toLocaleString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  });
  await sendEmail({
    to: params.emailUsuario,
    subject: 'Cita confirmada — MenteBridge',
    text: `Hola ${params.nombreUsuario},\n\nTu cita con ${params.cita.psicologo?.nombreCompleto ?? 'tu psicólogo'} está confirmada para el ${fecha}.\n\nEquipo MenteBridge`,
  });
}

export async function enviarRecordatorioCita(params: {
  email: string;
  nombre: string;
  fechaHora: Date;
  psicologoNombre: string;
}): Promise<void> {
  const fecha = params.fechaHora.toLocaleString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  });
  await sendEmail({
    to: params.email,
    subject: 'Recordatorio de cita — MenteBridge',
    text: `Hola ${params.nombre},\n\nTe recordamos tu cita con ${params.psicologoNombre} mañana ${fecha}.\n\nEquipo MenteBridge`,
  });
}

export async function enviarResumenSemanal(params: {
  email: string;
  nombre: string;
}): Promise<void> {
  await sendEmail({
    to: params.email,
    subject: 'Tu resumen semanal — MenteBridge',
    text: `Hola ${params.nombre},\n\nAquí está tu resumen de bienestar de esta semana en MenteBridge.\n\nEquipo MenteBridge`,
  });
}

export async function enviarConfirmacionSuscripcion(params: {
  email: string;
  nombre: string;
  plan: string;
  montoCOP?: number;
  fechaVencimiento?: Date;
  idTransaccion?: string;
}): Promise<void> {
  const monto = params.montoCOP
    ? `$${new Intl.NumberFormat('es-CO').format(params.montoCOP)} COP`
    : '';
  const vence = params.fechaVencimiento
    ? params.fechaVencimiento.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  await sendEmail({
    to: params.email,
    subject: `Plan ${params.plan} activado — MenteBridge`,
    text: `Hola ${params.nombre},\n\nTu plan ${params.plan} ha sido activado exitosamente.${monto ? `\nMonto: ${monto}` : ''}${vence ? `\nVigente hasta: ${vence}` : ''}\n\nEquipo MenteBridge`,
    html: `<p>Hola <strong>${params.nombre}</strong>,</p><p>Tu plan <strong>${params.plan}</strong> ha sido activado exitosamente. 🎉</p>${monto ? `<p>Monto: <strong>${monto}</strong></p>` : ''}${vence ? `<p>Vigente hasta: <strong>${vence}</strong></p>` : ''}<p>Equipo MenteBridge 💚</p>`,
  });
}
