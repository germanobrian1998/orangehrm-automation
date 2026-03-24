import { test, expect } from '@playwright/test';

// Smoke tests for OrangeHRM login functionality
test.describe('OrangeHRM Login Smoke Tests', () => {
    test('Login with valid credentials', async ({ page }) => {
        await page.goto('https://example.orangehrm.com'); // Replace with actual URL
        await page.fill('input[name="username"]', 'valid_username'); // Use a valid username
        await page.fill('input[name="password"]', 'valid_password'); // Use a valid password
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/dashboard/); // Adjust based on expected URL
        await expect(page.locator('h1')).toHaveText('Dashboard'); // Verify dashboard is displayed
    });

    test('Login with invalid credentials', async ({ page }) => {
        await page.goto('https://example.orangehrm.com'); // Replace with actual URL
        await page.fill('input[name="username"]', 'invalid_username'); // Use an invalid username
        await page.fill('input[name="password"]', 'invalid_password'); // Use an invalid password
        await page.click('button[type="submit"]');
        await expect(page.locator('.alert-danger')).toBeVisible(); // Adjust for actual error message locator
        await expect(page.locator('.alert-danger')).toHaveText('Invalid credentials'); // Adjust based on expected error message
    });
});
