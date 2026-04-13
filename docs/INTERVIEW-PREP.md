# 🎤 Interview Preparation Guide

Comprehensive Q&A for QA Automation Engineer interviews, using this project as your evidence base.

---

## Table of Contents

- [Core Playwright Questions](#-core-playwright-questions)
- [Framework Design Questions](#-framework-design-questions)
- [API Testing Questions](#-api-testing-questions)
- [CI/CD Questions](#-cicd-questions)
- [TypeScript in Testing Questions](#-typescript-in-testing-questions)
- [Monorepo Architecture Questions](#-monorepo-architecture-questions)
- [Test Data Management Questions](#-test-data-management-questions)
- [Flaky Tests Questions](#-flaky-tests-questions)
- [Scaling Questions](#-scaling-questions)
- [Behavioral Questions (STAR Format)](#-behavioral-questions-star-format)
- [Technical Deep-Dive Questions](#-technical-deep-dive-questions)
- [Technical Deep-Dive: Test Data Strategy](#️-technical-deep-dive-test-data-strategy)
- [Technical Deep-Dive: Flaky Test Handling](#-technical-deep-dive-flaky-test-handling)
- [Technical Deep-Dive: CI/CD Architecture](#️-technical-deep-dive-cicd-architecture)
- [Technical Deep-Dive: Framework Selection](#-technical-deep-dive-framework-selection)
- [Questions to Ask the Interviewer](#-questions-to-ask-the-interviewer)

---

## 🎭 Core Playwright Questions

### Q: Why did you choose Playwright over Cypress or Selenium?

**Answer:**

| Factor        | Playwright                    | Cypress                 | Selenium        |
| ------------- | ----------------------------- | ----------------------- | --------------- |
| Multi-browser | ✅ Chromium, Firefox, WebKit  | ⚠️ Firefox limited      | ✅ All          |
| API testing   | ✅ Built-in `request` fixture | ❌ Separate tool needed | ❌              |
| Auto-waiting  | ✅ Built-in, smart            | ✅ Built-in             | ❌ Manual waits |
| TypeScript    | ✅ First-class                | ✅ Good                 | ⚠️ Verbose      |
| Speed         | ✅ Fast                       | ✅ Fast                 | ❌ Slower       |
| Parallel      | ✅ Full parallel              | ⚠️ Limited              | ✅ With Grid    |
| Traces/Video  | ✅ Built-in                   | ✅ Built-in             | ❌              |

> "I chose Playwright because it's the only tool that does cross-browser testing (including WebKit/Safari), API testing, and UI testing in a single framework. In this project, I run the same login flow across Chromium, Firefox, and WebKit without any additional tooling."

---

### Q: How does Playwright's auto-waiting work?

**Answer:** Playwright automatically waits for elements to be actionable before interacting with them. "Actionable" means:

1. **Visible** — not hidden with `display: none` or `visibility: hidden`
2. **Stable** — not animating or moving
3. **Enabled** — not `disabled`
4. **Editable** — for inputs, not `readonly`
5. **Receives events** — not covered by another element

```typescript
// This single line waits for all 5 conditions automatically
await page.click('#submitButton');

// Contrast with Selenium where you'd need:
WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, 'submitButton')));
```

---

### Q: What's the difference between `page.locator()` and `page.$()` / `page.waitForSelector()`?

**Answer:**

- `page.locator()` returns a **Locator** — lazy, chainable, auto-waiting. Use this always.
- `page.$()` returns an **ElementHandle** — eager, no auto-waiting. Avoid in modern Playwright.
- `page.waitForSelector()` explicitly waits for a selector — useful when you need explicit control.

```typescript
// ✅ Modern — Locator is lazy and auto-waits
const btn = page.locator('button[type="submit"]');
await btn.click();

// ⚠️ Legacy — ElementHandle doesn't auto-wait
const btn = await page.$('button[type="submit"]');
await btn?.click();
```

---

### Q: How do you handle dynamic content and SPAs in Playwright?

**Answer:** OrangeHRM is a Vue.js SPA, so I use:

```typescript
// Wait for URL change after navigation
await page.waitForURL('**/dashboard/**');

// Wait for a specific API response (SPA data loading)
await Promise.all([
  page.waitForResponse((resp) => resp.url().includes('/api/v2/pim/employees')),
  page.click('[data-testid="employee-list-btn"]'),
]);

// Wait for network to settle after actions
await page.waitForLoadState('networkidle');
```

---

## 🏗️ Framework Design Questions

### Q: Explain the Page Object Model pattern and why you use it.

**Answer:** POM separates **test logic** from **page structure**. Each page class encapsulates:

- Selectors (as private class fields)
- Actions (as public methods returning `Promise<void>`)
- Queries (as public methods returning `Promise<string | boolean>`)

```typescript
// LoginPage.ts — page structure is encapsulated here
export class LoginPage extends BasePage {
  private readonly usernameInput = '#txtUsername';
  private readonly passwordInput = '#txtPassword';
  private readonly loginButton = 'button[type="submit"]';

  async login(username: string, password: string): Promise<void> {
    await this.fillInput(this.usernameInput, username);
    await this.fillInput(this.passwordInput, password);
    await this.clickButton(this.loginButton);
  }
}

// login.spec.ts — test logic only, no selectors
test('valid login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigateToLogin();
  await loginPage.login('Admin', 'admin123');
  await loginPage.verifyLoginSuccess();
});
```

**Benefits:** When a selector changes, you update only the page class — not every test that uses it.

---

### Q: What is `BasePage` and what does it provide?

**Answer:** `BasePage` in `packages/core/src/page-objects/BasePage.ts` is an abstract base class that all page objects inherit from. It provides reusable helpers:

- `goto(path)` — navigates relative to `baseURL`
- `fillInput(selector, value)` — clears then fills an input
- `clickButton(selector)` — waits and clicks
- `waitForVisible(selector)` — waits for element visibility
- `takeScreenshot(name)` — captures a named screenshot

This avoids duplicating Playwright boilerplate in every page class.

---

### Q: How do you choose selectors? What's your priority order?

**Answer:**

1. `data-testid` attribute — most stable, added specifically for testing
2. ARIA roles — `getByRole('button', { name: 'Login' })` — semantic and accessible
3. Form attributes — `input[name="username"]`, `button[type="submit"]`
4. Text content — `getByText('Submit')` — use sparingly (breaks on i18n)
5. CSS classes — only if stable, meaningful names
6. XPath — last resort, never preferred

```typescript
// ✅ Most stable to least stable
page.getByTestId('login-btn');
page.getByRole('button', { name: 'Login' });
page.locator('button[type="submit"]');
page.locator('.oxd-button--main'); // ⚠️ brittle
page.locator('div:nth-child(2) button'); // ❌ avoid
```

---

## 🔌 API Testing Questions

### Q: How do you integrate API testing with UI testing in this project?

**Answer:** Playwright's `request` fixture gives direct HTTP access alongside the browser. I use it two ways:

**1. API-only tests** (in `tests/api/`):

```typescript
test('GET /employees returns list', async ({ request }) => {
  const response = await request.get('/web/index.php/api/v2/pim/employees');
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data).toBeInstanceOf(Array);
});
```

**2. API setup + UI assertion** (10× faster than pure UI):

```typescript
test('employee appears in list after API create', async ({ page, request }) => {
  // Arrange: use API (fast)
  const emp = await employeeApi.create(request, { firstName: 'Jane' });
  // Act: navigate UI
  await employeePage.navigateToList();
  // Assert: verify in UI
  await expect(page.getByText('Jane')).toBeVisible();
  // Cleanup: use API (fast)
  await employeeApi.delete(request, emp.id);
});
```

---

### Q: How do you handle API authentication in tests?

**Answer:** OrangeHRM uses session-based auth. I authenticate via the API, capture the session cookie, and reuse it:

```typescript
// packages/hrm-api-suite/src/clients/AuthClient.ts
export class AuthClient extends BaseApiClient {
  async login(username: string, password: string): Promise<string> {
    const response = await this.post('/web/index.php/api/v2/auth/login', {
      username,
      password,
    });
    return response.headers['set-cookie'];
  }
}
```

For UI tests, Playwright's `storageState` saves and reuses the entire browser session including cookies.

---

## ⚙️ CI/CD Questions

### Q: Walk me through your CI/CD pipeline.

**Answer:** The project has 4 GitHub Actions workflows:

| Workflow               | Trigger                  | Duration | Purpose                         |
| ---------------------- | ------------------------ | -------- | ------------------------------- |
| `smoke-tests.yml`      | Every push/PR to `main`  | ~5 min   | Fast gate — blocks broken PRs   |
| `code-quality.yml`     | PR to `main`             | ~2 min   | ESLint + TypeScript check       |
| `regression-tests.yml` | Push to `main` + nightly | ~20 min  | Full validation                 |
| `test.yml`             | Push/PR to `main`        | ~25 min  | All browsers in parallel matrix |

The pipeline provides **progressive validation** — fast checks run first, expensive checks only on `main`.

---

### Q: How do you handle test failures in CI?

**Answer:**

1. **Retries:** CI retries each test 2× (`retries: 2` in `playwright.config.ts`) to absorb network flakiness
2. **Artifacts:** HTML reports + screenshots are uploaded on every run (retained 7–30 days)
3. **Traces:** Playwright captures a trace on first retry — allows step-by-step replay
4. **Branch protection:** `smoke` and `lint` checks are required before merge

> "When a test fails in CI, I download the HTML artifact, open it, and look at the screenshot + trace for the failing step. The trace shows the DOM state at each moment, which is invaluable for debugging."

---

### Q: How do you manage secrets in CI?

**Answer:** GitHub Secrets — credentials are stored encrypted at the organization/repo level and injected as environment variables at runtime. They are:

- Never visible in logs (GitHub masks `***`)
- Never accessible to fork PRs (protection)
- Rotated quarterly

```yaml
env:
  ORANGEHRM_ADMIN_PASSWORD: ${{ secrets.ORANGEHRM_ADMIN_PASSWORD }}
```

---

## 📘 TypeScript in Testing Questions

### Q: Why use TypeScript for tests?

**Answer:**

1. **Catch errors at compile time:** Missing required arguments, wrong types — before running a test
2. **IDE autocomplete:** Page object methods are discoverable; typos become red underlines
3. **Self-documenting:** Method signatures serve as documentation
4. **Refactoring safety:** Rename a method → TypeScript finds every usage

```typescript
// TypeScript catches this at compile time — Python/JS wouldn't
const emp = await employeeApi.create(request, {
  firstName: 'Jane',
  // ❌ TypeScript: Property 'lastName' is missing
});
```

---

### Q: What TypeScript features do you use in this project?

**Answer:**

- **Strict mode** (`"strict": true`) — catches null/undefined errors
- **Interface + type aliases** — for test data shapes, API response types
- **Generics** — `BaseApiClient<T>` for typed response handling
- **Async/await** — all Playwright APIs are Promise-based; `async/await` makes them readable
- **Access modifiers** — `private` for selectors in page objects, `public` for methods

---

## 🏢 Monorepo Architecture Questions

### Q: Why did you use a monorepo for this project?

**Answer:** A monorepo lets me share the `@qa-framework/core` package (BasePage, BaseApiClient, Logger, Config) across multiple test suites without publishing to npm. Changes to core are immediately available to all packages.

**Dependency graph:**

```
@qa-framework/core ──┬──► @qa-framework/orangehrm-suite
                     ├──► @qa-framework/hrm-api-suite
                     └──► @qa-framework/orangehrm-api-suite
@qa-framework/shared-utils ──► (all suites)
```

**Alternatives considered:**

- **Single package:** Core utils get duplicated when adding new app suites
- **Separate repos:** Changes to core require publishing a new version and updating each consumer

---

### Q: When would you create a new package vs adding a test file?

**Answer:**

| Scenario                                    | Action                                      |
| ------------------------------------------- | ------------------------------------------- |
| New OrangeHRM module (Recruitment, Reports) | Add page object + spec in `orangehrm-suite` |
| New REST endpoint                           | Add client method + spec in `hrm-api-suite` |
| Completely new application                  | New package (e.g., `new-app-suite`)         |
| Different team owns the tests               | New package for clear ownership             |
| Different tech (e.g., mobile/Appium)        | New package with different dependencies     |

---

## 📊 Test Data Management Questions

### Q: How do you manage test data?

**Answer:** Three strategies depending on the test:

1. **Generated data (Faker):** For fields where the value doesn't matter

   ```typescript
   const name = faker.person.firstName(); // unique every run
   ```

2. **API-created data:** For entity setup that's not under test

   ```typescript
   const emp = await employeeApi.create(request, { firstName: 'Test' });
   // ... test something else ...
   await employeeApi.delete(request, emp.id);
   ```

3. **CSV-driven data:** For boundary value and equivalence partition tests
   ```typescript
   // tests/data-driven/ reads from CSV files for parameterized scenarios
   ```

**Principle:** Tests are self-contained — they create their own data and clean it up in `afterEach`.

---

## 🎲 Flaky Tests Questions

### Q: How do you identify and fix flaky tests?

**Answer:**

**Identify:**

```bash
npx playwright test --repeat-each=5  # run each test 5 times
```

**Common causes I've encountered:**

1. Hard-coded `waitForTimeout` — replaced with `waitForSelector`
2. Race condition on SPA navigation — added `waitForURL` or `waitForResponse`
3. Shared state between tests — moved to `beforeEach` + isolated fixtures
4. Selector matching multiple elements — used `.first()` or more specific locator

**My systematic approach:**

1. Run the failing test 5× — if < 100% fail rate, it's flaky not broken
2. Enable `--trace on` and inspect the trace for the exact failure point
3. Check if it's a timing issue (most common) or a selector issue
4. Fix the root cause; never mask with more retries

---

## 📈 Scaling Questions

### Q: How would you scale this framework to 500+ tests?

**Answer:**

**Short-term (up to 300 tests):**

- Increase worker count to 4–8 locally
- Add more test specs in existing packages

**Medium-term (300–500 tests):**

- Implement test sharding: `npx playwright test --shard=1/6`
- Run each package's tests as a separate CI job

**Long-term (500+ tests):**

- Self-hosted runners with more cores
- Cache browser installs in CI
- Quarantine flaky tests to a separate nightly run
- Add Allure report history for trend analysis

---

## 🌟 Behavioral Questions (STAR Format)

### Q: Tell me about a challenging problem you solved with this framework.

**Situation:** Tests were intermittently failing in CI with timeout errors — roughly 1 in 5 runs would have 2–3 failures, but the tests passed fine locally.

**Task:** Identify the root cause and achieve consistent CI runs.

**Action:**

1. Enabled `trace: 'on-first-retry'` to capture failure traces
2. Downloaded the trace files from GitHub Actions artifacts
3. Opened traces in `npx playwright show-trace` and found that failures always occurred on the same navigation step — the dashboard load after login
4. The SPA was making 8 API calls after login; CI's slower network caused `waitForLoadState('load')` to resolve before all calls completed
5. Changed to `waitForResponse` targeting the last API call:
   ```typescript
   await Promise.all([
     page.waitForResponse((r) => r.url().includes('/api/v2/dashboard/employees/latest')),
     loginPage.login('Admin', config.adminPassword),
   ]);
   ```

**Result:** Zero flaky failures across the next 50 CI runs. The Playwright trace tool was the key differentiator — without it, I would have spent hours guessing.

---

### Q: How do you ensure test quality doesn't degrade over time?

**Answer:**

- **Code review for tests:** Every test PR is reviewed for POM compliance, AAA structure, and cleanup
- **Required CI checks:** Tests must pass before merge — broken tests block the team
- **Flakiness tracking:** Tests with > 2 retries in a week get a GitHub issue
- **Performance budget:** If the smoke suite exceeds 10 minutes, I investigate slow tests
- **Selector strategy:** Prefer `data-testid` — stable against UI redesigns

---

## 🔬 Technical Deep-Dive Questions

### Q: How does Playwright's `storageState` work and when do you use it?

**Answer:** `storageState` captures cookies, localStorage, and sessionStorage after a successful login, then replays them for subsequent tests — skipping the login UI entirely.

```typescript
// global.setup.ts — runs once before all tests
import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('/web/index.php/auth/login');
await page.fill('#txtUsername', 'Admin');
await page.fill('#txtPassword', config.adminPassword);
await page.click('button[type="submit"]');
await page.context().storageState({ path: '.auth/admin.json' });
await browser.close();

// playwright.config.ts
use: {
  storageState: '.auth/admin.json';
}
```

**When to use:** Any test suite where login is not the feature under test. Saves ~3s per test.

---

### Q: What's the difference between `test.beforeEach`, `test.beforeAll`, and fixtures?

**Answer:**

| Hook/Feature        | Scope                | Isolated? | Use for                                    |
| ------------------- | -------------------- | --------- | ------------------------------------------ |
| `test.beforeEach`   | Per test             | ✅ Yes    | Test data setup, page navigation           |
| `test.beforeAll`    | Per `describe` block | ❌ Shared | Expensive one-time setup (DB seed)         |
| Playwright fixtures | Per test             | ✅ Yes    | Reusable test context (authenticated page) |

```typescript
// Custom fixture — reusable authenticated page
const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('#txtUsername', 'Admin');
    await page.fill('#txtPassword', config.adminPassword);
    await page.click('button[type="submit"]');
    await use(page);
    // Teardown after test
    await page.context().clearCookies();
  },
});
```

---

### Q: How do you test cross-browser compatibility without maintaining separate test code?

**Answer:** Playwright's `projects` configuration runs the same test spec against multiple browser engines with no code changes:

```typescript
// playwright.config.ts
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
];
```

```bash
# Run on all 3 browsers simultaneously
npx playwright test

# Browser-specific run
npx playwright test --project=webkit
```

When a test needs browser-specific handling:

```typescript
test('submit form', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'Tracked in #42');
  // ...
});
```

---

## 🗂️ Technical Deep-Dive: Test Data Strategy

### Q: Walk me through your test data strategy in detail.

**Answer Framework:**

#### 1. Problem Identified

Pure UI test data setup is slow (~8s per test) and flaky — it depends on the application under test, which may have bugs itself.

#### 2. Solution: Three-Layer Data Strategy

```
Layer 1: Generated data (Faker)
   → For fields where the value doesn't matter
   → Unique every run — no conflicts between parallel tests

Layer 2: API-created data
   → For entity setup that's NOT the feature under test
   → 10× faster than UI forms (0.9s vs 8s)
   → Independent of UI behaviour

Layer 3: CSV-driven data
   → For boundary value analysis and equivalence partitions
   → Parameterised test cases from external data files
```

#### 3. Implementation

```typescript
// Layer 1: Generated data
import { faker } from '@faker-js/faker';
const testEmployee = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  employeeId: faker.string.numeric(5),
};

// Layer 2: API-created data
test.beforeEach(async ({ request }) => {
  const employee = await employeeApi.create(request, testEmployee);
  employeeId = employee.data.empNumber;
});

test.afterEach(async ({ request }) => {
  await employeeApi.delete(request, employeeId);
});

// Layer 3: CSV-driven
const loginScenarios = readCsv('tests/data-driven/login-data.csv');
for (const [username, password, expectedResult] of loginScenarios) {
  test(`login: ${username} → ${expectedResult}`, async ({ page }) => {
    await loginPage.login(username, password);
    await loginPage.verifyResult(expectedResult);
  });
}
```

#### 4. Trade-offs acknowledged

- API approach adds code complexity (need API client)
- CSV approach needs maintenance when requirements change
- Faker data is not deterministic — harder to reproduce a specific failure

#### 5. Metrics

- 58+ tests (19 specs × 3 browsers) with API setup: ~12 min total
- Same tests with UI setup: estimated ~50+ min
- **Saving: ~38 minutes per full run**

---

## 🎲 Technical Deep-Dive: Flaky Test Handling

### Q: Give me a specific example of debugging and fixing a flaky test.

**Answer (STAR format):**

**Situation**: The leave approval test was failing in ~5% of CI runs with a `AssertionError: Expected 7 but received 8` on the leave balance check. It passed 100% locally.

**Task**: Diagnose the root cause and achieve > 99% reliability without masking the issue with more retries.

**Action**:

```typescript
// Step 1: Isolate the flakiness
npx playwright test tests/regression/leave/leave-workflow.spec.ts --repeat-each=10

// Step 2: Enable trace on every run (not just retry)
// playwright.config.ts
trace: 'on',

// Step 3: Inspect the trace
npx playwright show-trace test-results/leave-workflow/.../trace.zip
// Finding: API response returned 200 but body showed OLD balance value
// The UI showed new balance, but the API was lagging behind

// Step 4: Root cause confirmed
// OrangeHRM demo has eventual consistency — balance updates async
```

**Fix applied**:

```typescript
// ❌ Before: immediate assertion
const balance = await leaveApi.getLeaveBalance(empId, leaveTypeId);
expect(balance).toBe(originalBalance - requestedDays);

// ✅ After: retry until consistent
await expect(async () => {
  const balance = await leaveApi.getLeaveBalance(empId, leaveTypeId);
  expect(balance).toBe(originalBalance - requestedDays);
}).toPass({ timeout: 5000 });
```

**Result**: Failure rate dropped from 5% to < 0.5%.

**Key learning**: Never increase `retries` as the first response to flakiness. Always diagnose — the trace viewer shows exactly what happened at each millisecond.

---

## ⚙️ Technical Deep-Dive: CI/CD Architecture

### Q: Design your CI/CD pipeline from scratch for a QA team of 5 engineers.

**Answer:**

#### Architecture Overview

```
Developer pushes → PR opened
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
    Code Quality (2 min)    Smoke Tests (5 min)
    ESLint + TypeScript      Chromium only
            │                       │
            └───────────┬───────────┘
                        ▼
               Both pass? Merge allowed
                        │
                        ▼
               Push to main branch
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
    Regression (20 min)    Browser Matrix (25 min)
    Chromium full suite    Chromium + Firefox + WebKit
            │                       │
            └───────────┬───────────┘
                        ▼
             Artifacts uploaded to GitHub
             (HTML report, screenshots, traces)
                        │
                        ▼
              Nightly: performance suite
```

#### Key decisions and rationale

| Decision                    | Rationale                                                      |
| --------------------------- | -------------------------------------------------------------- |
| Smoke on every PR           | Fast (5 min) gate — finds show-stoppers immediately            |
| Regression on merge to main | Balances speed (don't block PRs) vs. coverage                  |
| Parallel browser matrix     | 3× coverage for ~same wall-clock time                          |
| `retries: 2` in CI          | Absorbs transient network issues without masking real failures |
| Artifacts on every run      | Enables debugging without re-running (traces, screenshots)     |
| Required status checks      | Prevents broken code from reaching main                        |

#### What I'd add with more resources

1. **Sharding** — split 58 tests across 4 runners for faster feedback
2. **Self-hosted runners** — dedicated hardware for consistent performance
3. **Slack notifications** — alert on first failure, not after all retries
4. **Test quarantine** — automatically isolate flaky tests to nightly-only

---

## 🏆 Technical Deep-Dive: Framework Selection

### Q: You chose Playwright — defend that decision compared to alternatives.

**Answer:**

#### Evaluation criteria (weighted)

| Criterion                    | Weight | Why important                           |
| ---------------------------- | ------ | --------------------------------------- |
| Multi-browser (incl. WebKit) | 25%    | Safari is ~20% of web users             |
| API testing built-in         | 20%    | API-first setup is key to performance   |
| TypeScript first-class       | 20%    | Type safety prevents selector bugs      |
| Trace/debug tooling          | 15%    | Fast diagnosis = lower maintenance cost |
| Parallel execution           | 10%    | Scale without configuration overhead    |
| Learning curve               | 10%    | Team onboarding speed                   |

#### Comparison matrix

| Criterion              | Playwright | Cypress  | Selenium | WebdriverIO |
| ---------------------- | ---------- | -------- | -------- | ----------- |
| Multi-browser + WebKit | ✅ 5/5     | ⚠️ 3/5   | ✅ 4/5   | ✅ 4/5      |
| API testing built-in   | ✅ 5/5     | ❌ 1/5   | ❌ 1/5   | ⚠️ 2/5      |
| TypeScript first-class | ✅ 5/5     | ✅ 4/5   | ⚠️ 3/5   | ✅ 4/5      |
| Trace viewer           | ✅ 5/5     | ⚠️ 3/5   | ❌ 1/5   | ⚠️ 2/5      |
| Parallel execution     | ✅ 5/5     | ⚠️ 3/5   | ✅ 4/5   | ✅ 4/5      |
| Learning curve         | ⚠️ 3/5     | ✅ 5/5   | ❌ 2/5   | ⚠️ 3/5      |
| **Weighted score**     | **4.65**   | **3.30** | **2.55** | **3.30**    |

**Winner: Playwright** — clear leader on the highest-weight criteria.

#### What I'd use Cypress for instead

Cypress excels for component testing and developer-run tests in a React/Vue project. If the team was primarily front-end focused and Safari wasn't a requirement, Cypress would be a strong choice.

---

1. "What test frameworks are you currently using, and what pain points are you trying to solve?"
2. "How many tests are in your current suite, and how long does the CI run take?"
3. "What's your team's philosophy on test data — do tests create their own data or use shared fixtures?"
4. "How do you handle flaky tests — quarantine, retry, or investigate immediately?"
5. "What would success look like in the first 90 days for this role?"
6. "How does the QA team collaborate with developers on test automation?"

---

[← Back to docs/](.) | [QUICK_START.md](QUICK_START.md) | [Main README](../README.md)
