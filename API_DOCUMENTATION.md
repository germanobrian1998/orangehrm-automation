# API Documentation

Reference guide for the HRM API testing layer — clients, schemas, fixtures, and examples.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Authentication](#authentication)
- [Employee API](#employee-api)
- [Leave API](#leave-api)
- [Department API](#department-api)
- [Error Handling](#error-handling)
- [Fixtures and Test Data](#fixtures-and-test-data)
- [Writing API Tests](#writing-api-tests)
- [Pagination](#pagination)
- [Response Schema Validation](#response-schema-validation)

---

## Overview

The `packages/hrm-api-suite` package provides typed API clients and test fixtures for the OrangeHRM REST API (v2). All clients extend `BaseApiClient` from `@qa-framework/core` and interact with the OrangeHRM backend at `/api/v2/`.

```
packages/hrm-api-suite/
├── src/
│   ├── clients/
│   │   ├── EmployeeAPIClient.ts   # Employee CRUD
│   │   ├── LeaveAPIClient.ts      # Leave request management
│   │   ├── DepartmentAPIClient.ts # Department management
│   │   └── hrm-api.client.ts      # Composite client
│   ├── fixtures/
│   │   └── apiFixtures.ts         # Shared test data factories
│   └── schemas/
│       ├── Employee.ts            # TypeScript interfaces
│       ├── Leave.ts               # Leave-related interfaces
│       └── Department.ts          # Department interfaces
└── tests/
    ├── api/
    │   └── employee.spec.ts       # Employee API tests
    ├── employee.api.spec.ts       # Employee client tests
    ├── leave.api.spec.ts          # Leave client tests
    └── department.api.spec.ts     # Department client tests
```

---

## Architecture

All API clients inherit from `BaseApiClient`:

```
BaseApiClient (@qa-framework/core)
  ├── EmployeeAPIClient
  ├── LeaveAPIClient
  └── DepartmentAPIClient
```

`BaseApiClient` provides typed HTTP methods (`get`, `post`, `put`, `delete`) with built-in:
- Request/response logging via `Logger`
- Error propagation with contextual messages
- Authentication header injection

---

## Authentication

OrangeHRM uses cookie-based authentication. Log in via the UI before making API calls, or authenticate via the auth endpoint:

**Endpoint:** `POST /api/v2/auth/login`

```typescript
const body = { username: 'Admin', password: 'admin123' };
// The session cookie is automatically stored by Playwright's page context
```

All subsequent API calls in the same Playwright page context will carry the session cookie automatically.

---

## Employee API

### Base path: `/api/v2/pim/employees`

#### Get employee

```typescript
const client = new EmployeeAPIClient(page);
const employee = await client.getEmployee(1);
// Returns: Employee
```

**Response shape:**

```typescript
interface Employee {
  empNumber: number;     // unique identifier
  firstName: string;
  lastName: string;
  middleName?: string;
  employeeId: string;    // human-readable ID (e.g. "EMP-001")
  email?: string;
  workEmail?: string;
  jobTitle?: string;
  department?: string;
  status?: 'active' | 'inactive';
  hireDate?: string;     // ISO 8601 date: "2023-01-15"
}
```

#### List employees

```typescript
const response = await client.listEmployees(limit, offset);
// Returns: EmployeeListResponse { data: Employee[], meta: { total, limit, offset } }
```

#### Create employee

```typescript
const newEmployee = await client.createEmployee({
  firstName: 'Jane',
  lastName: 'Doe',
  employeeId: `EMP-${Date.now()}`,
});
// Returns: Employee
```

**Required fields:**

| Field | Type | Description |
|-------|------|-------------|
| `firstName` | `string` | Employee first name |
| `lastName` | `string` | Employee last name |
| `employeeId` | `string` | Unique HR identifier |

**Optional fields:** `middleName`

#### Update employee

```typescript
const updated = await client.updateEmployee(empNumber, {
  firstName: 'Updated',
  email: 'new@example.com',
});
// Returns: Employee
```

All `UpdateEmployeeDTO` fields are optional:

| Field | Type |
|-------|------|
| `firstName` | `string` |
| `lastName` | `string` |
| `middleName` | `string` |
| `email` | `string` |
| `jobTitle` | `string` |

#### Delete employee

```typescript
await client.deleteEmployee(empNumber);
// Returns: void
```

#### Search employees

```typescript
const results = await client.searchEmployees({
  name: 'John',
  departmentId: 3,
  limit: 10,
  offset: 0,
});
// Returns: Employee[]
```

---

## Leave API

### Base paths

| Resource | Path |
|----------|------|
| Leave types | `/api/v2/leave/leave-types` |
| Leave requests | `/api/v2/leave/leave-requests` |
| Single request | `/api/v2/leave/leave-requests/{id}` |

### Leave status lifecycle

```
PENDING → APPROVED → TAKEN
       ↘ REJECTED
       ↘ CANCELLED
APPROVED → CANCELLED
```

### Create leave request

```typescript
const client = new LeaveAPIClient(page);
const leaveRequest = await client.createLeaveRequest({
  employeeId: 100,
  leaveTypeId: 1,
  fromDate: '2025-06-01',
  toDate: '2025-06-03',
  comment: 'Annual vacation',
});
```

**CreateLeaveRequestDTO:**

| Field | Type | Required |
|-------|------|----------|
| `employeeId` | `number` | ✅ |
| `leaveTypeId` | `number` | ✅ |
| `fromDate` | `string` (ISO 8601) | ✅ |
| `toDate` | `string` (ISO 8601) | ✅ |
| `comment` | `string` | ❌ |

### Update leave status (approve / reject)

```typescript
await client.updateLeaveRequest(leaveId, { status: 'APPROVED' });
await client.updateLeaveRequest(leaveId, { status: 'REJECTED', comment: 'Insufficient balance' });
```

### Get leave balance

```typescript
const balance = await client.getLeaveBalance(employeeId, leaveTypeId);
// Returns: LeaveBalance { leaveTypeId, leaveTypeName, balance, used, scheduled, pending, taken }
```

---

## Department API

### Base path: `/api/v2/admin/subunits`

```typescript
const client = new DepartmentAPIClient(page);

// List departments
const departments = await client.listDepartments();

// Create department
const dept = await client.createDepartment({ name: 'Engineering' });

// Create sub-department
const subDept = await client.createDepartment({
  name: 'Backend Team',
  parentId: dept.id,
});

// Delete department
await client.deleteDepartment(dept.id);
```

---

## Error Handling

All API client methods:
1. Log the error with context via `this.logger.error(message, error)`
2. Re-throw the original error for the test to handle

Handle API errors in tests with `expect` assertions on error messages:

```typescript
test('should handle 404 for non-existent employee', async ({ page }) => {
  const client = new EmployeeAPIClient(page);

  await expect(client.getEmployee(99999)).rejects.toThrow();
});
```

### Common HTTP status codes

| Code | Meaning | Typical cause |
|------|---------|--------------|
| 200 | OK | Successful read |
| 201 | Created | Successful create |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Session expired |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server-side bug |

---

## Fixtures and Test Data

The `apiFixtures.ts` module provides factory functions for test data:

```typescript
import {
  employeeFixtures,
  leaveFixtures,
  departmentFixtures,
  paginationFixtures,
  API_ENDPOINTS,
} from '../src/fixtures/apiFixtures';

// Employee fixtures
const newEmp = employeeFixtures.validCreate();          // unique employeeId
const empWithMiddle = employeeFixtures.validCreateWithMiddleName();
const update = employeeFixtures.validUpdate();

// Leave fixtures
const leave = leaveFixtures.validCreate(employeeId, leaveTypeId);
const leaveWithComment = leaveFixtures.validCreateWithComment(employeeId, leaveTypeId);

// Pagination
const firstPage = paginationFixtures.firstPage;   // { limit: 10, offset: 0 }
const secondPage = paginationFixtures.secondPage; // { limit: 10, offset: 10 }
```

### Fixture guidelines

- Always use factory functions (not plain objects) so each call generates a unique `employeeId`
- Prefer `employeeFixtures.validCreate()` over manually constructing DTOs
- Use `invalidCreate.*` fixtures to test validation error scenarios

---

## Writing API Tests

### Recommended structure

```typescript
import { test, expect } from '@playwright/test';
import { EmployeeAPIClient } from '../src/clients/EmployeeAPIClient';
import { employeeFixtures } from '../src/fixtures/apiFixtures';

test.describe('@api Employee API', () => {
  test('should create a new employee', async ({ page }) => {
    // ── Arrange ──────────────────────────────────────────────────────────────
    const client = new EmployeeAPIClient(page);
    const dto = employeeFixtures.validCreate();

    // ── Act ───────────────────────────────────────────────────────────────────
    const employee = await client.createEmployee(dto);

    // ── Assert ────────────────────────────────────────────────────────────────
    expect(employee.empNumber).toBeDefined();
    expect(employee.firstName).toBe(dto.firstName);
    expect(employee.lastName).toBe(dto.lastName);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    await client.deleteEmployee(employee.empNumber);
  });
});
```

### API test checklist

- [ ] Use fixtures from `apiFixtures.ts` — do not hardcode test data
- [ ] Assert both the happy path and error scenarios
- [ ] Verify response schema (required fields, correct types)
- [ ] Clean up created resources in `afterEach` or at the end of the test
- [ ] Tag tests with `@api` for targeted runs

---

## Pagination

All list endpoints support `limit` and `offset` query parameters:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `limit` | 50 | Records per page |
| `offset` | 0 | Zero-based record offset |

Calculating page offset:

```typescript
const limit = 10;
const page = 2;                       // 1-indexed page number
const offset = (page - 1) * limit;   // offset = 10

const employees = await client.listEmployees(limit, offset);
const totalPages = Math.ceil(employees.meta.total / limit);
```

---

## Response Schema Validation

Validate response shapes in tests using TypeScript type assertions and `expect`:

```typescript
test('listEmployees response matches EmployeeListResponse schema', async ({ page }) => {
  const client = new EmployeeAPIClient(page);
  const response = await client.listEmployees(5, 0);

  // Meta validation
  expect(typeof response.meta.total).toBe('number');
  expect(response.meta.total).toBeGreaterThanOrEqual(0);

  // Data array validation
  expect(Array.isArray(response.data)).toBe(true);

  // Individual record validation
  if (response.data.length > 0) {
    const emp = response.data[0];
    expect(typeof emp.empNumber).toBe('number');
    expect(typeof emp.firstName).toBe('string');
    expect(typeof emp.lastName).toBe('string');
    expect(typeof emp.employeeId).toBe('string');
  }
});
```
