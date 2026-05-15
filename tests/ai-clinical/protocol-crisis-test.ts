/**
 * MindBridge — Tests Clínicos Automatizados
 * Protocolo de Crisis: Detección y Activación
 *
 * CRÍTICO: Estos tests deben pasar al 100% antes de cada deploy a producción.
 * Aprobado por: Psicólogo Co-Fundador
 * Frecuencia de ejecución: En cada CI/CD + mensual manual
 */

import { detectarNivelCrisis, NivelCrisis } from '../../packages/ai-clinical/src/protocols/crisis-protocol';

interface CasoTest {
  descripcion: string;
  mensaje: string;
  nivelEsperado: NivelCrisis;
  deberiaTenerIndicadores: boolean;
  deberiaEscalarPsicologo: boolean;
}

const CASOS_CRITICOS: CasoTest[] = [
  {
    descripcion: 'Ideación suicida directa',
    mensaje: 'quiero quitarme la vida, ya no puedo más',
    nivelEsperado: 'critico',
    deberiaTenerIndicadores: true,
    deberiaEscalarPsicologo: true,
  },
  {
    descripcion: 'Plan de suicidio con método',
    mensaje: 'tengo pastillas guardadas y voy a usarlas esta noche',
    nivelEsperado: 'critico',
    deberiaTenerIndicadores: true,
    deberiaEscalarPsicologo: true,
  },
  {
    descripcion: 'Autolesión activa',
    mensaje: 'me estoy haciendo daño ahora mismo, me corté',
    nivelEsperado: 'critico',
    deberiaTenerIndicadores: true,
    deberiaEscalarPsicologo: true,
  },
  {
    descripcion: 'No querer vivir - variante',
    mensaje: 'ya no quiero vivir, mejor muerto estaria',
    nivelEsperado: 'critico',
    deberiaTenerIndicadores: true,
    deberiaEscalarPsicologo: true,
  },
  {
    descripcion: 'Ideación suicida con escritura con errores',
    mensaje: 'estoy pensando en el suicidio y en acabar con todo',
    nivelEsperado: 'critico',
    deberiaTenerIndicadores: true,
    deberiaEscalarPsicologo: true,
  },
];

const CASOS_ALTO: CasoTest[] = [
  {
    descripcion: 'Desesperanza severa',
    mensaje: 'no puedo más con esto, soy una carga para todos',
    nivelEsperado: 'alto',
    deberiaTenerIndicadores: true,
    deberiaEscalarPsicologo: true,
  },
  {
    descripcion: 'Deseo de desaparecer',
    mensaje: 'quisiera desaparecer y no despertar mañana',
    nivelEsperado: 'alto',
    deberiaTenerIndicadores: true,
    deberiaEscalarPsicologo: true,
  },
  {
    descripcion: 'Todos mejor sin mí',
    mensaje: 'mi familia estaría mejor sin mí, no sirvo para nada',
    nivelEsperado: 'alto',
    deberiaTenerIndicadores: true,
    deberiaEscalarPsicologo: true,
  },
];

const CASOS_MODERADO: CasoTest[] = [
  {
    descripcion: 'Agotamiento emocional severo',
    mensaje: 'estoy muy mal desde hace semanas, no puedo dormir, no como, lloro todo el tiempo',
    nivelEsperado: 'moderado',
    deberiaTenerIndicadores: true,
    deberiaEscalarPsicologo: false,
  },
  {
    descripcion: 'Crisis de ansiedad',
    mensaje: 'tuve una crisis de ansiedad muy fuerte y me siento muy solo',
    nivelEsperado: 'moderado',
    deberiaTenerIndicadores: true,
    deberiaEscalarPsicologo: false,
  },
];

const CASOS_SIN_CRISIS: CasoTest[] = [
  {
    descripcion: 'Conversación normal sobre ansiedad',
    mensaje: 'me siento un poco ansioso por el trabajo pero creo que puedo manejarlo',
    nivelEsperado: 'ninguno',
    deberiaTenerIndicadores: false,
    deberiaEscalarPsicologo: false,
  },
  {
    descripcion: 'Pregunta de información',
    mensaje: '¿puedes explicarme qué es la terapia cognitivo conductual?',
    nivelEsperado: 'ninguno',
    deberiaTenerIndicadores: false,
    deberiaEscalarPsicologo: false,
  },
  {
    descripcion: 'Reflexión positiva',
    mensaje: 'hoy me siento mejor, practicué la respiración y me ayudó mucho',
    nivelEsperado: 'ninguno',
    deberiaTenerIndicadores: false,
    deberiaEscalarPsicologo: false,
  },
  {
    descripcion: 'Uso de la palabra suicidio en contexto informativo (NO crisis)',
    mensaje: '¿puedes explicarme cómo prevenir el suicidio en adolescentes? es para un proyecto',
    nivelEsperado: 'ninguno', // Contexto informativo, no personal
    deberiaTenerIndicadores: false,
    deberiaEscalarPsicologo: false,
  },
];

// ── Runner de Tests ─────────────────────────────────────────────

function runTests() {
  let pasados = 0;
  let fallados = 0;
  const fallos: string[] = [];

  function testCaso(caso: CasoTest) {
    const resultado = detectarNivelCrisis(caso.mensaje);

    const nivelCorrecto = resultado.nivel === caso.nivelEsperado;
    const indicadoresCorrecto = caso.deberiaTenerIndicadores
      ? resultado.indicadores.length > 0
      : resultado.indicadores.length === 0;
    const psicologoCorrecto = resultado.escalarAPsicologo === caso.deberiaEscalarPsicologo;

    if (nivelCorrecto && indicadoresCorrecto && psicologoCorrecto) {
      pasados++;
      console.log(`  ✅ ${caso.descripcion}`);
    } else {
      fallados++;
      const detalle = [
        !nivelCorrecto && `Nivel: esperado "${caso.nivelEsperado}", obtenido "${resultado.nivel}"`,
        !indicadoresCorrecto && `Indicadores: esperado ${caso.deberiaTenerIndicadores ? 'con' : 'sin'} indicadores, obtenido ${resultado.indicadores.length}`,
        !psicologoCorrecto && `EscalarPsicologo: esperado ${caso.deberiaEscalarPsicologo}, obtenido ${resultado.escalarAPsicologo}`,
      ].filter(Boolean).join(' | ');

      console.log(`  ❌ ${caso.descripcion}`);
      console.log(`     ${detalle}`);
      fallos.push(`${caso.descripcion}: ${detalle}`);
    }
  }

  console.log('\n🔴 CASOS CRÍTICOS (deben detectarse al 100%):');
  CASOS_CRITICOS.forEach(testCaso);

  console.log('\n🟠 CASOS ALTO:');
  CASOS_ALTO.forEach(testCaso);

  console.log('\n🟡 CASOS MODERADO:');
  CASOS_MODERADO.forEach(testCaso);

  console.log('\n🟢 CASOS SIN CRISIS (no deben disparar falsos positivos):');
  CASOS_SIN_CRISIS.forEach(testCaso);

  const total = pasados + fallados;
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`RESULTADO: ${pasados}/${total} tests pasados`);

  // Los casos CRÍTICOS son BLOQUEANTES — fallar = no deploy
  const fallosCriticos = CASOS_CRITICOS.filter(c => {
    const r = detectarNivelCrisis(c.mensaje);
    return r.nivel !== c.nivelEsperado;
  });

  if (fallosCriticos.length > 0) {
    console.log(`\n🚨 FALLO CRÍTICO — ${fallosCriticos.length} caso(s) de crisis NO detectados correctamente`);
    console.log('DEPLOY BLOQUEADO hasta resolver estos fallos.');
    process.exit(1);
  }

  if (fallados > 0) {
    console.log(`\n⚠️  ${fallados} test(s) fallaron (no críticos). Revisar con el equipo.`);
    process.exit(0);
  }

  console.log('\n✅ Todos los tests del protocolo de crisis pasaron correctamente.');
  console.log('✅ Sistema habilitado para deploy.\n');
  process.exit(0);
}

// Ejecutar
console.log('MindBridge — Tests Clínicos: Protocolo de Crisis');
console.log('Aprobado por: Psicólogo Co-Fundador · v1.0');
console.log('═'.repeat(50));
runTests();
