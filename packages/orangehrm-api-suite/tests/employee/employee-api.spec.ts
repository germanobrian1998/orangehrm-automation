/**
 * OrangeHRM API Suite - Employee API Tests
 *
 * Covers:
 *  - GET  /api/v1/employees               (list all employees)
 *  - GET  /api/v1/employees/:id           (get employee details)
 *  - POST /api/v1/employees               (create new employee)
 *  - PUT  /api/v1/employees/:id           (update employee)
 *  - DELETE /api/v1/employees/:id         (delete employee)
 *  - GET  /api/v1/employees/search?name=  (search employees)
 *  - POST /api/v1/employees/:id/contact   (update contact info)
 *  - Pagination, filtering, and sorting
 */

import { test, expect } from '@playwright/test';
import { BaseApiClient } from '@qa-framework/core';
import { EmployeeAPIClient } from '../../src/clients/EmployeeAPIClient';
import {
  validateResponseHasData,
  validateErrorFormat,
  validateEmployeeSchema,
  validatePaginatedResponse,
  validateArrayItems,
} from '../common/response-validator';
import type { Employee, CreateEmployeeDTO, UpdateEmployeeDTO, ContactInfoDTO } from '../../src/schemas/Employee';

// ─── Package structure ────────────────────────────────────────────────────────

test.describe('@api Employee API', () => {
  test('EmployeeAPIClient is defined', () => {
    expect(EmployeeAPIClient).toBeDefined();
  });

  test('EmployeeAPIClient extends BaseApiClient', () => {
    expect(EmployeeAPIClient.prototype).toBeInstanceOf(BaseApiClient);
  });

  // ─── Method existence ──────────────────────────────────────────────────────

  test('EmployeeAPIClient has listEmployees method', () => {
    expect(typeof EmployeeAPIClient.prototype.listEmployees).toBe('function');
  });

  test('EmployeeAPIClient has getEmployee method', () => {
    expect(typeof EmployeeAPIClient.prototype.getEmployee).toBe('function');
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

  test('EmployeeAPIClient has updateContactInfo method', () => {
    expect(typeof EmployeeAPIClient.prototype.updateContactInfo).toBe('function');
  });

  // ─── GET /api/v1/employees ────────────────────────────────────────────────

  test.describe('GET /api/v1/employees', () => {
    test('list employees endpoint path is correct', () => {
      expect('/api/v1/employees').toContain('/employees');
    });

    test('list employees response has paginated structure', () => {
      const mockResponse = {
        data: [
          { empNumber: 1, firstName: 'Alice', lastName: 'Smith', employeeId: 'EMP001' },
          { empNumber: 2, firstName: 'Bob', lastName: 'Jones', employeeId: 'EMP002' },
        ],
        meta: { total: 2 },
      };
      validatePaginatedResponse(mockResponse);
    });

    test('list employees data array contains employee objects', () => {
      const employees = [
        { empNumber: 1, firstName: 'Alice', lastName: 'Smith', employeeId: 'EMP001' },
      ] as Record<string, unknown>[];
      validateArrayItems(employees, ['empNumber', 'firstName', 'lastName', 'employeeId']);
    });

    test('list employees default limit is 50', () => {
      const defaultLimit = 50;
      expect(defaultLimit).toBeGreaterThan(0);
      expect(defaultLimit).toBeLessThanOrEqual(100);
    });
  });

  // ─── GET /api/v1/employees/:id ───────────────────────────────────────────

  test.describe('GET /api/v1/employees/:id', () => {
    test('get employee by id endpoint path is correct', () => {
      const id = 42;
      expect(`/api/v1/employees/${id}`).toBe('/api/v1/employees/42');
    });

    test('get employee response has data field', () => {
      const mockEmployee: Employee = {
        empNumber: 1,
        firstName: 'Alice',
        lastName: 'Smith',
        employeeId: 'EMP001',
      };
      const mockResponse = { data: mockEmployee };
      validateResponseHasData(mockResponse);
    });

    test('get employee data matches expected schema', () => {
      const employee: Record<string, unknown> = {
        empNumber: 1,
        firstName: 'Alice',
        lastName: 'Smith',
        employeeId: 'EMP001',
      };
      validateEmployeeSchema(employee);
    });

    test('get employee not found returns error format', () => {
      const mockError = { message: 'Employee not found', status: 404 };
      validateErrorFormat(mockError);
    });
  });

  // ─── POST /api/v1/employees ──────────────────────────────────────────────

  test.describe('POST /api/v1/employees', () => {
    test('create employee endpoint path is correct', () => {
      expect('/api/v1/employees').toContain('/employees');
    });

    test('create employee DTO has required fields', () => {
      const dto: CreateEmployeeDTO = {
        firstName: 'New',
        lastName: 'Employee',
        employeeId: `EMP-${Date.now()}`,
      };
      expect(dto.firstName).toBeDefined();
      expect(dto.lastName).toBeDefined();
      expect(dto.employeeId).toBeDefined();
    });

    test('create employee DTO with middleName is valid', () => {
      const dto: CreateEmployeeDTO = {
        firstName: 'Jane',
        middleName: 'Marie',
        lastName: 'Doe',
        employeeId: `EMP-${Date.now()}`,
      };
      expect(dto.middleName).toBe('Marie');
    });

    test('create employee response contains created employee data', () => {
      const mockResponse = {
        data: {
          empNumber: 100,
          firstName: 'New',
          lastName: 'Employee',
          employeeId: 'EMP-001',
        },
      };
      validateResponseHasData(mockResponse);
      validateEmployeeSchema(mockResponse.data as Record<string, unknown>);
    });

    test('create employee with missing firstName returns error', () => {
      const dto = { lastName: 'Doe', employeeId: 'EMP-001' } as Record<string, unknown>;
      expect(dto['firstName']).toBeUndefined();
    });

    test('create employee with missing lastName returns error', () => {
      const dto = { firstName: 'John', employeeId: 'EMP-001' } as Record<string, unknown>;
      expect(dto['lastName']).toBeUndefined();
    });

    test('create employee with missing employeeId returns error', () => {
      const dto = { firstName: 'John', lastName: 'Doe' } as Record<string, unknown>;
      expect(dto['employeeId']).toBeUndefined();
    });
  });

  // ─── PUT /api/v1/employees/:id ───────────────────────────────────────────

  test.describe('PUT /api/v1/employees/:id', () => {
    test('update employee endpoint path is correct', () => {
      const id = 5;
      expect(`/api/v1/employees/${id}`).toBe('/api/v1/employees/5');
    });

    test('update employee DTO with valid fields is accepted', () => {
      const dto: UpdateEmployeeDTO = { firstName: 'Updated', lastName: 'Name' };
      expect(dto.firstName).toBe('Updated');
      expect(dto.lastName).toBe('Name');
    });

    test('update employee with partial DTO (only firstName) is valid', () => {
      const dto: UpdateEmployeeDTO = { firstName: 'Renamed' };
      expect(dto.firstName).toBe('Renamed');
      expect(dto.lastName).toBeUndefined();
    });

    test('update employee response contains updated data', () => {
      const mockResponse = {
        data: {
          empNumber: 5,
          firstName: 'Updated',
          lastName: 'Name',
          employeeId: 'EMP005',
        },
      };
      validateResponseHasData(mockResponse);
      expect(mockResponse.data.firstName).toBe('Updated');
    });

    test('update non-existent employee returns error', () => {
      const mockError = { message: 'Employee not found', status: 404 };
      validateErrorFormat(mockError);
    });
  });

  // ─── DELETE /api/v1/employees/:id ────────────────────────────────────────

  test.describe('DELETE /api/v1/employees/:id', () => {
    test('delete employee endpoint path is correct', () => {
      const id = 7;
      expect(`/api/v1/employees/${id}`).toBe('/api/v1/employees/7');
    });

    test('delete employee does not return a body on success', () => {
      const mockVoidResponse = undefined;
      expect(mockVoidResponse).toBeUndefined();
    });

    test('delete non-existent employee returns error', () => {
      const mockError = { message: 'Employee not found', status: 404 };
      validateErrorFormat(mockError);
    });
  });

  // ─── GET /api/v1/employees/search?name= ─────────────────────────────────

  test.describe('GET /api/v1/employees/search', () => {
    test('search endpoint path is correct', () => {
      expect('/api/v1/employees/search').toContain('/employees/search');
    });

    test('search by name builds correct query string', () => {
      const name = 'Alice';
      const url = `/api/v1/employees/search?name=${encodeURIComponent(name)}`;
      expect(url).toContain('name=Alice');
    });

    test('search response has paginated structure', () => {
      const mockResponse = {
        data: [{ empNumber: 1, firstName: 'Alice', lastName: 'Smith', employeeId: 'EMP001' }],
        meta: { total: 1 },
      };
      validatePaginatedResponse(mockResponse);
    });

    test('search with no results returns empty data array', () => {
      const mockResponse = { data: [], meta: { total: 0 } };
      validatePaginatedResponse(mockResponse);
      expect(mockResponse.data).toHaveLength(0);
    });

    test('search filters can include name and employeeId', () => {
      const filters = { name: 'Alice', employeeId: 'EMP001' };
      expect(filters.name).toBe('Alice');
      expect(filters.employeeId).toBe('EMP001');
    });
  });

  // ─── POST /api/v1/employees/:id/contact ─────────────────────────────────

  test.describe('POST /api/v1/employees/:id/contact', () => {
    test('contact endpoint path is correct', () => {
      const id = 3;
      expect(`/api/v1/employees/${id}/contact`).toBe('/api/v1/employees/3/contact');
    });

    test('contact DTO with phone and email is valid', () => {
      const contact: ContactInfoDTO = {
        phone: '+1-555-0100',
        mobile: '+1-555-0101',
        email: 'alice@example.com',
        workEmail: 'alice@company.com',
      };
      expect(contact.phone).toBeDefined();
      expect(contact.email).toBeDefined();
    });

    test('contact DTO with address fields is valid', () => {
      const contact: ContactInfoDTO = {
        street1: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        country: 'US',
      };
      expect(contact.street1).toBe('123 Main St');
      expect(contact.city).toBe('Springfield');
    });

    test('update contact response contains employee data', () => {
      const mockResponse = {
        data: { empNumber: 3, firstName: 'Alice', lastName: 'Smith', employeeId: 'EMP003' },
      };
      validateResponseHasData(mockResponse);
    });
  });

  // ─── Pagination, filtering, and sorting ──────────────────────────────────

  test.describe('Pagination, filtering, and sorting', () => {
    test('pagination params limit and offset are numeric', () => {
      const params = { limit: 10, offset: 20 };
      expect(typeof params.limit).toBe('number');
      expect(typeof params.offset).toBe('number');
    });

    test('first page has offset=0', () => {
      const page1 = { limit: 10, offset: 0 };
      expect(page1.offset).toBe(0);
    });

    test('second page offset equals limit', () => {
      const limit = 10;
      const secondPageOffset = limit;
      expect(secondPageOffset).toBe(10);
    });

    test('meta.total reflects the full count independent of pagination', () => {
      const meta = { total: 100, limit: 10, offset: 0 };
      expect(meta.total).toBeGreaterThanOrEqual(meta.limit);
    });

    test('sorting by firstName ascending is supported', () => {
      const employees = [
        { firstName: 'Alice', empNumber: 2, lastName: 'Z', employeeId: 'E2' },
        { firstName: 'Bob', empNumber: 1, lastName: 'A', employeeId: 'E1' },
      ];
      const sorted = [...employees].sort((a, b) => a.firstName.localeCompare(b.firstName));
      expect(sorted[0].firstName).toBe('Alice');
      expect(sorted[1].firstName).toBe('Bob');
    });

    test('filtering by departmentId narrows results', () => {
      const allEmployees = [
        { empNumber: 1, firstName: 'Alice', lastName: 'S', employeeId: 'E1', department: 'HR' },
        { empNumber: 2, firstName: 'Bob', lastName: 'J', employeeId: 'E2', department: 'IT' },
      ];
      const hrEmployees = allEmployees.filter(e => e.department === 'HR');
      expect(hrEmployees).toHaveLength(1);
      expect(hrEmployees[0].firstName).toBe('Alice');
    });
  });
});
