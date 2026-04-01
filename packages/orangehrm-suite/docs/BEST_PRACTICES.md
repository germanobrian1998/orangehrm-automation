# Testing Best Practices Guide

This guide defines the conventions, patterns, and techniques used across the OrangeHRM automation framework to keep tests reliable, readable, and maintainable.

## Table of Contents

- [Test Naming Conventions](#test-naming-conventions)
- [Test Organization and Categorization](#test-organization-and-categorization)
- [Assertion Best Practices](#assertion-best-practices)
- [Wait Strategies and Synchronization](#wait-strategies-and-synchronization)
- [Error Handling and Logging](#error-handling-and-logging)
- [Test Data Management](#test-data-management)
- [Flakiness Prevention Techniques](#flakiness-prevention-techniques)
- [Test Maintenance Guidelines](#test-maintenance-guidelines)

---

## Test Naming Conventions

### File naming

Test files use the `.spec.ts` suffix and are named after the feature they test:

```
login.spec.ts
pim-employee.spec.ts
leave-apply.spec.ts
```

### `test.describe` blocks

Describe blocks group related tests. Use the `@tag` prefix and a clear noun phrase:

```typescript
test.describe('@auth Login Test Suite', () => { ... });
test.describe('@pim Employee Management', () => { ... });
```

### Individual test names

Follow the pattern: **action + context + expected outcome**, written in sentence case:

```typescript
// ✅ Good
test('LoginPage can be instantiated with a Playwright page', ...)
test('empty username and password fail validation', ...)
test('unauthenticated fresh page returns false for isLoggedIn', ...)

// ❌ Bad
test('test1', ...)
test('login', ...)
test('should login', ...)   // avoid "should"
```

### Nested describes

Use nested `test.describe` blocks to group tests by sub-feature or scenario type:

```typescript
test.describe('@auth Login Test Suite', () => {
  test.describe('Successful login', () => { ... });
  test.describe('Invalid credentials handling', () => { ... });
  test.describe('Session management', () => { ... });
  test.describe('Logout functionality', () => { ... });
});
```

---

## Test Organization and Categorization

### Tag convention

Tags are embedded in the `test.describe` title with the `@` prefix. Apply one or more tags:

| Tag | Meaning |
|---|---|
| `@smoke` | Critical happy-path tests; run on every commit |
| `@regression` | Full regression coverage |
| `@auth` | Authentication-related tests |
| `@pim` | PIM / Employee module |
| `@leave` | Leave management module |
| `@performance` | Performance module |
| `@reporting` | Report generation |
| `@security` | Security and compliance |
| `@integration` | Cross-module integration |
| `@api` | API-level tests |

### Folder structure mirrors feature areas

```
tests/
├── auth/           ← @auth tests
├── dashboard/      ← @dashboard tests
├── employee/       ← @pim tests
├── leave/          ← @leave tests
├── performance/    ← @performance tests
├── reporting/      ← @reporting tests
├── security/       ← @security tests
└── integration/    ← @integration tests
```

### AAA pattern (Arrange–Act–Assert)

Structure every test with clearly separated phases, using inline comments when it aids readability:

```typescript
test('valid admin credential shape is correctly typed', async ({ logger }) => {
  // Arrange
  logger.step(1, 'Validate admin credential object shape');

  // Act
  const credentials = { username: 'Admin', password: 'admin123' };

  // Assert
  expect(typeof credentials.username).toBe('string');
  expect(credentials.username).toBe('Admin');
  logger.assertion(true, 'Admin credentials have the correct shape');
});
```

---

## Assertion Best Practices

### Use specific matchers

Playwright's `expect` API provides rich matchers. Prefer specific ones over generic equality checks:

```typescript
// ✅ Specific
expect(text).toBe('Expected Value');
expect(list).toHaveLength(3);
expect(email).toMatch(/@/);
expect(errorMsg).toContain('Invalid credentials');

// ❌ Too generic
expect(text === 'Expected Value').toBe(true);
```

### One logical assertion group per test

Each test should validate a single behaviour. Multiple `expect` calls are fine when they collectively verify one concept:

```typescript
// ✅ All assertions relate to credential shape
expect(typeof credentials.username).toBe('string');
expect(typeof credentials.password).toBe('string');

// ❌ Mixing unrelated concerns
expect(credentials.username).toBe('Admin');
expect(loginPage).toBeInstanceOf(LoginPage);   // unrelated to credentials
```

### Log assertions explicitly

Use `logger.assertion()` for assertions that benefit from visibility in the test report:

```typescript
logger.assertion(true, 'Admin credentials have the correct shape');
logger.assertion(result.status === 200, `API returned status ${result.status}`);
```

### Avoid negated assertions on UI state

Prefer positive assertions where possible; negated visibility checks can pass for the wrong reason:

```typescript
// ✅ Prefer checking for the expected state
await expect(page.locator(selectors.login.errorMessage)).toBeVisible();

// ⚠️ Less reliable
await expect(page.locator(selectors.dashboard.header)).not.toBeHidden();
```

---

## Wait Strategies and Synchronization

### Use framework wait helpers

The framework provides `WaitFor` helpers via `BasePage.waitFor.*`. Prefer these over raw `page.waitFor*` calls:

```typescript
// ✅ Framework helper
await this.waitFor.loadingComplete();
await this.waitFor.elementVisible(selectors.login.submitButton);

// ❌ Avoid hard waits
await page.waitForTimeout(2000);
```

### Never use `waitForTimeout` in production tests

`waitForTimeout` introduces fixed delays that make tests slow and brittle. Replace with event-based waits:

```typescript
// ❌ Bad
await page.waitForTimeout(3000);

// ✅ Good
await page.waitForLoadState('networkidle');
await this.waitFor.elementVisible(selector);
```

### Wait for URL after navigation

Always confirm navigation completed by waiting for the expected URL:

```typescript
await this.click(selectors.login.submitButton);
await this.waitForUrl(/.*\/dashboard/);
await this.waitFor.loadingComplete();
```

### Use `waitUntil` for custom conditions

For complex synchronisation, use the `waitUntil` helper with a polling condition:

```typescript
await this.waitUntil(async () => {
  const count = await page.locator(selectors.pim.employeeRow).count();
  return count > 0;
}, 15000);
```

---

## Error Handling and Logging

### Wrap interactions in try/catch inside page objects

Page object methods should catch errors, log them, optionally take a screenshot, and re-throw:

```typescript
async login(credentials: LoginCredentials): Promise<void> {
  try {
    this.logger.step(1, `Logging in as ${credentials.username}`);
    await this.goto('/auth/login');
    await this.fill(selectors.login.usernameInput, credentials.username);
    await this.fill(selectors.login.passwordInput, credentials.password);
    await this.click(selectors.login.submitButton);
    await this.waitForUrl(/.*\/dashboard/);
    this.logger.info(`✓ Login successful for ${credentials.username}`);
  } catch (error) {
    this.logger.error('Login failed', error);
    await this.screenshot('login_failure');
    throw error;
  }
}
```

### Use logger levels appropriately

| Level | Use for |
|---|---|
| `logger.step(n, msg)` | Major test steps (visible in reports) |
| `logger.info(msg)` | Significant state changes and confirmations |
| `logger.debug(msg)` | Low-level detail (selector interactions, values) |
| `logger.warn(msg)` | Non-fatal issues that may affect results |
| `logger.error(msg, err)` | Failures – always include the original error |

### Do not swallow errors in tests

Tests should let errors propagate so Playwright can capture traces and screenshots:

```typescript
// ✅ Let errors propagate
const text = await loginPage.getText(selector);
expect(text).toBe('Expected');

// ❌ Swallowing errors masks test failures
try {
  const text = await loginPage.getText(selector);
  expect(text).toBe('Expected');
} catch {
  // silent failure
}
```

---

## Test Data Management

### Use Faker for dynamic test data

Import `@faker-js/faker` to generate unique, realistic data for each test run:

```typescript
import { faker } from '@faker-js/faker';

const employee = {
  firstName: faker.person.firstName(),
  lastName:  faker.person.lastName(),
  employeeId: `EMP-${faker.string.numeric(6)}`,
};
```

### Isolate test data

Each test should create its own data and clean it up. Avoid sharing mutable state between tests:

```typescript
test.afterEach(async ({ apiClient }) => {
  if (createdEmployeeId) {
    await apiClient.deleteEmployee(createdEmployeeId);
  }
});
```

### Centralise static credentials

Static credentials (admin user, demo accounts) belong in environment variables, not hardcoded in tests:

```typescript
// ✅ From config
const credentials = {
  username: config.adminUsername,
  password: config.adminPassword,
};

// ❌ Hardcoded
const credentials = { username: 'Admin', password: 'admin123' };
```

### Separate test data files for large datasets

For complex data-driven tests, store test data in JSON or TypeScript fixture files:

```
tests/fixtures/
├── employees.json
├── leave-types.json
└── report-templates.ts
```

---

## Flakiness Prevention Techniques

### Make tests atomic and independent

Each test must be able to run in any order and must not depend on the state left by another test.

### Use `test.beforeEach` for setup

```typescript
test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login({ username: config.adminUsername, password: config.adminPassword });
});
```

### Retry transient failures in CI

The Playwright config sets `retries: 2` in CI. Do not increase this beyond 2; instead, fix the root cause of flakiness.

### Avoid `page.pause()` in committed tests

`page.pause()` is a debugging tool only. Remove it before committing.

### Use stable selectors

Prefer selectors that reflect semantic meaning, in this priority order:

1. `data-testid` or `data-cy` attributes (most stable)
2. ARIA roles and labels: `role=button[name="Save"]`
3. Text content: `text=Submit`
4. CSS class selectors (least preferred – may change with styling)

```typescript
// ✅ Stable
'.orangehrm-login-button'
'[data-testid="submit"]'
'role=button[name="Submit"]'

// ⚠️ Less stable
'.btn-primary'
'div > div:nth-child(3) > button'
```

### Avoid sleeping between API calls

Use API response status or polling instead of a fixed sleep after a POST/PUT:

```typescript
// ✅ Poll until the resource appears
await this.waitUntil(async () => {
  const emp = await apiClient.getEmployee(id).catch(() => null);
  return emp !== null;
});

// ❌ Fixed sleep
await new Promise(r => setTimeout(r, 2000));
```

---

## Test Maintenance Guidelines

### Review and update selectors when the UI changes

When a selector breaks, update it in `src/selectors.ts`. Never duplicate selectors across test files.

### Delete or fix failing tests immediately

A failing test is either a bug (fix the code) or an outdated test (update it). Skipping tests with `test.skip()` should be temporary and tracked with a comment and issue reference:

```typescript
test.skip('employee list shows pagination controls', async () => {
  // TODO: Re-enable after PROJ-123 is resolved
});
```

### Keep page objects slim

Page objects should contain only UI interaction logic. Business assertions belong in tests, not in page objects.

### Review tests as part of code review

Every PR that changes UI behaviour must include updated or new tests. Reviewers should verify that tests actually validate the changed behaviour.

### Run the full suite before merging

Even if a change seems isolated, run the full relevant test suite before merging to catch unintended regressions.
