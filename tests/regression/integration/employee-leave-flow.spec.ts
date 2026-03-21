/**
 * Integration Tests - Employee Leave Flow
 * Tests complete workflow: Create Employee → Apply Leave → Approve
 * Multi-module, multi-role interaction
 * 
 * @regression
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { EmployeeAPI } from '@api/employee.api';
import { LeaveAPI } from '@api/leave.api';
import { AdminAPI } from '@api/admin.api';
import { environment } from '@config/environment';
import { constants } from '@config/constants';

test.describe('Integration - Employee Leave Complete Flow @regression', () => {
  
  test('Complete workflow: Create employee > Apply leave > Approve @regression', async ({ page }) => {
    // ===== SETUP =====
    const employeeAPI = new EmployeeAPI(page);
    const leaveAPI = new LeaveAPI(page);
    const loginPage = new LoginPage(page);

    await employeeAPI.authenticate(
      environment.adminUsername,
      environment.adminPassword
    );

    // ===== STEP 1: Create Employee via API =====
    const employee = await employeeAPI.create({
      firstName: `IntegrationTest_${Date.now()}`,
      lastName: 'Employee',
      employeeId: `EMPI_${Date.now().toString().slice(-6)}`,
    });
    expect(employee.id).toBeTruthy();

    // ===== STEP 2: Get initial leave balance =====
    const initialBalance = await leaveAPI.getLeaveBalance(employee.id, 1);
    expect(initialBalance.balance).toBeGreaterThan(0);
    const initialBalanceValue = initialBalance.balance;

    // ===== STEP 3: Apply leave via API =====
    const fromDate = constants.DATES.TOMORROW();
    const toDate = constants.DATES.TOMORROW();

    const leaveRequest = await leaveAPI.applyLeave({
      employeeId: employee.id,
      leaveTypeId: 1,
      fromDate,
      toDate,
      comment: 'Integration test leave',
    });
    expect(leaveRequest.status).toBe('PENDING');

    // ===== STEP 4: Approve leave =====
    await leaveAPI.approveLeave(leaveRequest.id);

    const approvedLeave = await leaveAPI.getLeaveRequest(leaveRequest.id);
    expect(approvedLeave.status).toBe('APPROVED');

    // ===== STEP 5: Verify balance updated =====
    const updatedBalance = await leaveAPI.getLeaveBalance(employee.id, 1);
    expect(updatedBalance.balance).toBe(initialBalanceValue - 1);

    // ===== CLEANUP =====
    await employeeAPI.delete(employee.id);
  });
});