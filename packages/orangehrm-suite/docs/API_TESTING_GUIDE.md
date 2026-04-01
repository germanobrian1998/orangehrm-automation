# API Testing Guide

This guide explains how to write and organise API tests using Playwright and the `BaseApiClient` provided by `@qa-framework/core`.

## Table of Contents

- [API Testing with Playwright](#api-testing-with-playwright)
- [Request and Response Handling](#request-and-response-handling)
- [Authentication and Headers](#authentication-and-headers)
- [API Validation Strategies](#api-validation-strategies)
- [Mock API Setup](#mock-api-setup)
- [Performance Testing APIs](#performance-testing-apis)

---

## API Testing with Playwright

### Why use Playwright for API testing?

Playwright's `APIRequestContext` allows HTTP requests to be made directly from the test process, without a browser. This makes it ideal for:

- **Setup and teardown** – create/delete test data via API before/after UI tests.
- **Contract testing** – validate that API responses match the expected schema.
- **Hybrid tests** – perform an action via the API and verify the result in the UI (or vice versa).

### `BaseApiClient` overview

All API clients in the framework extend `BaseApiClient` from `@qa-framework/core`:

```typescript
import { BaseApiClient } from '@qa-framework/core';

export class EmployeeAPIClient extends BaseApiClient {
  async createEmployee(data: CreateEmployeeDTO): Promise<Employee> {
    const response = await this.post<{ data: Employee }>('/api/v2/pim/employees', data);
    return response.data;
  }
}
```

`BaseApiClient` provides:

| Method | Description |
|---|---|
| `authenticate(username, password)` | Fetches and stores a bearer token |
| `get<T>(endpoint)` | Authenticated GET |
| `post<T>(endpoint, data)` | Authenticated POST |
| `put<T>(endpoint, data)` | Authenticated PUT |
| `patch<T>(endpoint, data)` | Authenticated PATCH |
| `delete(endpoint)` | Authenticated DELETE |

---

## Request and Response Handling

### Making a GET request

```typescript
const response = await this.get<{ data: Employee[] }>('/api/v2/pim/employees');
const employees = response.data;
```

### Making a POST request

```typescript
const newEmployee = await this.post<{ data: Employee }>('/api/v2/pim/employees', {
  firstName: 'Jane',
  lastName:  'Doe',
  employeeId: 'EMP-001',
});
const created = newEmployee.data;
```

### Making a PUT request

```typescript
const updated = await this.put<{ data: Employee }>(`/api/v2/pim/employees/${id}`, {
  firstName: 'Janet',
});
```

### Making a DELETE request

```typescript
await this.delete(`/api/v2/pim/employees/${id}`);
```

### Query parameters

Build query strings with `URLSearchParams`:

```typescript
const params = new URLSearchParams({
  name:   'Jane',
  limit:  '50',
  offset: '0',
}).toString();

const response = await this.get<EmployeeListResponse>(
  `/api/v2/pim/employees?${params}`
);
```

### Typed responses

Always provide a generic type parameter so TypeScript can validate the response shape:

```typescript
interface EmployeeListResponse {
  data: Employee[];
  meta: { total: number };
}

const list = await this.get<EmployeeListResponse>('/api/v2/pim/employees');
console.log(list.meta.total); // number – fully typed
```

---

## Authentication and Headers

### Token-based authentication

`BaseApiClient.authenticate()` calls `/api/v2/auth/credentials` with username/password and stores the returned `Authorization` header for all subsequent requests:

```typescript
// In a test beforeEach
const apiClient = new EmployeeAPIClient(page);
await apiClient.authenticate(config.adminUsername, config.adminPassword);
```

### Custom headers

If you need to add custom headers (e.g., `X-Request-ID`) beyond what the base client provides, override the request method in your subclass:

```typescript
export class AuditApiClient extends BaseApiClient {
  protected async buildHeaders(): Promise<Record<string, string>> {
    const base = await super['buildHeaders']();
    return {
      ...base,
      'X-Request-ID': crypto.randomUUID(),
    };
  }
}
```

### Session reuse between API and UI

Playwright allows sharing cookies between `APIRequestContext` and the browser page. Authenticate once via API, then reuse the session in the browser:

```typescript
test('create employee via API and verify in UI', async ({ page }) => {
  // 1. Authenticate via API
  const apiClient = new EmployeeAPIClient(page);
  await apiClient.authenticate(config.adminUsername, config.adminPassword);

  // 2. Create employee via API
  const employee = await apiClient.createEmployee({
    firstName: 'Jane', lastName: 'Doe', employeeId: 'EMP-001',
  });

  // 3. Verify in UI (no separate UI login needed if cookies are shared)
  const loginPage = new LoginPage(page);
  await loginPage.login({ username: config.adminUsername, password: config.adminPassword });

  const pimPage = new PimPage(page);
  expect(await pimPage.verifyEmployeeInList(employee.employeeId)).toBe(true);
});
```

---

## API Validation Strategies

### Status code validation

```typescript
test('GET /api/v2/pim/employees returns 200', async ({ page }) => {
  const apiClient = new EmployeeAPIClient(page);
  await apiClient.authenticate(config.adminUsername, config.adminPassword);

  const response = await apiClient.get<EmployeeListResponse>('/api/v2/pim/employees');
  // BaseApiClient throws on non-2xx status, so reaching this line means 2xx
  expect(response).toBeDefined();
});
```

### Response body schema validation

Validate the structure of API responses to catch contract regressions:

```typescript
test('employee object has required fields', async ({ page, config }) => {
  const apiClient = new EmployeeAPIClient(page);
  await apiClient.authenticate(config.adminUsername, config.adminPassword);

  const response = await apiClient.get<{ data: Employee[] }>('/api/v2/pim/employees?limit=1');
  const employee = response.data[0];

  expect(typeof employee.empNumber).toBe('number');
  expect(typeof employee.firstName).toBe('string');
  expect(typeof employee.lastName).toBe('string');
  expect(typeof employee.employeeId).toBe('string');
});
```

### Pagination validation

```typescript
test('pagination metadata is correct', async ({ page, config }) => {
  const apiClient = new EmployeeAPIClient(page);
  await apiClient.authenticate(config.adminUsername, config.adminPassword);

  const response = await apiClient.get<EmployeeListResponse>('/api/v2/pim/employees?limit=5&offset=0');

  expect(response.data).toHaveLength(5);
  expect(typeof response.meta.total).toBe('number');
  expect(response.meta.total).toBeGreaterThanOrEqual(5);
});
```

### Error response validation

```typescript
test('404 is returned for non-existent employee', async ({ page }) => {
  const apiClient = new EmployeeAPIClient(page);
  await apiClient.authenticate(config.adminUsername, config.adminPassword);

  // BaseApiClient throws on error status; inspect the error
  await expect(apiClient.getEmployee(999999)).rejects.toThrow();
});
```

### Data integrity: create → get → delete

```typescript
test('CRUD lifecycle for employee', async ({ page, config }) => {
  const apiClient = new EmployeeAPIClient(page);
  await apiClient.authenticate(config.adminUsername, config.adminPassword);

  // Create
  const created = await apiClient.createEmployee({
    firstName: 'Test', lastName: 'User', employeeId: 'EMP-CRUD-01',
  });
  expect(created.empNumber).toBeDefined();

  // Read
  const fetched = await apiClient.getEmployee(created.empNumber);
  expect(fetched.firstName).toBe('Test');

  // Update
  const updated = await apiClient.updateEmployee(created.empNumber, { firstName: 'Updated' });
  expect(updated.firstName).toBe('Updated');

  // Delete
  await apiClient.deleteEmployee(created.empNumber);
  await expect(apiClient.getEmployee(created.empNumber)).rejects.toThrow();
});
```

---

## Mock API Setup

Playwright supports **route interception** to mock API responses in UI tests. This is useful for testing error states or slow networks without affecting a real server.

### Intercept a specific endpoint

```typescript
test('UI shows error when employee API fails', async ({ page }) => {
  // Intercept the employees endpoint and return a 500
  await page.route('**/api/v2/pim/employees', (route) => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' }),
    });
  });

  const loginPage = new LoginPage(page);
  await loginPage.login({ username: 'Admin', password: 'admin123' });

  const pimPage = new PimPage(page);
  await pimPage.navigate();

  // Expect the UI to display an error state
  expect(await pimPage.isErrorMessageVisible()).toBe(true);
});
```

### Mock a slow network response

```typescript
await page.route('**/api/v2/pim/employees', async (route) => {
  await new Promise((r) => setTimeout(r, 3000)); // 3-second delay
  await route.continue();
});
```

### Return fixture data

```typescript
import employees from '../fixtures/employees.json';

await page.route('**/api/v2/pim/employees', (route) => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: employees, meta: { total: employees.length } }),
  });
});
```

---

## Performance Testing APIs

For information on load testing and performance metrics for API endpoints, see [PERFORMANCE_TESTING.md](./PERFORMANCE_TESTING.md).

### Basic API response time validation

```typescript
test('employee list API responds within 2 seconds', async ({ page, config }) => {
  const apiClient = new EmployeeAPIClient(page);
  await apiClient.authenticate(config.adminUsername, config.adminPassword);

  const start = Date.now();
  await apiClient.get('/api/v2/pim/employees?limit=50');
  const duration = Date.now() - start;

  expect(duration).toBeLessThan(2000);
});
```

### Concurrent request validation

```typescript
test('API handles 5 concurrent requests', async ({ page, config }) => {
  const apiClient = new EmployeeAPIClient(page);
  await apiClient.authenticate(config.adminUsername, config.adminPassword);

  const requests = Array.from({ length: 5 }, () =>
    apiClient.get('/api/v2/pim/employees?limit=10')
  );

  const results = await Promise.all(requests);
  expect(results).toHaveLength(5);
  results.forEach((r) => expect(r).toBeDefined());
});
```
