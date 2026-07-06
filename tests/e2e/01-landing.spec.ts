/**
 * E2E — Landing page y navegación pública
 */
import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('carga correctamente y muestra elementos clave', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MindBridge/i);

    // CTA principal visible
    const cta = page.getByRole('link', { name: /comenzar|registrar|prueba/i }).first();
    await expect(cta).toBeVisible();
  });

  test('navega a login desde el CTA', async ({ page }) => {
    await page.goto('/');
    const loginLink = page.getByRole('link', { name: /iniciar sesión|login/i }).first();
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('página de login carga el formulario', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('página de registro carga el formulario', async ({ page }) => {
    await page.goto('/registro');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('redirecciona /dashboard a /login si no hay sesión', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirecciona /chat a /login si no hay sesión', async ({ page }) => {
    await page.goto('/chat');
    await expect(page).toHaveURL(/\/login/);
  });
});
