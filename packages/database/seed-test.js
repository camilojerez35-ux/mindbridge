const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const usuario = await prisma.usuario.create({
    data: {
      nombre: 'Camilo Test',
      email: 'camilo@test.com',
      hashedPassword: '$2b$10$VsqWZ15N9NmtXaTEK3hvnOS6xawLyBFRdNcwMoOcSEYG7JXTEbUyy',
      rol: 'USUARIO',
      planActual: 'GRATIS',
      emailVerificado: new Date(),
      consentimientoDatos: true,
      consentimientoIA: true,
      estado: 'ACTIVO'
    }
  });
  console.log('Usuario creado:', usuario.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
