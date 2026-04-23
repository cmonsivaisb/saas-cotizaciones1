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

test.describe('Admin - Subscription Management', () => {
  test('should load subscription detail page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/subscriptions');
    await page.waitForTimeout(2000);
    
    const hasSubscriptions = await page.locator('[class*="card"]').count() > 0;
    if (hasSubscriptions) {
      await page.locator('[class*="card"]').first().click();
      await page.waitForTimeout(1500);
      
      const hasContent = await page.locator('h1').isVisible();
      expect(hasContent).toBe(true);
    }
  });

  test('should display subscription status', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/subscriptions');
    await page.waitForTimeout(2000);
    
    const hasSubscriptions = await page.locator('[class*="card"]').count() > 0;
    if (hasSubscriptions) {
      await page.locator('[class*="card"]').first().click();
      await page.waitForTimeout(1500);
      
      const statusBadge = page.locator('[class*="badge"]');
      const count = await statusBadge.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should have back link', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/subscriptions');
    await page.waitForTimeout(2000);
    
    const hasSubscriptions = await page.locator('[class*="card"]').count() > 0;
    if (hasSubscriptions) {
      await page.locator('[class*="card"]').first().click();
      await page.waitForTimeout(1500);
      
      const backLink = page.getByText(/Volver a Suscripciones/);
      await expect(backLink).toBeVisible();
    }
  });
});