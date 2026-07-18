const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const psicologos = [
    {
      nombre: 'Laura',
      apellido: 'Martínez',
      email: 'laura.martinez@mentebridge.com',
      especialidades: ['Ansiedad', 'Depresión', 'Terapia cognitiva'],
      bio: 'Psicóloga clínica con 8 años de experiencia. Especializada en terapia cognitivo-conductual para ansiedad y depresión.',
      tarifa: 120000,
      anos: 8,
    },
    {
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      email: 'carlos.rodriguez@mentebridge.com',
      especialidades: ['Trauma', 'EMDR', 'Estrés postraumático'],
      bio: 'Especialista en trauma y EMDR. Ayudo a personas a superar experiencias difíciles y recuperar su bienestar.',
      tarifa: 150000,
      anos: 12,
    },
    {
      nombre: 'Ana',
      apellido: 'Gómez',
      email: 'ana.gomez@mentebridge.com',
      especialidades: ['Parejas', 'Familia', 'Comunicación'],
      bio: 'Terapeuta de pareja y familia con enfoque sistémico. Acompaño procesos de cambio en relaciones.',
      tarifa: 130000,
      anos: 6,
    },
    {
      nombre: 'Diego',
      apellido: 'Herrera',
      email: 'diego.herrera@mentebridge.com',
      especialidades: ['Adolescentes', 'Autoestima', 'Identidad'],
      bio: 'Psicólogo enfocado en jóvenes y adultos jóvenes. Trabajo temas de identidad, autoestima y desarrollo personal.',
      tarifa: 100000,
      anos: 5,
    },
  ];

  for (const p of psicologos) {
    const hash = await bcrypt.hash('Psicologo2026!', 10);

    const existente = await prisma.usuario.findUnique({ where: { email: p.email } });
    let usuarioPsi = existente;

    if (!existente) {
      usuarioPsi = await prisma.usuario.create({
        data: {
          nombre: p.nombre,
          apellido: p.apellido,
          email: p.email,
          hashedPassword: hash,
          rol: 'PSICOLOGO',
          planActual: 'GRATIS',
          emailVerificado: new Date(),
          consentimientoDatos: true,
          consentimientoIA: true,
          estado: 'ACTIVO',
        },
      });
    }

    const psiExistente = await prisma.psicologo.findFirst({ where: { usuarioId: usuarioPsi.id } });
    if (!psiExistente) {
      await prisma.psicologo.create({
        data: {
          usuarioId: usuarioPsi.id,
          nombreCompleto: `${p.nombre} ${p.apellido}`,
          especialidades: p.especialidades,
          bio: p.bio,
          anosExperiencia: p.anos,
          tarifaCOP: p.tarifa,
          calificacionPromedio: parseFloat((4.2 + Math.random() * 0.7).toFixed(1)),
          estado: 'VERIFICADO',
          activo: true,
          modalidad: ['VIDEOLLAMADA', 'CHAT'],
          ciudades: ['Bogotá', 'Medellín'],
          idiomas: ['Español'],
          enfoqueTerapeutico: ['Cognitivo-conductual'],
          tarjetaProfesionalId: `TP-${Math.floor(100000 + Math.random() * 900000)}`,
          formacion: 'Psicología Clínica - Universidad Nacional de Colombia',
          disponibilidad: { lunes: ['09:00','10:00','11:00','14:00','15:00'], martes: ['09:00','10:00','14:00'], miercoles: ['10:00','11:00','15:00','16:00'], jueves: ['09:00','10:00','14:00'], viernes: ['09:00','10:00','11:00'] },
        },
      });
      console.log(`✓ Psicólogo creado: ${p.nombre} ${p.apellido}`);
    } else {
      console.log(`- Ya existe: ${p.nombre} ${p.apellido}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
