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

  test('should view leave list page', async ({ page }) => {
    // Navigate directly to leave list
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/leave/leaveList');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the leave list page
    await expect(page.locator('h6:has-text("Leave List")')).toBeVisible({ timeout: 10000 });
  });

  test('should check leave dashboard', async ({ page }) => {
    // Navigate to leave dashboard
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewLeaveModule');
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded
    await expect(page).toHaveURL(/.*leave.*/);
  });
});
