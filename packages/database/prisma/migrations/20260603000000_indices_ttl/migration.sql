-- Índices en PagosPsicologo (MEDIO-2)
CREATE INDEX IF NOT EXISTS "pagos_psicologos_psicologoId_idx" ON "pagos_psicologos"("psicologoId");
CREATE INDEX IF NOT EXISTS "pagos_psicologos_estado_idx" ON "pagos_psicologos"("estado");

-- TTL en SenalRTC: campo expiresAt + índice para limpieza eficiente (MEDIO-3)
ALTER TABLE "senales_rtc" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT NOW() + INTERVAL '24 hours';
CREATE INDEX IF NOT EXISTS "senales_rtc_expiresAt_idx" ON "senales_rtc"("expiresAt");
