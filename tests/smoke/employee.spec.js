"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const LoginPage_1 = require("../../src/pages/LoginPage");
const EmployeePage_1 = require("../../src/pages/EmployeePage");
test_1.test.describe('Employee Management Tests with Page Objects', () => {
    let loginPage;
    let employeePage;
    test_1.test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage_1.LoginPage(page);
        employeePage = new EmployeePage_1.EmployeePage(page);
        // Login first
        await loginPage.navigateToLogin();
        await loginPage.login('Admin', 'admin123');
        await loginPage.verifyLoginSuccess();
    });
    (0, test_1.test)('should navigate to employee list', async () => {
        await employeePage.navigateToEmployeeList();
        const isTableVisible = await employeePage.verifyEmployeeTableVisible();
        (0, test_1.expect)(isTableVisible).toBe(true);
    });
    (0, test_1.test)('should verify employee list page loads', async ({ page }) => {
        await employeePage.navigateToEmployeeList();
        // Verificar que estamos en la página correcta
        await (0, test_1.expect)(page).toHaveURL(/.*viewEmployeeList.*/);
    });
    (0, test_1.test)('should display employee section', async ({ page }) => {
        await employeePage.navigateToEmployeeList();
        // Verificar que la tabla está visible
        const table = await employeePage.verifyEmployeeTableVisible();
        (0, test_1.expect)(table).toBe(true);
    });
});
//# sourceMappingURL=employee.spec.js.map