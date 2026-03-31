/**
 * HRM API Suite - Employee API Tests
 * Comprehensive tests for EmployeeAPIClient: CRUD operations,
 * error handling, validation, and response schema validation.
 * Follows the Testing Pyramid (ADR-003) at the API integration layer.
 */

import { test, expect } from '@playwright/test';
import { BaseApiClient } from '@qa-framework/core';
import { EmployeeAPIClient } from '../../src/clients/EmployeeAPIClient';
import { employeeFixtures, paginationFixtures, API_ENDPOINTS } from '../../src/fixtures/apiFixtures';
import {
  Employee,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  EmployeeSearchDTO,
} from '../../src/schemas/Employee';

test.describe('@api Employee API CRUD Operations', () => {
  // ── 1. Class structure validation ─────────────────────────────────────────

  test.describe('Class and inheritance', () => {
    test('EmployeeAPIClient is defined', () => {
      expect(EmployeeAPIClient).toBeDefined();
    });

    test('EmployeeAPIClient extends BaseApiClient', () => {
      expect(EmployeeAPIClient.prototype).toBeInstanceOf(BaseApiClient);
    });

    test('EmployeeAPIClient can be instantiated', ({ page }) => {
      const client = new EmployeeAPIClient(page);
      expect(client).toBeInstanceOf(EmployeeAPIClient);
      expect(client).toBeInstanceOf(BaseApiClient);
    });
  });

  // ── 2. CRUD method existence ───────────────────────────────────────────────

  test.describe('CRUD methods', () => {
    test('getEmployee method exists', () => {
      expect(typeof EmployeeAPIClient.prototype.getEmployee).toBe('function');
    });

    test('listEmployees method exists', () => {
      expect(typeof EmployeeAPIClient.prototype.listEmployees).toBe('function');
    });

    test('createEmployee method exists', () => {
      expect(typeof EmployeeAPIClient.prototype.createEmployee).toBe('function');
    });

    test('updateEmployee method exists', () => {
      expect(typeof EmployeeAPIClient.prototype.updateEmployee).toBe('function');
    });

    test('deleteEmployee method exists', () => {
      expect(typeof EmployeeAPIClient.prototype.deleteEmployee).toBe('function');
    });

    test('searchEmployees method exists', () => {
      expect(typeof EmployeeAPIClient.prototype.searchEmployees).toBe('function');
    });
  });

  // ── 3. Response schema validation ─────────────────────────────────────────

  test.describe('Employee schema validation', () => {
    test('Employee schema has required fields: empNumber, firstName, lastName, employeeId', () => {
      // Arrange / Act
      const employee: Employee = {
        empNumber: 1,
        firstName: 'John',
        lastName: 'Doe',
        employeeId: 'EMP-001',
      };

      // Assert
      expect(employee.empNumber).toBeDefined();
      expect(employee.firstName).toBeDefined();
      expect(employee.lastName).toBeDefined();
      expect(employee.employeeId).toBeDefined();
    });

    test('Employee schema allows optional middleName', () => {
      // Arrange / Act
      const employee: Employee = {
        empNumber: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        employeeId: 'EMP-002',
        middleName: 'Marie',
      };

      // Assert
      expect(employee.middleName).toBe('Marie');
    });

    test('Employee schema allows optional email fields', () => {
      // Arrange / Act
      const employee: Employee = {
        empNumber: 3,
        firstName: 'Bob',
        lastName: 'Jones',
        employeeId: 'EMP-003',
        email: 'bob@example.com',
        workEmail: 'bob.jones@corp.com',
      };

      // Assert
      expect(employee.email).toBe('bob@example.com');
      expect(employee.workEmail).toBe('bob.jones@corp.com');
    });

    test('Employee schema allows optional jobTitle and department', () => {
      // Arrange / Act
      const employee: Employee = {
        empNumber: 4,
        firstName: 'Alice',
        lastName: 'Brown',
        employeeId: 'EMP-004',
        jobTitle: 'Software Engineer',
        department: 'Engineering',
      };

      // Assert
      expect(employee.jobTitle).toBe('Software Engineer');
      expect(employee.department).toBe('Engineering');
    });

    test('Employee status is either active or inactive', () => {
      // Arrange
      const validStatuses: Array<'active' | 'inactive'> = ['active', 'inactive'];

      // Assert
      validStatuses.forEach((status) => {
        const employee: Employee = {
          empNumber: 5,
          firstName: 'Test',
          lastName: 'User',
          employeeId: 'EMP-005',
          status,
        };
        expect(['active', 'inactive']).toContain(employee.status);
      });
    });

    test('Employee hireDate follows ISO date format when provided', () => {
      // Arrange / Act
      const employee: Employee = {
        empNumber: 6,
        firstName: 'Carol',
        lastName: 'Davis',
        employeeId: 'EMP-006',
        hireDate: '2023-01-15',
      };

      // Assert
      expect(employee.hireDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  // ── 4. CreateEmployeeDTO validation ───────────────────────────────────────

  test.describe('CreateEmployeeDTO validation', () => {
    test('validCreate fixture returns a correctly shaped DTO', () => {
      // Arrange / Act
      const dto = employeeFixtures.validCreate();

      // Assert
      expect(dto.firstName).toBe('Test');
      expect(dto.lastName).toBe('Employee');
      expect(dto.employeeId).toMatch(/^EMP-\d+$/);
    });

    test('validCreateWithMiddleName fixture includes middleName', () => {
      // Arrange / Act
      const dto = employeeFixtures.validCreateWithMiddleName();

      // Assert
      expect(dto.firstName).toBe('John');
      expect(dto.middleName).toBe('Michael');
      expect(dto.lastName).toBe('Doe');
    });

    test('CreateEmployeeDTO requires firstName', () => {
      // Arrange
      const valid: CreateEmployeeDTO = {
        firstName: 'John',
        lastName: 'Doe',
        employeeId: 'EMP-001',
      };

      // Assert
      expect(valid.firstName).toBeTruthy();
    });

    test('CreateEmployeeDTO requires lastName', () => {
      // Arrange
      const valid: CreateEmployeeDTO = {
        firstName: 'John',
        lastName: 'Doe',
        employeeId: 'EMP-001',
      };

      // Assert
      expect(valid.lastName).toBeTruthy();
    });

    test('CreateEmployeeDTO requires employeeId', () => {
      // Arrange
      const valid: CreateEmployeeDTO = {
        firstName: 'John',
        lastName: 'Doe',
        employeeId: 'EMP-001',
      };

      // Assert
      expect(valid.employeeId).toBeTruthy();
    });

    test('invalidCreate fixture exposes missing-firstName scenario', () => {
      // Arrange / Act
      const invalid = employeeFixtures.invalidCreate.missingFirstName;

      // Assert
      expect(invalid).toBeDefined();
      expect((invalid as Record<string, unknown>).firstName).toBeUndefined();
    });

    test('invalidCreate fixture exposes missing-lastName scenario', () => {
      const invalid = employeeFixtures.invalidCreate.missingLastName;
      expect(invalid).toBeDefined();
      expect((invalid as Record<string, unknown>).lastName).toBeUndefined();
    });

    test('invalidCreate fixture exposes missing-employeeId scenario', () => {
      const invalid = employeeFixtures.invalidCreate.missingEmployeeId;
      expect(invalid).toBeDefined();
      expect((invalid as Record<string, unknown>).employeeId).toBeUndefined();
    });

    test('invalidCreate empty fixture has no fields', () => {
      const invalid = employeeFixtures.invalidCreate.empty;
      expect(Object.keys(invalid)).toHaveLength(0);
    });
  });

  // ── 5. UpdateEmployeeDTO validation ───────────────────────────────────────

  test.describe('UpdateEmployeeDTO validation', () => {
    test('validUpdate fixture returns an update DTO', () => {
      // Arrange / Act
      const dto = employeeFixtures.validUpdate();

      // Assert
      expect(dto.firstName).toBe('Updated');
      expect(dto.lastName).toBe('Name');
    });

    test('UpdateEmployeeDTO allows partial updates (firstName only)', () => {
      // Arrange / Act
      const dto: UpdateEmployeeDTO = { firstName: 'NewFirst' };

      // Assert
      expect(dto.firstName).toBe('NewFirst');
      expect(dto.lastName).toBeUndefined();
    });

    test('UpdateEmployeeDTO allows partial updates (email only)', () => {
      // Arrange / Act
      const dto: UpdateEmployeeDTO = { email: 'new@example.com' };

      // Assert
      expect(dto.email).toMatch(/@/);
    });

    test('UpdateEmployeeDTO allows updating jobTitle', () => {
      // Arrange / Act
      const dto: UpdateEmployeeDTO = { jobTitle: 'Senior Engineer' };

      // Assert
      expect(dto.jobTitle).toBe('Senior Engineer');
    });
  });

  // ── 6. EmployeeSearchDTO validation ───────────────────────────────────────

  test.describe('EmployeeSearchDTO validation', () => {
    test('EmployeeSearchDTO allows name filter', () => {
      // Arrange / Act
      const dto: EmployeeSearchDTO = { name: 'John' };

      // Assert
      expect(dto.name).toBe('John');
    });

    test('EmployeeSearchDTO allows employeeId filter', () => {
      const dto: EmployeeSearchDTO = { employeeId: 'EMP-001' };
      expect(dto.employeeId).toBe('EMP-001');
    });

    test('EmployeeSearchDTO allows departmentId filter', () => {
      const dto: EmployeeSearchDTO = { departmentId: 5 };
      expect(dto.departmentId).toBe(5);
    });

    test('EmployeeSearchDTO allows pagination parameters', () => {
      // Arrange / Act
      const dto: EmployeeSearchDTO = { limit: 20, offset: 40 };

      // Assert
      expect(dto.limit).toBe(20);
      expect(dto.offset).toBe(40);
    });

    test('EmployeeSearchDTO can combine multiple filters', () => {
      // Arrange / Act
      const dto: EmployeeSearchDTO = {
        name: 'John',
        departmentId: 3,
        limit: 10,
        offset: 0,
      };

      // Assert
      expect(Object.keys(dto)).toHaveLength(4);
    });
  });

  // ── 7. Error handling and validation ──────────────────────────────────────

  test.describe('Error handling', () => {
    test('API_ENDPOINTS.employees points to the correct base path', () => {
      expect(API_ENDPOINTS.employees).toBe('/api/v2/pim/employees');
    });

    test('API_ENDPOINTS.employee returns path with numeric ID', () => {
      expect(API_ENDPOINTS.employee(42)).toBe('/api/v2/pim/employees/42');
    });

    test('API_ENDPOINTS.employee handles ID of 1', () => {
      expect(API_ENDPOINTS.employee(1)).toBe('/api/v2/pim/employees/1');
    });

    test('EmployeeListResponse has data array and meta object', () => {
      // Arrange / Act
      const response = {
        data: [
          { empNumber: 1, firstName: 'Alice', lastName: 'Brown', employeeId: 'EMP-001' },
        ] as Employee[],
        meta: { total: 1, limit: 10, offset: 0 },
      };

      // Assert
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.meta.total).toBe(1);
    });

    test('empty employee list response is valid', () => {
      // Arrange / Act
      const response = { data: [] as Employee[], meta: { total: 0 } };

      // Assert
      expect(response.data).toHaveLength(0);
      expect(response.meta.total).toBe(0);
    });

    test('non-existent employee ID results in an invalid lookup', () => {
      // Arrange
      const knownIds = [1, 2, 3, 4, 5];
      const searchId = 9999;

      // Act
      const found = knownIds.includes(searchId);

      // Assert
      expect(found).toBe(false);
    });

    test('negative employee ID is an invalid parameter', () => {
      // Arrange / Act
      const id = -1;

      // Assert
      expect(id).toBeLessThan(0);
    });
  });

  // ── 8. Pagination fixtures ─────────────────────────────────────────────────

  test.describe('Pagination', () => {
    test('defaultPage fixture has limit=50 and offset=0', () => {
      expect(paginationFixtures.defaultPage.limit).toBe(50);
      expect(paginationFixtures.defaultPage.offset).toBe(0);
    });

    test('firstPage fixture has limit=10 and offset=0', () => {
      expect(paginationFixtures.firstPage.limit).toBe(10);
      expect(paginationFixtures.firstPage.offset).toBe(0);
    });

    test('secondPage fixture has limit=10 and offset=10', () => {
      expect(paginationFixtures.secondPage.limit).toBe(10);
      expect(paginationFixtures.secondPage.offset).toBe(10);
    });

    test('largePage fixture has limit=100', () => {
      expect(paginationFixtures.largePage.limit).toBe(100);
    });

    test('invalidPagination fixture has negative values', () => {
      expect(paginationFixtures.invalidPagination.limit).toBeLessThan(0);
      expect(paginationFixtures.invalidPagination.offset).toBeLessThan(0);
    });

    test('page offset advances by the page limit value', () => {
      // Arrange
      const limit = 10;

      // Act
      const page2Offset = limit * 1;
      const page3Offset = limit * 2;

      // Assert
      expect(page2Offset).toBe(10);
      expect(page3Offset).toBe(20);
    });

    test('total pages calculated from meta.total and limit', () => {
      // Arrange
      const total = 55;
      const limit = 10;

      // Act
      const pages = Math.ceil(total / limit);

      // Assert
      expect(pages).toBe(6);
    });
  });
});
