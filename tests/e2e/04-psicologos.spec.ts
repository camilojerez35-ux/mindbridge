/**
 * E2E — Directorio de psicólogos (página pública)
 */
import { test, expect } from '@playwright/test';

test.describe('Directorio de psicólogos', () => {
  test('página carga correctamente', async ({ page }) => {
    await page.goto('/psicologos');
    await expect(page).toHaveURL(/\/psicologos/);
  });

  test('API devuelve psicólogos activos', async ({ request }) => {
    const res = await request.get('/api/psicologos');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('psicologos');
    expect(Array.isArray(data.psicologos)).toBe(true);
    // Todos deben estar activos
    data.psicologos.forEach((p: any) => {
      expect(p.activo).toBe(true);
    });
  });

  test('API filtra por ciudad', async ({ request }) => {
    const res = await request.get('/api/psicologos?ciudad=Bogotá');
    expect(res.status()).toBe(200);
  });

  test('API devuelve 404 para psicólogo inexistente', async ({ request }) => {
    const res = await request.get('/api/psicologos?id=id-que-no-existe');
    expect(res.status()).toBe(404);
  });
});
