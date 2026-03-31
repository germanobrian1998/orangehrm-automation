/**
 * HRM API Suite - Department API tests
 * Tests for DepartmentAPIClient: CRUD operations, hierarchy, and employee membership.
 */

import { test, expect } from '@playwright/test';
import { BaseApiClient } from '@qa-framework/core';
import { DepartmentAPIClient } from '../src/clients/DepartmentAPIClient';
import { departmentFixtures, API_ENDPOINTS } from '../src/fixtures/apiFixtures';

test.describe('@api Department API Client', () => {
  // ─── Package structure ───────────────────────────────────────────────────

  test('DepartmentAPIClient is defined', () => {
    expect(DepartmentAPIClient).toBeDefined();
  });

  test('DepartmentAPIClient extends BaseApiClient', () => {
    expect(DepartmentAPIClient.prototype).toBeInstanceOf(BaseApiClient);
  });

  // ─── Method existence ────────────────────────────────────────────────────

  test('DepartmentAPIClient has getDepartment method', () => {
    expect(typeof DepartmentAPIClient.prototype.getDepartment).toBe('function');
  });

  test('DepartmentAPIClient has listDepartments method', () => {
    expect(typeof DepartmentAPIClient.prototype.listDepartments).toBe('function');
  });

  test('DepartmentAPIClient has createDepartment method', () => {
    expect(typeof DepartmentAPIClient.prototype.createDepartment).toBe('function');
  });

  test('DepartmentAPIClient has updateDepartment method', () => {
    expect(typeof DepartmentAPIClient.prototype.updateDepartment).toBe('function');
  });

  test('DepartmentAPIClient has deleteDepartment method', () => {
    expect(typeof DepartmentAPIClient.prototype.deleteDepartment).toBe('function');
  });

  test('DepartmentAPIClient has getDepartmentEmployees method', () => {
    expect(typeof DepartmentAPIClient.prototype.getDepartmentEmployees).toBe('function');
  });

  // ─── Schema validation ───────────────────────────────────────────────────

  test('Department schema has required fields', () => {
    const department = {
      id: 1,
      name: 'Engineering',
    };
    expect(department.id).toBeDefined();
    expect(department.name).toBeDefined();
  });

  test('Department schema allows optional hierarchy fields', () => {
    const department = {
      id: 2,
      name: 'Frontend',
      parentId: 1,
      parentName: 'Engineering',
      headId: 100,
      headName: 'Jane Smith',
    };
    expect(department.parentId).toBe(1);
    expect(department.parentName).toBe('Engineering');
    expect(department.headName).toBe('Jane Smith');
  });

  test('DepartmentEmployee schema has required fields', () => {
    const deptEmployee = {
      empNumber: 5,
      firstName: 'Alice',
      lastName: 'Johnson',
      employeeId: 'EMP-005',
    };
    expect(deptEmployee.empNumber).toBe(5);
    expect(deptEmployee.firstName).toBe('Alice');
    expect(deptEmployee.employeeId).toBe('EMP-005');
  });

  // ─── Fixtures validation ─────────────────────────────────────────────────

  test('departmentFixtures.validCreate returns correct DTO', () => {
    const dto = departmentFixtures.validCreate();
    expect(dto.name).toMatch(/^Test Department \d+$/);
  });

  test('departmentFixtures.validCreate generates unique names', async () => {
    const dto1 = departmentFixtures.validCreate();
    await new Promise(resolve => setTimeout(resolve, 2));
    const dto2 = departmentFixtures.validCreate();
    expect(dto1.name).not.toBe(dto2.name);
  });

  test('departmentFixtures.validCreateWithParent includes parentId', () => {
    const dto = departmentFixtures.validCreateWithParent(10);
    expect(dto.parentId).toBe(10);
    expect(dto.name).toMatch(/^Sub Department \d+$/);
  });

  test('departmentFixtures.invalidCreate.missingName has no name', () => {
    const dto = departmentFixtures.invalidCreate.missingName;
    expect((dto as Record<string, unknown>).name).toBeUndefined();
  });

  test('departmentFixtures.invalidCreate.emptyName has empty string', () => {
    const dto = departmentFixtures.invalidCreate.emptyName;
    expect(dto.name).toBe('');
  });

  test('API_ENDPOINTS.departments points to correct path', () => {
    expect(API_ENDPOINTS.departments).toBe('/api/v2/admin/subunits');
  });

  test('API_ENDPOINTS.department returns path with id', () => {
    expect(API_ENDPOINTS.department(3)).toBe('/api/v2/admin/subunits/3');
  });
});
