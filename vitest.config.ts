import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals:     true,
    environment: 'node',
    setupFiles:  ['./tests/setup.ts'],
    include: [
      'tests/**/*.test.ts',
      'packages/*/src/**/*.test.ts',
      'apps/*/src/**/*.test.ts',
    ],
    exclude: ['**/node_modules/**', '**/.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include:  ['packages/*/src/**', 'apps/*/src/lib/**', 'apps/*/src/app/api/**'],
      exclude:  ['**/*.test.ts', '**/*.d.ts', '**/node_modules/**'],
      thresholds: {
        // Los tests clínicos son bloqueantes — 100% de cobertura requerida
        'packages/ai-clinical/src/protocols/crisis-protocol.ts': {
          statements: 100,
          branches:   100,
          functions:  100,
          lines:      100,
        },
      },
    },
    reporters: ['verbose'],
    // Timeout más largo para llamadas a DB en tests de integración
    testTimeout: 30_000,
  },
  resolve: {
    alias: {
      '@mindbridge/ai-clinical': path.resolve(__dirname, 'packages/ai-clinical/src'),
      '@mindbridge/database':    path.resolve(__dirname, 'packages/database'),
      // Alias @ para imports de apps/web desde tests de integración
      '@':                       path.resolve(__dirname, 'apps/web/src'),
      // Forzar una sola instancia de next-auth y next para que los mocks funcionen
      'next-auth':               path.resolve(__dirname, 'node_modules/next-auth'),
      'next':                    path.resolve(__dirname, 'node_modules/next'),
      // apps/web usa @anthropic-ai/sdk ^0.24 — la raíz tiene una versión distinta (^0.104);
      // forzar la del workspace de apps/web para que el mock en tests coincida con el runtime real.
      '@anthropic-ai/sdk':       path.resolve(__dirname, 'apps/web/node_modules/@anthropic-ai/sdk'),
    },
  },
});
