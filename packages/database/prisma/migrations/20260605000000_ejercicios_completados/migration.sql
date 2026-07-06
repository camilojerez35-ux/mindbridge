-- CreateTable
CREATE TABLE "ejercicios_completados" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "ejercicioId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "duracionSeg" INTEGER NOT NULL,
    "completadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ejercicios_completados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ejercicios_completados_usuarioId_idx" ON "ejercicios_completados"("usuarioId");

-- CreateIndex
CREATE INDEX "ejercicios_completados_ejercicioId_idx" ON "ejercicios_completados"("ejercicioId");

-- CreateIndex
CREATE INDEX "ejercicios_completados_completadoEn_idx" ON "ejercicios_completados"("completadoEn");

-- AddForeignKey
ALTER TABLE "ejercicios_completados" ADD CONSTRAINT "ejercicios_completados_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
