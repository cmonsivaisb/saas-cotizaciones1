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

test.describe('User - Order List', () => {
  test('should display orders list', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/orders');
    await page.waitForTimeout(2000);
    
    const hasOrders = await page.locator('[class*="card"]').count() > 0;
    const hasEmpty = await page.getByText('No hay').isVisible();
    
    expect(hasOrders || hasEmpty).toBe(true);
  });
});

test.describe('User - Order View', () => {
  test('should access order details', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/orders');
    await page.waitForTimeout(2000);
    
    const hasOrders = await page.locator('[class*="card"]').count() > 0;
    if (hasOrders) {
      await page.locator('[class*="card"]').first().click();
      await page.waitForTimeout(1500);
    }
  });
});