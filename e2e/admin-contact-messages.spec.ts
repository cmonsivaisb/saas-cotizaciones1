import { test, expect, type Page } from '@playwright/test';

const ADMIN_EMAIL = 'admin@cotizanet.com';
const ADMIN_PASSWORD = 'admin123';

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('/admin', { timeout: 15000 });
}

test.describe('Admin - Contact Messages', () => {
  test('should load contact messages page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/contact-messages');
    await page.waitForTimeout(2000);
    
    await expect(page.getByRole('heading', { name: 'Mensajes de Contacto' })).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/contact-messages');
    await page.waitForTimeout(2000);
    
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible();
  });

  test('should display status filter', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/contact-messages');
    await page.waitForTimeout(2000);
    
    const select = page.locator('select');
    await expect(select).toBeVisible();
  });

  test('should display messages or empty state', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/contact-messages');
    await page.waitForTimeout(2000);
    
    const hasMessages = await page.locator('[class*="card"]').count() > 0;
    const hasEmpty = await page.getByText('No hay mensajes').isVisible();
    
    expect(hasMessages || hasEmpty).toBe(true);
  });
});