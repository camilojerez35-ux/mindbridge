-- MindBridge — Migración: Audit Log + Constraint único en transacciones
-- Cumple: Ley 1581/2012 Art. 17 (registro de acceso a datos sensibles)
-- Fecha: 2026-05-21

-- ── D: Unique constraint en Pago.idTransaccionPasarela ───────────────────────
-- Previene duplicados financieros si el webhook se procesa dos veces.
-- NULL se permite múltiples veces (estándar PostgreSQL: NULL != NULL).
CREATE UNIQUE INDEX "pagos_idTransaccionPasarela_key"
  ON "pagos"("idTransaccionPasarela")
  WHERE "idTransaccionPasarela" IS NOT NULL;

-- ── C: Tabla de Audit Log ─────────────────────────────────────────────────────
-- Sin FK a usuarios para que los registros sobrevivan la eliminación de cuentas.
-- Append-only por diseño — no hay UPDATE ni DELETE permitidos en producción.
CREATE TABLE "audit_log" (
    "id"          TEXT        NOT NULL,
    "usuarioId"   TEXT,
    "adminId"     TEXT,
    "accion"      TEXT        NOT NULL,
    "recurso"     TEXT        NOT NULL,
    "recursoId"   TEXT,
    "ipAddress"   TEXT,
    "userAgent"   TEXT,
    "metadatos"   JSONB,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_log_usuarioId_idx" ON "audit_log"("usuarioId");
CREATE INDEX "audit_log_accion_idx"    ON "audit_log"("accion");
CREATE INDEX "audit_log_recurso_idx"   ON "audit_log"("recurso");
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");
