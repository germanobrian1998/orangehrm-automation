# Testing Guidelines

Best practices and patterns for writing tests in the OrangeHRM Automation framework.

---

## Table of Contents

- [Testing Pyramid](#testing-pyramid)
- [Page Object Model](#page-object-model)
- [Test Structure](#test-structure)
- [AAA Pattern](#aaa-pattern)
- [Naming Conventions](#naming-conventions)
- [Tagging Strategy](#tagging-strategy)
- [Fixture Usage](#fixture-usage)
- [Selectors](#selectors)
- [Assertions](#assertions)
- [Async / Await](#async--await)
- [Error Handling in Tests](#error-handling-in-tests)
- [Data Management](#data-management)
- [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## Testing Pyramid

This framework follows the **Testing Pyramid** strategy (ADR-003):

```
         /\
        /  \    E2E / UI tests (few, slow, expensive)
       /----\
      /      \  Integration tests (moderate, page objects)
     /--------\
    /          \ Unit tests (many, fast, cheap)
   /____________\
```

| Layer | Location | Speed | Count |
|-------|----------|-------|-------|
| Unit | `packages/core/tests/unit/` | Fast (< 1 s) | Many |
| Integration | `tests/integration/` | Medium (2–10 s) | Moderate |
| E2E / API | `tests/api/`, `tests/auth/`, `tests/employee/`, `tests/leave/` | Slower | Few |

**Rule:** Prefer lower-level tests. Only write E2E tests for flows that cannot be validated at a lower level.

---

## Page Object Model

All UI tests must use the Page Object Model (ADR-004):

```typescript
// ✅ Correct – no selectors in test files
import { LoginPage } from '../../src/pages/login.page';

test('should login successfully @smoke', async ({ page, logger }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login({ username: 'Admin', password: 'admin123' });
  const loggedIn = await loginPage.isLoggedIn();
  expect(loggedIn).toBe(true);
});

// ❌ Wrong – raw selectors in tests
test('should login', async ({ page }) => {
  await page.fill('#orangehrm-username', 'Admin');
  await page.fill('#orangehrm-password', 'admin123');
  await page.click('button[type="submit"]');
});
```

### Page Object Guidelines

- Extend `BasePage` from `@qa-framework/core`
- All selectors live in `src/selectors.ts` — never inside test files
- Page methods return `Promise<void>` for actions and `Promise<boolean | string>` for queries
- Keep page classes focused: one class per page or major page section
- Log each step using `this.logger.step(n, 'description')`

---

## Test Structure

```
packages/
├── orangehrm-suite/
│   └── tests/
│       ├── auth/
│       │   └── login.spec.ts          # Authentication flows
│       ├── employee/
│       │   └── employee-crud.spec.ts  # Employee CRUD
│       ├── leave/
│       │   └── leave-requests.spec.ts # Leave management
│       └── integration/               # Cross-page integration tests
│           ├── login-to-dashboard.integration.spec.ts
│           └── employee-management.integration.spec.ts
└── hrm-api-suite/
    └── tests/
        ├── api/
        │   └── employee.spec.ts       # Employee API tests
        └── integration/               # API integration tests
```

---

## AAA Pattern

Structure every test with **Arrange → Act → Assert**:

```typescript
test('should submit a leave request @smoke', async ({ page, logger }) => {
  // ── Arrange ───────────────────────────────────────────────────────────────
  logger.step(1, 'Set up leave request data');
  const leavePage = new LeavePage(page);
  const requestData = {
    leaveType: 'Annual',
    fromDate: '2025-07-01',
    toDate: '2025-07-03',
  };

  // ── Act ───────────────────────────────────────────────────────────────────
  await leavePage.submitLeaveRequest(requestData);

  // ── Assert ────────────────────────────────────────────────────────────────
  const status = await leavePage.getLeaveStatus();
  expect(status).toBe('PENDING');
});
```

**Rules:**
- One `Act` per test
- Assertions belong only in the Assert section
- Separate each section visually with a blank line or comment

---

## Naming Conventions

| Entity | Convention | Example |
|--------|------------|---------|
| Test files | `kebab-case.spec.ts` | `leave-requests.spec.ts` |
| Page classes | `PascalCase` | `LeaveRequestPage` |
| Page files | `kebab-case.page.ts` | `leave-request.page.ts` |
| Test suites (`describe`) | Sentence describing the feature | `'Leave Request Submission'` |
| Test cases (`test`) | Sentence starting with `should` | `'should submit a leave request'` |
| Private selectors | `camelCase` with descriptive suffix | `submitButton`, `errorAlert` |

---

## Tagging Strategy

Tag tests with `@` prefixes in the test title:

| Tag | Description | Run command |
|-----|-------------|-------------|
| `@smoke` | Fast, critical-path tests | `npm run test:smoke` |
| `@auth` | Authentication tests | `npx playwright test --grep @auth` |
| `@employee` | Employee management tests | `npx playwright test --grep @employee` |
| `@leave` | Leave management tests | `npx playwright test --grep @leave` |
| `@api` | API-layer tests | `npx playwright test --grep @api` |
| `@integration` | Cross-package integration | `npx playwright test --grep @integration` |

```typescript
test('should login with valid credentials @smoke @auth', async ({ page }) => { ... });
```

---

## Fixture Usage

Import the extended `test` from `@qa-framework/core` to access framework fixtures:

```typescript
import { test, expect } from '@qa-framework/core';

test('example with fixtures', async ({ logger, config, testPage }) => {
  logger.step(1, 'Using framework fixtures');
  logger.info(`Base URL: ${config.baseURL}`);

  const loginPage = new LoginPage(testPage);
  // ...
});
```

| Fixture | Type | When to use |
|---------|------|-------------|
| `logger` | `Logger` | Always — log steps and assertions |
| `config` | `Config` | Access environment settings |
| `testPage` | `Page` | Raw Playwright page |
| `basePage` | `BasePage` | Use core navigation helpers |
| `baseApiClient` | `BaseApiClient` | Direct API calls in tests |

---

## Selectors

**Priority order (most to least stable):**

1. `data-testid` attributes
2. ARIA roles and labels (`role="button"`, `aria-label="Submit"`)
3. CSS selectors scoped to a component
4. Text content selectors (`button:has-text("Save")`)
5. XPath (last resort only)

**Always define selectors in `src/selectors.ts`**, never inline them in test files:

```typescript
// src/selectors.ts
export const selectors = {
  login: {
    usernameInput: '#orangehrm-username',
    submitButton: 'button[type="submit"]',
  },
};

// test file
import { selectors } from '../../src/selectors';
await loginPage.fill(selectors.login.usernameInput, 'Admin');
```

---

## Assertions

Use `expect` from `@playwright/test` (re-exported by `@qa-framework/core`):

```typescript
// ✅ Good – specific assertions
expect(employee.firstName).toBe('John');
expect(employees).toHaveLength(3);
expect(status).toMatch(/^(PENDING|APPROVED)$/);

// ✅ Good – soft assertions for non-critical checks
expect.soft(employee.email).toBeDefined();

// ❌ Avoid – overly broad assertions
expect(response).toBeTruthy();
```

Use `logger.assertion(condition, message)` to log assertion results:

```typescript
const isValid = dto.firstName.length > 0;
logger.assertion(isValid, 'Employee firstName is not empty');
expect(isValid).toBe(true);
```

---

## Async / Await

- Always `await` async operations — never leave floating Promises
- Prefer `async/await` over `.then()` chains
- Use `await waitFor.loadingComplete()` instead of arbitrary `page.waitForTimeout()`

```typescript
// ✅ Correct
await loginPage.login(credentials);
const loggedIn = await loginPage.isLoggedIn();

// ❌ Wrong – unhandled Promise
loginPage.login(credentials);
```

---

## Error Handling in Tests

Page Object methods already log errors and re-throw. In tests, use `try/catch` only when testing negative paths:

```typescript
// ✅ Testing an expected error path
test('should display error for invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const errorMessage = await loginPage.loginAndExpectError({
    username: 'invalid',
    password: 'wrong',
  });
  expect(errorMessage).toContain('Invalid credentials');
});
```

Do **not** wrap positive test flows in `try/catch` — let test failures surface naturally.

---

## Data Management

- Use `src/fixtures/` factories for test data — never hardcode data in tests
- Generate unique IDs with `Date.now()` to avoid collisions: `EMP-${Date.now()}`
- Clean up created resources in `test.afterEach` or `test.afterAll` hooks
- Never store sensitive data (passwords, tokens) directly in test files

```typescript
import { employeeFixtures } from '../src/fixtures/apiFixtures';

const newEmployee = employeeFixtures.validCreate(); // generates unique ID
```

---

## Anti-Patterns to Avoid

| Anti-pattern | Why | Fix |
|---|---|---|
| Hardcoded selectors in tests | Brittle, breaks on UI changes | Use page objects and `selectors.ts` |
| `page.waitForTimeout(3000)` | Slow, non-deterministic | Use `waitFor.loadingComplete()` |
| Multiple acts per test | Hard to debug | Split into separate tests |
| Assertions in Arrange/Act | Hides intent | Move to Assert section |
| `any` TypeScript type | Hides type errors | Use explicit types |
| Skipping tests with `test.skip` long-term | Creates ignored failures | Fix the test or remove it |
| Hardcoded credentials | Security risk | Use `src/config/environment.ts` |
