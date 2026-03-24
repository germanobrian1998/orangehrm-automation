import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { LeavePage } from '../../src/pages/LeavePage';

test.describe('Leave Management Tests with Page Objects', () => {
  let loginPage: LoginPage;
  let leavePage: LeavePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    leavePage = new LeavePage(page);
    
    // Login first
    await loginPage.navigateToLogin();
    await loginPage.login('Admin', 'admin123');
    await loginPage.verifyLoginSuccess();
  });

  test('should navigate to leave module', async ({ page }) => {
    await leavePage.navigateToDashboard();
    await leavePage.verifyLeavePageLoaded();
    
    // Verificar que cargó correctamente
    expect(page.url()).toContain('leave');
  });

  test('should be on leave section after login', async ({ page }) => {
    // Después de login, navegamos a leave
    await leavePage.navigateToDashboard();
    
    await expect(page).toHaveURL(/.*leave.*/);
  });
});
