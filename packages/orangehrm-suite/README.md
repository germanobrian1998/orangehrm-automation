# @qa-framework/orangehrm-suite

OrangeHRM-specific UI test suite built on top of [@qa-framework/core](../core/README.md).

## Overview

This package provides page objects, API clients and test helpers that are specific to the [OrangeHRM](https://opensource-demo.orangehrmlive.com) application. All base functionality (HTTP helpers, logging, wait utilities, screenshots) is inherited from `@qa-framework/core`, so only OrangeHRM business logic lives here.

## Setup

### Prerequisites

- Node.js ≥ 18
- npm workspaces (run `npm install` from the repository root)

### Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable                    | Default                                        | Description                    |
| --------------------------- | ---------------------------------------------- | ------------------------------ |
| `ORANGEHRM_BASE_URL`        | `https://opensource-demo.orangehrmlive.com`    | Target application URL         |
| `ORANGEHRM_ADMIN_USERNAME`  | `Admin`                                        | Admin login username           |
| `ORANGEHRM_ADMIN_PASSWORD`  | `admin123`                                     | Admin login password           |
| `TEST_TIMEOUT`              | `30000`                                        | Default test timeout (ms)      |
| `LOG_LEVEL`                 | `info`                                         | Winston log level              |

### Running tests

```bash
# From repository root
npm run test:orangehrm

# From this package
npm test
npm run test:smoke       # @smoke tagged tests only
npm run test:regression  # @regression tagged tests only
```

## Project structure

```
packages/orangehrm-suite/
├── src/
│   ├── api/
│   │   └── employee.api-client.ts  # EmployeeAPIClient extends BaseApiClient
│   ├── pages/
│   │   ├── login.page.ts           # LoginPage extends BasePage
│   │   └── pim.page.ts             # PimPage extends BasePage
│   ├── selectors.ts                # Centralised CSS/attribute selectors
│   └── index.ts                    # Package public API
├── tests/
│   └── suite.spec.ts               # Smoke / integration tests
├── playwright.config.ts
├── tsconfig.json
└── README.md
```

## Extending core classes

### Page objects

All page objects extend `BasePage` from `@qa-framework/core`. The base class provides:

- `goto(path)` – navigate to a relative URL with logging
- `fill(selector, value)` – clear + fill an input
- `click(selector)` – scroll into view then click
- `getText(selector)` – get trimmed text content
- `isVisible(selector)` – returns `true/false` without throwing
- `waitForUrl(pattern)` – assert URL after navigation
- `screenshot(stepName)` – take a named screenshot
- `waitFor` – access to `WaitFor` helpers (e.g. `loadingComplete()`)

```typescript
import { BasePage } from '@qa-framework/core';

export class LoginPage extends BasePage {
  async login(credentials: LoginCredentials): Promise<void> {
    await this.goto('/auth/login');
    await this.fill('[name="username"]', credentials.username);
    await this.fill('[name="password"]', credentials.password);
    await this.click('[type="submit"]');
    await this.waitForUrl(/.*\/dashboard/);
  }
}
```

### API clients

All API clients extend `BaseApiClient` from `@qa-framework/core`. The base class provides:

- `authenticate(username, password)` – fetches and stores a bearer token
- `get<T>(endpoint)` – authenticated GET request
- `post<T>(endpoint, data)` – authenticated POST request
- `put<T>(endpoint, data)` – authenticated PUT request
- `delete<T>(endpoint)` – authenticated DELETE request
- `patch<T>(endpoint, data)` – authenticated PATCH request

```typescript
import { BaseApiClient } from '@qa-framework/core';

export class EmployeeAPIClient extends BaseApiClient {
  async createEmployee(data: CreateEmployeeDTO): Promise<Employee> {
    const response = await this.post<{ data: Employee }>('/api/v2/pim/employees', data);
    return response.data;
  }

  async getEmployee(employeeId: number): Promise<Employee> {
    const response = await this.get<{ data: Employee }>(`/api/v2/pim/employees/${employeeId}`);
    return response.data;
  }
}
```

### Fixtures

Tests import the extended `test` fixture from `@qa-framework/core` which provides:

| Fixture          | Type              | Description                              |
| ---------------- | ----------------- | ---------------------------------------- |
| `logger`         | `Logger`          | Winston logger scoped to the test title  |
| `config`         | `Config`          | Singleton config instance                |
| `basePage`       | `BasePage`        | BasePage bound to the current page       |
| `baseApiClient`  | `BaseApiClient`   | BaseApiClient bound to the current page  |

```typescript
import { test, expect } from '@qa-framework/core';

test('create and verify employee', async ({ logger, page }) => {
  logger.info('Starting employee creation test');

  const loginPage = new LoginPage(page);
  await loginPage.login({ username: 'Admin', password: 'admin123' });

  const pimPage = new PimPage(page);
  await pimPage.createEmployee({ firstName: 'Jane', lastName: 'Doe', employeeId: 'EMP001' });

  expect(await pimPage.verifyEmployeeInList('EMP001')).toBe(true);
});
```

## Adding new page objects

1. Create `src/pages/my-feature.page.ts`
2. Extend `BasePage` and add feature-specific methods
3. Export from `src/index.ts`

## Adding new API clients

1. Create `src/api/my-feature.api-client.ts`
2. Extend `BaseApiClient` and add endpoint-specific methods
3. Export types and the class from `src/index.ts`
