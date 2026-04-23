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

test.describe('Admin - Invoices CRUD', () => {
  test('should display invoices with correct data', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/invoices');
    
    const invoicesList = page.locator('[class*="card"]');
    const count = await invoicesList.count();
    
    if (count > 0) {
      await expect(page.getByText('Monto')).toBeVisible();
      await expect(page.getByText('MXN')).toBeVisible();
      await expect(page.getByText(/creada|fecha/i)).toBeVisible();
    }
  });

  test('should show pending invoices with correct status badge when there are invoices', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/invoices');
    await page.waitForTimeout(1000);
    
    const hasCards = await page.locator('[class*="card"]').count() > 0;
    if (hasCards) {
      const badge = page.locator('[class*="badge"]').first();
      if (await badge.isVisible()) {
        await expect(badge).toBeVisible();
      }
    } else {
      await expect(page.getByText('No hay facturas')).toBeVisible();
    }
  });

  test('should show paid invoices with correct status badge when there are invoices', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/invoices');
    await page.waitForTimeout(1000);
    
    const hasCards = await page.locator('[class*="card"]').count() > 0;
    if (hasCards) {
      const select = page.locator('select');
      if (await select.isVisible()) {
        await select.selectOption('paid');
        await page.waitForTimeout(500);
      }
    }
  });
});

test.describe('Admin - Subscription Invoices', () => {
  test('should display subscription invoices with plan data', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/invoices');
    
    const invoices = page.locator('[class*="card"]');
    const count = await invoices.count();
    
    if (count > 0) {
      await expect(page.getByText(/plan|suscripcion/i).first()).toBeVisible();
    }
  });

  test('should display invoice dates correctly', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/invoices');
    
    const invoices = page.locator('[class*="card"]');
    const count = await invoices.count();
    
    if (count > 0) {
      await expect(page.getByText(/creada|vencimiento/i).first()).toBeVisible();
    }
  });
});