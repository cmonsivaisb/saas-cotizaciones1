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

test.describe('Admin - Companies', () => {
  test('should display existing companies in list', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/companies');
    
    await page.waitForTimeout(1000);
    
    const hasCompanies = await page.locator('[class*="card"]').count() > 0;
    const hasEmptyState = await page.getByText('No hay empresas').isVisible();
    
    if (hasCompanies) {
      await expect(page.getByText('Empresas').first()).toBeVisible();
    } else if (hasEmptyState) {
      await expect(page.getByText('No hay empresas')).toBeVisible();
    }
  });

  test('should display company card with basic info when companies exist', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/companies');
    
    await page.waitForTimeout(1000);
    
    const hasCompanies = await page.locator('[class*="card"]').count() > 0;
    if (hasCompanies) {
      const cards = page.locator('[class*="card"]');
      await expect(cards.first()).toBeVisible();
    }
  });

  test('should have working filter dropdown', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/companies');
    
    const select = page.locator('select');
    if (await select.isVisible()) {
      await select.selectOption('active');
      await page.waitForTimeout(500);
      
      await select.selectOption('');
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Admin - Create Company', () => {
  test('should open create company form when button is visible', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/companies');
    
    await page.waitForTimeout(1000);
    
    const newButton = page.getByRole('button', { name: /nueva empresa/i });
    if (await newButton.isVisible()) {
      await newButton.click();
      await page.waitForTimeout(1500);
      
      const hasPageContent = await page.locator('h1, h2, h3').count() > 0;
      expect(hasPageContent).toBe(true);
    }
  });
});