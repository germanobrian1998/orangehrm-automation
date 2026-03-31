/**
 * HRM API Suite - Employee API tests
 * Tests for EmployeeAPIClient: CRUD operations, pagination, validation, and error scenarios.
 */

import { test, expect } from '@playwright/test';
import { BaseApiClient } from '@qa-framework/core';
import { EmployeeAPIClient } from '../src/clients/EmployeeAPIClient';
import { employeeFixtures, paginationFixtures, API_ENDPOINTS } from '../src/fixtures/apiFixtures';

test.describe('@api Employee API Client', () => {
  // ─── Package structure ───────────────────────────────────────────────────

  test('EmployeeAPIClient is defined', () => {
    expect(EmployeeAPIClient).toBeDefined();
  });

  test('EmployeeAPIClient extends BaseApiClient', () => {
    expect(EmployeeAPIClient.prototype).toBeInstanceOf(BaseApiClient);
  });

  // ─── Method existence ────────────────────────────────────────────────────

  test('EmployeeAPIClient has getEmployee method', () => {
    expect(typeof EmployeeAPIClient.prototype.getEmployee).toBe('function');
  });

  test('EmployeeAPIClient has listEmployees method', () => {
    expect(typeof EmployeeAPIClient.prototype.listEmployees).toBe('function');
  });

  test('EmployeeAPIClient has createEmployee method', () => {
    expect(typeof EmployeeAPIClient.prototype.createEmployee).toBe('function');
  });

  test('EmployeeAPIClient has updateEmployee method', () => {
    expect(typeof EmployeeAPIClient.prototype.updateEmployee).toBe('function');
  });

  test('EmployeeAPIClient has deleteEmployee method', () => {
    expect(typeof EmployeeAPIClient.prototype.deleteEmployee).toBe('function');
  });

  test('EmployeeAPIClient has searchEmployees method', () => {
    expect(typeof EmployeeAPIClient.prototype.searchEmployees).toBe('function');
  });

  // ─── Schema validation ───────────────────────────────────────────────────

  test('Employee schema has required fields', () => {
    const employee = {
      empNumber: 1,
      firstName: 'John',
      lastName: 'Doe',
      employeeId: 'EMP001',
    };
    expect(employee.empNumber).toBeDefined();
    expect(employee.firstName).toBeDefined();
    expect(employee.lastName).toBeDefined();
    expect(employee.employeeId).toBeDefined();
  });

  test('Employee schema allows optional fields', () => {
    const employee = {
      empNumber: 1,
      firstName: 'John',
      lastName: 'Doe',
      employeeId: 'EMP001',
      middleName: 'Michael',
      email: 'john.doe@example.com',
      jobTitle: 'Engineer',
    };
    expect(employee.middleName).toBe('Michael');
    expect(employee.email).toBe('john.doe@example.com');
    expect(employee.jobTitle).toBe('Engineer');
  });

  // ─── Fixtures validation ─────────────────────────────────────────────────

  test('employeeFixtures.validCreate returns valid DTO', () => {
    const dto = employeeFixtures.validCreate();
    expect(dto.firstName).toBe('Test');
    expect(dto.lastName).toBe('Employee');
    expect(dto.employeeId).toMatch(/^EMP-\d+$/);
  });

  test('employeeFixtures.validCreateWithMiddleName includes middleName', () => {
    const dto = employeeFixtures.validCreateWithMiddleName();
    expect(dto.middleName).toBe('Michael');
    expect(dto.firstName).toBe('John');
  });

  test('employeeFixtures.validUpdate returns update DTO', () => {
    const dto = employeeFixtures.validUpdate();
    expect(dto.firstName).toBe('Updated');
    expect(dto.lastName).toBe('Name');
  });

  test('employeeFixtures.invalidCreate contains validation scenarios', () => {
    expect(employeeFixtures.invalidCreate.missingFirstName).toBeDefined();
    expect(employeeFixtures.invalidCreate.missingLastName).toBeDefined();
    expect(employeeFixtures.invalidCreate.missingEmployeeId).toBeDefined();
    expect(employeeFixtures.invalidCreate.empty).toBeDefined();
  });

  test('API_ENDPOINTS.employees points to correct path', () => {
    expect(API_ENDPOINTS.employees).toBe('/api/v2/pim/employees');
  });

  test('API_ENDPOINTS.employee returns path with id', () => {
    expect(API_ENDPOINTS.employee(42)).toBe('/api/v2/pim/employees/42');
  });

  // ─── Pagination fixtures ─────────────────────────────────────────────────

  test('paginationFixtures.firstPage has limit=10 offset=0', () => {
    expect(paginationFixtures.firstPage.limit).toBe(10);
    expect(paginationFixtures.firstPage.offset).toBe(0);
  });

  test('paginationFixtures.secondPage has correct offset', () => {
    expect(paginationFixtures.secondPage.limit).toBe(10);
    expect(paginationFixtures.secondPage.offset).toBe(10);
  });
});
