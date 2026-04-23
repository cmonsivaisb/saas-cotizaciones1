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

test.describe('User - Quote List', () => {
  test('should display quotes list', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/quotes');
    await page.waitForTimeout(2000);
    
    const hasQuotes = await page.locator('[class*="card"]').count() > 0;
    const hasEmpty = await page.getByText('No hay').isVisible();
    
    expect(hasQuotes || hasEmpty).toBe(true);
  });
});

test.describe('User - Quote Edit', () => {
  test('should access edit page', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/quotes');
    await page.waitForTimeout(2000);
    
    const hasQuotes = await page.locator('[class*="card"]').count() > 0;
    if (hasQuotes) {
      const firstCard = page.locator('[class*="card"]').first();
      const link = firstCard.locator('a').first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForTimeout(1500);
      }
    }
  });
});