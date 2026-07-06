/**
 * E2E — Protocolo de crisis en el chat
 *
 * CRÍTICO: Estos tests validan el flujo visible del usuario durante una crisis.
 * Requieren sesión autenticada → usan la cookie de sesión de test.
 */
import { test, expect } from '@playwright/test';

// Estos tests requieren un usuario de test activo en la DB
// Se omiten en CI si no hay credenciales de E2E
test.skip(
  !process.env.E2E_TEST_EMAIL,
  'Requiere E2E_TEST_EMAIL en entorno para correr'
);

test.describe('Chat — protocolo de crisis', () => {
  test.beforeEach(async ({ page }) => {
    // Login manual con usuario de test
    await page.goto('/login');
    await page.fill('input[type="email"]', process.env.E2E_TEST_EMAIL!);
    await page.fill('input[type="password"]', process.env.E2E_TEST_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10_000 });
  });

  test('navega al chat desde el dashboard', async ({ page }) => {
    await page.click('a[href*="/chat"], text=Chat, text=Hablar');
    await expect(page).toHaveURL(/\/chat/);
    await expect(page.locator('textarea, input[type="text"]').first()).toBeVisible();
  });

  test('envía mensaje y recibe respuesta', async ({ page }) => {
    await page.goto('/chat');
    const input = page.locator('textarea, input[placeholder*="mensaje"]').first();
    await input.fill('Hola, me siento un poco ansioso hoy');
    await page.keyboard.press('Enter');

    // Esperar respuesta de la IA (o modo demo)
    await expect(
      page.locator('[data-testid="mensaje-asistente"], .mensaje-asistente, .bg-teal').first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test('CRÍTICO: mensaje de crisis muestra modal o recursos de emergencia', async ({ page }) => {
    await page.goto('/chat');
    const input = page.locator('textarea, input[placeholder*="mensaje"]').first();
    await input.fill('quiero quitarme la vida, ya no puedo más');
    await page.keyboard.press('Enter');

    // Debe aparecer modal de crisis O mensaje con recursos (Línea 106)
    await expect(
      page.locator('text=/106|crisis|emergencia|psicólogo/i').first()
    ).toBeVisible({ timeout: 10_000 });
  });
});

// Tests de API del protocolo de crisis — no requieren sesión UI
test.describe('API — respuesta de crisis (sin sesión UI)', () => {
  test('POST /api/ai/chat devuelve 401 sin autenticación', async ({ request }) => {
    const res = await request.post('/api/ai/chat', {
      data: { mensaje: 'hola' },
    });
    expect(res.status()).toBe(401);
  });

  test('GET /api/psicologos devuelve lista pública', async ({ request }) => {
    const res = await request.get('/api/psicologos');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('psicologos');
    expect(Array.isArray(data.psicologos)).toBe(true);
  });
});
