-- Dedup de recordatorios de citas: evita reenvíos y permite que el cron
-- recupere citas pendientes de recordatorio sin depender de una ventana de tiempo estrecha.
ALTER TABLE "citas" ADD COLUMN "recordatorio24hEnviadoEn" TIMESTAMP(3);
ALTER TABLE "citas" ADD COLUMN "recordatorio1hEnviadoEn"  TIMESTAMP(3);
