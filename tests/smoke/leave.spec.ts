import { test, expect } from '@playwright/test';

test.describe('Leave Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await page.fill('input[name="username"]', 'Admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*dashboard.*/);
    await page.waitForTimeout(2000);
  });

  test('should navigate to dashboard successfully', async ({ page }) => {
    // Verify we're on the dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);
  });

  test('should check leave dashboard accessibility', async ({ page }) => {
    // Navigate to leave module
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewLeaveModule');
    
    // Verify navigation was successful (no error page)
    await expect(page).not.toHaveURL(/.*error.*/);
  });
});
