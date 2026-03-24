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
    // Click PIM menu
    await page.click('a[href="#"] >> text=PIM');
    await page.waitForLoadState('networkidle');
    
    // Click Employee List
    await page.click('a >> text=Employee List');
    await page.waitForLoadState('networkidle');
    
    // Check if we're on the page with records
    await expect(page.locator('.oxd-table')).toBeVisible();
  });

  test('should search employee', async ({ page }) => {
    await page.click('a[href="#"] >> text=PIM');
    await page.waitForLoadState('networkidle');
    
    await page.click('a >> text=Employee List');
    await page.waitForLoadState('networkidle');
    
    // Verify table is visible
    await expect(page.locator('.oxd-table')).toBeVisible();
  });
});
