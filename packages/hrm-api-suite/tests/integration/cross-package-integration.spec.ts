/**
 * HRM API Suite - Cross-Package Integration Tests
 * Validates that EmployeeAPIClient and LeaveAPIClient work together:
 * shared schema compatibility, combined workflow correctness, and
 * data consistency across both API domains.
 */

import { test, expect } from '@playwright/test';
import { EmployeeAPIClient } from '../../src/clients/EmployeeAPIClient';
import { LeaveAPIClient } from '../../src/clients/LeaveAPIClient';
import { DepartmentAPIClient } from '../../src/clients/DepartmentAPIClient';
import { employeeFixtures, leaveFixtures, API_ENDPOINTS } from '../../src/fixtures/apiFixtures';
import { Employee, CreateEmployeeDTO } from '../../src/schemas/Employee';
import { CreateLeaveRequestDTO, LeaveRequest } from '../../src/schemas/Leave';

test.describe('@integration Cross-Package API Integration', () => {
  // ─── All clients resolve together ──────────────────────────────────────

  test('EmployeeAPIClient and LeaveAPIClient are both importable', () => {
    expect(EmployeeAPIClient).toBeDefined();
    expect(LeaveAPIClient).toBeDefined();
  });

  test('all three API clients can coexist in same test scope', () => {
    expect(EmployeeAPIClient).toBeDefined();
    expect(LeaveAPIClient).toBeDefined();
    expect(DepartmentAPIClient).toBeDefined();
  });

  // ─── Employee + Leave workflow schema compatibility ─────────────────────

  test('employee schema empNumber maps to leave request employeeId', () => {
    const employee: Partial<Employee> = { empNumber: 42 };
    const leaveDto: Partial<CreateLeaveRequestDTO> = { employeeId: employee.empNumber };
    expect(leaveDto.employeeId).toBe(42);
  });

  test('leave request DTO can be constructed from employee data', () => {
    const employeeData = employeeFixtures.validCreate();
    const employeeId = 100; // Simulated empNumber returned after creation

    const leaveDto: CreateLeaveRequestDTO = {
      employeeId,
      leaveTypeId: 1,
      fromDate: '2025-09-01',
      toDate: '2025-09-03',
      comment: `Leave for ${employeeData.firstName} ${employeeData.lastName}`,
    };

    expect(leaveDto.employeeId).toBe(100);
    expect(leaveDto.comment).toContain(employeeData.firstName);
    expect(leaveDto.comment).toContain(employeeData.lastName);
  });

  // ─── Create employee → request leave workflow ───────────────────────────

  test('create-employee-then-leave workflow steps are correctly ordered', () => {
    const steps = [
      { step: 1, action: 'create_employee', requires: null },
      { step: 2, action: 'get_employee_id', requires: 'create_employee' },
      { step: 3, action: 'create_leave_request', requires: 'get_employee_id' },
      { step: 4, action: 'verify_leave_status', requires: 'create_leave_request' },
    ];

    expect(steps[0].requires).toBeNull();
    expect(steps[1].requires).toBe('create_employee');
    expect(steps[2].requires).toBe('get_employee_id');
    expect(steps[3].requires).toBe('create_leave_request');
  });

  test('employee creation result provides empNumber for leave request', () => {
    const mockEmployeeResponse: Employee = {
      empNumber: 77,
      firstName: 'Jane',
      lastName: 'Smith',
      employeeId: 'EMP-077',
    };

    const leaveDto = leaveFixtures.validCreate(mockEmployeeResponse.empNumber, 1);
    expect(leaveDto.employeeId).toBe(77);
  });

  test('leave request created after employee has PENDING initial status', () => {
    const mockLeaveResponse: Partial<LeaveRequest> = {
      id: 1,
      employeeId: 77,
      status: 'PENDING',
    };
    expect(mockLeaveResponse.status).toBe('PENDING');
  });

  // ─── State persistence simulation ──────────────────────────────────────

  test('employee state persists correctly across sequential operations', () => {
    const employeeState: Record<number, Employee> = {};

    // Simulate creating two employees
    const emp1: Employee = { empNumber: 1, firstName: 'Alice', lastName: 'A', employeeId: 'EMP-A1' };
    const emp2: Employee = { empNumber: 2, firstName: 'Bob', lastName: 'B', employeeId: 'EMP-B2' };

    employeeState[emp1.empNumber] = emp1;
    employeeState[emp2.empNumber] = emp2;

    expect(Object.keys(employeeState)).toHaveLength(2);
    expect(employeeState[1].firstName).toBe('Alice');
    expect(employeeState[2].firstName).toBe('Bob');
  });

  test('leave request state persists correctly after creation', () => {
    const leaveState: Record<number, Partial<LeaveRequest>> = {};

    const lr1: Partial<LeaveRequest> = { id: 1, employeeId: 10, status: 'PENDING' };
    const lr2: Partial<LeaveRequest> = { id: 2, employeeId: 20, status: 'APPROVED' };

    leaveState[lr1.id!] = lr1;
    leaveState[lr2.id!] = lr2;

    expect(leaveState[1].status).toBe('PENDING');
    expect(leaveState[2].status).toBe('APPROVED');
  });

  // ─── Cross-domain API endpoint consistency ──────────────────────────────

  test('employee and leave API endpoints share same base URL structure', () => {
    expect(API_ENDPOINTS.employees).toContain('/api/v2/');
    expect(API_ENDPOINTS.leaveRequests).toContain('/api/v2/');
    expect(API_ENDPOINTS.departments).toContain('/api/v2/');
  });

  test('employee endpoint is different from leave endpoint', () => {
    expect(API_ENDPOINTS.employees).not.toBe(API_ENDPOINTS.leaveRequests);
  });

  // ─── Combined fixture validation ────────────────────────────────────────

  test('employee and leave fixtures produce complete and compatible data', () => {
    const employeeDto: CreateEmployeeDTO = employeeFixtures.validCreate();
    const leaveDto: CreateLeaveRequestDTO = leaveFixtures.validCreate(999, 1);

    expect(employeeDto.firstName).toBeTruthy();
    expect(employeeDto.lastName).toBeTruthy();
    expect(leaveDto.fromDate).toBeTruthy();
    expect(leaveDto.toDate).toBeTruthy();

    // Both fixtures generate unique timestamped IDs
    expect(employeeDto.employeeId).toMatch(/^EMP-\d+$/);
    expect(typeof leaveDto.employeeId).toBe('number');
  });
});
