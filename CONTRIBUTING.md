# Contributing to OrangeHRM Automation

Thank you for your interest in contributing! This guide explains how to get set up, what standards to follow, and how to submit your work.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Code Standards](#code-standards)
- [Writing Tests](#writing-tests)
- [Pull Request Process](#pull-request-process)
- [Code of Conduct](#code-of-conduct)
- [Reporting Issues](#reporting-issues)

---

## Getting Started

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

4. **Create** a feature branch (see [Branch Naming](#branch-naming)):

   ```bash
   git checkout -b feat/add-recruitment-tests
   ```

5. **Make your changes**, write tests, and ensure everything passes:

   ```bash
   npm run lint
   npm run build
   npm run test:smoke
   ```

6. **Push** and open a pull request against `main`.

---

## Branch Naming

Use the following prefixes:

| Prefix | When to use |
|---|---|
| `feat/` | New test or feature |
| `fix/` | Bug fix or flaky test correction |
| `docs/` | Documentation-only changes |
| `chore/` | Build, CI, or dependency updates |
| `refactor/` | Code restructuring without behaviour change |

**Examples:**

```
feat/add-recruitment-page-tests
fix/login-error-selector-update
docs/update-best-practices
chore/upgrade-playwright-1.45
```

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`

**Examples:**

```
feat(leave): add leave balance validation tests
fix(login): update error selector for new OrangeHRM version
docs(readme): add architecture diagram
chore(ci): upgrade actions/upload-artifact to v4
test(api): add employee delete API test
```

---

## Code Standards

This project uses ESLint and Prettier. Run the following before committing:

```bash
# Check for lint errors
npm run lint

# Auto-fix lint errors
npm run lint:fix

# Format code
npm run format

# Type-check
npm run build
```

### TypeScript Guidelines

- Use explicit types; avoid `any`
- Prefer `async/await` over Promise chains
- Export page objects and utilities through index files

```typescript
// ✅ Good
async login(username: string, password: string): Promise<void> {
  await this.fillInput(this.usernameInput, username);
  await this.fillInput(this.passwordInput, password);
  await this.clickButton(this.loginButton);
}

// ❌ Avoid
async login(username: any, password: any) {
  // ...
}
```

### Selector Strategy

Prefer selectors in this order:

1. `data-testid` attributes (most stable)
2. ARIA roles and labels
3. CSS classes scoped to a component
4. XPath (last resort)

```typescript
// ✅ Preferred
const submitButton = '[data-testid="submit-btn"]';

// ✅ Acceptable
const submitButton = 'button[type="submit"]';

// ❌ Fragile
const submitButton = 'div > div:nth-child(3) > button';
```

---

## Writing Tests

### File Locations

| Test type | Directory |
|---|---|
| Fast validation | `tests/smoke/` |
| API tests | `tests/api/` |
| Cross-browser | `tests/cross-browser/` |
| Data-driven | `tests/data-driven/` |

### Test Structure

Use the Page Object Model. Tests should only contain assertions and orchestration — no direct selectors.

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';

test.describe('Login Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
  });

  test('should login with valid credentials @smoke', async () => {
    await loginPage.login('Admin', 'admin123');
    await loginPage.verifyLoginSuccess();
  });
});
```

### Tagging

Tag smoke tests with `@smoke` in the test title so they can be run independently:

```typescript
test('should load dashboard @smoke', async () => { ... });
```

Run tagged tests with:

```bash
npm run test:smoke   # runs tests tagged @smoke
```

---

## Pull Request Process

1. Ensure all lint, type-check, and smoke tests pass locally.
2. Fill out the PR description — explain **what** changed and **why**.
3. Link related issues using `Closes #<issue-number>`.
4. Request a review from a maintainer.
5. Address all review comments before merging.

PRs that introduce flaky tests, break the build, or lack a description will not be merged.

---

## Code of Conduct

- Be respectful and constructive in all interactions.
- Harassment, personal attacks, or discriminatory language will not be tolerated.
- Focus feedback on code, not on the person.

---

## Reporting Issues

Open an issue in the [Issues tab](https://github.com/germanobrian1998/orangehrm-automation/issues). Include:

- A clear title
- Steps to reproduce
- Expected vs. actual behaviour
- Playwright version, browser, and OS
- Relevant logs or screenshots