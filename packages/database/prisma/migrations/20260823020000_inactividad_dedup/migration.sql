-- Dedup de recordatorios de inactividad — evita reenvíos diarios/semanales indefinidos
ALTER TABLE "usuarios" ADD COLUMN "ultimoReengagementEnviadoEn"  TIMESTAMP(3);
ALTER TABLE "usuarios" ADD COLUMN "ultimaInactividadIAEnviadoEn" TIMESTAMP(3);
