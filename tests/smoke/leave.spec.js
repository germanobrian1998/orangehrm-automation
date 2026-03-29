"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const LoginPage_1 = require("../../src/pages/LoginPage");
const LeavePage_1 = require("../../src/pages/LeavePage");
test_1.test.describe('Leave Management Tests with Page Objects', () => {
    let loginPage;
    let leavePage;
    test_1.test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage_1.LoginPage(page);
        leavePage = new LeavePage_1.LeavePage(page);
        // Login first
        await loginPage.navigateToLogin();
        await loginPage.login('Admin', 'admin123');
        await loginPage.verifyLoginSuccess();
    });
    (0, test_1.test)('should navigate to leave module', async ({ page }) => {
        await leavePage.navigateToDashboard();
        await leavePage.verifyLeavePageLoaded();
        // Verificar que cargó correctamente
        (0, test_1.expect)(page.url()).toContain('leave');
    });
    (0, test_1.test)('should be on leave section after login', async ({ page }) => {
        // Después de login, navegamos a leave
        await leavePage.navigateToDashboard();
        await (0, test_1.expect)(page).toHaveURL(/.*leave.*/);
    });
});
//# sourceMappingURL=leave.spec.js.map