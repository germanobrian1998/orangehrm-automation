/**
 * Regression Tests - Complete Leave Workflow
 * Tests: Apply, Approve, and Verify Leave
 * Multi-role workflow (Employee + Manager)
 * 
 * @regression
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { LeaveRequestPage } from '@pages/leave-request.page';
import { EmployeeAPI } from '@api/employee.api';
import { LeaveAPI } from '@api/leave.api';
import { AdminAPI } from '@api/admin.api';
import { environment } from '@config/environment';
import { constants } from '@config/constants';

test.describe('Leave Management - Complete Workflow @regression', () => {
  
  test('Employee applies for leave and manager approves @regression', async ({ page }) => {
    // ===== SETUP =====
    const employeeAPI = new EmployeeAPI(page);
    const leaveAPI = new LeaveAPI(page);
    const loginPage = new LoginPage(page);
    const leaveRequestPage = new LeaveRequestPage(page);

    // Authenticate APIs
    await employeeAPI.authenticate(
      environment.adminUsername,
      environment.adminPassword
    );

    // Create test employee via API
    const employee = await employeeAPI.create({
      firstName: `LeaveTest_${Date.now()}`,
      lastName: 'Employee',
      employeeId: `EMPL_${Date.now().toString().slice(-6)}`,
    });

    this.logger?.info(`Employee created: ${employee.id}`);

    // ===== APPLY LEAVE =====
    // Login as admin (simulating manager)
    await loginPage.login({
      username: environment.adminUsername,
      password: environment.adminPassword,
    });

    const fromDate = constants.DATES.TOMORROW();
    const toDate = constants.DATES.TOMORROW();

    // Apply leave via API
    const leaveRequest = await leaveAPI.applyLeave({
      employeeId: employee.id,
      leaveTypeId: 1, // Annual Leave
      fromDate,
      toDate,
      comment: 'Test leave request',
    });

    expect(leaveRequest.status).toBe('PENDING');

    // ===== APPROVE LEAVE =====
    // Approve leave via API
    await leaveAPI.approveLeave(leaveRequest.id);

    // Verify status changed
    const approvedLeave = await leaveAPI.getLeaveRequest(leaveRequest.id);
    expect(approvedLeave.status).toBe('APPROVED');

    // ===== CLEANUP =====
    await employeeAPI.delete(employee.id);
  });

  test('System prevents overlapping leave requests @regression', async ({ page }) => {
    // Arrange
    const employeeAPI = new EmployeeAPI(page);
    const leaveAPI = new LeaveAPI(page);

    await employeeAPI.authenticate(
      environment.adminUsername,
      environment.adminPassword
    );

    const employee = await employeeAPI.create({
      firstName: `OverlapTest_${Date.now()}`,
      lastName: 'Employee',
      employeeId: `EMPO_${Date.now().toString().slice(-6)}`,
    });

    const fromDate = constants.DATES.TOMORROW();
    const toDate = constants.DATES.TOMORROW();

    // Act - Create first leave
    await leaveAPI.applyLeave({
      employeeId: employee.id,
      leaveTypeId: 1,
      fromDate,
      toDate,
    });

    // Act - Try to create overlapping leave
    let errorOccurred = false;
    try {
      await leaveAPI.applyLeave({
        employeeId: employee.id,
        leaveTypeId: 1,
        fromDate,
        toDate,
      });
    } catch (error) {
      errorOccurred = true;
    }

    // Assert
    expect(errorOccurred).toBe(true);

    // Cleanup
    await employeeAPI.delete(employee.id);
  });
});