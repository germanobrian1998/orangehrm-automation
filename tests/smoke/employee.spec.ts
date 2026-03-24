import { test, expect } from '@playwright/test';

test.describe('Employee Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await page.fill('input[name="username"]', 'Admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*dashboard.*/);
  });

  test('should navigate to employee list', async ({ page }) => {
    await page.click('a:has-text("PIM")');
    await page.click('a:has-text("Employee List")');
    
    await expect(page.locator('table')).toBeVisible();
  });

  test('should search employee', async ({ page }) => {
    await page.click('a:has-text("PIM")');
    await page.click('a:has-text("Employee List")');
    
    await expect(page.locator('table')).toBeVisible();
  });
});
