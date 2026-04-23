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

test.describe('Admin Payments', () => {
  test('should load payments page with title', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/payments');
    await expect(page.getByRole('heading', { name: 'Pagos' })).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/payments');
    const searchInput = page.getByPlaceholder(/Buscar/).first();
    await expect(searchInput).toBeVisible();
  });

  test('should display status filter dropdown', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/payments');
    await expect(page.locator('select')).toBeVisible();
  });

  test('should display filter options', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/payments');
    const select = page.locator('select');
    await expect(select).toBeVisible();
    await expect(select).toHaveValue('');
  });
});