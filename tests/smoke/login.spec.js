"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const LoginPage_1 = require("../../src/pages/LoginPage");
test_1.test.describe('Login Tests with Page Objects', () => {
    let loginPage;
    test_1.test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage_1.LoginPage(page);
        await loginPage.navigateToLogin();
    });
    (0, test_1.test)('should login with valid credentials', async () => {
        await loginPage.login('Admin', 'admin123');
        await loginPage.verifyLoginSuccess();
    });
    (0, test_1.test)('should handle invalid credentials gracefully', async ({ page }) => {
        await loginPage.login('invalid', 'wrongpass');
        // Esperar a que ocurra algo (error o redirección)
        await page.waitForTimeout(2000);
        // Verificar que NO estamos en dashboard
        const url = page.url();
        (0, test_1.expect)(url).not.toContain('dashboard');
    });
    (0, test_1.test)('should display validation for empty fields', async () => {
        await loginPage.clickButton('button[type="submit"]');
        await loginPage.verifyValidationError();
    });
});
//# sourceMappingURL=login.spec.js.map