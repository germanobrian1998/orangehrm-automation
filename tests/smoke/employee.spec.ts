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
    
    // Verify we're on the employee list page - check URL
    await expect(page).toHaveURL(/.*viewEmployeeList.*/);
  });

  test('should load employee table successfully', async ({ page }) => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList');
    await page.waitForLoadState('networkidle');
    
    // Check if table is visible
    await expect(page.locator('.oxd-table')).toBeVisible({ timeout: 10000 });
  });
});
