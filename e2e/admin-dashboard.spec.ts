import { test, expect, type Page } from '@playwright/test';

const ADMIN_EMAIL = 'admin@cotizanet.com';
const ADMIN_PASSWORD = 'admin123';

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('/admin', { timeout: 10000 });
}

test.describe('Admin Dashboard', () => {
  test('should load and show title', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole('heading', { name: 'Dashboard Admin' })).toBeVisible();
  });

  test('should display stats cards with data', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.locator('h3:has-text("Empresas totales")')).toBeVisible();
    await expect(page.locator('h3:has-text("Suscripciones")')).toBeVisible();
    await expect(page.locator('h3:has-text("Ingresos del mes")')).toBeVisible();
    await expect(page.locator('h3:has-text("Leads nuevos")')).toBeVisible();
  });

  test('should display company status cards with data', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.locator('h3:has-text("Empresas Activas")')).toBeVisible();
    await expect(page.locator('h3:has-text("Período de Gracia")')).toBeVisible();
    await expect(page.locator('h3:has-text("Suspendidas")')).toBeVisible();
    await expect(page.getByText('Operando normalmente')).toBeVisible();
  });

  test('should display recent companies section', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole('heading', { name: 'Empresas recientes' })).toBeVisible();
  });

  test('should display recent leads section', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole('heading', { name: 'Leads recientes' })).toBeVisible();
  });
});