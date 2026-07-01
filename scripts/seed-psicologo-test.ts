/**
 * Script de seed: crea un psicólogo de prueba con su usuario asociado.
 * Ejecutar: npx tsx scripts/seed-psicologo-test.ts
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL },
  },
});

async function main() {
  const email = 'psicologo@mindbridge.co';

  // Evitar duplicados
  const existente = await db.usuario.findUnique({ where: { email } });
  if (existente) {
    console.log('⚠️  El psicólogo de prueba ya existe:', email);
    const psi = await db.psicologo.findUnique({ where: { usuarioId: existente.id } });
    console.log('   Usuario ID :', existente.id);
    console.log('   Psicólogo ID:', psi?.id);
    return;
  }

  const hashedPassword = await bcrypt.hash('MindTest2026!', 12);

  const usuario = await db.usuario.create({
    data: {
      email,
      nombre: 'Laura',
      apellido: 'Martínez',
      hashedPassword,
      rol: 'PSICOLOGO',
      estado: 'ACTIVO',
      consentimientoDatos: true,
      fechaConsentimiento: new Date(),
      consentimientoIA: true,
      fechaConsentimientoIA: new Date(),
    },
  });

  const psicologo = await db.psicologo.create({
    data: {
      usuarioId: usuario.id,
      nombreCompleto: 'Laura Martínez Rodríguez',
      tarjetaProfesionalId: 'PSI-COL-TEST-001',
      tarjetaVerificada: true,
      fechaVerificacion: new Date(),
      especialidades: ['Ansiedad', 'Depresión', 'Estrés laboral', 'Duelo'],
      enfoqueTerapeutico: ['TCC', 'ACT', 'Mindfulness'],
      formacion: 'Psicóloga clínica — Universidad de los Andes (2015). Magíster en Psicología Clínica — Pontificia Universidad Javeriana (2018). Certificada en Terapia Cognitivo-Conductual (Beck Institute, 2019).',
      anosExperiencia: 9,
      bio: 'Especialista en ansiedad, depresión y estrés laboral. Mi enfoque integra TCC con técnicas de mindfulness para ayudarte a desarrollar herramientas concretas de regulación emocional. Creo en un espacio seguro, sin juicios, donde puedas explorar y transformar lo que te pesa.',
      tarifaCOP: 120000,
      disponibilidad: {
        lunes:    ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        martes:   ['09:00', '10:00', '11:00', '14:00', '15:00'],
        miercoles:['09:00', '10:00', '14:00', '15:00', '16:00'],
        jueves:   ['09:00', '10:00', '11:00', '14:00'],
        viernes:  ['09:00', '10:00', '11:00'],
      },
      ciudades: ['Bogotá', 'Medellín'],
      modalidad: ['VIDEOLLAMADA', 'TELEFONICA'],
      idiomas: ['Español', 'Inglés'],
      estado: 'ACTIVO',
      activo: true,
      fechaActivacion: new Date(),
      calificacionPromedio: 4.9,
      totalCitas: 127,
      totalResenas: 38,
      fotoUrl: null,
    },
  });

  console.log('✅ Psicólogo de prueba creado:');
  console.log('   Email    :', email);
  console.log('   Password :', 'MindTest2026!');
  console.log('   Usuario ID :', usuario.id);
  console.log('   Psicólogo ID:', psicologo.id);
}

main()
  .catch(e => { console.error('❌ Error:', e.message); process.exit(1); })
  .finally(() => db.$disconnect());
