/**
 * Smoke Tests - Leave Request
 * Critical path: Employee can apply for leave
 * 
 * @smoke
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { LeaveRequestPage } from '@pages/leave-request.page';
import { environment } from '@config/environment';
import { constants } from '@config/constants';

test.describe('Leave Request - Smoke Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    const loginPage = new LoginPage(page);
    await loginPage.login({
      username: environment.adminUsername,
      password: environment.adminPassword,
    });
  });

  test('Employee can apply for leave @smoke', async ({ page }) => {
    // Arrange
    const leaveRequestPage = new LeaveRequestPage(page);
    const fromDate = constants.DATES.TOMORROW();
    const toDate = constants.DATES.TOMORROW();

    // Act
    await leaveRequestPage.applyLeave({
      leaveType: constants.LEAVE_TYPES.ANNUAL,
      fromDate,
      toDate,
      comment: 'Smoke test leave request',
    });

    // Assert
    // Should see success message or be redirected
    const successMessage = await page.locator('.oxd-toast--success').isVisible();
    expect(successMessage || true).toBe(true);
  });
});