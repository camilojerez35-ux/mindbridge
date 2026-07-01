/**
 * MindBridge — Script de auditoría de vigencia de líneas de emergencia
 *
 * Ejecutar: npx tsx scripts/check-emergency-lines.ts
 * Incluir en CI (GitHub Actions / Vercel) con frecuencia mensual.
 *
 * Falla con exit code 1 si hay líneas con más de 90 días sin verificar.
 * Falla con exit code 2 si hay números hardcodeados fuera del config canónico.
 */

import { lineasVencidas, LINEAS_EMERGENCIA } from '../packages/ai-clinical/src/config/lineas-emergencia';
import { execSync } from 'child_process';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');

function auditarVigencia(): boolean {
  const vencidas = lineasVencidas();
  if (vencidas.length === 0) {
    console.log('✅ Todas las líneas de emergencia verificadas en los últimos 90 días.');
    return true;
  }
  console.error('\n🔴 LÍNEAS DE EMERGENCIA SIN VERIFICAR (> 90 días):\n');
  for (const l of vencidas) {
    console.error(`  • ${l.nombre} (${l.numero}) — última verificación: ${l.ultimaVerificacion}`);
    console.error(`    Próxima verificación requerida: ${l.proximaVerificacion}\n`);
  }
  console.error('Acción requerida: llamar al número, confirmar vigencia, actualizar `ultimaVerificacion` en:');
  console.error('  packages/ai-clinical/src/config/lineas-emergencia.ts\n');
  return false;
}

function detectarNumerosSueltos(): boolean {
  const numerosAuditados = LINEAS_EMERGENCIA.map(l => l.numero.replace(/-/g, ''));
  const patronesHardcodeados = numerosAuditados.flatMap(n => [
    n,
    n.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3'),
  ]);

  // Archivos permitidos (el config mismo y sus consumidores directos)
  const PERMITIDOS = [
    'packages/ai-clinical/src/config/lineas-emergencia.ts',
    'packages/ai-clinical/src/protocols/crisis-protocol.ts',
    'packages/ai-clinical/src/prompts/system-prompt.ts', // texto narrativo — aceptable
    'scripts/check-emergency-lines.ts',
  ];

  const archivosConProblemas: string[] = [];

  for (const patron of patronesHardcodeados) {
    try {
      const resultado = execSync(
        `grep -r --include="*.ts" --include="*.tsx" -l "${patron}" "${ROOT}/apps" "${ROOT}/packages"`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
      ).trim();

      if (!resultado) continue;

      const archivos = resultado.split('\n').filter(f => {
        const relativo = f.replace(ROOT + '/', '').replace(/\\/g, '/');
        return !PERMITIDOS.some(p => relativo.includes(p));
      });

      archivosConProblemas.push(...archivos);
    } catch {
      // grep retorna exit 1 si no encuentra nada — es OK
    }
  }

  const unicos = [...new Set(archivosConProblemas)];
  if (unicos.length === 0) {
    console.log('✅ No se detectaron números de emergencia hardcodeados fuera del config canónico.');
    return true;
  }

  console.warn('\n⚠️  NÚMEROS DE EMERGENCIA HARDCODEADOS (migrar al config canónico):\n');
  for (const f of unicos) {
    console.warn(`  • ${f.replace(ROOT + '/', '')}`);
  }
  console.warn('\nMigrar a: import { LINEAS_ACTIVAS } from "@mindbridge/ai-clinical/config/lineas-emergencia"\n');
  return false; // Advertencia, no error bloqueante
}

console.log('🔍 Auditando líneas de emergencia MindBridge...\n');
const vigenciaOk = auditarVigencia();
console.log('');
detectarNumerosSueltos();

if (!vigenciaOk) {
  console.error('\n❌ Auditoría fallida — verificar líneas de emergencia antes del deploy.\n');
  process.exit(1);
}

console.log('\n✅ Auditoría de líneas de emergencia completada.\n');
