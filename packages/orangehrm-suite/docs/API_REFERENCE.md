# API Reference

This document provides a complete reference of the public API exposed by `@qa-framework/core` and `@qa-framework/orangehrm-suite`.

## Table of Contents

- [Core Package (`@qa-framework/core`)](#core-package-qa-frameworkcore)
  - [BasePage](#basepage)
  - [BaseApiClient](#baseapiclient)
  - [Config](#config)
  - [Logger](#logger)
  - [WaitFor](#waitfor)
  - [ScreenshotManager](#screenshotmanager)
  - [Fixtures](#fixtures)
  - [Constants](#constants)
  - [Types](#types)
- [OrangeHRM Suite (`@qa-framework/orangehrm-suite`)](#orangehrm-suite-qa-frameworkorangehrm-suite)
  - [LoginPage](#loginpage)
  - [DashboardPage](#dashboardpage)
  - [PimPage](#pimpage)
  - [LeavePage](#leavepage)
  - [ReportingPage](#reportingpage)
  - [EmployeeAPIClient](#employeeapiclient)
  - [selectors](#selectors)
- [Configuration Options](#configuration-options)

---

## Core Package (`@qa-framework/core`)

### BasePage

Located at `packages/core/src/page-objects/base.page.ts`.

All page objects extend this class. It provides logging, error handling, and common browser interactions.

#### Constructor

```typescript
constructor(protected page: Page)
```

#### Properties

| Property | Type | Description |
|---|---|---|
| `logger` | `Logger` | Logger scoped to the page object class name |
| `waitFor` | `WaitFor` | Collection of wait helpers |
| `screenshotManager` | `ScreenshotManager` | Screenshot capture utility |

#### Methods

| Method | Signature | Description |
|---|---|---|
| `goto` | `(path: string) => Promise<void>` | Navigate to a relative URL path |
| `fill` | `(selector: string, value: string) => Promise<void>` | Clear and fill an input field |
| `click` | `(selector: string) => Promise<void>` | Scroll into view then click |
| `doubleClick` | `(selector: string) => Promise<void>` | Double-click an element |
| `rightClick` | `(selector: string) => Promise<void>` | Right-click an element |
| `hover` | `(selector: string) => Promise<void>` | Hover over an element |
| `getText` | `(selector: string) => Promise<string>` | Get trimmed text content |
| `getInputValue` | `(selector: string) => Promise<string>` | Get current value of an input |
| `getAttribute` | `(selector: string, attribute: string) => Promise<string \| null>` | Get an attribute value |
| `isVisible` | `(selector: string) => Promise<boolean>` | Check if element is visible (no throw) |
| `isEnabled` | `(selector: string) => Promise<boolean>` | Check if element is enabled (no throw) |
| `selectOption` | `(selector: string, value: string) => Promise<void>` | Select a `<select>` dropdown option |
| `check` | `(selector: string) => Promise<void>` | Check a checkbox or radio |
| `uncheck` | `(selector: string) => Promise<void>` | Uncheck a checkbox |
| `acceptAlert` | `() => void` | Register a one-time dialog acceptor |
| `dismissAlert` | `() => void` | Register a one-time dialog dismisser |
| `waitForUrl` | `(expectedUrl: string \| RegExp) => Promise<void>` | Wait for URL to match pattern |
| `verifyPageTitle` | `(expectedTitle: string) => Promise<void>` | Assert page title contains text |
| `screenshot` | `(stepName: string) => Promise<void>` | Take a named screenshot |
| `getCurrentUrl` | `() => string` | Get the current page URL |
| `waitForElement` | `(selector: string, state?: 'visible' \| 'hidden' \| 'attached' \| 'detached', timeout?: number) => Promise<void>` | Wait for element to reach a state |
| `waitUntil` | `(condition: () => Promise<boolean>, timeout?: number) => Promise<void>` | Poll until a condition returns true |
| `reload` | `() => Promise<void>` | Reload the current page |

---

### BaseApiClient

Located at `packages/core/src/api-client/base.api-client.ts`.

All API clients extend this class. It handles authentication, request serialisation, and response parsing.

#### Constructor

```typescript
constructor(protected page: Page)
```

#### Protected Properties

| Property | Type | Description |
|---|---|---|
| `baseURL` | `string` | Base URL from `environment.baseURL` |
| `authToken` | `string \| null` | Stored bearer token after authentication |
| `logger` | `Logger` | Logger scoped to the API client class name |
| `requestContext` | `APIRequestContext \| null` | Playwright's request context |

#### Methods

| Method | Signature | Description |
|---|---|---|
| `authenticate` | `(username: string, password: string) => Promise<void>` | Authenticate and store bearer token |
| `get` | `<T>(endpoint: string) => Promise<T>` | Authenticated GET request |
| `post` | `<T>(endpoint: string, data?: unknown) => Promise<T>` | Authenticated POST request |
| `put` | `<T>(endpoint: string, data?: unknown) => Promise<T>` | Authenticated PUT request |
| `delete` | `<T>(endpoint: string) => Promise<T>` | Authenticated DELETE request |
| `patch` | `<T>(endpoint: string, data?: unknown) => Promise<T>` | Authenticated PATCH request |

> **Note:** `get`, `post`, `put`, `delete`, and `patch` are `protected`. Subclasses expose them through typed wrapper methods.

---

### Config

Located at `packages/core/src/config/Config.ts`.

A singleton that reads environment variables once and exposes typed getters.

#### Static Methods

| Method | Signature | Description |
|---|---|---|
| `getInstance` | `() => Config` | Return the singleton instance |
| `reset` | `() => void` | Reset the singleton (for use in tests) |

#### Instance Properties (getters)

| Getter | Type | Environment Variable |
|---|---|---|
| `baseURL` | `string` | `ORANGEHRM_BASE_URL` |
| `adminUsername` | `string` | `ORANGEHRM_ADMIN_USERNAME` |
| `adminPassword` | `string` | `ORANGEHRM_ADMIN_PASSWORD` |
| `testTimeout` | `number` | `TEST_TIMEOUT` |
| `apiTimeout` | `number` | `API_TIMEOUT` |
| `logLevel` | `string` | `LOG_LEVEL` |
| `debug` | `boolean` | `DEBUG` |
| `isCI` | `boolean` | `CI` |
| `isDev` | `boolean` | `NODE_ENV` |
| `browser` | `BrowserName` | `BROWSER` |
| `headless` | `boolean` | `HEADLESS` |

#### Generic getter

```typescript
get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K]
getAll(): Readonly<EnvironmentConfig>
```

#### Pre-instantiated export

```typescript
import { config } from '@qa-framework/core';
// config is the singleton instance
```

---

### Logger

Located at `packages/core/src/logger/logger.ts`.

A Winston-based structured logger. Each page object and fixture automatically creates one scoped to the class name.

#### Constructor

```typescript
new Logger(context?: string)
// Also: createLogger(context?: string): Logger
```

#### Methods

| Method | Signature | Description |
|---|---|---|
| `debug` | `(message: string, data?: unknown) => void` | Debug-level log |
| `info` | `(message: string, data?: unknown) => void` | Info-level log |
| `warn` | `(message: string, data?: unknown) => void` | Warning-level log |
| `error` | `(message: string, error?: Error \| unknown) => void` | Error-level log with optional Error |
| `step` | `(stepNumber: number, description: string) => void` | Log a numbered test step |
| `assertion` | `(condition: boolean, message: string) => void` | Log an assertion with ✓/✗ prefix |

---

### WaitFor

Located at `packages/core/src/utils/wait-for.ts`.

A collection of explicit wait helpers to avoid flaky tests.

#### Constructor

```typescript
new WaitFor(page: Page, timeout?: number)
// Also: createWaitFor(page: Page, timeout?: number): WaitFor
```

#### Methods

| Method | Signature | Description |
|---|---|---|
| `elementVisible` | `(selector: string, timeout?: number) => Promise<void>` | Wait until element is visible |
| `elementHidden` | `(selector: string, timeout?: number) => Promise<void>` | Wait until element is hidden |
| `elementAttached` | `(selector: string, timeout?: number) => Promise<void>` | Wait until element is attached to DOM |
| `urlChange` | `(expectedUrl: string \| RegExp, timeout?: number) => Promise<void>` | Wait for URL to match |
| `text` | `(text: string, timeout?: number) => Promise<void>` | Wait for text to appear on page |
| `condition` | `(callback: () => Promise<boolean>, timeout?: number, pollInterval?: number) => Promise<void>` | Poll until condition returns true |
| `networkIdle` | `(timeout?: number) => Promise<void>` | Wait for network idle |
| `loadingComplete` | `(selector?: string, timeout?: number) => Promise<void>` | Wait for loading spinner to disappear |
| `delay` | `(ms: number) => Promise<void>` | Fixed delay (use sparingly) |

---

### ScreenshotManager

Located at `packages/core/src/utils/screenshot-manager.ts`.

#### Constructor

```typescript
new ScreenshotManager(page: Page)
// Also: createScreenshotManager(page: Page): ScreenshotManager
```

#### Methods

| Method | Signature | Description |
|---|---|---|
| `take` | `(className: string, stepName: string) => Promise<void>` | Capture a named screenshot |

Screenshots are saved to `screenshots/<ClassName>/<stepName>-<timestamp>.png`.

---

### Fixtures

Located at `packages/core/src/fixtures/TestFixtures.ts`.

Extended Playwright `test` object that injects additional fixtures.

```typescript
import { test, expect } from '@qa-framework/core';
```

#### Additional fixtures

| Fixture | Type | Description |
|---|---|---|
| `logger` | `Logger` | Logger scoped to the test title |
| `config` | `Config` | Singleton Config instance |
| `basePage` | `BasePage` | BasePage bound to the current page |
| `baseApiClient` | `BaseApiClient` | BaseApiClient bound to the current page |
| `testPage` | `Page` | Playwright Page (alias for `page`) |

---

### Constants

Located at `packages/core/src/config/constants.ts`.

```typescript
import { constants } from '@qa-framework/core';

constants.TIMEOUTS.SHORT   // 5000 ms
constants.TIMEOUTS.MEDIUM  // 15000 ms
constants.TIMEOUTS.LONG    // 30000 ms
```

---

### Types

Located at `packages/core/src/types/`.

```typescript
import type { EnvironmentConfig, BrowserName } from '@qa-framework/core';

type BrowserName = 'chromium' | 'firefox' | 'webkit';

interface EnvironmentConfig {
  baseURL: string;
  adminUsername: string;
  adminPassword: string;
  testTimeout: number;
  apiTimeout: number;
  logLevel: string;
  debug: boolean;
  isCI: boolean;
  isDev: boolean;
  browser: BrowserName;
  headless: boolean;
}
```

---

## OrangeHRM Suite (`@qa-framework/orangehrm-suite`)

### LoginPage

```typescript
import { LoginPage, LoginCredentials } from '@qa-framework/orangehrm-suite';
```

#### Interfaces

```typescript
interface LoginCredentials {
  username: string;
  password: string;
}
```

#### Methods

| Method | Signature | Description |
|---|---|---|
| `login` | `(credentials: LoginCredentials) => Promise<void>` | Perform a full login flow |
| `loginAndExpectError` | `(credentials: LoginCredentials) => Promise<string>` | Attempt login and return the error message |
| `logout` | `() => Promise<void>` | Click user dropdown and select Logout |
| `isLoggedIn` | `() => Promise<boolean>` | Check if the user dropdown is visible |

---

### DashboardPage

```typescript
import { DashboardPage } from '@qa-framework/orangehrm-suite';
```

#### Methods

| Method | Signature | Description |
|---|---|---|
| `navigate` | `() => Promise<void>` | Navigate to the dashboard |
| `getWelcomeMessage` | `() => Promise<string>` | Get the welcome heading text |
| `isWidgetVisible` | `(widgetName: string) => Promise<boolean>` | Check visibility of a dashboard widget |

---

### PimPage

```typescript
import { PimPage, CreateEmployeeDTO } from '@qa-framework/orangehrm-suite';
```

#### Interfaces

```typescript
interface CreateEmployeeDTO {
  firstName: string;
  lastName: string;
  employeeId: string;
  middleName?: string;
}
```

#### Methods

| Method | Signature | Description |
|---|---|---|
| `navigate` | `() => Promise<void>` | Navigate to the PIM employee list |
| `createEmployee` | `(data: CreateEmployeeDTO) => Promise<void>` | Fill and submit the Add Employee form |
| `searchEmployee` | `(name: string) => Promise<void>` | Enter a name in the search field and click Search |
| `verifyEmployeeInList` | `(employeeId: string) => Promise<boolean>` | Check if an employee row exists in the table |
| `deleteEmployee` | `(employeeId: string) => Promise<void>` | Delete an employee from the list |

---

### LeavePage

```typescript
import { LeavePage } from '@qa-framework/orangehrm-suite';
```

#### Methods

| Method | Signature | Description |
|---|---|---|
| `navigate` | `() => Promise<void>` | Navigate to the Apply Leave page |
| `applyLeave` | `(leaveType: string, fromDate: string, toDate: string, comment?: string) => Promise<void>` | Submit a leave application |
| `getLeaveStatus` | `(leaveId: string) => Promise<string>` | Get the status of a leave request |

---

### ReportingPage

```typescript
import { ReportingPage } from '@qa-framework/orangehrm-suite';
```

#### Methods

| Method | Signature | Description |
|---|---|---|
| `navigate` | `() => Promise<void>` | Navigate to the Reports page |
| `generateReport` | `(reportName: string) => Promise<void>` | Select and generate a named report |
| `exportReport` | `(format: 'PDF' \| 'Excel' \| 'CSV') => Promise<void>` | Export the current report |

---

### EmployeeAPIClient

```typescript
import { EmployeeAPIClient } from '@qa-framework/orangehrm-suite';
```

#### Interfaces

```typescript
interface Employee {
  empNumber: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  employeeId: string;
  email?: string;
}

interface CreateEmployeeDTO {
  firstName: string;
  lastName: string;
  middleName?: string;
  employeeId: string;
}

interface UpdateEmployeeDTO {
  firstName?: string;
  lastName?: string;
  middleName?: string;
}

interface EmployeeSearchDTO {
  name?: string;
  employeeId?: string;
  limit?: number;
  offset?: number;
}

interface EmployeeListResponse {
  data: Employee[];
  meta: { total: number };
}
```

#### Methods

| Method | Signature | Description |
|---|---|---|
| `authenticate` | `(username: string, password: string) => Promise<void>` | Authenticate and store bearer token |
| `createEmployee` | `(data: CreateEmployeeDTO) => Promise<Employee>` | Create a new employee via API |
| `getEmployee` | `(employeeId: number) => Promise<Employee>` | Get employee by numeric ID |
| `updateEmployee` | `(employeeId: number, data: UpdateEmployeeDTO) => Promise<Employee>` | Update employee data |
| `deleteEmployee` | `(employeeId: number) => Promise<void>` | Delete employee by numeric ID |
| `searchEmployees` | `(filters: EmployeeSearchDTO) => Promise<Employee[]>` | Search employees with filters |
| `getEmployeeList` | `(pageNumber?: number, pageSize?: number) => Promise<EmployeeListResponse>` | Get paginated employee list |

---

### selectors

The `selectors` object provides all CSS selectors used in the suite, organised by page/feature:

```typescript
import { selectors } from '@qa-framework/orangehrm-suite';

selectors.login.usernameInput     // '#orangehrm-username'
selectors.login.passwordInput     // '#orangehrm-password'
selectors.login.submitButton      // 'button[type="submit"]'
selectors.login.errorMessage      // '.oxd-alert-content'
selectors.login.rememberMeCheckbox // 'input[type="checkbox"]'

selectors.dashboard.userDropdown  // '.oxd-userdropdown-tab'
selectors.dashboard.logoutOption  // 'a:has-text("Logout")'

selectors.pim.addEmployeeButton   // 'button:has-text("Add")'
selectors.pim.firstNameInput      // 'input[placeholder="First Name"]'
selectors.pim.employeeRow(id)     // `tr:has-text("${id}")`

selectors.leave.leaveTypeSelect   // '.oxd-select-text'
selectors.leave.fromDateInput     // 'input[placeholder="yyyy-mm-dd"]'

selectors.common.successMessage   // '.oxd-toast--success'
selectors.common.errorAlert       // '.oxd-alert--error'
selectors.common.loadingSpinner   // '.oxd-loading-spinner'
```

Full selector reference: see `packages/orangehrm-suite/src/selectors.ts`.

---

## Configuration Options

### Environment variables

| Variable | Type | Default | Description |
|---|---|---|---|
| `ORANGEHRM_BASE_URL` | string | `https://opensource-demo.orangehrmlive.com` | Target application URL |
| `ORANGEHRM_ADMIN_USERNAME` | string | `Admin` | Admin login username |
| `ORANGEHRM_ADMIN_PASSWORD` | string | `admin123` | Admin login password |
| `TEST_TIMEOUT` | number | `30000` | Global test timeout (ms) |
| `API_TIMEOUT` | number | `10000` | API request timeout (ms) |
| `BROWSER` | string | `chromium` | Browser: `chromium`, `firefox`, `webkit` |
| `HEADLESS` | boolean | `true` | Run browser headlessly |
| `LOG_LEVEL` | string | `info` | Log level: `error`, `warn`, `info`, `debug` |
| `DEBUG` | boolean | `false` | Enable debug-level logging |
| `CI` | boolean | `false` | CI mode (retries, forbidOnly, reduced workers) |
| `NODE_ENV` | string | – | Determines which `.env` file is loaded |
| `ALLURE_RESULTS_DIR` | string | `./test-results` | Allure results output directory |

### Playwright configuration

Key options in `packages/orangehrm-suite/playwright.config.ts`:

| Option | CI Value | Local Value | Description |
|---|---|---|---|
| `fullyParallel` | `true` | `true` | Run tests and files in parallel |
| `forbidOnly` | `true` | `false` | Fail if `test.only()` is present |
| `retries` | `2` | `0` | Automatic test retries on failure |
| `workers` | `2` | auto | Number of parallel workers |
| `timeout` | from env | from env | Per-test timeout |
| `screenshot` | `only-on-failure` | `only-on-failure` | When to capture screenshots |
| `trace` | `on-first-retry` | `on-first-retry` | When to capture traces |
