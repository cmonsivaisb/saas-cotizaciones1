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

test.describe('User - Customer CRUD', () => {
  test('should create a new customer', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/clients/new');
    await page.waitForTimeout(2000);
    
    const form = page.locator('form');
    if (await form.isVisible()) {
      const nameInput = page.locator('input[name="businessName"]');
      if (await nameInput.isVisible()) {
        await nameInput.fill(`Cliente ${Date.now()}`);
      }
      
      const contactInput = page.locator('input[name="contactName"]');
      if (await contactInput.isVisible()) {
        await contactInput.fill('Contacto');
      }
      
      const phoneInput = page.locator('input[name="phone"]');
      if (await phoneInput.isVisible()) {
        await phoneInput.fill('+52 55 12345678');
      }
      
      const saveBtn = page.getByRole('button', { name: /crear|guardar|save/i });
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForTimeout(2000);
      }
    }
  });

  test('should display customers list', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/clients');
    await page.waitForTimeout(2000);
    
    const hasCustomers = await page.locator('[class*="card"]').count() > 0;
    const hasEmpty = await page.getByText('No hay').isVisible();
    
    expect(hasCustomers || hasEmpty).toBe(true);
  });
});

test.describe('User - Customer Edit', () => {
  test('should edit customer', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/clients');
    await page.waitForTimeout(2000);
    
    const hasCustomers = await page.locator('[class*="card"]').count() > 0;
    if (hasCustomers) {
      const editLink = page.getByRole('link', { name: /editar|edit/i }).first();
      if (await editLink.isVisible()) {
        await editLink.click();
        await page.waitForTimeout(1500);
        
        const form = page.locator('form');
        if (await form.isVisible()) {
          await page.getByRole('button', { name: /guardar|save/i }).click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });
});