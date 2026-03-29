"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
test_1.test.describe('Cross-Browser Login Tests', () => {
    (0, test_1.test)('should login successfully in all browsers', async ({ page }) => {
        await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
        await page.fill('input[name="username"]', 'Admin');
        await page.fill('input[name="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await (0, test_1.expect)(page).toHaveURL(/.*dashboard.*/);
    });
    (0, test_1.test)('should display error message on invalid login', async ({ page }) => {
        await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
        await page.fill('input[name="username"]', 'invalid');
        await page.fill('input[name="password"]', 'invalid');
        await page.click('button[type="submit"]');
        await (0, test_1.expect)(page.locator('.oxd-alert')).toBeVisible();
    });
});
//# sourceMappingURL=login-cross-browser.spec.js.map