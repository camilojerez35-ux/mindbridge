// Re-export desde confirmaciones.ts — no usar @sendgrid/mail directamente
export {
  enviarEmail,
  enviarEmailBienvenida,
  enviarVerificacionEmail,
  enviarRecuperacionPassword,
  enviarConfirmacionCita,
  enviarRecordatorioCita,
  enviarResumenSemanal,
  enviarConfirmacionSuscripcion,
} from '@/lib/email/confirmaciones';
