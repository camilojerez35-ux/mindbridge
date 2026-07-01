-- AlterTable: agregar pushToken para notificaciones móviles (Expo Push)
ALTER TABLE "Usuario" ADD COLUMN "pushToken" TEXT;
