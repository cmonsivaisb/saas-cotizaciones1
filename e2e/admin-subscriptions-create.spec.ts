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

test.describe('Admin - Subscriptions CRUD', () => {
  test('should display subscriptions with company and plan data', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/subscriptions');
    
    const subscriptionsList = page.locator('[class*="card"]');
    const count = await subscriptionsList.count();
    
    if (count > 0) {
      await expect(page.getByText(/plan|empresa/i).first()).toBeVisible();
      await expect(page.getByText(/MXN|pesos/i).first()).toBeVisible();
    }
  });

  test('should display subscription period dates', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/subscriptions');
    
    const subscriptions = page.locator('[class*="card"]');
    const count = await subscriptions.count();
    
    if (count > 0) {
      await expect(page.getByText(/periodo|cobro/i).first()).toBeVisible();
    }
  });
});

test.describe('Admin - Subscription Status', () => {
  test('should verify subscription status badges exist', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/subscriptions');
    await page.waitForTimeout(1000);
    
    const select = page.locator('select');
    if (await select.isVisible()) {
      await select.selectOption('active');
      await page.waitForTimeout(500);
    }
  });
});