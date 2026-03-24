import { test, expect } from '@playwright/test';

const browsers = ['chromium', 'firefox', 'webkit'];

browsers.forEach(browserType => {
    test.describe(`Cross-browser testing with ${browserType}`, () => {
        test('Login test', async ({ browser }) => {
            const context = await browser.newContext();
            const page = await context.newPage();
            await page.goto('https://example.com/login');
            await page.fill('input[name="username"]', 'your_username_here');
            await page.fill('input[name="password"]', 'your_password_here');
            await page.click('button[type="submit"]');
            await expect(page).toHaveURL('https://example.com/dashboard');
            await context.close();
        });
    });
});