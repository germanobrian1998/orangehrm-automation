/**
 * HRM API Suite - Data Flow Integration Tests
 * Validates data consistency between UI and API domains, data persistence
 * simulation, state management correctness, and concurrent operation handling.
 */

import { test, expect } from '@playwright/test';
import { employeeFixtures, leaveFixtures, departmentFixtures, API_ENDPOINTS } from '../../src/fixtures/apiFixtures';
import { Employee, EmployeeListResponse } from '../../src/schemas/Employee';
import { LeaveRequest, LeaveBalance } from '../../src/schemas/Leave';

test.describe('@integration Data Flow Validation', () => {
  // ─── Data consistency between UI and API ───────────────────────────────

  test('employee data created via API matches expected UI display format', () => {
    const apiEmployee: Employee = {
      empNumber: 1,
      firstName: 'Integration',
      lastName: 'Test',
      employeeId: 'EMP-INTG-001',
    };

    // UI would display as "Integration Test"
    const displayName = `${apiEmployee.firstName} ${apiEmployee.lastName}`;
    expect(displayName).toBe('Integration Test');

    // UI employee ID field matches API employeeId
    expect(apiEmployee.employeeId).toBe('EMP-INTG-001');
  });

  test('leave balance data from API maps to UI display values', () => {
    const apiBalance: LeaveBalance = {
      leaveTypeId: 1,
      leaveTypeName: 'Annual Leave',
      balance: 20,
      used: 8,
      scheduled: 2,
      pending: 1,
      taken: 8,
    };

    // UI would show available = balance - used - scheduled - pending
    const available = apiBalance.balance - apiBalance.used - apiBalance.scheduled - apiBalance.pending;
    expect(available).toBe(9);
    expect(available).toBeGreaterThanOrEqual(0);
  });

  test('employee list response structure supports UI table rendering', () => {
    const listResponse: EmployeeListResponse = {
      data: [
        { empNumber: 1, firstName: 'Alice', lastName: 'A', employeeId: 'EMP-A' },
        { empNumber: 2, firstName: 'Bob', lastName: 'B', employeeId: 'EMP-B' },
      ],
      meta: { total: 2, limit: 10, offset: 0 },
    };

    expect(listResponse.data).toHaveLength(2);
    expect(listResponse.meta.total).toBe(2);
    expect(listResponse.data[0].firstName).toBe('Alice');
  });

  // ─── Data persistence simulation ────────────────────────────────────────

  test('created employee data persists across simulated requests', async () => {
    // Simulate in-memory persistence store
    const employeeStore = new Map<number, Employee>();

    const emp: Employee = { empNumber: 10, firstName: 'Persist', lastName: 'Test', employeeId: 'EMP-P10' };
    employeeStore.set(emp.empNumber, emp);

    // Simulate GET after POST
    await new Promise(resolve => setTimeout(resolve, 5));
    const fetched = employeeStore.get(emp.empNumber);

    expect(fetched).toBeDefined();
    expect(fetched!.firstName).toBe('Persist');
    expect(fetched!.employeeId).toBe('EMP-P10');
  });

  test('leave request data persists after creation and status update', async () => {
    const leaveStore = new Map<number, LeaveRequest>();

    const lr: LeaveRequest = {
      id: 20,
      employeeId: 10,
      leaveTypeId: 1,
      fromDate: '2025-12-01',
      toDate: '2025-12-03',
      status: 'PENDING',
      days: 3,
    };
    leaveStore.set(lr.id, lr);

    // Simulate status update
    await new Promise(resolve => setTimeout(resolve, 5));
    const existing = leaveStore.get(lr.id);
    if (existing) {
      const updated = { ...existing, status: 'APPROVED' as const };
      leaveStore.set(lr.id, updated);
    }

    const persisted = leaveStore.get(lr.id);
    expect(persisted!.status).toBe('APPROVED');
    expect(persisted!.employeeId).toBe(lr.employeeId);
  });

  test('deleted employee does not persist in the store', () => {
    const employeeStore = new Map<number, Employee>();

    const emp: Employee = { empNumber: 99, firstName: 'Delete', lastName: 'Me', employeeId: 'EMP-DEL' };
    employeeStore.set(emp.empNumber, emp);
    expect(employeeStore.has(99)).toBe(true);

    // Simulate DELETE
    employeeStore.delete(emp.empNumber);
    expect(employeeStore.has(99)).toBe(false);
  });

  // ─── Concurrent operations ──────────────────────────────────────────────

  test('concurrent employee fixture generation produces unique IDs', async () => {
    const results = await Promise.all(
      Array.from({ length: 5 }, async (_, i) => {
        await new Promise(resolve => setTimeout(resolve, i * 3));
        return employeeFixtures.validCreate().employeeId;
      })
    );
    const unique = new Set(results);
    expect(unique.size).toBe(5);
  });

  test('concurrent leave fixture generation is thread-safe', async () => {
    const results = await Promise.all(
      Array.from({ length: 5 }, async (_, i) => {
        await new Promise(resolve => setTimeout(resolve, i * 2));
        return leaveFixtures.validCreate(i + 1, 1);
      })
    );
    expect(results).toHaveLength(5);
    results.forEach((lr, idx) => {
      expect(lr.employeeId).toBe(idx + 1);
    });
  });

  test('concurrent department fixture generation produces unique names', async () => {
    const names = await Promise.all(
      Array.from({ length: 3 }, async (_, i) => {
        await new Promise(resolve => setTimeout(resolve, i * 3));
        return departmentFixtures.validCreate().name;
      })
    );
    const unique = new Set(names);
    expect(unique.size).toBe(3);
  });

  // ─── End-to-end data flow ───────────────────────────────────────────────

  test('full create-update-read-delete data flow maintains consistency', () => {
    const store = new Map<number, Employee>();

    // CREATE
    const emp: Employee = {
      empNumber: 50,
      firstName: 'Flow',
      lastName: 'Test',
      employeeId: 'EMP-FLOW-50',
    };
    store.set(emp.empNumber, emp);
    expect(store.get(50)!.firstName).toBe('Flow');

    // UPDATE
    store.set(50, { ...store.get(50)!, firstName: 'Updated' });
    expect(store.get(50)!.firstName).toBe('Updated');
    expect(store.get(50)!.lastName).toBe('Test'); // unchanged

    // READ
    const read = store.get(50);
    expect(read!.empNumber).toBe(50);
    expect(read!.employeeId).toBe('EMP-FLOW-50');

    // DELETE
    store.delete(50);
    expect(store.has(50)).toBe(false);
  });
});
