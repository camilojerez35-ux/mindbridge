/**
 * E2E — Flujo de registro de usuario
 */
import { test, expect } from '@playwright/test';

const EMAIL_UNICO = `e2e-${Date.now()}@test.mindbridge.co`;

test.describe('Registro de usuario', () => {
  test('muestra errores de validación con campos vacíos', async ({ page }) => {
    await page.goto('/registro');
    await page.click('button[type="submit"]');

    // Debe aparecer al menos un mensaje de error
    const errores = page.locator('[role="alert"], .text-red-500, .text-red-600');
    await expect(errores.first()).toBeVisible({ timeout: 3000 });
  });

  test('muestra error con email inválido', async ({ page }) => {
    await page.goto('/registro');
    await page.fill('input[type="email"]', 'no-es-un-email');
    await page.fill('input[type="password"]', 'Contraseña1!');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=correo')).toBeVisible({ timeout: 3000 });
  });

  test('muestra error con contraseña débil', async ({ page }) => {
    await page.goto('/registro');
    await page.fill('input[type="email"]', EMAIL_UNICO);
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/contraseña|password/i').first()).toBeVisible({ timeout: 3000 });
  });

  test('registro exitoso muestra pantalla de verificación', async ({ page }) => {
    await page.goto('/registro');

    // Rellenar formulario completo
    const nombre = page.locator('input[placeholder*="nombre"], input[name="nombre"]').first();
    if (await nombre.isVisible()) await nombre.fill('Usuario Test');

    await page.fill('input[type="email"]', EMAIL_UNICO);
    await page.fill('input[type="password"]', 'TestPass123!');

    // Aceptar checkboxes de consentimiento si existen
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      const cb = checkboxes.nth(i);
      const name = await cb.getAttribute('name') ?? '';
      // Solo marcar los de privacidad y IA (no marketing)
      if (!name.includes('marketing')) await cb.check();
    }

    await page.click('button[type="submit"]');

    // Esperar pantalla de éxito o redirección a verificar-email
    await expect(
      page.locator('text=/verifica|revisa.*email|correo/i').first()
    ).toBeVisible({ timeout: 8000 });
  });
});
