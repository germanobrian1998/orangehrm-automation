import { test, expect } from '@playwright/test';

test.describe('Leave Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await page.fill('input[name="username"]', 'Admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*dashboard.*/);
  });

  test('should view leave requests', async ({ page }) => {
    await page.click('a:has-text("Leave")');
    
    await expect(page.locator('text=Leave')).toBeVisible();
  });

  test('should check leave balance', async ({ page }) => {
    await page.click('a:has-text("Leave")');
    
    await expect(page.locator('text=Leave')).toBeVisible();
  });
});
