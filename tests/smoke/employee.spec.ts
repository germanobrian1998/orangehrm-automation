import { test, expect } from '@playwright/test';

test.describe('Employee Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await page.fill('input[name="username"]', 'Admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*dashboard.*/);
    await page.waitForTimeout(2000);
  });

  test('should navigate to employee list', async ({ page }) => {
    // Navigate directly to employee list
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the employee list page
    await expect(page.locator('.oxd-table')).toBeVisible({ timeout: 10000 });
  });

  test('should verify employee list page title', async ({ page }) => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList');
    await page.waitForLoadState('networkidle');
    
    // Check if the page title contains "Employee"
    await expect(page.locator('h6:has-text("Employee")')).toBeVisible({ timeout: 10000 });
  });
});
