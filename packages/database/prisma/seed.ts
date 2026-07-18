/**
 * MenteBridge — Seed de base de datos
 * Datos iniciales requeridos para funcionamiento de la plataforma.
 * Ejecutar: npm run seed (en packages/database)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de MenteBridge...');

  // ── 1. Usuario Super Admin ──────────────────────────────────────
  const bcrypt = await import('bcryptjs');
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'MenteBridge@2026!';
  const hashed = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.usuario.upsert({
    where:  { email: 'admin@mentebridge.com' },
    update: { hashedPassword: hashed, rol: 'SUPERADMIN', estado: 'ACTIVO', planActual: 'EMPRESARIAL' },
    create: {
      email:                'admin@mentebridge.com',
      nombre:               'Admin',
      apellido:             'MenteBridge',
      hashedPassword:       hashed,
      rol:                  'SUPERADMIN',
      estado:               'ACTIVO',
      planActual:           'EMPRESARIAL',
      emailVerificado:      new Date(),
      consentimientoDatos:  true,
      fechaConsentimiento:  new Date(),
      consentimientoIA:     true,
      fechaConsentimientoIA: new Date(),
    },
  });
  console.log(`  ✅ Super admin: ${admin.email}`);

  // ── 1b. Admin secundario ────────────────────────────────────────
  const admin2 = await prisma.usuario.upsert({
    where:  { email: 'camilojerez35@gmail.com' },
    update: { hashedPassword: hashed, rol: 'SUPERADMIN', estado: 'ACTIVO', planActual: 'EMPRESARIAL' },
    create: {
      email:                'camilojerez35@gmail.com',
      nombre:               'Camilo',
      apellido:             'Jerez',
      hashedPassword:       hashed,
      rol:                  'SUPERADMIN',
      estado:               'ACTIVO',
      planActual:           'EMPRESARIAL',
      emailVerificado:      new Date(),
      consentimientoDatos:  true,
      fechaConsentimiento:  new Date(),
      consentimientoIA:     true,
      fechaConsentimientoIA: new Date(),
    },
  });
  console.log(`  ✅ Admin secundario: ${admin2.email}`);

  // ── 2. Psicólogo demo (para staging/dev) ───────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const psiPassword = await bcrypt.hash('PsicoDemo@2026!', 12);

    const psicoUsuario = await prisma.usuario.upsert({
      where:  { email: 'psicologo@mentebridge.com' },
      update: {},
      create: {
        email:               'psicologo@mentebridge.com',
        nombre:              'Andrea',
        apellido:            'Morales Demo',
        hashedPassword:      psiPassword,
        rol:                 'PSICOLOGO',
        estado:              'ACTIVO',
        planActual:          'EMPRESARIAL',
        emailVerificado:     new Date(),
        consentimientoDatos: true,
        fechaConsentimiento: new Date(),
        consentimientoIA:    true,
        fechaConsentimientoIA: new Date(),
      },
    });

    await prisma.psicologo.upsert({
      where:  { usuarioId: psicoUsuario.id },
      update: {},
      create: {
        usuarioId:            psicoUsuario.id,
        nombreCompleto:       'Dra. Andrea Morales Demo',
        tarjetaProfesionalId: 'PSI-DEMO-000001',
        tarjetaVerificada:    true,
        fechaVerificacion:    new Date(),
        especialidades:       ['Ansiedad', 'Depresión', 'TCC'],
        enfoqueTerapeutico:   ['TCC', 'Mindfulness'],
        formacion:            'Psicología Clínica — Universidad de los Andes. Especialización TCC.',
        anosExperiencia:      8,
        bio:                  'Psicóloga clínica especializada en TCC. Cuenta demo para staging.',
        tarifaCOP:            80000,
        disponibilidad:       {
          lunes:   ['9:00', '10:00', '11:00', '14:00', '15:00'],
          martes:  ['9:00', '10:00', '11:00', '14:00'],
          miercoles: ['9:00', '10:00'],
          jueves:  ['14:00', '15:00', '16:00'],
          viernes: ['9:00', '10:00', '11:00'],
        },
        ciudades:  ['Bogotá'],
        modalidad: ['VIDEOLLAMADA'],
        estado:    'ACTIVO',
        activo:    true,
        fechaActivacion: new Date(),
      },
    });
    console.log(`  ✅ Psicólogo demo: ${psicoUsuario.email}`);

    // Usuario paciente demo
    const pacientePassword = await bcrypt.hash('Paciente@2026!', 12);
    const paciente = await prisma.usuario.upsert({
      where:  { email: 'paciente@mentebridge.com' },
      update: {},
      create: {
        email:               'paciente@mentebridge.com',
        nombre:              'Usuario',
        apellido:            'Demo',
        hashedPassword:      pacientePassword,
        rol:                 'USUARIO',
        estado:              'ACTIVO',
        planActual:          'PLUS',
        emailVerificado:     new Date(),
        consentimientoDatos: true,
        fechaConsentimiento: new Date(),
        consentimientoIA:    true,
        fechaConsentimientoIA: new Date(),
      },
    });
    console.log(`  ✅ Paciente demo: ${paciente.email}`);
  }

  console.log('\n✅ Seed completado exitosamente.');
  console.log('   Credenciales de acceso en docs/operacional/credenciales-dev.md');
}

main()
  .catch(e => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
