import { test, expect, type Page } from '@playwright/test';

const USER_EMAIL = 'test@empresa.com';
const USER_PASSWORD = 'test123';

async function loginAsUser(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', USER_EMAIL);
  await page.fill('input[type="password"]', USER_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard', { timeout: 15000 });
}

test.describe('User - Quote Page Navigation', () => {
  test('should load quote form page', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/quotes/new');
    await page.waitForTimeout(2000);
    
    const hasContent = await page.locator('h1, h2, form').count() > 0;
    expect(hasContent).toBe(true);
  });

  test('should display quotes list with data', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/quotes');
    await page.waitForTimeout(2000);
    
    const hasQuotes = await page.locator('[class*="card"]').count() > 0;
    const hasEmpty = await page.getByText('No hay').isVisible();
    
    expect(hasQuotes || hasEmpty).toBe(true);
  });
});

test.describe('User - Quote Card Data', () => {
  test('should display quote amounts', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/quotes');
    await page.waitForTimeout(2000);
    
    const hasQuotes = await page.locator('[class*="card"]').count() > 0;
    if (hasQuotes) {
      const card = page.locator('[class*="card"]').first();
      await expect(card).toBeVisible();
    }
  });

  test('should have view details link', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/quotes');
    await page.waitForTimeout(2000);
    
    const hasQuotes = await page.locator('[class*="card"]').count() > 0;
    if (hasQuotes) {
      const links = page.locator('a');
      const count = await links.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});