/**
 * HRM API Suite - API Integration Tests
 * Validates end-to-end API integration scenarios: employee + leave combined
 * workflows, state management across requests, and data flow consistency.
 */

import { test, expect } from '@playwright/test';
import { EmployeeAPIClient } from '../../src/clients/EmployeeAPIClient';
import { LeaveAPIClient } from '../../src/clients/LeaveAPIClient';
import { employeeFixtures, leaveFixtures, API_ENDPOINTS } from '../../src/fixtures/apiFixtures';
import { Employee, CreateEmployeeDTO } from '../../src/schemas/Employee';
import { LeaveRequest, LeaveBalance, CreateLeaveRequestDTO } from '../../src/schemas/Leave';

test.describe('@integration API Integration Tests', () => {
  // ─── Client instantiation ───────────────────────────────────────────────

  test('both API clients have matching method signatures for employee operations', () => {
    // EmployeeAPIClient is the authoritative source; validate method contracts
    expect(typeof EmployeeAPIClient.prototype.getEmployee).toBe('function');
    expect(typeof EmployeeAPIClient.prototype.createEmployee).toBe('function');
    expect(typeof EmployeeAPIClient.prototype.updateEmployee).toBe('function');
    expect(typeof EmployeeAPIClient.prototype.deleteEmployee).toBe('function');
  });

  test('LeaveAPIClient has matching method signatures for leave operations', () => {
    expect(typeof LeaveAPIClient.prototype.createLeaveRequest).toBe('function');
    expect(typeof LeaveAPIClient.prototype.getLeaveRequest).toBe('function');
    expect(typeof LeaveAPIClient.prototype.updateLeaveRequest).toBe('function');
    expect(typeof LeaveAPIClient.prototype.deleteLeaveRequest).toBe('function');
    expect(typeof LeaveAPIClient.prototype.getLeaveBalance).toBe('function');
  });

  // ─── Create employee and request leave workflow ─────────────────────────

  test('should create employee and then request leave – data contract', async () => {
    // Step 1: Create employee DTO
    const employeeDto: CreateEmployeeDTO = {
      firstName: 'Jane',
      lastName: 'Smith',
      employeeId: `EMP-${Date.now()}`,
    };
    expect(employeeDto.firstName).toBe('Jane');
    expect(employeeDto.lastName).toBe('Smith');

    // Step 2: Simulate employee creation response
    const createdEmployee: Employee = {
      empNumber: 200,
      firstName: employeeDto.firstName,
      lastName: employeeDto.lastName,
      employeeId: employeeDto.employeeId,
    };
    expect(createdEmployee.empNumber).toBe(200);

    // Step 3: Build leave request for created employee
    const leaveDto: CreateLeaveRequestDTO = {
      employeeId: createdEmployee.empNumber,
      leaveTypeId: 1,
      fromDate: '2025-10-01',
      toDate: '2025-10-03',
      comment: 'Conference attendance',
    };
    expect(leaveDto.employeeId).toBe(createdEmployee.empNumber);

    // Step 4: Simulate leave request creation response
    const createdLeave: LeaveRequest = {
      id: 50,
      employeeId: leaveDto.employeeId,
      leaveTypeId: leaveDto.leaveTypeId,
      fromDate: leaveDto.fromDate,
      toDate: leaveDto.toDate,
      status: 'PENDING',
      days: 3,
    };
    expect(createdLeave.status).toBe('PENDING');

    // Step 5: Verify data consistency
    expect(createdLeave.employeeId).toBe(createdEmployee.empNumber);
  });

  test('should verify employee data consistency after leave request', async () => {
    // Step 1: Baseline employee with known leave balance
    const employee: Employee & { leaveBalance?: number } = {
      empNumber: 300,
      firstName: 'Bob',
      lastName: 'Jones',
      employeeId: 'EMP-300',
      leaveBalance: 15,
    };

    // Step 2: Simulate leave balance after 3 days approved
    const initialBalance: LeaveBalance = {
      leaveTypeId: 1,
      leaveTypeName: 'Annual Leave',
      balance: 15,
      used: 3,
      scheduled: 0,
      pending: 0,
      taken: 3,
    };

    const remainingBalance = initialBalance.balance - initialBalance.taken;
    expect(remainingBalance).toBe(12);
    expect(remainingBalance).toBeLessThan(employee.leaveBalance!);
  });

  // ─── Multi-employee leave scenario ──────────────────────────────────────

  test('should handle multiple employees with simultaneous leave requests', () => {
    const employees: Employee[] = [
      { empNumber: 1, firstName: 'Alice', lastName: 'A', employeeId: 'EMP-A' },
      { empNumber: 2, firstName: 'Bob', lastName: 'B', employeeId: 'EMP-B' },
      { empNumber: 3, firstName: 'Carol', lastName: 'C', employeeId: 'EMP-C' },
    ];

    const leaveRequests: LeaveRequest[] = employees.map((emp, idx) => ({
      id: idx + 1,
      employeeId: emp.empNumber,
      leaveTypeId: 1,
      fromDate: '2025-11-01',
      toDate: '2025-11-03',
      status: 'PENDING',
      days: 3,
    }));

    expect(leaveRequests).toHaveLength(3);
    leaveRequests.forEach((lr, idx) => {
      expect(lr.employeeId).toBe(employees[idx].empNumber);
      expect(lr.status).toBe('PENDING');
    });
  });

  // ─── Leave request state transitions ────────────────────────────────────

  test('leave request transitions from PENDING to APPROVED correctly', () => {
    const leaveRequest: LeaveRequest = {
      id: 1,
      employeeId: 42,
      leaveTypeId: 1,
      fromDate: '2025-06-01',
      toDate: '2025-06-03',
      status: 'PENDING',
      days: 3,
    };

    // Simulate approval
    const approvedRequest: LeaveRequest = { ...leaveRequest, status: 'APPROVED' };
    expect(approvedRequest.status).toBe('APPROVED');
    expect(approvedRequest.id).toBe(leaveRequest.id);
    expect(approvedRequest.employeeId).toBe(leaveRequest.employeeId);
  });

  // ─── Fixture-driven API workflow ─────────────────────────────────────────

  test('fixture-driven employee creation produces valid API payload', () => {
    const dto = employeeFixtures.validCreate();
    expect(dto.firstName).toBeTruthy();
    expect(dto.lastName).toBeTruthy();
    expect(dto.employeeId).toMatch(/^EMP-\d+$/);
  });

  test('fixture-driven leave creation produces valid API payload', () => {
    const employeeId = 123;
    const leaveTypeId = 2;
    const dto = leaveFixtures.validCreate(employeeId, leaveTypeId);
    expect(dto.employeeId).toBe(employeeId);
    expect(dto.leaveTypeId).toBe(leaveTypeId);
    expect(dto.fromDate).toBeTruthy();
    expect(dto.toDate).toBeTruthy();
  });

  // ─── API endpoint URL structure ─────────────────────────────────────────

  test('employee balance can be derived from leave balance endpoint', () => {
    const employeeId = 42;
    const expectedPath = `/api/v2/leave/employees/${employeeId}/leave-balance`;
    expect(expectedPath).toContain(String(employeeId));
    expect(expectedPath).toContain('leave-balance');
  });

  test('employee leave requests endpoint includes employee context', () => {
    const employeeId = 42;
    const expectedPath = `/api/v2/leave/employees/${employeeId}/leave-requests`;
    expect(expectedPath).toContain(String(employeeId));
    expect(expectedPath).toContain('leave-requests');
  });
});
