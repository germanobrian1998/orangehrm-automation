# 📈 Scalability Guide — Growing from 58 to 500+ Tests

How to evolve this framework as the team and test suite grow.

---

## Table of Contents

- [Current State (58 Tests)](#-current-state-58-tests)
- [Growth Strategy](#-growth-strategy-58--500-tests)
- [Adding New Test Environments](#-adding-new-test-environments)
- [Adding New Applications or Modules](#-adding-new-applications-or-modules)
- [CI/CD at Scale](#-cicd-at-scale)
- [Managing Test Flakiness at Scale](#-managing-test-flakiness-at-scale)
- [Team Collaboration Strategies](#-team-collaboration-strategies)
- [Package Structure at Scale](#-package-structure-at-scale)
- [When to Create a New Package](#-when-to-create-a-new-package)

---

## 📌 Current State (58 Tests)

```
tests/
├── smoke/          ~8 specs   — fast validation (Chromium)
├── api/            ~6 specs   — REST API validation
├── cross-browser/  ~3 specs   — browser compatibility
├── data-driven/    ~1 spec    — CSV-driven scenarios
└── performance/    ~1 spec    — Web Vitals checks
```

**What's working well at this scale:**
- Single `playwright.config.ts` at the root
- 2 CI workers give adequate parallelism
- All tests complete in < 10 minutes

---

## 🚀 Growth Strategy: 58 → 500+ Tests

### Phase 1 (58 → 150 tests): Expand test coverage

Add more page objects and test specs without changing the architecture.

**Focus areas:**
- Expand smoke suite: cover every major module (Recruitment, Performance, Reports)
- Add more data-driven scenarios
- Expand API test coverage for all HRM endpoints

**Commands to add modules quickly:**
```bash
# Scaffold a new page object in the existing suite
touch src/pages/RecruitmentPage.ts
touch tests/smoke/recruitment.spec.ts
```

### Phase 2 (150 → 300 tests): Introduce sharding

When the full suite exceeds 20 minutes, split it across shards:

```yaml
# .github/workflows/regression-tests.yml
strategy:
  matrix:
    shard: [1/4, 2/4, 3/4, 4/4]
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}
```

This splits the 300 tests into 4 parallel groups of ~75 — each shard runs in ~10 minutes.

### Phase 3 (300 → 500+ tests): Full monorepo parallelism

Run each package's tests as an independent CI job:

```yaml
jobs:
  orangehrm-ui:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:orangehrm
  hrm-api:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:hrm-api
```

---

## 🌍 Adding New Test Environments

### Add a staging environment

**Step 1 — Add to `.env.example`:**
```bash
STAGING_BASE_URL=https://staging.your-orangehrm.com
STAGING_ADMIN_USERNAME=admin
STAGING_ADMIN_PASSWORD=stagingpass
```

**Step 2 — Extend `playwright.config.ts`:**
```typescript
const ENV = process.env.TEST_ENV || 'demo';
const baseUrls = {
  demo: 'https://opensource-demo.orangehrmlive.com',
  staging: process.env.STAGING_BASE_URL!,
  prod: process.env.PROD_BASE_URL!,
};

export default defineConfig({
  use: {
    baseURL: baseUrls[ENV],
  },
});
```

**Step 3 — Run against staging:**
```bash
TEST_ENV=staging npm run test:smoke
```

**Step 4 — Add a CI workflow for staging:**
```yaml
# .github/workflows/staging-tests.yml
on:
  push:
    branches: [staging]
env:
  TEST_ENV: staging
  STAGING_BASE_URL: ${{ secrets.STAGING_BASE_URL }}
```

---

## 🏗️ Adding New Applications or Modules

### Adding a new OrangeHRM module (e.g., Recruitment)

**Step 1 — Create the page object:**
```typescript
// packages/orangehrm-suite/src/pages/RecruitmentPage.ts
import { BasePage } from '@qa-framework/core';
import { Page } from '@playwright/test';

export class RecruitmentPage extends BasePage {
  private readonly addJobButton = '[data-testid="add-job-btn"]';

  constructor(page: Page) { super(page); }

  async navigateToRecruitment(): Promise<void> {
    await this.goto('/web/index.php/recruitment/viewRecruitment');
  }

  async addJob(jobTitle: string): Promise<void> {
    await this.clickButton(this.addJobButton);
    await this.fillInput('[data-testid="job-title-input"]', jobTitle);
    await this.clickButton('[data-testid="save-btn"]');
  }
}
```

**Step 2 — Create the test spec:**
```typescript
// tests/smoke/recruitment.spec.ts
import { test, expect } from '@playwright/test';
import { RecruitmentPage } from '@qa-framework/orangehrm-suite';
import { LoginPage } from '@qa-framework/orangehrm-suite';

test.describe('Recruitment @smoke', () => {
  test('add a job vacancy', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const recruitmentPage = new RecruitmentPage(page);

    await loginPage.navigateToLogin();
    await loginPage.login('Admin', 'admin123');
    await recruitmentPage.navigateToRecruitment();
    await recruitmentPage.addJob('Senior QA Engineer');

    await expect(page.getByText('Senior QA Engineer')).toBeVisible();
  });
});
```

### Adding a completely new application

Create a new package (see [When to Create a New Package](#-when-to-create-a-new-package)):

```bash
mkdir -p packages/new-app-suite/src/{pages,tests}
```

---

## ⚙️ CI/CD at Scale

### Sharding (recommended at 300+ tests)

```yaml
# Split test suite into N parallel shards
strategy:
  matrix:
    shard: ['1/6', '2/6', '3/6', '4/6', '5/6', '6/6']
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}
  - uses: actions/upload-artifact@v4
    with:
      name: blob-report-${{ matrix.shard }}
      path: blob-report/

# Merge all shard reports into one
merge-reports:
  needs: test
  steps:
    - run: npx playwright merge-reports ./all-blobs --reporter html
```

### Self-hosted runners (for faster execution)

Register a self-hosted runner with more cores:
1. GitHub → Settings → Actions → Runners → New self-hosted runner
2. Update workflow: `runs-on: self-hosted`

Self-hosted runners can use 8–16 workers vs GitHub's 2.

### Caching browsers between runs

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ hashFiles('**/package-lock.json') }}
```

This reduces browser install time from ~60s to ~5s on cache hits.

---

## 🎲 Managing Test Flakiness at Scale

### Track flakiness rate per test

Use the JSON reporter to log results over time, then identify tests with > 5% failure rate:

```bash
# Count failures across 20 runs
jq '.suites[].specs[] | select(.tests[0].results[].status == "failed") | .title' results-*.json | sort | uniq -c | sort -rn
```

### Quarantine flaky tests

Tag and isolate unreliable tests until they are fixed:

```typescript
test('flaky recruitment test @flaky', async ({ page }) => {
  test.skip(process.env.CI === 'true', 'Quarantined — tracked in #issue-123');
  // ...
});
```

### Retry strategies at scale

```typescript
// playwright.config.ts
retries: process.env.CI ? 2 : 0,

// Or per-test for known fragile tests
test('intermittent network test', async ({ page }) => {
  test.info().annotations.push({ type: 'flaky', description: 'network-dependent' });
  // ...
}, { retries: 3 });
```

---

## 👥 Team Collaboration Strategies

### Ownership model

Assign packages/modules to teams or individuals:

| Package | Owner | Tests |
|---------|-------|-------|
| `@qa-framework/core` | Framework team | Unit tests for utils |
| `@qa-framework/orangehrm-suite` | QA team | UI/E2E tests |
| `@qa-framework/hrm-api-suite` | API QA team | API contract tests |

### PR conventions at scale

- **Never** push directly to `main`
- Require at least 1 reviewer for test files, 2 for core framework changes
- Use draft PRs for WIP test additions
- Tag PRs with test suite labels: `smoke`, `regression`, `api`

### Code review checklist for new tests

- [ ] Uses Page Object Model (no selectors in test files)
- [ ] Has `Arrange / Act / Assert` structure
- [ ] Cleans up test data after itself
- [ ] Tagged with correct suite (`@smoke`, `@regression`)
- [ ] Has a descriptive test name that explains the behaviour

---

## 📦 Package Structure at Scale

### Current (5 packages)

```
packages/
├── core/                    # Framework base
├── shared-utils/            # Shared helpers
├── orangehrm-suite/         # OrangeHRM UI tests
├── hrm-api-suite/           # HRM API tests
└── orangehrm-api-suite/     # Additional API tests
```

### Scaled (10+ packages)

```
packages/
├── core/                    # Framework base (stable, versioned)
├── shared-utils/            # Test data factories, helpers
│
├── orangehrm-suite/         # OrangeHRM UI tests
├── orangehrm-api-suite/     # OrangeHRM API tests
├── orangehrm-performance/   # OrangeHRM performance tests
│
├── hrm-api-suite/           # HRM REST API tests
├── hrm-mobile-suite/        # Mobile tests (Appium)
│
├── reporting/               # Custom Allure plugins, dashboards
└── test-data/               # Centralized test data management
```

---

## 📋 When to Create a New Package

Create a new package when **all** of the following are true:

| Criterion | Example |
|-----------|---------|
| Tests are for a **distinct application or service** | A new HR portal separate from OrangeHRM |
| Tests have **different dependencies** | Mobile tests need Appium; UI tests don't |
| Tests have a **different execution cadence** | Nightly performance tests vs on-every-PR smoke tests |
| A **different team** owns the tests | Backend team owns API contract tests |

**Don't create a new package for:**
- A new OrangeHRM module (just add a page object + spec)
- A new test tag (just use `--grep`)
- A minor refactor (do it within the existing package)

---

[← Back to docs/](.) | [CI-CD.md](CI-CD.md) | [Main README](../README.md)
