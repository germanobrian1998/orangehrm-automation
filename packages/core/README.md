# @qa-framework/core

> Foundational layer for the QA automation monorepo.  
> All test suites depend on this package.

---

## Table of Contents

1. [Installation](#installation)
2. [Package Structure](#package-structure)
3. [BasePage](#basepage)
4. [BaseApiClient](#baseapiclient)
5. [Logger](#logger)
6. [Config](#config)
7. [TestHelpers](#testhelpers)
8. [TestFixtures](#testfixtures)
9. [Types](#types)
10. [Best Practices](#best-practices)

---

## Installation

This package is resolved automatically by npm workspaces. No manual install is required — just declare it as a dependency:

```json
{
  "dependencies": {
    "@qa-framework/core": "*"
  }
}
```

Then run `npm install` from the repository root.

---

## Package Structure

```
packages/core/src/
├── page-objects/
│   └── base.page.ts          # BasePage – extend for UI page objects
├── api-client/
│   └── base.api-client.ts    # BaseApiClient – extend for API clients
├── logger/
│   └── logger.ts             # Winston-based structured logger
├── config/
│   ├── Config.ts             # Singleton config manager
│   ├── environment.ts        # Environment variables (legacy)
│   └── constants.ts          # Shared test constants
├── utils/
│   ├── TestHelpers.ts        # General-purpose utility functions
│   ├── wait-for.ts           # WaitFor class with explicit wait helpers
│   └── screenshot-manager.ts # Smart screenshot capture
├── fixtures/
│   └── TestFixtures.ts       # Extended Playwright test fixtures
├── types/
│   └── index.ts              # Shared TypeScript types & interfaces
└── index.ts                  # Main entry point (re-exports everything)
```

---

## BasePage

`BasePage` is the base class for all UI page objects. It wraps Playwright's `Page` API with logging, error handling, and helpers.

### Usage

```typescript
import { BasePage } from '@qa-framework/core';
import { Page } from '@playwright/test';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async login(username: string, password: string): Promise<void> {
    await this.goto('/web/index.php/auth/login');
    await this.fill('input[name="username"]', username);
    await this.fill('input[name="password"]', password);
    await this.click('button[type="submit"]');
    await this.waitForUrl(/dashboard/);
  }
}
```

### Available Methods

| Method | Description |
|--------|-------------|
| `goto(path)` | Navigate to a path relative to `baseURL` |
| `click(selector)` | Scroll element into view and click it |
| `fill(selector, value)` | Clear, fill, and blur an input |
| `getText(selector)` | Return trimmed text content |
| `isVisible(selector)` | Return `true` if element is visible |
| `waitForElement(selector, state?, timeout?)` | Wait for element to reach given state |
| `waitUntil(condition, timeout?)` | Wait until an arbitrary async condition is true |
| `waitForUrl(pattern)` | Wait for URL to match pattern |
| `verifyPageTitle(title)` | Assert page title contains expected text |
| `screenshot(stepName)` | Capture a named screenshot |
| `getCurrentUrl()` | Return current page URL |
| `reload()` | Reload the page |

---

## BaseApiClient

`BaseApiClient` is the base class for API test clients. It wraps Playwright's `APIRequestContext` with bearer-token auth, typed responses, and logging.

### Usage

```typescript
import { BaseApiClient } from '@qa-framework/core';
import { Page } from '@playwright/test';

export class HrmApiClient extends BaseApiClient {
  constructor(page: Page) {
    super(page);
  }

  async getEmployees(): Promise<Employee[]> {
    return this.get<Employee[]>('/api/v2/pim/employees');
  }

  async createEmployee(data: NewEmployee): Promise<Employee> {
    return this.post<Employee>('/api/v2/pim/employees', data);
  }
}
```

### Available Methods

| Method | Description |
|--------|-------------|
| `authenticate(username, password)` | Log in and store the bearer token |
| `get<T>(endpoint)` | HTTP GET with typed response |
| `post<T>(endpoint, data?)` | HTTP POST with typed response |
| `put<T>(endpoint, data?)` | HTTP PUT with typed response |
| `delete<T>(endpoint)` | HTTP DELETE with typed response |
| `patch<T>(endpoint, data?)` | HTTP PATCH with typed response |

> All HTTP methods are `protected` — subclasses expose the business-level API.

---

## Logger

Structured Winston-based logger with daily log rotation.

### Usage

```typescript
import { createLogger } from '@qa-framework/core';

const logger = createLogger('MyPage');

logger.info('Navigation started');
logger.debug('Selector resolved', { selector: '#btn' });
logger.warn('Retrying operation');
logger.error('Action failed', new Error('timeout'));
logger.step(1, 'Fill login form');
logger.assertion(isLoggedIn, 'User is logged in');
```

Log files are written to `logs/` and rotated daily (kept for 14 days).

---

## Config

Singleton configuration manager that reads environment variables with typed defaults.

### Usage

```typescript
import { Config, config } from '@qa-framework/core';

// Use the pre-created singleton
const url = config.baseURL;

// Or get the instance explicitly
const cfg = Config.getInstance();
console.log(cfg.get('testTimeout')); // e.g. 30000
```

### Environment Variables

| Variable | Default |
|----------|---------|
| `ORANGEHRM_BASE_URL` | `https://opensource-demo.orangehrmlive.com` |
| `ORANGEHRM_ADMIN_USERNAME` | `Admin` |
| `ORANGEHRM_ADMIN_PASSWORD` | `admin123` |
| `TEST_TIMEOUT` | `30000` |
| `API_TIMEOUT` | `10000` |
| `LOG_LEVEL` | `info` |
| `DEBUG` | `false` |

Copy `.env.example` to `.env.local` and override values for your environment.

---

## TestHelpers

Pure utility functions with no external dependencies.

```typescript
import {
  sleep, randomInt, randomString, randomEmail,
  today, formatDate, addDays,
  retry, deepClone, trimObjectValues,
  isNonEmptyString, capitalise, camelToLabel,
  toQueryString, parseQueryString,
  truncate, arraysEqual, flattenObject,
} from '@qa-framework/core';

// Pause for 500ms
await sleep(500);

// Retry flaky operations
const result = await retry(() => fetchData(), 3, 1000);

// Generate test data
const email = randomEmail('company.com'); // test_abc123@company.com
const id    = randomString(8);            // e.g. "A3kRmQ7z"

// Date helpers
const nextWeek = addDays(new Date(), 7);
const formatted = formatDate(nextWeek);   // "2024-12-25"
```

---

## TestFixtures

Extended Playwright `test` object with pre-wired framework fixtures.

```typescript
import { test, expect } from '@qa-framework/core';

test('login works', async ({ logger, basePage, config }) => {
  logger.step(1, 'Navigate to login page');
  await basePage.goto('/web/index.php/auth/login');

  logger.info(`Base URL: ${config.baseURL}`);
  await expect(basePage['page']).toHaveTitle(/OrangeHRM/);
});
```

### Available Fixtures

| Fixture | Type | Description |
|---------|------|-------------|
| `logger` | `Logger` | Winston logger scoped to the current test |
| `config` | `Config` | Singleton config instance |
| `basePage` | `BasePage` | BasePage bound to the current Playwright `page` |
| `baseApiClient` | `BaseApiClient` | BaseApiClient bound to the current `page` |
| `testPage` | `Page` | Raw Playwright page (same as built-in `page`) |

---

## Types

All shared TypeScript interfaces and types are exported from `@qa-framework/core`:

```typescript
import type {
  EnvironmentConfig,
  HttpMethod,
  ApiResponse,
  ApiError,
  RequestOptions,
  LogLevel,
  LogEntry,
  NavigationOptions,
  WaitOptions,
  TestUser,
  TestEmployee,
  Credentials,
  ScreenshotOptions,
} from '@qa-framework/core';
```

---

## Best Practices

1. **Always extend `BasePage`** – never use `page` directly in test files.
2. **Always extend `BaseApiClient`** – add business-level methods and expose only those.
3. **Use `createLogger`** in every class – pass the class name as context for easier debugging.
4. **Use `Config.getInstance()`** – avoid reading `process.env` directly in test code.
5. **Use `retry()` for flaky network calls** – wrap assertions that depend on eventual consistency.
6. **Use typed responses** – always provide a generic type argument to `get<T>()`, `post<T>()`, etc.
7. **Keep page objects focused** – one page object per page/component.
8. **Write unit tests for utilities** – `TestHelpers` and `Config` logic should be tested without a browser.
