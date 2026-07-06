-- MindBridge Colombia — Migración Inicial
-- Generado desde: packages/database/prisma/schema.prisma
-- Cumple: Ley 1581/2012 (datos sensibles), Resolución 2654/2019 (historia clínica)

-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('ACTIVO', 'SUSPENDIDO', 'ELIMINADO', 'PENDIENTE_VERIFICACION');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('USUARIO', 'ADMIN', 'PSICOLOGO', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "PlanSuscripcion" AS ENUM ('GRATIS', 'PLUS', 'FAMILIA', 'EMPRESARIAL');

-- CreateEnum
CREATE TYPE "EstadoSuscripcion" AS ENUM ('ACTIVA', 'VENCIDA', 'CANCELADA', 'PAUSADA', 'PRUEBA');

-- CreateEnum
CREATE TYPE "EstadoSesion" AS ENUM ('ACTIVA', 'CERRADA', 'ARCHIVADA');

-- CreateEnum
CREATE TYPE "RolMensaje" AS ENUM ('user', 'assistant', 'system');

-- CreateEnum
CREATE TYPE "EstadoPsicologo" AS ENUM ('PENDIENTE_VERIFICACION', 'VERIFICADO', 'ACTIVO', 'SUSPENDIDO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA_USUARIO', 'CANCELADA_PSICOLOGO', 'NO_ASISTIO');

-- CreateEnum
CREATE TYPE "TipoCita" AS ENUM ('PRIMERA_CONSULTA', 'SEGUIMIENTO', 'URGENTE');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'PROCESANDO', 'APROBADO', 'RECHAZADO', 'REEMBOLSADO');

-- CreateEnum
CREATE TYPE "TipoConsentimiento" AS ENUM ('POLITICA_PRIVACIDAD', 'TERMINOS_USO', 'USO_IA', 'DATOS_SALUD', 'MARKETING', 'HISTORIA_CLINICA', 'COMPARTIR_CON_PSICOLOGO');

-- CreateTable usuarios
CREATE TABLE "usuarios" (
    "id"                      TEXT NOT NULL,
    "email"                   TEXT NOT NULL,
    "emailVerificado"         TIMESTAMP(3),
    "nombre"                  TEXT,
    "apellido"                TEXT,
    "telefono"                TEXT,
    "ciudadColombia"          TEXT,
    "fechaNacimiento"         TIMESTAMP(3),
    "imagen"                  TEXT,
    "hashedPassword"          TEXT,
    "consentimientoDatos"     BOOLEAN NOT NULL DEFAULT false,
    "fechaConsentimiento"     TIMESTAMP(3),
    "consentimientoIA"        BOOLEAN NOT NULL DEFAULT false,
    "fechaConsentimientoIA"   TIMESTAMP(3),
    "consentimientoMarketing" BOOLEAN NOT NULL DEFAULT false,
    "motivoConsulta"          TEXT,
    "condicionesPrevias"      TEXT,
    "medicamentos"            TEXT,
    "estado"                  "EstadoUsuario"   NOT NULL DEFAULT 'ACTIVO',
    "rol"                     "RolUsuario"      NOT NULL DEFAULT 'USUARIO',
    "planActual"              "PlanSuscripcion" NOT NULL DEFAULT 'GRATIS',
    "suscripcionId"           TEXT,
    "suscripcionVence"        TIMESTAMP(3),
    "createdAt"               TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"               TIMESTAMP(3) NOT NULL,
    "ultimoAcceso"            TIMESTAMP(3),
    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable suscripciones
CREATE TABLE "suscripciones" (
    "id"                TEXT NOT NULL,
    "usuarioId"         TEXT NOT NULL,
    "plan"              "PlanSuscripcion"    NOT NULL,
    "estado"            "EstadoSuscripcion"  NOT NULL DEFAULT 'ACTIVA',
    "montoCOP"          INTEGER NOT NULL,
    "fechaInicio"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaVencimiento"  TIMESTAMP(3) NOT NULL,
    "fechaCancelacion"  TIMESTAMP(3),
    "motivoCancelacion" TEXT,
    "referenciaPago"    TEXT,
    "idTransaccion"     TEXT,
    "metodoPago"        TEXT,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL,
    CONSTRAINT "suscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable sesiones_chat
CREATE TABLE "sesiones_chat" (
    "id"                   TEXT NOT NULL,
    "usuarioId"            TEXT NOT NULL,
    "titulo"               TEXT,
    "estado"               "EstadoSesion" NOT NULL DEFAULT 'ACTIVA',
    "resumen"              TEXT,
    "nivelAnimoPrevio"     INTEGER,
    "nivelAnimoPosterior"  INTEGER,
    "huboEventoCrisis"     BOOLEAN NOT NULL DEFAULT false,
    "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"            TIMESTAMP(3) NOT NULL,
    "cerradaEn"            TIMESTAMP(3),
    CONSTRAINT "sesiones_chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable mensajes_chat
CREATE TABLE "mensajes_chat" (
    "id"          TEXT NOT NULL,
    "usuarioId"   TEXT NOT NULL,
    "sesionId"    TEXT,
    "rol"         "RolMensaje" NOT NULL,
    "contenido"   TEXT NOT NULL,
    "modeloIA"    TEXT,
    "tokensUsados" INTEGER,
    "esCrisis"    BOOLEAN NOT NULL DEFAULT false,
    "nivelCrisis" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mensajes_chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable entradas_diario
CREATE TABLE "entradas_diario" (
    "id"          TEXT NOT NULL,
    "usuarioId"   TEXT NOT NULL,
    "contenido"   TEXT NOT NULL,
    "estadoAnimo" INTEGER NOT NULL,
    "emociones"   TEXT[],
    "etiquetas"   TEXT[],
    "analisisIA"  TEXT,
    "patronesIA"  TEXT[],
    "esFavorito"  BOOLEAN NOT NULL DEFAULT false,
    "esPrivado"   BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "entradas_diario_pkey" PRIMARY KEY ("id")
);

-- CreateTable registros_animo
CREATE TABLE "registros_animo" (
    "id"        TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "valor"     INTEGER NOT NULL,
    "nota"      TEXT,
    "contexto"  TEXT,
    "emociones" TEXT[],
    "fecha"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "registros_animo_pkey" PRIMARY KEY ("id")
);

-- CreateTable psicologos
CREATE TABLE "psicologos" (
    "id"                    TEXT NOT NULL,
    "usuarioId"             TEXT NOT NULL,
    "nombreCompleto"        TEXT NOT NULL,
    "tarjetaProfesionalId"  TEXT NOT NULL,
    "tarjetaVencimiento"    TIMESTAMP(3),
    "tarjetaVerificada"     BOOLEAN NOT NULL DEFAULT false,
    "fechaVerificacion"     TIMESTAMP(3),
    "especialidades"        TEXT[],
    "enfoqueTerapeutico"    TEXT[],
    "formacion"             TEXT NOT NULL,
    "años_experiencia"      INTEGER NOT NULL,
    "bio"                   TEXT NOT NULL,
    "tarifaCOP"             INTEGER NOT NULL,
    "disponibilidad"        JSONB NOT NULL,
    "zonaHoraria"           TEXT NOT NULL DEFAULT 'America/Bogota',
    "ciudades"              TEXT[],
    "modalidad"             TEXT[],
    "idiomas"               TEXT[] DEFAULT ARRAY['Español']::TEXT[],
    "estado"                "EstadoPsicologo" NOT NULL DEFAULT 'PENDIENTE_VERIFICACION',
    "activo"                BOOLEAN NOT NULL DEFAULT false,
    "fechaActivacion"       TIMESTAMP(3),
    "calificacionPromedio"  DOUBLE PRECISION,
    "totalCitas"            INTEGER NOT NULL DEFAULT 0,
    "totalReseñas"          INTEGER NOT NULL DEFAULT 0,
    "fotoUrl"               TEXT,
    "videoUrl"              TEXT,
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             TIMESTAMP(3) NOT NULL,
    CONSTRAINT "psicologos_pkey" PRIMARY KEY ("id")
);

-- CreateTable pagos
CREATE TABLE "pagos" (
    "id"                      TEXT NOT NULL,
    "suscripcionId"           TEXT,
    "montoCOP"                INTEGER NOT NULL,
    "metodoPago"              TEXT NOT NULL,
    "referencia"              TEXT NOT NULL,
    "pasarela"                TEXT NOT NULL,
    "idTransaccionPasarela"   TEXT,
    "estadoPasarela"          TEXT,
    "respuestaPasarela"       JSONB,
    "estado"                  "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "fechaPago"               TIMESTAMP(3),
    "createdAt"               TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable citas
CREATE TABLE "citas" (
    "id"                  TEXT NOT NULL,
    "usuarioId"           TEXT NOT NULL,
    "psicologoId"         TEXT NOT NULL,
    "fechaHora"           TIMESTAMP(3) NOT NULL,
    "duracionMinutos"     INTEGER NOT NULL DEFAULT 45,
    "estado"              "EstadoCita" NOT NULL DEFAULT 'PENDIENTE',
    "tipo"                "TipoCita"   NOT NULL DEFAULT 'PRIMERA_CONSULTA',
    "modalidad"           TEXT NOT NULL DEFAULT 'VIDEOLLAMADA',
    "montoCOP"            INTEGER NOT NULL,
    "comisionCOP"         INTEGER NOT NULL,
    "montoPsicologoCOP"   INTEGER NOT NULL,
    "estadoPago"          "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "pagoId"              TEXT,
    "notasPrevias"        TEXT,
    "notasClinicas"       TEXT,
    "salaVideollamada"    TEXT,
    "tokenPsicologo"      TEXT,
    "tokenUsuario"        TEXT,
    "motivoCancelacion"   TEXT,
    "canceladaBy"         TEXT,
    "canceladaEn"         TIMESTAMP(3),
    "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"           TIMESTAMP(3) NOT NULL,
    CONSTRAINT "citas_pkey" PRIMARY KEY ("id")
);

-- CreateTable resenas
CREATE TABLE "resenas" (
    "id"            TEXT NOT NULL,
    "citaId"        TEXT NOT NULL,
    "psicologoId"   TEXT NOT NULL,
    "calificacion"  INTEGER NOT NULL,
    "comentario"    TEXT,
    "aprobada"      BOOLEAN NOT NULL DEFAULT true,
    "moderadaEn"    TIMESTAMP(3),
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "resenas_pkey" PRIMARY KEY ("id")
);

-- CreateTable pagos_psicologos
CREATE TABLE "pagos_psicologos" (
    "id"          TEXT NOT NULL,
    "psicologoId" TEXT NOT NULL,
    "periodo"     TEXT NOT NULL,
    "montoCOP"    INTEGER NOT NULL,
    "numeroCitas" INTEGER NOT NULL,
    "estado"      TEXT NOT NULL DEFAULT 'PENDIENTE',
    "fechaPago"   TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pagos_psicologos_pkey" PRIMARY KEY ("id")
);

-- CreateTable incidentes_crisis
CREATE TABLE "incidentes_crisis" (
    "id"                      TEXT NOT NULL,
    "usuarioId"               TEXT NOT NULL,
    "sesionId"                TEXT,
    "nivel"                   TEXT NOT NULL,
    "indicadoresDetectados"   TEXT[],
    "fragmentoAnonimizado"    TEXT,
    "protocoloActivado"       BOOLEAN NOT NULL DEFAULT false,
    "psicologoNotificado"     BOOLEAN NOT NULL DEFAULT false,
    "usuarioConfirmoSeguro"   BOOLEAN,
    "resolucion"              TEXT,
    "timestampDeteccion"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timestampResolucion"     TIMESTAMP(3),
    CONSTRAINT "incidentes_crisis_pkey" PRIMARY KEY ("id")
);

-- CreateTable consentimientos
CREATE TABLE "consentimientos" (
    "id"          TEXT NOT NULL,
    "usuarioId"   TEXT NOT NULL,
    "tipo"        "TipoConsentimiento" NOT NULL,
    "version"     TEXT NOT NULL,
    "aceptado"    BOOLEAN NOT NULL,
    "ipAddress"   TEXT,
    "userAgent"   TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "consentimientos_pkey" PRIMARY KEY ("id")
);

-- ── Unique constraints ────────────────────────────────────────────
ALTER TABLE "usuarios"      ADD CONSTRAINT "usuarios_email_key"                       UNIQUE ("email");
ALTER TABLE "suscripciones" ADD CONSTRAINT "suscripciones_referenciaPago_key"         UNIQUE ("referenciaPago");
ALTER TABLE "psicologos"    ADD CONSTRAINT "psicologos_usuarioId_key"                 UNIQUE ("usuarioId");
ALTER TABLE "psicologos"    ADD CONSTRAINT "psicologos_tarjetaProfesionalId_key"      UNIQUE ("tarjetaProfesionalId");
ALTER TABLE "pagos"         ADD CONSTRAINT "pagos_referencia_key"                     UNIQUE ("referencia");
ALTER TABLE "resenas"       ADD CONSTRAINT "resenas_citaId_key"                       UNIQUE ("citaId");

-- ── Indexes ───────────────────────────────────────────────────────
CREATE INDEX "usuarios_email_idx"                ON "usuarios"("email");
CREATE INDEX "usuarios_planActual_idx"           ON "usuarios"("planActual");
CREATE INDEX "suscripciones_usuarioId_idx"       ON "suscripciones"("usuarioId");
CREATE INDEX "suscripciones_estado_idx"          ON "suscripciones"("estado");
CREATE INDEX "sesiones_chat_usuarioId_idx"       ON "sesiones_chat"("usuarioId");
CREATE INDEX "sesiones_chat_estado_idx"          ON "sesiones_chat"("estado");
CREATE INDEX "mensajes_chat_usuarioId_idx"       ON "mensajes_chat"("usuarioId");
CREATE INDEX "mensajes_chat_sesionId_idx"        ON "mensajes_chat"("sesionId");
CREATE INDEX "mensajes_chat_esCrisis_idx"        ON "mensajes_chat"("esCrisis");
CREATE INDEX "entradas_diario_usuarioId_idx"     ON "entradas_diario"("usuarioId");
CREATE INDEX "entradas_diario_createdAt_idx"     ON "entradas_diario"("createdAt");
CREATE INDEX "registros_animo_usuarioId_idx"     ON "registros_animo"("usuarioId");
CREATE INDEX "registros_animo_fecha_idx"         ON "registros_animo"("fecha");
CREATE INDEX "psicologos_estado_idx"             ON "psicologos"("estado");
CREATE INDEX "psicologos_activo_idx"             ON "psicologos"("activo");
CREATE INDEX "citas_usuarioId_idx"               ON "citas"("usuarioId");
CREATE INDEX "citas_psicologoId_idx"             ON "citas"("psicologoId");
CREATE INDEX "citas_fechaHora_idx"               ON "citas"("fechaHora");
CREATE INDEX "citas_estado_idx"                  ON "citas"("estado");
CREATE INDEX "resenas_psicologoId_idx"           ON "resenas"("psicologoId");
CREATE INDEX "incidentes_crisis_usuarioId_idx"   ON "incidentes_crisis"("usuarioId");
CREATE INDEX "incidentes_crisis_nivel_idx"       ON "incidentes_crisis"("nivel");
CREATE INDEX "incidentes_crisis_timestamp_idx"   ON "incidentes_crisis"("timestampDeteccion");
CREATE INDEX "consentimientos_usuarioId_idx"     ON "consentimientos"("usuarioId");
CREATE INDEX "consentimientos_tipo_idx"          ON "consentimientos"("tipo");

-- ── Foreign keys ──────────────────────────────────────────────────
ALTER TABLE "suscripciones"    ADD CONSTRAINT "suscripciones_usuarioId_fkey"     FOREIGN KEY ("usuarioId")   REFERENCES "usuarios"("id")     ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sesiones_chat"    ADD CONSTRAINT "sesiones_chat_usuarioId_fkey"     FOREIGN KEY ("usuarioId")   REFERENCES "usuarios"("id")     ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "mensajes_chat"    ADD CONSTRAINT "mensajes_chat_usuarioId_fkey"     FOREIGN KEY ("usuarioId")   REFERENCES "usuarios"("id")     ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "mensajes_chat"    ADD CONSTRAINT "mensajes_chat_sesionId_fkey"      FOREIGN KEY ("sesionId")    REFERENCES "sesiones_chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "entradas_diario"  ADD CONSTRAINT "entradas_diario_usuarioId_fkey"   FOREIGN KEY ("usuarioId")   REFERENCES "usuarios"("id")     ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "registros_animo"  ADD CONSTRAINT "registros_animo_usuarioId_fkey"   FOREIGN KEY ("usuarioId")   REFERENCES "usuarios"("id")     ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "psicologos"       ADD CONSTRAINT "psicologos_usuarioId_fkey"        FOREIGN KEY ("usuarioId")   REFERENCES "usuarios"("id")     ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pagos"            ADD CONSTRAINT "pagos_suscripcionId_fkey"         FOREIGN KEY ("suscripcionId") REFERENCES "suscripciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "citas"            ADD CONSTRAINT "citas_usuarioId_fkey"             FOREIGN KEY ("usuarioId")   REFERENCES "usuarios"("id")     ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "citas"            ADD CONSTRAINT "citas_psicologoId_fkey"           FOREIGN KEY ("psicologoId") REFERENCES "psicologos"("id")   ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "citas"            ADD CONSTRAINT "citas_pagoId_fkey"                FOREIGN KEY ("pagoId")      REFERENCES "pagos"("id")        ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "resenas"          ADD CONSTRAINT "resenas_citaId_fkey"              FOREIGN KEY ("citaId")      REFERENCES "citas"("id")        ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "resenas"          ADD CONSTRAINT "resenas_psicologoId_fkey"         FOREIGN KEY ("psicologoId") REFERENCES "psicologos"("id")   ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pagos_psicologos" ADD CONSTRAINT "pagos_psicologos_psicologoId_fkey" FOREIGN KEY ("psicologoId") REFERENCES "psicologos"("id")  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "incidentes_crisis" ADD CONSTRAINT "incidentes_crisis_usuarioId_fkey" FOREIGN KEY ("usuarioId")  REFERENCES "usuarios"("id")     ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "consentimientos"  ADD CONSTRAINT "consentimientos_usuarioId_fkey"   FOREIGN KEY ("usuarioId")   REFERENCES "usuarios"("id")     ON DELETE RESTRICT ON UPDATE CASCADE;
