import { test, expect, type Page } from '@playwright/test';

const USER_EMAIL = 'test@empresa.com';
const USER_PASSWORD = 'test123';

test.describe('User Login', () => {
  test('should login as regular user', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', USER_EMAIL);
    await page.fill('input[type="password"]', USER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 15000 });
    
    const hasDashboardContent = await page.url().includes('/dashboard');
    expect(hasDashboardContent).toBe(true);
  });
});

test.describe('User - Quotes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', USER_EMAIL);
    await page.fill('input[type="password"]', USER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 15000 });
  });

  test('should load quotes page with title', async ({ page }) => {
    await page.goto('/quotes');
    await page.waitForTimeout(2000);
    
    const hasQuotes = await page.getByRole('heading', { name: 'Cotizaciones' }).isVisible();
    const hasEmpty = await page.getByText('No hay').isVisible();
    
    expect(hasQuotes || hasEmpty).toBe(true);
  });

  test('should display quotes list or empty state', async ({ page }) => {
    await page.goto('/quotes');
    await page.waitForTimeout(2000);
    
    const hasCards = await page.locator('[class*="card"]').count() > 0;
    const hasEmpty = await page.getByText(/no hay|sin/i).isVisible();
    
    expect(hasCards || hasEmpty).toBe(true);
  });
});

test.describe('User - Orders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', USER_EMAIL);
    await page.fill('input[type="password"]', USER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 15000 });
  });

  test('should load orders page', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForTimeout(2000);
    
    const hasOrders = await page.getByRole('heading', { name: 'Pedidos' }).isVisible();
    const hasEmpty = await page.getByText('No hay').isVisible();
    
    expect(hasOrders || hasEmpty).toBe(true);
  });
});

test.describe('User - Customers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', USER_EMAIL);
    await page.fill('input[type="password"]', USER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 15000 });
  });

  test('should load customers page', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForTimeout(2000);
    
    const hasCustomers = await page.getByRole('heading', { name: 'Clientes' }).isVisible();
    const hasEmpty = await page.getByText('No hay').isVisible();
    
    expect(hasCustomers || hasEmpty).toBe(true);
  });
});

test.describe('User - Inventory', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', USER_EMAIL);
    await page.fill('input[type="password"]', USER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 15000 });
  });

  test('should load inventory page', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForTimeout(2000);
    
    const hasInventory = await page.getByRole('heading', { name: 'Inventario' }).isVisible();
    const hasEmpty = await page.getByText('No hay').isVisible();
    
    expect(hasInventory || hasEmpty).toBe(true);
  });
});