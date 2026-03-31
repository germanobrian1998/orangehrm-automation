/**
 * HRM API Suite - API Test Fixtures
 * Shared test data and helpers for API test specs.
 */

import { CreateEmployeeDTO, UpdateEmployeeDTO } from '../schemas/Employee';
import { CreateLeaveRequestDTO } from '../schemas/Leave';
import { CreateDepartmentDTO } from '../schemas/Department';

// ─── Employee Fixtures ────────────────────────────────────────────────────────

export const employeeFixtures = {
  validCreate: (): CreateEmployeeDTO => ({
    firstName: 'Test',
    lastName: 'Employee',
    employeeId: `EMP-${Date.now()}`,
  }),

  validCreateWithMiddleName: (): CreateEmployeeDTO => ({
    firstName: 'John',
    middleName: 'Michael',
    lastName: 'Doe',
    employeeId: `EMP-${Date.now()}`,
  }),

  validUpdate: (): UpdateEmployeeDTO => ({
    firstName: 'Updated',
    lastName: 'Name',
  }),

  invalidCreate: {
    missingFirstName: { lastName: 'Doe', employeeId: 'EMP-001' } as Partial<CreateEmployeeDTO>,
    missingLastName: { firstName: 'John', employeeId: 'EMP-001' } as Partial<CreateEmployeeDTO>,
    missingEmployeeId: { firstName: 'John', lastName: 'Doe' } as Partial<CreateEmployeeDTO>,
    empty: {} as Partial<CreateEmployeeDTO>,
  },
};

// ─── Leave Fixtures ────────────────────────────────────────────────────────────

export const leaveFixtures = {
  validCreate: (employeeId: number, leaveTypeId: number): CreateLeaveRequestDTO => ({
    employeeId,
    leaveTypeId,
    fromDate: '2025-06-01',
    toDate: '2025-06-03',
    comment: 'Annual vacation',
  }),

  validCreateWithComment: (employeeId: number, leaveTypeId: number): CreateLeaveRequestDTO => ({
    employeeId,
    leaveTypeId,
    fromDate: '2025-07-10',
    toDate: '2025-07-11',
    comment: 'Medical appointment',
  }),

  invalidCreate: {
    missingDates: { employeeId: 1, leaveTypeId: 1 } as Partial<CreateLeaveRequestDTO>,
    invalidDateRange: {
      employeeId: 1,
      leaveTypeId: 1,
      fromDate: '2025-06-05',
      toDate: '2025-06-01',
    } as CreateLeaveRequestDTO,
  },
};

// ─── Department Fixtures ──────────────────────────────────────────────────────

export const departmentFixtures = {
  validCreate: (): CreateDepartmentDTO => ({
    name: `Test Department ${Date.now()}`,
  }),

  validCreateWithParent: (parentId: number): CreateDepartmentDTO => ({
    name: `Sub Department ${Date.now()}`,
    parentId,
  }),

  invalidCreate: {
    missingName: {} as Partial<CreateDepartmentDTO>,
    emptyName: { name: '' } as CreateDepartmentDTO,
  },
};

// ─── Pagination Fixtures ──────────────────────────────────────────────────────

export const paginationFixtures = {
  defaultPage: { limit: 50, offset: 0 },
  firstPage: { limit: 10, offset: 0 },
  secondPage: { limit: 10, offset: 10 },
  largePage: { limit: 100, offset: 0 },
  invalidPagination: { limit: -1, offset: -10 },
};

// ─── API Endpoint Constants ───────────────────────────────────────────────────

export const API_ENDPOINTS = {
  employees: '/api/v2/pim/employees',
  employee: (id: number) => `/api/v2/pim/employees/${id}`,
  leaveTypes: '/api/v2/leave/leave-types',
  leaveRequests: '/api/v2/leave/leave-requests',
  leaveRequest: (id: number) => `/api/v2/leave/leave-requests/${id}`,
  departments: '/api/v2/admin/subunits',
  department: (id: number) => `/api/v2/admin/subunits/${id}`,
  auth: '/api/v2/auth/login',
};
