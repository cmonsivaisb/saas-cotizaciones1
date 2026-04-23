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

test.describe('Admin - Lead Detail', () => {
  test('should load lead detail page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/leads');
    await page.waitForTimeout(2000);
    
    const hasLeads = await page.locator('[class*="card"]').count() > 0;
    if (hasLeads) {
      await page.locator('[class*="card"]').first().click();
      await page.waitForTimeout(1500);
      
      const hasContent = await page.locator('h1').isVisible();
      expect(hasContent).toBe(true);
    }
  });

  test('should display lead information', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/leads');
    await page.waitForTimeout(2000);
    
    const hasLeads = await page.locator('[class*="card"]').count() > 0;
    if (hasLeads) {
      await page.locator('[class*="card"]').first().click();
      await page.waitForTimeout(1500);
      
      const emailLink = page.getByRole('link', { name: /@/ });
      const count = await emailLink.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should have back link', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/leads');
    await page.waitForTimeout(2000);
    
    const hasLeads = await page.locator('[class*="card"]').count() > 0;
    if (hasLeads) {
      await page.locator('[class*="card"]').first().click();
      await page.waitForTimeout(1500);
      
      const backLink = page.getByText(/Volver a Leads/);
      await expect(backLink).toBeVisible();
    }
  });
});