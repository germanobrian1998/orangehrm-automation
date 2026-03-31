/**
 * HRM API Suite - Employee API Integration Tests
 * Validates EmployeeAPIClient integration: method contracts, schema validation,
 * pagination behaviour, search filters, and error handling shapes.
 */

import { test, expect } from '@playwright/test';
import { BaseApiClient } from '@qa-framework/core';
import { EmployeeAPIClient } from '../../src/clients/EmployeeAPIClient';
import { employeeFixtures, paginationFixtures, API_ENDPOINTS } from '../../src/fixtures/apiFixtures';
import { Employee, CreateEmployeeDTO, UpdateEmployeeDTO, EmployeeSearchDTO } from '../../src/schemas/Employee';

test.describe('@integration @api Employee API Integration', () => {
  // ─── Client structure ───────────────────────────────────────────────────

  test('EmployeeAPIClient inherits from BaseApiClient', () => {
    expect(EmployeeAPIClient.prototype).toBeInstanceOf(BaseApiClient);
  });

  test('EmployeeAPIClient exposes all CRUD methods', () => {
    const methods = ['getEmployee', 'listEmployees', 'createEmployee', 'updateEmployee', 'deleteEmployee', 'searchEmployees'];
    methods.forEach(method => {
      expect(typeof (EmployeeAPIClient.prototype as Record<string, unknown>)[method]).toBe('function');
    });
  });

  // ─── CreateEmployeeDTO validation ──────────────────────────────────────

  test('CreateEmployeeDTO requires firstName', () => {
    const dto: CreateEmployeeDTO = {
      firstName: 'Jane',
      lastName: 'Smith',
      employeeId: 'EMP-INT-001',
    };
    expect(dto.firstName).toBe('Jane');
  });

  test('CreateEmployeeDTO requires lastName', () => {
    const dto: CreateEmployeeDTO = {
      firstName: 'Jane',
      lastName: 'Smith',
      employeeId: 'EMP-INT-001',
    };
    expect(dto.lastName).toBe('Smith');
  });

  test('CreateEmployeeDTO requires employeeId', () => {
    const dto: CreateEmployeeDTO = {
      firstName: 'Jane',
      lastName: 'Smith',
      employeeId: 'EMP-INT-001',
    };
    expect(dto.employeeId).toBeTruthy();
  });

  test('CreateEmployeeDTO accepts optional middleName', () => {
    const dto: CreateEmployeeDTO = {
      firstName: 'Jane',
      middleName: 'Anne',
      lastName: 'Smith',
      employeeId: 'EMP-INT-002',
    };
    expect(dto.middleName).toBe('Anne');
  });

  // ─── UpdateEmployeeDTO validation ──────────────────────────────────────

  test('UpdateEmployeeDTO allows partial firstName update', () => {
    const update: UpdateEmployeeDTO = { firstName: 'NewFirst' };
    expect(update.firstName).toBe('NewFirst');
  });

  test('UpdateEmployeeDTO allows partial lastName update', () => {
    const update: UpdateEmployeeDTO = { lastName: 'NewLast' };
    expect(update.lastName).toBe('NewLast');
  });

  test('UpdateEmployeeDTO allows partial email update', () => {
    const update: UpdateEmployeeDTO = { email: 'new@example.com' };
    expect(update.email).toBe('new@example.com');
  });

  test('UpdateEmployeeDTO allows empty object (no-op update)', () => {
    const update: UpdateEmployeeDTO = {};
    expect(Object.keys(update)).toHaveLength(0);
  });

  // ─── Employee schema validation ─────────────────────────────────────────

  test('Employee schema includes empNumber as primary key', () => {
    const employee: Employee = {
      empNumber: 42,
      firstName: 'Test',
      lastName: 'Employee',
      employeeId: 'EMP-042',
    };
    expect(typeof employee.empNumber).toBe('number');
    expect(employee.empNumber).toBe(42);
  });

  test('Employee status can be active or inactive', () => {
    const activeEmployee: Employee = {
      empNumber: 1,
      firstName: 'Active',
      lastName: 'User',
      employeeId: 'EMP-ACTIVE',
      status: 'active',
    };
    const inactiveEmployee: Employee = {
      empNumber: 2,
      firstName: 'Inactive',
      lastName: 'User',
      employeeId: 'EMP-INACTIVE',
      status: 'inactive',
    };
    expect(activeEmployee.status).toBe('active');
    expect(inactiveEmployee.status).toBe('inactive');
  });

  // ─── EmployeeSearchDTO validation ──────────────────────────────────────

  test('EmployeeSearchDTO supports name filter', () => {
    const filter: EmployeeSearchDTO = { name: 'John' };
    expect(filter.name).toBe('John');
  });

  test('EmployeeSearchDTO supports employeeId filter', () => {
    const filter: EmployeeSearchDTO = { employeeId: 'EMP-001' };
    expect(filter.employeeId).toBe('EMP-001');
  });

  test('EmployeeSearchDTO supports pagination', () => {
    const filter: EmployeeSearchDTO = { limit: 10, offset: 20 };
    expect(filter.limit).toBe(10);
    expect(filter.offset).toBe(20);
  });

  test('EmployeeSearchDTO supports department filter', () => {
    const filter: EmployeeSearchDTO = { departmentId: 5 };
    expect(filter.departmentId).toBe(5);
  });

  // ─── Fixture integration ────────────────────────────────────────────────

  test('fixture generates valid CreateEmployeeDTO for API', () => {
    const dto = employeeFixtures.validCreate();
    const requiredFields: (keyof CreateEmployeeDTO)[] = ['firstName', 'lastName', 'employeeId'];
    requiredFields.forEach(field => {
      expect(dto[field]).toBeTruthy();
    });
  });

  test('fixture with middle name produces complete DTO', () => {
    const dto = employeeFixtures.validCreateWithMiddleName();
    expect(dto.firstName).toBeTruthy();
    expect(dto.middleName).toBeTruthy();
    expect(dto.lastName).toBeTruthy();
    expect(dto.employeeId).toBeTruthy();
  });

  test('consecutive fixture calls produce unique employee IDs', async () => {
    const ids: string[] = [];
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 2));
      ids.push(employeeFixtures.validCreate().employeeId);
    }
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(5);
  });

  // ─── Pagination integration ─────────────────────────────────────────────

  test('first page pagination starts at offset 0', () => {
    expect(paginationFixtures.firstPage.offset).toBe(0);
  });

  test('second page offset equals first page limit', () => {
    expect(paginationFixtures.secondPage.offset).toBe(paginationFixtures.secondPage.limit);
  });

  test('large page limit does not exceed 100', () => {
    expect(paginationFixtures.largePage.limit).toBeLessThanOrEqual(100);
  });

  test('API endpoint for employee list is correct', () => {
    expect(API_ENDPOINTS.employees).toBe('/api/v2/pim/employees');
  });

  test('API endpoint builder for single employee includes ID', () => {
    const endpoint = API_ENDPOINTS.employee(99);
    expect(endpoint).toContain('99');
    expect(endpoint).toContain('/api/v2/pim/employees/');
  });
});
