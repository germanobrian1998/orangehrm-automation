# 📋 Testing Best Practices

Patterns and conventions for the OrangeHRM Automation Suite. Follow these guidelines to keep the test suite stable, readable, and maintainable.

---

## Table of Contents

- [Page Object Model](#-page-object-model)
- [Selector Stability Guide](#-selector-stability-guide)
- [AAA Pattern](#-aaa-pattern)
- [Async/Await Patterns](#-asyncawait-patterns)
- [Assertions](#-assertions)
- [Error Handling Patterns](#-error-handling-patterns)
- [Test Data Management](#-test-data-management)
- [Test Organisation](#-test-organisation)
- [API Testing](#-api-testing)
- [Cross-Browser Compatibility](#-cross-browser-compatibility)
- [Reporting and Debugging](#-reporting-and-debugging)
- [Code Quality Standards](#-code-quality-standards)
- [Anti-Patterns](#-anti-patterns)

---

## 🏗️ Page Object Model

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

  async getErrorMessage(): Promise<string> {
    return (await this.page.locator(this.errorAlert).textContent()) ?? '';
  }
}
```

**Rules:**

- Selectors live **only** in the page class — never in test files
- Page methods return `Promise<void>` for actions and `Promise<boolean | string>` for queries
- Keep page classes focused: one class per page or major page section
- Inherit from `BasePage` to reuse common helpers (`goto`, `fillInput`, `clickButton`, etc.)

### `BasePage` contract

`packages/core/src/page-objects/BasePage.ts` provides:

```typescript
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected async goto(path: string): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState('domcontentloaded');
  }

  protected async fillInput(selector: string, value: string): Promise<void> {
    await this.page.locator(selector).clear();
    await this.page.locator(selector).fill(value);
  }

  protected async clickButton(selector: string): Promise<void> {
    await this.page.locator(selector).click();
  }
}
```

---

## 🎯 Selector Stability Guide

Choose selectors that survive UI redesigns and refactors.

**Priority order (most stable → least stable):**

| Priority | Selector type       | Example                                           | Stability                  |
| -------- | ------------------- | ------------------------------------------------- | -------------------------- |
| 1        | `data-testid`       | `[data-testid="login-btn"]`                       | ✅ Highest — test-specific |
| 2        | ARIA role + name    | `getByRole('button', { name: 'Login' })`          | ✅ Semantic                |
| 3        | Form attributes     | `button[type="submit"]`, `input[name="username"]` | ✅ Structural              |
| 4        | Placeholder / label | `getByPlaceholder('Username')`                    | ✅ User-visible            |
| 5        | Semantic CSS class  | `.oxd-button--main`                               | ⚠️ Brittle on refactor     |
| 6        | Position-based      | `div:nth-child(2) button`                         | ❌ Breaks on reorder       |
| 7        | XPath               | `//button[contains(text(),'Login')]`              | ❌ Last resort             |

```typescript
// ✅ Best — explicitly added for testing
page.getByTestId('employee-save-btn');

// ✅ Great — semantic, accessible
page.getByRole('button', { name: 'Save' });
page.getByRole('textbox', { name: 'First Name' });

// ✅ Good — stable form attributes
page.locator('button[type="submit"]');
page.locator('input[placeholder="Username"]');

// ⚠️ Fragile — CSS classes can change on redesign
page.locator('.oxd-button--medium');

// ❌ Avoid — breaks on any DOM reordering
page.locator('div:nth-child(2) > .container > button');
```

### Avoiding selector conflicts

When a selector matches multiple elements, always narrow it:

```typescript
// ❌ Ambiguous — multiple save buttons on the page
await page.locator('button:has-text("Save")').click();

// ✅ Scoped to a specific form section
await page.locator('[data-testid="personal-info-form"]').locator('button:has-text("Save")').click();

// ✅ Or use the index when order is guaranteed
await page.locator('button:has-text("Save")').first().click();
```

---

## ✅ AAA Pattern

Every test should be divided into three clearly separated phases:

| Phase       | Purpose                                                               |
| ----------- | --------------------------------------------------------------------- |
| **Arrange** | Set up preconditions: navigate, create data, instantiate page objects |
| **Act**     | Perform the single action under test                                  |
| **Assert**  | Verify the expected result with Playwright's web-first assertions     |

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { EmployeePage } from '../../src/pages/EmployeePage';

test.describe('Employee Management', () => {
  test('displays employee list after login @smoke', async ({ page }) => {
    // ── Arrange ───────────────────────────────────────────────────────
    const loginPage = new LoginPage(page);
    const employeePage = new EmployeePage(page);
    await loginPage.navigateToLogin();
    await loginPage.login('Admin', process.env.ADMIN_PASSWORD!);

    // ── Act ───────────────────────────────────────────────────────────
    await employeePage.navigateToEmployeeList();

    // ── Assert ────────────────────────────────────────────────────────
    await expect(page.locator('.oxd-table')).toBeVisible();
  });
});
```

**Rules:**

- One action per test; if two independent things need testing, write two tests
- Never assert inside the Arrange phase
- Keep Act as short as possible — ideally a single page object method call

---

## ⚡ Async/Await Patterns

Always `await` Playwright actions. Use built-in wait helpers rather than `page.waitForTimeout`.

```typescript
// ✅ Playwright auto-waits for actionability
await page.click('button[type="submit"]');
await page.fill('#txtUsername', 'Admin');

// ✅ Wait for navigation after clicking a link
await Promise.all([page.waitForURL('**/dashboard/**'), page.click('.login-btn')]);

// ✅ Wait for a specific API response (SPA data loading)
await Promise.all([
  page.waitForResponse((r) => r.url().includes('/api/v2/pim/employees')),
  page.click('[data-testid="employee-menu"]'),
]);

// ✅ Wait for DOM state
await page.waitForSelector('.oxd-topbar-header', { state: 'visible' });
await page.waitForLoadState('domcontentloaded');

// ❌ Never — arbitrary sleeps make tests slow and hide race conditions
await page.waitForTimeout(3000);
```

### Choosing the right `waitForLoadState`

| State                | Waits until          | Use when                       |
| -------------------- | -------------------- | ------------------------------ |
| `'domcontentloaded'` | HTML parsed          | SPA navigation (fastest)       |
| `'load'`             | All resources loaded | Page has images/scripts needed |
| `'networkidle'`      | No network for 500ms | Dynamic data loading completes |

---

## 🔍 Assertions

Use Playwright's web-first `expect` — assertions automatically retry until they pass or timeout.

```typescript
import { expect } from '@playwright/test';

// ✅ Web-first — auto-retry up to expect.timeout
await expect(page).toHaveURL(/dashboard/);
await expect(page.locator('h6')).toHaveText('Dashboard');
await expect(page.locator('.oxd-alert')).toBeVisible();
await expect(page.locator('.oxd-table-row')).toHaveCount(5);

// ✅ Soft assertions — collect all failures before failing
await expect.soft(page.locator('.employee-name')).toBeVisible();
await expect.soft(page.locator('.employee-id')).toHaveText('0001');

// ✅ Custom failure message
await expect(page.locator('.error'), 'Error message should appear on invalid login').toBeVisible();

// ❌ Gets the value immediately — may fail before element updates
const text = await page.locator('h6').textContent();
expect(text).toBe('Dashboard');
```

---

## 🛡️ Error Handling Patterns

Handle **expected** errors gracefully; let unexpected ones propagate.

```typescript
// ✅ Optional element — handle gracefully with a timeout
async dismissCookieBanner(): Promise<void> {
  const banner = this.page.locator('[data-testid="cookie-banner"]');
  const isVisible = await banner.isVisible({ timeout: 2000 }).catch(() => false);
  if (isVisible) {
    await banner.locator('button:has-text("Accept")').click();
  }
}

// ✅ Custom error message for assertion failures
async verifyEmployeeCount(expected: number): Promise<void> {
  const count = await this.page.locator('.oxd-table-row').count();
  expect(count, `Expected ${expected} employee rows, got ${count}`).toBe(expected);
}

// ✅ Log and rethrow — preserve stack trace
async login(username: string, password: string): Promise<void> {
  try {
    await this.fillInput(this.usernameInput, username);
    await this.fillInput(this.passwordInput, password);
    await this.clickButton(this.loginButton);
  } catch (error) {
    this.logger.error('Login action failed', { username, error });
    throw error; // always rethrow — don't swallow
  }
}

// ❌ Swallowing errors masks real failures
try {
  await someAction();
} catch {
  // silent — never do this in tests
}
```

---

## 📊 Test Data Management

Externalise test data — never hardcode credentials or PII.

### Environment variables

```bash
# .env.example (committed — no real values)
ORANGEHRM_BASE_URL=https://opensource-demo.orangehrmlive.com
ORANGEHRM_ADMIN_USERNAME=Admin
ORANGEHRM_ADMIN_PASSWORD=your_password_here
```

```typescript
// packages/core/src/config/environment.ts
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export const config = {
  baseURL: process.env.ORANGEHRM_BASE_URL ?? 'https://opensource-demo.orangehrmlive.com',
  adminUsername: process.env.ORANGEHRM_ADMIN_USERNAME ?? 'Admin',
  adminPassword: process.env.ORANGEHRM_ADMIN_PASSWORD!,
};
```

### Generated data with Faker

```typescript
import { faker } from '@faker-js/faker';

const employee = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email({ provider: 'example.com' }), // non-real domain
};
```

### CSV-driven tests

```typescript
// tests/data-driven/login.spec.ts
const rows = fs
  .readFileSync('tests/data-driven/login-data.csv', 'utf-8')
  .split('\n')
  .slice(1)
  .filter(Boolean)
  .map((r) => r.split(','));

for (const [username, password, expected] of rows) {
  test(`login: ${username} expects ${expected}`, async ({ page }) => {
    await loginPage.login(username, password);
    await expect(page).toHaveURL(new RegExp(expected));
  });
}
```

---

## 📁 Test Organisation

```
tests/
├── smoke/          # @smoke — fast validation, every push (~5 min)
├── api/            # API contract and status code tests
├── cross-browser/  # Key flows on Chromium, Firefox, WebKit
├── data-driven/    # Parameterised tests from CSV
└── performance/    # Web Vitals and timing checks
```

**Rules:**

- One test file per feature area (`login.spec.ts`, `leave.spec.ts`)
- Group related tests with `test.describe`
- Use `test.beforeEach` for shared setup; `test.afterEach` for cleanup
- Each test must be independent — no shared mutable state between tests

---

## 🔌 API Testing

```typescript
import { test, expect } from '@playwright/test';

test.describe('Employee API', () => {
  test('returns 401 without authentication', async ({ request }) => {
    const response = await request.get(
      'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/pim/employees'
    );
    expect(response.status()).toBe(401);
  });

  test('returns employee list when authenticated', async ({ request }) => {
    // Arrange: API auth (faster than UI login)
    const authResponse = await request.post('/web/index.php/api/v2/auth/login', {
      data: {
        username: config.adminUsername,
        password: config.adminPassword,
        grantType: 'password',
      },
    });
    const { access_token } = await authResponse.json();

    // Act
    const response = await request.get('/web/index.php/api/v2/pim/employees', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    // Assert
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(body.data).toBeInstanceOf(Array);
  });
});
```

---

## 🌐 Cross-Browser Compatibility

```typescript
// playwright.config.ts — all 3 engines
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
],
```

**Tips:**

- Run multi-browser in CI; use `--project=chromium` locally for speed
- Skip known browser-specific issues, don't ignore them:
  ```typescript
  test.skip(browserName === 'webkit', 'Tracked in #42 — WebKit timing issue');
  ```

---

## 📈 Reporting and Debugging

```bash
# Open HTML report after a test run
npm run report

# Step-by-step debugger
npm run test:debug

# Interactive UI mode with time travel
npm run test:ui

# View a trace file (from CI artifact or local run)
npx playwright show-trace test-results/<test-folder>/trace.zip
```

Traces (`trace: 'on-first-retry'`) capture every action, screenshot, and network request — invaluable for CI failures.

---

## 🏆 Code Quality Standards

### TypeScript conventions

```typescript
// ✅ Explicit return types, no 'any'
async getEmployeeCount(): Promise<number> {
  return await this.page.locator('.oxd-table-row').count();
}

// ❌ Implicit types, 'any' parameter
async getCount(selector: any) {
  return this.page.locator(selector).count();
}
```

### Naming conventions

| Entity            | Convention                       | Example                                  |
| ----------------- | -------------------------------- | ---------------------------------------- |
| Test files        | `kebab-case.spec.ts`             | `leave-request.spec.ts`                  |
| Page classes      | `PascalCase`                     | `LeaveRequestPage`                       |
| Page files        | `PascalCase.ts`                  | `LeaveRequestPage.ts`                    |
| Test suites       | Noun phrase                      | `'Leave Request Submission'`             |
| Test cases        | Verb phrase describing behaviour | `'submits a leave request successfully'` |
| Private selectors | `camelCase`                      | `submitButton`, `errorAlert`             |

### Before every commit

```bash
npm run lint        # ESLint check
npm run lint:fix    # Auto-fix ESLint errors
npm run format      # Prettier formatting
npm run build       # TypeScript type check
```

---

## ❌ Anti-Patterns

### Don't use selectors in test files

```typescript
// ❌ Selector leaks into test — brittle
test('login', async ({ page }) => {
  await page.fill('#txtUsername', 'Admin');
  await page.click('button[type="submit"]');
});

// ✅ All selectors in page object
test('login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('Admin', config.adminPassword);
});
```

### Don't use arbitrary waits

```typescript
// ❌ Slow and hides race conditions
await page.waitForTimeout(3000);

// ✅ Wait for the actual condition
await page.waitForSelector('.dashboard', { state: 'visible' });
```

### Don't hardcode credentials

```typescript
// ❌ Exposed in source control
await loginPage.login('Admin', 'admin123');

// ✅ From environment config
await loginPage.login(config.adminUsername, config.adminPassword);
```

### Don't share state between tests

```typescript
// ❌ Second test depends on first test's side effect
let createdId: string;
test('create', async () => {
  createdId = await create();
});
test('edit', async () => {
  await edit(createdId);
}); // ← ordering dependency

// ✅ Each test is self-contained
test('edit employee', async ({ request, page }) => {
  const emp = await employeeApi.create(request, { firstName: 'Test' });
  await employeePage.edit(emp.id, { firstName: 'Updated' });
  await employeeApi.delete(request, emp.id);
});
```

### Don't ignore lint errors

```typescript
// ❌ Suppresses a real problem
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = await response.json();

// ✅ Define a proper type
interface EmployeeResponse {
  data: Employee[];
  meta: Meta;
}
const data: EmployeeResponse = await response.json();
```

---

[← Back to docs/](.) | [CONTRIBUTING.md](CONTRIBUTING.md) | [Main README](../README.md)
