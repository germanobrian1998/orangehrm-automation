import { test, expect } from '@playwright/test';

test.describe('Login Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.fill('input[name="username"]', 'Admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*dashboard.*/);
  });

  test('should display error with invalid credentials', async ({ page }) => {
    await page.fill('input[name="username"]', 'invalid');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.oxd-alert')).toBeVisible();
  });

  test('should display validation for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    const errorMessages = page.locator('.oxd-input-field-error-message');
    await expect(errorMessages.first()).toBeVisible();
  });
});
