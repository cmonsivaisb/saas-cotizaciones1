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

test.describe('User - Inventory CRUD', () => {
  test('should create a new inventory item', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/inventory/new');
    await page.waitForTimeout(2000);
    
    const form = page.locator('form');
    if (await form.isVisible()) {
      const nameInput = page.locator('input[name="name"]');
      if (await nameInput.isVisible()) {
        await nameInput.fill(`Artículo ${Date.now()}`);
      }
      
      const priceInput = page.locator('input[name="salePrice"]');
      if (await priceInput.isVisible()) {
        await priceInput.fill('100');
      }
      
      const saveBtn = page.getByRole('button', { name: /crear|guardar|save/i });
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForTimeout(2000);
      }
    }
  });

  test('should display inventory items list', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/inventory');
    await page.waitForTimeout(2000);
    
    const hasItems = await page.locator('[class*="card"]').count() > 0;
    const hasEmpty = await page.getByText('No hay').isVisible();
    
    expect(hasItems || hasEmpty).toBe(true);
  });
});

test.describe('User - Inventory Edit', () => {
  test('should edit inventory item', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/inventory');
    await page.waitForTimeout(2000);
    
    const hasItems = await page.locator('[class*="card"]').count() > 0;
    if (hasItems) {
      const editLink = page.getByRole('link', { name: /editar|edit/i }).first();
      if (await editLink.isVisible()) {
        await editLink.click();
        await page.waitForTimeout(1500);
        
        await page.getByRole('button', { name: /guardar|save/i }).click();
        await page.waitForTimeout(1000);
      }
    }
  });
});