-- AlterTable: agregar pushToken para notificaciones móviles (Expo Push)
ALTER TABLE "usuarios" ADD COLUMN "pushToken" TEXT;
