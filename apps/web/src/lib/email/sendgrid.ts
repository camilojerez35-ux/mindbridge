// src/lib/email/sendgrid.ts
// RUTA: Importado por APIs que envían emails
// Instalar: npm install @sendgrid/mail

import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const FROM = { email: process.env.EMAIL_FROM || 'noreply@mindbridge.co', name: 'MindBridge Colombia' };
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ── Email de bienvenida ────────────────────────────────────────
export async function enviarEmailBienvenida(params: { email: string; nombre: string }) {
  const nombre = escaparHtml(params.nombre);
  await sgMail.send({
    to: params.email, from: FROM,
    subject: '¡Bienvenido/a a MindBridge! Tu viaje de bienestar comienza aquí 💚',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0d1a12;color:white;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#1a6b4a,#145438);padding:40px;text-align:center">
          <h1 style="color:#2dd4bf;font-size:32px;margin:0">MindBridge</h1>
          <p style="color:rgba(255,255,255,0.7);margin-top:8px">🇨🇴 Colombia · Salud Mental Accesible</p>
        </div>
        <div style="padding:40px">
          <h2 style="color:white">Hola, ${nombre}! 👋</h2>
          <p style="color:#8aab96;line-height:1.7">Nos alegra tenerte en MindBridge. Ahora tienes acceso a nuestra IA especializada en bienestar emocional, disponible las 24 horas para acompañarte.</p>
          <div style="background:rgba(45,212,191,0.1);border:1px solid rgba(45,212,191,0.2);border-radius:12px;padding:20px;margin:24px 0">
            <p style="color:#2dd4bf;font-weight:700;margin:0 0 12px">Con tu plan gratuito puedes:</p>
            <ul style="color:#8aab96;margin:0;padding-left:20px">
              <li>3 sesiones de chat con IA por semana</li>
              <li>Diario emocional básico</li>
              <li>Ejercicios guiados de respiración y mindfulness</li>
              <li>Protocolo de crisis activo siempre</li>
            </ul>
          </div>
          <a href="${APP_URL}/dashboard" style="display:block;background:#1a6b4a;color:white;padding:14px;border-radius:8px;text-decoration:none;text-align:center;font-weight:700;font-size:16px">Ir a mi dashboard →</a>
        </div>
        <div style="padding:20px 40px;border-top:1px solid #1a2e1f;text-align:center">
          <p style="color:#3d5c48;font-size:12px">⚠️ Herramienta de bienestar emocional. No sustituye atención profesional.</p>
          <p style="color:#3d5c48;font-size:12px">Crisis: <strong style="color:#2dd4bf">Línea 106 · 123</strong></p>
        </div>
      </div>`,
  });
}

// ── Verificación de email ──────────────────────────────────────
export async function enviarVerificacionEmail(params: { email: string; nombre: string; token: string }) {
  const nombre = escaparHtml(params.nombre);
  const link = `${APP_URL}/api/auth/verificar?token=${encodeURIComponent(params.token)}`;
  await sgMail.send({
    to: params.email, from: FROM,
    subject: 'Verifica tu email en MindBridge',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
        <h2>Hola ${nombre}, verifica tu email</h2>
        <p>Haz clic en el botón para verificar tu cuenta:</p>
        <a href="${link}" style="display:inline-block;background:#1a6b4a;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700">Verificar mi email →</a>
        <p style="color:#666;font-size:12px;margin-top:20px">Este enlace expira en 24 horas. Si no creaste una cuenta, ignora este email.</p>
      </div>`,
  });
}

// ── Confirmación de cita ───────────────────────────────────────
export async function enviarConfirmacionCita(params: {
  emailUsuario: string; nombreUsuario: string;
  nombrePsicologo: string; fechaHora: Date;
  salaVideollamada: string; montoCOP: number;
}) {
  const nombreUsuario = escaparHtml(params.nombreUsuario);
  const nombrePsicologo = escaparHtml(params.nombrePsicologo);
  const fecha = params.fechaHora.toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const hora = params.fechaHora.toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' });
  const monto = new Intl.NumberFormat('es-CO').format(params.montoCOP);

  await sgMail.send({
    to: params.emailUsuario, from: FROM,
    subject: `✅ Cita confirmada con ${nombrePsicologo}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0d1a12;color:white;border-radius:16px;overflow:hidden">
        <div style="background:#1a6b4a;padding:30px;text-align:center">
          <h2 style="color:white;margin:0">✅ Cita Confirmada</h2>
        </div>
        <div style="padding:32px">
          <p style="color:#8aab96">Hola ${nombreUsuario},</p>
          <div style="background:rgba(45,212,191,0.08);border:1px solid rgba(45,212,191,0.2);border-radius:12px;padding:20px;margin:20px 0">
            <p><strong style="color:#2dd4bf">Psicólogo/a:</strong> <span style="color:white">${nombrePsicologo}</span></p>
            <p><strong style="color:#2dd4bf">Fecha:</strong> <span style="color:white">${fecha}</span></p>
            <p><strong style="color:#2dd4bf">Hora:</strong> <span style="color:white">${hora} (Colombia)</span></p>
            <p><strong style="color:#2dd4bf">Valor:</strong> <span style="color:white">$${monto} COP</span></p>
          </div>
          <a href="${params.salaVideollamada}" style="display:block;background:#1a6b4a;color:white;padding:14px;border-radius:8px;text-decoration:none;text-align:center;font-weight:700">📹 Unirme a la videollamada</a>
          <p style="color:#5a8a6a;font-size:13px;margin-top:16px">El enlace estará activo 10 minutos antes de la cita. Puedes cancelar con mínimo 24 horas de anticipación.</p>
        </div>
      </div>`,
  });
}

// ── Recordatorio de cita (24h antes) ──────────────────────────
export async function enviarRecordatorioCita(params: { email: string; nombre: string; nombrePsicologo: string; horasCita: number; salaVideollamada: string }) {
  const nombre = escaparHtml(params.nombre);
  const nombrePsicologo = escaparHtml(params.nombrePsicologo);
  await sgMail.send({
    to: params.email, from: FROM,
    subject: `⏰ Recordatorio: Cita con ${nombrePsicologo} en ${params.horasCita} horas`,
    html: `<div style="font-family:Inter,sans-serif"><h3>Hola ${nombre},</h3><p>Te recordamos que tienes una cita con ${nombrePsicologo} en ${params.horasCita} horas.</p><a href="${params.salaVideollamada}" style="background:#1a6b4a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">Unirme a la videollamada</a></div>`,
  });
}

// ── Recuperación de contraseña ────────────────────────────────
export async function enviarRecuperacionPassword(params: { email: string; nombre: string; token: string }) {
  const nombre = escaparHtml(params.nombre);
  const link = `${APP_URL}/nueva-password?token=${encodeURIComponent(params.token)}`;
  await sgMail.send({
    to: params.email, from: FROM,
    subject: 'Recupera tu contraseña de MindBridge',
    html: `<div style="font-family:Inter,sans-serif"><h3>Hola ${nombre},</h3><p>Recibimos una solicitud para restablecer tu contraseña.</p><a href="${link}" style="background:#1a6b4a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">Restablecer contraseña →</a><p style="color:#666;font-size:12px">Este enlace expira en 1 hora. Si no solicitaste esto, ignora este email.</p></div>`,
  });
}

// ── Resumen semanal de bienestar ───────────────────────────────
export async function enviarResumenSemanal(params: { email: string; nombre: string; animoPromedio: number; sesionesIA: number; tendencia: string }) {
  const nombre = escaparHtml(params.nombre);
  const tendencia = escaparHtml(params.tendencia);
  const emoji = params.animoPromedio >= 7 ? '😄' : params.animoPromedio >= 4 ? '😐' : '😔';
  await sgMail.send({
    to: params.email, from: FROM,
    subject: `${emoji} Tu resumen semanal de bienestar — MindBridge`,
    html: `<div style="font-family:Inter,sans-serif;max-width:500px"><h3>Hola ${nombre}, aquí tu resumen de la semana:</h3><ul><li>Ánimo promedio: <strong>${params.animoPromedio}/10</strong></li><li>Sesiones con IA: <strong>${params.sesionesIA}</strong></li><li>Tendencia: <strong>${tendencia}</strong></li></ul><a href="${APP_URL}/dashboard/progreso" style="background:#1a6b4a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none">Ver mi progreso</a></div>`,
  });
}
