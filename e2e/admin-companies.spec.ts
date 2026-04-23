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

test.describe('Admin Companies', () => {
  test('should load companies page with title', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/companies');
    await expect(page.getByRole('heading', { name: 'Empresas' })).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/companies');
    const searchInput = page.getByPlaceholder(/Buscar/).first();
    await expect(searchInput).toBeVisible();
  });

  test('should display status filter dropdown', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/companies');
    await expect(page.locator('select')).toBeVisible();
    await expect(page.getByRole('combobox')).toBeVisible();
  });

  test('should display new company button', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/companies');
    await expect(page.getByRole('button', { name: 'Nueva empresa' })).toBeVisible();
  });

  test('should display filter options', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/companies');
    const select = page.locator('select');
    await expect(select).toBeVisible();
    await expect(select).toHaveValue('');
  });
});