# @qa-framework/hrm-api-suite

HRM REST API test suite — typed API clients, schema validation, fixtures, and performance tests built on top of `@qa-framework/core`.

## Overview

This package demonstrates the reusability of `@qa-framework/core` across multiple projects. It provides:

- **Typed API clients** for Employee, Leave, and Department endpoints
- **TypeScript schemas** (interfaces) for every request/response shape
- **Test fixtures** with valid and invalid data scenarios
- **Comprehensive test specs** with 30+ tests covering CRUD, pagination, validation, and performance

## Package Structure

```
packages/hrm-api-suite/
├── src/
│   ├── clients/
│   │   ├── EmployeeAPIClient.ts   # Employee CRUD operations
│   │   ├── LeaveAPIClient.ts      # Leave request management
│   │   ├── DepartmentAPIClient.ts # Department hierarchy
│   │   └── hrm-api.client.ts      # Legacy unified client
│   ├── schemas/
│   │   ├── Employee.ts            # Employee interfaces
│   │   ├── Leave.ts               # Leave interfaces
│   │   └── Department.ts          # Department interfaces
│   ├── fixtures/
│   │   └── apiFixtures.ts         # Shared test fixtures
│   └── index.ts                   # Main export
└── tests/
    ├── employee.api.spec.ts        # Employee API tests (18 tests)
    ├── leave.api.spec.ts           # Leave API tests (16 tests)
    ├── department.api.spec.ts      # Department API tests (16 tests)
    └── performance.api.spec.ts     # Performance tests (8 tests)
```

## Installation

This package is part of the monorepo. Dependencies are installed from the root:

```bash
npm ci
```

## Running Tests

```bash
# Run all API tests
npm run test --workspace=packages/hrm-api-suite

# Run only API-tagged tests
npm run test:api --workspace=packages/hrm-api-suite

# Run only performance tests
npm run test:performance --workspace=packages/hrm-api-suite
```

## Extending BaseApiClient

All API clients extend `BaseApiClient` from `@qa-framework/core`. Example:

```typescript
import { Page } from '@playwright/test';
import { BaseApiClient } from '@qa-framework/core';
import { Employee } from '../schemas/Employee';

export class EmployeeAPIClient extends BaseApiClient {
  constructor(page: Page) {
    super(page);
  }

  async getEmployee(id: number): Promise<Employee> {
    const response = await this.get<{ data: Employee }>(`/api/v2/pim/employees/${id}`);
    return response.data;
  }

  async createEmployee(employee: Partial<Employee>): Promise<Employee> {
    const response = await this.post<{ data: Employee }>('/api/v2/pim/employees', employee);
    return response.data;
  }
}
```

## Available Clients

### EmployeeAPIClient

| Method | Description |
|---|---|
| `getEmployee(id)` | Get a single employee by ID |
| `listEmployees(limit, offset)` | Paginated employee list |
| `createEmployee(dto)` | Create a new employee |
| `updateEmployee(id, dto)` | Update an employee |
| `deleteEmployee(id)` | Delete an employee |
| `searchEmployees(filters)` | Search with filters |

### LeaveAPIClient

| Method | Description |
|---|---|
| `getLeaveTypes()` | List all leave types |
| `getLeaveRequest(id)` | Get a leave request |
| `listLeaveRequests(limit, offset)` | Paginated leave requests |
| `createLeaveRequest(dto)` | Create a leave request |
| `updateLeaveRequest(id, dto)` | Update leave request status |
| `deleteLeaveRequest(id)` | Delete a leave request |
| `getLeaveBalance(employeeId)` | Get leave balance |
| `getEmployeeLeaveRequests(empId, limit, offset)` | Employee leave history |

### DepartmentAPIClient

| Method | Description |
|---|---|
| `getDepartment(id)` | Get a department |
| `listDepartments(limit, offset)` | List all departments |
| `createDepartment(dto)` | Create a department |
| `updateDepartment(id, dto)` | Update a department |
| `deleteDepartment(id)` | Delete a department |
| `getDepartmentEmployees(departmentId)` | Members of a department |

## Test Coverage

| Spec File | Tests | Coverage |
|---|---|---|
| `employee.api.spec.ts` | 18 | Package exports, method existence, schema shape, fixtures |
| `leave.api.spec.ts` | 19 | Package exports, method existence, schema shape, fixtures |
| `department.api.spec.ts` | 18 | Package exports, method existence, schema shape, fixtures |
| `performance.api.spec.ts` | 8 | Fixture throughput, endpoint builder speed, uniqueness |
| `api.spec.ts` (smoke) | 1 | All clients exported |
| **Total** | **64** | |

## API Endpoint Constants

```typescript
import { API_ENDPOINTS } from '@qa-framework/hrm-api-suite';

API_ENDPOINTS.employees               // '/api/v2/pim/employees'
API_ENDPOINTS.employee(42)            // '/api/v2/pim/employees/42'
API_ENDPOINTS.leaveRequests           // '/api/v2/leave/leave-requests'
API_ENDPOINTS.leaveRequest(5)         // '/api/v2/leave/leave-requests/5'
API_ENDPOINTS.departments             // '/api/v2/admin/subunits'
API_ENDPOINTS.department(3)           // '/api/v2/admin/subunits/3'
```

## Using Fixtures in Tests

```typescript
import { test, expect } from '@playwright/test';
import { EmployeeAPIClient, employeeFixtures } from '@qa-framework/hrm-api-suite';

test('create employee', async ({ page }) => {
  const client = new EmployeeAPIClient(page);
  await client.authenticate('Admin', 'admin123');

  const dto = employeeFixtures.validCreate();
  const employee = await client.createEmployee(dto);
  expect(employee.empNumber).toBeDefined();
});
```
