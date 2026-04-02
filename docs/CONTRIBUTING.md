# 🤝 Contributing Guide

How to add new tests, page objects, and API clients to the OrangeHRM Automation Suite.

---

## Table of Contents

- [Getting Started](#-getting-started)
- [Git Workflow](#-git-workflow)
- [Commit Message Conventions](#-commit-message-conventions)
- [How to Add New Tests](#-how-to-add-new-tests)
- [How to Add New Page Objects](#-how-to-add-new-page-objects)
- [How to Add New API Clients](#-how-to-add-new-api-clients)
- [Pull Request Process](#-pull-request-process)
- [PR Checklist](#-pr-checklist)
- [Code of Conduct](#-code-of-conduct)

---

## 🏁 Getting Started

1. **Fork** the repository to your GitHub account.

2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-username>/orangehrm-automation.git
   cd orangehrm-automation
   ```

3. **Install** dependencies:
   ```bash
   npm ci
   npx playwright install --with-deps chromium
   ```

4. **Copy** the environment template:
   ```bash
   cp .env.example .env.local
   # Edit .env.local — this file is gitignored
   ```

5. **Create** a feature branch:
   ```bash
   git checkout -b feat/add-recruitment-tests
   ```

6. **Make changes**, verify everything passes:
   ```bash
   npm run lint
   npm run build
   npm run test:smoke
   ```

7. **Push** and open a pull request against `main`.

---

## 🌿 Git Workflow

### Branch naming

| Prefix | When to use | Example |
|--------|-------------|---------|
| `feat/` | New test or feature | `feat/add-recruitment-tests` |
| `fix/` | Bug fix or flaky test fix | `fix/login-timeout-ci` |
| `docs/` | Documentation only | `docs/update-best-practices` |
| `chore/` | Build, CI, dependency updates | `chore/upgrade-playwright-1.45` |
| `refactor/` | Code restructuring | `refactor/extract-employee-helpers` |

### Keep branches short-lived

- Target < 5 days from branch creation to PR merge
- Rebase against `main` frequently to avoid large merge conflicts:
  ```bash
  git fetch origin
  git rebase origin/main
  ```

---

## 📝 Commit Message Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | When |
|------|------|
| `feat` | New test, page object, or feature |
| `fix` | Bug fix, flaky test correction |
| `docs` | Documentation only |
| `refactor` | Code change without behaviour change |
| `chore` | Build, CI, dependencies |
| `test` | Adding or updating tests only |

### Examples

```
feat(smoke): add leave management smoke tests

Add 3 smoke tests for the Leave module:
- submit a leave request
- view leave balance
- cancel a pending request

fix(employee): correct selector for employee save button

The save button selector changed from .oxd-button--main
to [data-testid="save-employee-btn"] after UI update.

chore(deps): upgrade Playwright to 1.45.0
```

---

## ➕ How to Add New Tests

### Example: Adding a smoke test for the Recruitment module

**Step 1 — Create the test file:**

```typescript
// tests/smoke/recruitment.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { RecruitmentPage } from '../../src/pages/RecruitmentPage';
import { config } from '../../src/config/environment';

test.describe('Recruitment @smoke', () => {
  let loginPage: LoginPage;
  let recruitmentPage: RecruitmentPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    recruitmentPage = new RecruitmentPage(page);
    await loginPage.navigateToLogin();
    await loginPage.login(config.adminUsername, config.adminPassword);
  });

  test('displays vacancy list after navigation', async ({ page }) => {
    // ── Arrange (done in beforeEach) ─────────────────────────────────

    // ── Act ───────────────────────────────────────────────────────────
    await recruitmentPage.navigateToVacancyList();

    // ── Assert ────────────────────────────────────────────────────────
    await expect(page.locator('.oxd-table')).toBeVisible();
    await expect(page).toHaveURL(/recruitment/);
  });

  test('shows error when adding vacancy without required fields', async ({ page }) => {
    // ── Arrange ───────────────────────────────────────────────────────
    await recruitmentPage.navigateToAddVacancy();

    // ── Act ───────────────────────────────────────────────────────────
    await recruitmentPage.submitVacancyForm(); // submit empty form

    // ── Assert ────────────────────────────────────────────────────────
    await expect(page.getByText('Required')).toBeVisible();
  });
});
```

**Step 2 — Tag the test correctly:**

| Tag | Suite | Trigger |
|-----|-------|---------|
| `@smoke` | Smoke | Every push/PR |
| `@regression` | Regression | Push to main + nightly |
| (no tag) | Full matrix | Push/PR |

**Step 3 — Verify it runs:**
```bash
npx playwright test tests/smoke/recruitment.spec.ts --headed
```

---

## 📄 How to Add New Page Objects

### Example: Adding `RecruitmentPage`

**Step 1 — Create the page class:**

```typescript
// src/pages/RecruitmentPage.ts
import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class RecruitmentPage extends BasePage {
  // ── Selectors ────────────────────────────────────────────────────
  private readonly addVacancyButton = '[data-testid="add-vacancy-btn"]';
  private readonly vacancyTable = '.oxd-table';
  private readonly jobTitleInput = '[data-testid="job-title-input"]';
  private readonly saveButton = 'button[type="submit"]';

  constructor(page: Page) {
    super(page);
  }

  // ── Navigation ───────────────────────────────────────────────────
  async navigateToVacancyList(): Promise<void> {
    await this.goto('/web/index.php/recruitment/viewRecruitment');
  }

  async navigateToAddVacancy(): Promise<void> {
    await this.goto('/web/index.php/recruitment/viewRecruitment');
    await this.clickButton(this.addVacancyButton);
  }

  // ── Actions ──────────────────────────────────────────────────────
  async fillVacancyTitle(title: string): Promise<void> {
    await this.fillInput(this.jobTitleInput, title);
  }

  async submitVacancyForm(): Promise<void> {
    await this.clickButton(this.saveButton);
  }

  // ── Queries ──────────────────────────────────────────────────────
  async isVacancyTableVisible(): Promise<boolean> {
    return await this.page.locator(this.vacancyTable).isVisible();
  }

  async getVacancyCount(): Promise<number> {
    return await this.page.locator('.oxd-table-row').count();
  }

  // ── Assertions ───────────────────────────────────────────────────
  async verifyVacancyTableVisible(): Promise<void> {
    await expect(this.page.locator(this.vacancyTable)).toBeVisible();
  }
}
```

**Step 2 — Follow the `BasePage` contract:**

All page objects extend `BasePage` from `@qa-framework/core`. Never call `page.click()` or `page.fill()` directly in tests — always go through page object methods.

**Step 3 — Export from the barrel file (if applicable):**

```typescript
// src/pages/index.ts
export { LoginPage } from './LoginPage';
export { EmployeePage } from './EmployeePage';
export { RecruitmentPage } from './RecruitmentPage'; // ← add here
```

**Step 4 — Write a quick unit test:**
```bash
npx playwright test --grep "Recruitment" --headed
```

---

## 🔌 How to Add New API Clients

### Example: Adding a `RecruitmentApiClient`

**Step 1 — Create the client class:**

```typescript
// src/api/recruitment.api.ts
import { APIRequestContext } from '@playwright/test';

const BASE = 'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2';

export interface Vacancy {
  id?: number;
  jobTitleId: number;
  name: string;
  numOfPositions?: number;
}

export class RecruitmentApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async createVacancy(vacancy: Vacancy): Promise<Vacancy> {
    const response = await this.request.post(`${BASE}/recruitment/vacancies`, {
      data: vacancy,
    });
    if (!response.ok()) {
      throw new Error(`Failed to create vacancy: ${response.status()} ${await response.text()}`);
    }
    const body = await response.json();
    return body.data as Vacancy;
  }

  async getVacancy(id: number): Promise<Vacancy> {
    const response = await this.request.get(`${BASE}/recruitment/vacancies/${id}`);
    if (!response.ok()) {
      throw new Error(`Vacancy ${id} not found: ${response.status()}`);
    }
    const body = await response.json();
    return body.data as Vacancy;
  }

  async deleteVacancy(id: number): Promise<void> {
    const response = await this.request.delete(`${BASE}/recruitment/vacancies/${id}`);
    if (!response.ok()) {
      throw new Error(`Failed to delete vacancy ${id}: ${response.status()}`);
    }
  }
}
```

**Step 2 — Use in a test with proper cleanup:**

```typescript
// tests/api/recruitment-api.spec.ts
import { test, expect } from '@playwright/test';
import { RecruitmentApiClient, Vacancy } from '../../src/api/recruitment.api';

test.describe('Recruitment API', () => {
  let recruitmentApi: RecruitmentApiClient;
  let createdVacancyId: number | undefined;

  test.beforeEach(({ request }) => {
    recruitmentApi = new RecruitmentApiClient(request);
  });

  test.afterEach(async () => {
    if (createdVacancyId !== undefined) {
      await recruitmentApi.deleteVacancy(createdVacancyId);
      createdVacancyId = undefined;
    }
  });

  test('creates a vacancy successfully', async () => {
    // ── Arrange ───────────────────────────────────────────────────────
    const vacancyData: Vacancy = { jobTitleId: 1, name: 'QA Engineer' };

    // ── Act ───────────────────────────────────────────────────────────
    const created = await recruitmentApi.createVacancy(vacancyData);
    createdVacancyId = created.id;

    // ── Assert ────────────────────────────────────────────────────────
    expect(created.id).toBeDefined();
    expect(created.name).toBe('QA Engineer');
  });
});
```

**Principle:** Always clean up API-created data in `afterEach` to keep the demo environment clean for other tests.

---

## 🔄 Pull Request Process

1. Ensure your branch is up to date with `main`:
   ```bash
   git fetch origin && git rebase origin/main
   ```

2. Run the full quality check locally:
   ```bash
   npm run lint && npm run build && npm run test:smoke
   ```

3. Push your branch and open a PR against `main`

4. Fill in the PR description with:
   - What the PR adds/changes
   - How to test it
   - Screenshots if relevant (for UI changes)

5. Wait for CI checks to pass:
   - `smoke / smoke` ✅
   - `lint / lint` ✅

6. Request a review from at least one maintainer

7. Address review comments and re-request review

8. Squash merge when approved

---

## ✅ PR Checklist

Before submitting a PR, verify all of these:

**Tests:**
- [ ] New tests follow the AAA pattern
- [ ] Tests are tagged correctly (`@smoke`, `@regression`, or untagged)
- [ ] Tests clean up any data they create (`afterEach`)
- [ ] Tests are independent (can run in any order)
- [ ] No `test.only()` left in test files

**Code quality:**
- [ ] No selectors in test files (all in page objects)
- [ ] No hardcoded credentials (use `config.adminPassword`)
- [ ] No `page.waitForTimeout()` (use explicit waits)
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] ESLint passes (`npm run lint`)

**Documentation:**
- [ ] New page objects have JSDoc comments for public methods (if complex)
- [ ] New scripts added to `package.json` are documented in README

**CI:**
- [ ] Smoke tests pass (`npm run test:smoke`)
- [ ] No `console.log` debugging left in production code

---

## 📜 Code of Conduct

- Be respectful in PR comments and issue discussions
- Assume good intent — review the code, not the person
- Write constructive feedback with examples when requesting changes
- Respond to PR comments within 48 hours

---

[← Back to docs/](.) | [BEST-PRACTICES.md](BEST-PRACTICES.md) | [Main README](../README.md)
