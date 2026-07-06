/**
 * Helpers de autenticación para tests E2E.
 * Usa una sesión de test inyectada via cookie para evitar el flujo OAuth real.
 */
import { Page, BrowserContext } from '@playwright/test';

export const TEST_USER = {
  id:    'e2e-user-id',
  email: 'e2e@mindbridge.co',
  name:  'Usuario E2E',
  plan:  'GRATIS',
  rol:   'USUARIO',
};

/**
 * Establece una sesión autenticada en el contexto del browser.
 * Requiere que NEXTAUTH_URL y NEXTAUTH_SECRET estén disponibles.
 */
export async function loginComoUsuario(context: BrowserContext): Promise<void> {
  // En E2E usamos la página de login real con credenciales de prueba
  // (requiere usuario de test en la DB de test)
  const page = await context.newPage();
  await page.goto('/login');
  await page.fill('input[type="email"]', process.env.E2E_TEST_EMAIL ?? 'e2e@mindbridge.co');
  await page.fill('input[type="password"]', process.env.E2E_TEST_PASSWORD ?? 'TestPass123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10_000 });
  await page.close();
}

export async function irA(page: Page, ruta: string): Promise<void> {
  await page.goto(ruta);
}
