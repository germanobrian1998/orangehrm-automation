# @qa-framework/core

> The foundational layer of the QA Automation Framework.
> All other packages depend on this package.

---

## 📦 What's included

| Module | File | Purpose |
|---|---|---|
| `BasePage` | `src/page-objects/BasePage.ts` | Abstract base class for all Page Objects |
| `BaseApiClient` | `src/api-client/BaseApiClient.ts` | Abstract base class for API clients (axios) |
| `Logger` | `src/logger/Logger.ts` | Centralized Winston-based logging |
| `Config` | `src/config/Config.ts` | Environment variable management (singleton) |
| `TestHelpers` | `src/utils/TestHelpers.ts` | Common test utility functions |
| `TestFixtures` | `src/fixtures/TestFixtures.ts` | Playwright fixture extensions |
| Types | `src/types/index.ts` | Shared TypeScript interfaces & types |

---

## 🚀 Getting started

### Install

This package is consumed via npm workspaces from the monorepo root:

```bash
# From the monorepo root
npm install
```

### Build

```bash
npm run core:build
# or directly
cd packages/core && npm run build
```

### Run unit tests

```bash
npm run core:test
# or directly
cd packages/core && npm test
```

---

## 🏗️ Usage

### BasePage

`BasePage` is an abstract class. Extend it to create page-specific classes.

```typescript
import { BasePage } from '@qa-framework/core';
import { Page } from '@playwright/test';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async login(username: string, password: string): Promise<void> {
    await this.goto('/web/index.php/auth/login');
    await this.fill('[name="username"]', username);
    await this.fill('[name="password"]', password);
    await this.click('[type="submit"]');
  }

  async verifyLoginSuccess(): Promise<void> {
    await this.waitForUrl(/dashboard/);
  }
}
```

**Available methods:**

| Method | Signature | Description |
|---|---|---|
| `goto` | `(url, options?) => Promise<void>` | Navigate to a URL |
| `click` | `(selector) => Promise<void>` | Click an element |
| `fill` | `(selector, text) => Promise<void>` | Clear and fill an input |
| `getText` | `(selector) => Promise<string>` | Get trimmed text content |
| `getInputValue` | `(selector) => Promise<string>` | Get input field value |
| `waitForElement` | `(selector, options?) => Promise<void>` | Wait for element visibility |
| `waitForUrl` | `(pattern, timeout?) => Promise<void>` | Wait for URL match |
| `isVisible` | `(selector) => Promise<boolean>` | Check element visibility |
| `isEnabled` | `(selector) => Promise<boolean>` | Check element enabled state |
| `selectOption` | `(selector, value) => Promise<void>` | Select dropdown option |
| `check` / `uncheck` | `(selector) => Promise<void>` | Toggle checkboxes |
| `verifyPageTitle` | `(title) => Promise<void>` | Assert page title |
| `acceptAlert` / `dismissAlert` | `() => void` | Handle browser dialogs |
| `reload` | `(options?) => Promise<void>` | Reload the page |
| `getCurrentUrl` | `() => string` | Get current URL |

---

### BaseApiClient

`BaseApiClient` is an abstract class. Extend it to create endpoint-specific API clients.

```typescript
import { BaseApiClient } from '@qa-framework/core';
import { AxiosResponse } from 'axios';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
}

export class EmployeeApiClient extends BaseApiClient {
  constructor(baseUrl: string) {
    super(baseUrl);
  }

  async getEmployee(id: number): Promise<AxiosResponse<Employee>> {
    return this.get<Employee>(`/api/v2/pim/employees/${id}`);
  }

  async createEmployee(data: Partial<Employee>): Promise<AxiosResponse<Employee>> {
    return this.post<Employee>('/api/v2/pim/employees', data);
  }
}

// In your test:
const client = new EmployeeApiClient('https://demo.orangehrmlive.com');
await client.authenticate({ username: 'Admin', password: 'admin123' });
const { data } = await client.getEmployee(1);
```

**Available methods:**

| Method | Signature | Description |
|---|---|---|
| `authenticate` | `(credentials, endpoint?) => Promise<void>` | Log in and store bearer token |
| `setAuthToken` | `(token) => void` | Manually set bearer token |
| `clearAuthToken` | `() => void` | Remove stored token |
| `get` | `(endpoint, options?) => Promise<AxiosResponse<T>>` | GET request |
| `post` | `(endpoint, body?, options?) => Promise<AxiosResponse<T>>` | POST request |
| `put` | `(endpoint, body?, options?) => Promise<AxiosResponse<T>>` | PUT request |
| `delete` | `(endpoint, options?) => Promise<AxiosResponse<T>>` | DELETE request |
| `patch` | `(endpoint, body?, options?) => Promise<AxiosResponse<T>>` | PATCH request |

---

### Logger

```typescript
import { Logger, createLogger } from '@qa-framework/core';

const logger = new Logger('LoginTests');
// or
const logger = createLogger('LoginTests');

logger.info('Test started');
logger.step(1, 'Navigate to login page');
logger.debug('Element selector', { selector: '#username' });
logger.warn('Slow network response');
logger.error('Test failed', new Error('Element not found'));
logger.assertion(true, 'User is logged in');
```

Logs are written to:
- **Console** — colorised, human-readable
- **`logs/combined.log`** — all levels (JSON)
- **`logs/error.log`** — errors only (JSON)

---

### Config

```typescript
import { Config } from '@qa-framework/core';

const config = Config.getInstance();

// Read a string variable (throws if missing and no default)
const baseUrl = config.get('BASE_URL', 'https://demo.orangehrmlive.com');

// Read a number variable
const timeout = config.getNumber('TIMEOUT', 30000);

// Read a boolean variable
const headless = config.getBoolean('HEADLESS', true);

// Get a full EnvironmentConfig object
const env = config.getEnvironmentConfig();
// { baseUrl, apiUrl, timeout, retries, logLevel, environment }
```

Create a `.env` file at the project root:

```env
BASE_URL=https://opensource-demo.orangehrmlive.com
API_URL=https://opensource-demo.orangehrmlive.com/api/v2
TIMEOUT=30000
RETRIES=2
LOG_LEVEL=info
ENVIRONMENT=test
```

---

### TestHelpers

```typescript
import { TestHelpers } from '@qa-framework/core';

// Generate unique test data
const username = TestHelpers.uniqueUsername('qa');      // "qa_1716300000000"
const email    = TestHelpers.uniqueEmail('test.local'); // "qa_1716300000000@test.local"
const id       = TestHelpers.uniqueId('emp');           // "emp_1716300000000_a3f2g"

// Date helpers
const today    = TestHelpers.today();            // "2024-06-15"
const tomorrow = TestHelpers.dateFromToday(1);   // "2024-06-16"

// Retry flaky async operations
const result = await TestHelpers.retry(
  () => fetchSomething(),
  { maxRetries: 3, delay: 500, backoff: true },
);

// Wait for a condition
await TestHelpers.waitUntil(() => element.isVisible(), { timeout: 5000, interval: 200 });

// Utilities
TestHelpers.maskSecret('mysecret');   // "*****ret"
TestHelpers.toKebabCase('MyClass');   // "my-class"
TestHelpers.capitalise('hello');      // "Hello"
const copy = TestHelpers.deepClone({ a: 1 });
```

---

### TestFixtures

Extend the core fixtures in your test files to get `logger`, `config`, `baseUrl`, `apiUrl`, and `timeout` pre-wired:

```typescript
import { test, expect } from '@qa-framework/core';

test('can load the home page', async ({ page, baseUrl, logger }) => {
  logger.step(1, 'Navigate to home page');
  await page.goto(baseUrl);
  expect(page.url()).toContain('orangehrmlive');
});
```

To compose additional fixtures:

```typescript
import { test as base } from '@qa-framework/core';
import { LoginPage } from '../pages/LoginPage';

const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { test };
```

---

## 🏆 Best Practices

1. **Always extend `BasePage`** — never write raw `page.locator()` calls in test files.
2. **Always extend `BaseApiClient`** — keeps authentication and error handling centralised.
3. **Use `TestHelpers.uniqueId()`** for any test data that must be unique across parallel runs.
4. **Use `Config.getInstance()`** — never hardcode URLs or credentials.
5. **Log every test step** with `logger.step(n, description)` for easier debugging in CI.
6. **Add `@smoke` / `@regression` tags** to tests so selective runs work out-of-the-box.

---

## 📁 Package structure

```
packages/core/
├── src/
│   ├── api-client/
│   │   └── BaseApiClient.ts
│   ├── config/
│   │   └── Config.ts
│   ├── fixtures/
│   │   └── TestFixtures.ts
│   ├── logger/
│   │   └── Logger.ts
│   ├── page-objects/
│   │   └── BasePage.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── TestHelpers.ts
│   └── index.ts
├── tests/
│   ├── mocks/
│   │   └── mockData.ts
│   └── unit/
│       ├── Config.test.ts
│       ├── Logger.test.ts
│       └── TestHelpers.test.ts
├── jest.config.js
├── package.json
├── README.md
└── tsconfig.json
```
