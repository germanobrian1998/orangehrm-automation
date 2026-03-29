# Testing Best Practices

This document describes the patterns and conventions used in this project. Following these guidelines keeps the test suite stable, readable, and maintainable.

---

## Table of Contents

- [Page Object Model](#page-object-model)
- [Selectors](#selectors)
- [AAA Pattern](#aaa-pattern)
- [Async Handling](#async-handling)
- [Assertions](#assertions)
- [Test Data Management](#test-data-management)
- [Error Handling](#error-handling)
- [Test Organisation](#test-organisation)
- [API Testing](#api-testing)
- [Cross-Browser Compatibility](#cross-browser-compatibility)
- [Reporting and Debugging](#reporting-and-debugging)

---

## Page Object Model

Separate page structure from test logic. Each page class encapsulates its own selectors and actions.

```typescript
// src/pages/LoginPage.ts
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly usernameInput = '#txtUsername';
  private readonly passwordInput = '#txtPassword';
  private readonly loginButton = 'button[type="submit"]';
  private readonly errorAlert = '.oxd-alert-content';

  constructor(page: Page) {
    super(page);
  }

  async navigateToLogin(): Promise<void> {
    await this.goto('/web/index.php/auth/login');
  }

  async login(username: string, password: string): Promise<void> {
    await this.fillInput(this.usernameInput, username);
    await this.fillInput(this.passwordInput, password);
    await this.clickButton(this.loginButton);
  }

  async verifyLoginSuccess(): Promise<void> {
    await this.page.waitForURL('**/dashboard/**');
  }
}
```

**Rules:**

- Selectors live **only** in the page class — never in test files
- Page methods return `Promise<void>` for actions and `Promise<boolean | string>` for queries
- Keep page classes focused: one class per page or major page section
- Inherit from `BasePage` to reuse common helpers

---

## Selectors

Choose selectors that are stable across application updates.

**Priority order (most to least stable):**

1. `data-testid` attribute
2. ARIA role + accessible name
3. Semantic HTML (`button[type="submit"]`, `input[name="username"]`)
4. Unique CSS class with a meaningful name
5. XPath (last resort — avoid if possible)

```typescript
// ✅ Most stable
'[data-testid="login-btn"]'

// ✅ Semantic and stable
'button[type="submit"]'
'input[placeholder="Username"]'

// ⚠️ Works, but brittle if CSS is refactored
'.oxd-button--medium'

// ❌ Avoid — breaks on any DOM reordering
'div:nth-child(2) > .container > button'
```

---

## AAA Pattern

Every test should be divided into three clearly separated phases:

| Phase | Purpose |
|---|---|
| **Arrange** | Set up preconditions: navigate, prepare data, create page objects |
| **Act** | Perform the single action under test |
| **Assert** | Verify the expected result with Playwright's web-first assertions |

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { EmployeePage } from '../../src/pages/EmployeePage';

test.describe('Employee Management', () => {
  test('should display employee list after login @smoke', async ({ page }) => {
    // ── Arrange ───────────────────────────────────────────────────────────────
    const loginPage = new LoginPage(page);
    const employeePage = new EmployeePage(page);
    await loginPage.navigateToLogin();
    await loginPage.login('Admin', 'admin123');

    // ── Act ───────────────────────────────────────────────────────────────────
    await employeePage.navigateToEmployeeList();

    // ── Assert ────────────────────────────────────────────────────────────────
    await employeePage.verifyEmployeeTableVisible();
  });
});
```

**Rules:**

- Keep each phase visually separated — a blank line or a short comment is enough
- One action per test; if you need to test two independent actions, write two tests
- Never assert inside the Arrange phase; if setup can fail, it belongs in a `beforeEach` with its own error message
- Keep Act as short as possible — a single method call from a page object is ideal

---

## Async Handling

Always `await` Playwright actions. Use built-in wait helpers rather than `page.waitForTimeout`.

```typescript
// ✅ Playwright waits for the element automatically
await page.click('button[type="submit"]');
await page.fill('#txtUsername', 'Admin');

// ✅ Wait for navigation after an action
await page.click('.login-btn');
await page.waitForURL('**/dashboard/**');

// ✅ Wait for a specific element to appear
await page.waitForSelector('.oxd-topbar-header', { state: 'visible' });

// ❌ Avoid arbitrary sleeps — they make tests slow and unreliable
await page.waitForTimeout(3000);
```

---

## Assertions

Use Playwright's `expect` with web-first assertions. These automatically retry until the condition is met or the timeout expires.

```typescript
import { expect } from '@playwright/test';

// ✅ Web-first assertions (auto-retry)
await expect(page).toHaveURL(/dashboard/);
await expect(page.locator('h6')).toHaveText('Dashboard');
await expect(page.locator('.oxd-alert')).toBeVisible();

// ✅ Soft assertions — collect all failures before failing the test
await expect.soft(page.locator('.employee-name')).toBeVisible();
await expect.soft(page.locator('.employee-id')).toHaveText('0001');

// ❌ Non-retrying assertion on a value that may not be ready yet
const text = await page.locator('h6').textContent();
expect(text).toBe('Dashboard'); // may fail on slow networks
```

---

## Test Data Management

Externalise test data to avoid hardcoding values in tests.

### Environment variables

```bash
# .env (never commit credentials)
BASE_URL=https://opensource-demo.orangehrmlive.com
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=admin123
```

```typescript
// src/config/environment.ts
export const env = {
  baseURL: process.env.BASE_URL ?? 'https://opensource-demo.orangehrmlive.com',
  adminUsername: process.env.ADMIN_USERNAME ?? 'Admin',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'admin123',
};
```

### CSV-driven tests

For login scenarios with multiple credential sets, store data in `tests/data-driven/login-data.csv` and read it in the test:

```typescript
import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const rows = fs
  .readFileSync(path.join(__dirname, 'login-data.csv'), 'utf-8')
  .split('\n')
  .slice(1) // skip header
  .filter(Boolean)
  .map(row => row.split(','));

for (const [username, password, expected] of rows) {
  test(`login with ${username} expects ${expected}`, async ({ page }) => {
    // ...
  });
}
```

---

## Error Handling

Handle expected errors gracefully; let unexpected ones bubble up.

```typescript
// ✅ Graceful handling for known optional elements
async dismissCookieBanner(): Promise<void> {
  const banner = this.page.locator('[data-testid="cookie-banner"]');
  if (await banner.isVisible({ timeout: 2000 }).catch(() => false)) {
    await banner.locator('button:has-text("Accept")').click();
  }
}

// ✅ Meaningful custom error messages
async verifyEmployeeCount(expected: number): Promise<void> {
  const count = await this.page.locator('.oxd-table-row').count();
  expect(count, `Expected ${expected} employee rows but found ${count}`).toBe(expected);
}

// ❌ Swallowing all errors hides real failures
try {
  await someAction();
} catch {
  // silent — don't do this
}
```

---

## Test Organisation

```
tests/
├── smoke/          # @smoke — fast validation, run on every push (~1 min)
├── api/            # API contract and status code tests
├── cross-browser/  # Key flows validated on Chromium, Firefox, WebKit
└── data-driven/    # Parameterised tests from CSV or JSON
```

**Guidelines:**

- One test file per feature area (e.g., `login.spec.ts`, `leave.spec.ts`)
- Group related tests with `test.describe`
- Use `test.beforeEach` for shared setup (login, navigation)
- Use `test.afterEach` only for cleanup that is genuinely needed
- Keep each test independent — avoid state shared across tests

---

## API Testing

Use Playwright's `request` fixture for API tests. Always validate the status code before accessing the body.

```typescript
import { test, expect } from '@playwright/test';
import { env } from '../../src/config/environment';

test.describe('Employee API', () => {
  const baseURL = `${env.baseURL}/web/index.php/api/v2`;

  test('should return 401 without authentication', async ({ request }) => {
    const response = await request.get(`${baseURL}/pim/employees`);
    expect(response.status()).toBe(401);
  });

  test('should return employees list when authenticated', async ({ request }) => {
    // Authenticate first via API — credentials come from environment config, not hardcoded
    const auth = await request.post(`${baseURL}/auth/login`, {
      data: {
        username: env.adminUsername,
        password: env.adminPassword,
        clientId: 'api_oauth_id',
        grantType: 'password',
      },
    });
    const { access_token } = await auth.json();

    const response = await request.get(`${baseURL}/pim/employees`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });
});
```

---

## Cross-Browser Compatibility

Run key user journeys against all three browser engines to catch rendering differences.

```typescript
// playwright.config.ts
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
],
```

**Tips:**

- Run the full matrix in CI, not locally (use `--project=chromium` for local iteration)
- Set `retries: 2` in CI to handle transient network issues
- Screenshots are captured on failure automatically (`screenshot: 'only-on-failure'`)

---

## Reporting and Debugging

### HTML Report

```bash
# Generate and open the report
npm run report
```

### Traces

Traces record every action, screenshot, and network request for a failed test.

```bash
# View a trace file
npx playwright show-trace test-results/<test-folder>/trace.zip
```

Traces are captured on the first retry in CI (`trace: 'on-first-retry'` in `playwright.config.ts`).

### Debug Mode

```bash
# Open Playwright Inspector for step-by-step debugging
npm run test:debug

# Interactive UI mode with time-travel debugging
npm run test:ui
```

### Logging

Use the project logger for structured output:

```typescript
import { logger } from '../utils/logger';

logger.info('Navigating to login page');
logger.error('Login failed', { username, statusCode });
```

---

## Code Quality Standards

### TypeScript

- Use explicit types for all function parameters and return values; avoid `any`
- Enable strict mode in `tsconfig.json` (`"strict": true`)
- Prefer `async/await` over `.then()` chains
- Export page objects and utilities via `index.ts` barrel files

```typescript
// ✅ Explicit types, async/await
async getEmployeeCount(): Promise<number> {
  return await this.page.locator('.oxd-table-row').count();
}

// ❌ Implicit return type, any parameter
async getCount(selector) {
  return this.page.locator(selector).count();
}
```

### Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Test files | `kebab-case.spec.ts` | `leave-request.spec.ts` |
| Page classes | `PascalCase` | `LeaveRequestPage` |
| Page files | `kebab-case.page.ts` | `leave-request.page.ts` |
| Test suites | Sentence describing the feature | `'Leave Request Submission'` |
| Test cases | Sentence starting with `should` | `'should submit a leave request'` |
| Private selectors | `camelCase` with descriptive suffix | `submitButton`, `errorAlert` |

### Keep Tests Independent

- Each test must be able to run in isolation — no shared mutable state between tests
- Use `test.beforeEach` for setup; use `test.afterEach` only when cleanup is strictly required
- Avoid storing results from one test and using them in another

```typescript
// ✅ Self-contained test
test('should navigate to employee list', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const employeePage = new EmployeePage(page);
  await loginPage.navigateToLogin();
  await loginPage.login('Admin', 'admin123');
  await employeePage.navigateToEmployeeList();
  await employeePage.verifyEmployeeTableVisible();
});

// ❌ Depends on another test having run first
test('should see employee added in previous test', async ({ page }) => {
  // Fails if the previous test didn't run or the order changed
});
```

### Linting & Formatting

Run these commands before every commit:

```bash
npm run lint        # Check for ESLint errors
npm run lint:fix    # Auto-fix fixable ESLint errors
npm run format      # Format all files with Prettier
npm run build       # TypeScript type-check (no emit)
```