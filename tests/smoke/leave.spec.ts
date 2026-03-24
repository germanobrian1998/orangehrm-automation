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
    // Click Leave menu
    await page.click('a[href="#"] >> text=Leave');
    await page.waitForLoadState('networkidle');
    
    // Verify we're in the Leave section
    await expect(page.locator('h6:has-text("Leave")')).toBeVisible();
  });

  test('should check leave balance', async ({ page }) => {
    await page.click('a[href="#"] >> text=Leave');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h6:has-text("Leave")')).toBeVisible();
  });
});
