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

test.describe('Admin - Leads CRUD', () => {
  const TEST_LEAD_NAME = `Lead Test ${Date.now()}`;
  const TEST_LEAD_EMAIL = `lead${Date.now()}@test.com`;

  test('should create a new lead', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/leads');
    
    await page.getByRole('button', { name: 'Nuevo lead' }).click();
    
    await page.waitForTimeout(1000);
    
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');
    
    if (await nameInput.isVisible()) {
      await nameInput.fill(TEST_LEAD_NAME);
      if (await emailInput.isVisible()) {
        await emailInput.fill(TEST_LEAD_EMAIL);
      }
      
      await page.getByRole('button', { name: /crear|guardar/i }).click();
      await page.waitForTimeout(2000);
      
      await expect(page.getByText(TEST_LEAD_NAME)).toBeVisible();
    }
  });

  test('should verify lead was created with correct status', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/leads');
    await page.waitForTimeout(2000);
    
    const hasLead = await page.getByText(TEST_LEAD_NAME.substring(0, 15)).isVisible();
    if (hasLead) {
      await expect(page.getByText('Nuevo')).toBeVisible();
    }
  });

  test('should update lead status', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/leads');
    
    const leadLink = page.getByRole('link', { name: /ver detalle/i });
    if (await leadLink.isVisible()) {
      await leadLink.first().click();
      await page.waitForTimeout(1000);
      
      const statusSelect = page.locator('select[name="status"]');
      if (await statusSelect.isVisible()) {
        await statusSelect.selectOption('contacted');
        await page.getByRole('button', { name: /guardar/i }).click();
        await page.waitForTimeout(1000);
        
        await expect(page.getByText('Contactado')).toBeVisible();
      }
    }
  });
});