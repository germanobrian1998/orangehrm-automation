# Contributing Guide

Thank you for contributing to the OrangeHRM automation framework. This guide describes the development workflow, coding standards, and review process.

## Table of Contents

- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)
- [Commit Message Conventions](#commit-message-conventions)
- [Testing Requirements](#testing-requirements)
- [Documentation Standards](#documentation-standards)

---

## Development Workflow

### 1. Fork and clone

```bash
git clone https://github.com/germanobrian1998/orangehrm-automation.git
cd orangehrm-automation
npm install
```

### 2. Create a feature branch

Branch names follow the pattern: `type/short-description`

| Type | When to use |
|---|---|
| `feat/` | New feature or test |
| `fix/` | Bug fix |
| `docs/` | Documentation only |
| `refactor/` | Code restructuring without behaviour change |
| `test/` | Adding or updating tests |
| `chore/` | Dependency updates, build tooling |

```bash
git checkout -b feat/add-leave-module-tests
```

### 3. Make changes

- Follow the [coding standards](#coding-standards) below.
- Write or update tests as required.
- Update documentation if behaviour changes.

### 4. Verify locally

```bash
# Lint
npm run lint

# Type-check
cd packages/orangehrm-suite && npx tsc --noEmit

# Run relevant tests
npm run test:smoke
```

### 5. Commit changes

Follow the [commit message conventions](#commit-message-conventions).

```bash
git add .
git commit -m "feat(leave): add leave application test suite"
```

### 6. Push and open a Pull Request

```bash
git push origin feat/add-leave-module-tests
```

Then open a PR on GitHub. Fill in the PR template with a description, related issues, and testing notes.

---

## Coding Standards

### TypeScript

- Use `strict` mode (already enabled in `tsconfig.json`).
- Prefer `const` over `let`. Never use `var`.
- Always type function parameters and return values.
- Avoid `any`; use `unknown` when the type is genuinely unknown.

```typescript
// ✅ Good
async getEmployee(id: number): Promise<Employee> { ... }

// ❌ Bad
async getEmployee(id: any): Promise<any> { ... }
```

### Page objects

- Extend `BasePage` for all UI page objects.
- Extend `BaseApiClient` for all API clients.
- Add selectors to `src/selectors.ts`, not inline in page objects.
- Use `try/catch` with logging and re-throw in page object methods.

### Tests

- Follow the [Testing Best Practices Guide](./BEST_PRACTICES.md).
- Use the AAA pattern (Arrange–Act–Assert).
- Tag tests with appropriate `@tag` prefixes.
- Do not use `test.only()` in committed code.

### ESLint

Run the linter before committing:

```bash
npm run lint
# Auto-fix where possible
npm run lint -- --fix
```

### Prettier

Code formatting is enforced by Prettier. Format on save in VS Code, or run manually:

```bash
npx prettier --write "packages/**/*.ts"
```

---

## Pull Request Process

### PR title

Use the same format as commit messages:

```
feat(pim): add employee search by department filter
fix(auth): handle session timeout gracefully
docs(readme): update setup instructions for Node 20
```

### PR description template

```markdown
## Summary
<!-- What does this PR do? -->

## Related Issues
<!-- Closes #123, Fixes #456 -->

## Changes
<!-- Bullet list of what changed -->
- Added `DepartmentFilterPage` page object
- Added 5 new tests to `tests/employee/department-filter.spec.ts`
- Updated `src/selectors.ts` with department filter selectors

## Testing
<!-- How was this tested? -->
- [x] `npm run test:smoke` passes
- [x] New tests pass locally (chromium)
- [x] `npx tsc --noEmit` has no errors
- [ ] Tested in Firefox and WebKit

## Screenshots / Videos
<!-- Attach screenshots or screen recordings if UI changed -->
```

### PR checklist

Before requesting review, ensure:

- [ ] All CI checks pass (lint, type-check, tests)
- [ ] New tests are added for new functionality
- [ ] Documentation is updated if behaviour changed
- [ ] No `test.only()` or `page.pause()` left in the code
- [ ] Selectors are added to `src/selectors.ts`
- [ ] Error handling uses `try/catch` with logging

### Review and merge

- At least **one approved review** is required before merging.
- The PR author is responsible for addressing review comments.
- Squash and merge is preferred to keep `main`/`develop` history clean.

---

## Code Review Guidelines

### For reviewers

**Focus on:**
- Correctness – does the code do what it says?
- Test coverage – are new code paths covered by tests?
- Maintainability – will this be easy to change in the future?
- Consistency – does this follow existing patterns?

**Be constructive:**
- Explain *why* a change is needed, not just *what* to change.
- Distinguish between blocking issues (must fix) and suggestions (optional).
- Use `nit:` prefix for minor style suggestions.

**Check for:**
- Hardcoded credentials or URLs (should use `config.*` instead)
- `console.log()` in page objects (use `this.logger.*` instead)
- Selectors inline in test files (should be in `selectors.ts`)
- Missing `try/catch` in page object methods
- `test.only()` or `page.pause()` left in code

### For authors

- Respond to every review comment, even with just "Done" or "Acknowledged".
- Request a re-review after addressing feedback.
- If you disagree with a suggestion, explain your reasoning constructively.

---

## Commit Message Conventions

Commits follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|---|---|
| `feat` | New feature or test |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change that doesn't fix a bug or add a feature |
| `test` | Adding or updating tests |
| `chore` | Tooling, dependencies, CI/CD changes |
| `perf` | Performance improvement |
| `style` | Formatting only (no logic changes) |

### Scopes

Use the package or feature area as scope:

```
feat(pim): add department filter tests
fix(auth): handle expired session token
docs(framework): update CI integration guide
chore(deps): update playwright to 1.41.0
```

### Examples

```
feat(leave): add annual leave application test

Implements the full leave application flow including
leave type selection, date range input, and approval.

Closes #42

---

fix(login): increase timeout for slow CI environments

The login redirect sometimes exceeds 30s in CI.
Increase waitForUrl timeout to 45s.

Fixes #67
```

---

## Testing Requirements

### When to add tests

| Change type | Tests required |
|---|---|
| New page object | Unit tests for all public methods |
| New test spec | At least 3 scenarios (happy path, error, edge case) |
| Bug fix | Regression test that would have caught the bug |
| Selector change | Verify existing tests still pass |
| Config change | Update fixtures or mocks if relevant |

### Test coverage expectations

- All new page object methods must have at least one test.
- Happy-path flows must be tagged `@smoke`.
- Error and edge cases should be tagged `@regression`.

### Running tests before pushing

```bash
# Quick sanity check
npm run test:smoke

# Full regression
npm run test:regression

# Type checking
cd packages/orangehrm-suite && npx tsc --noEmit
cd packages/core && npx tsc --noEmit
```

---

## Documentation Standards

### When to update documentation

- Adding a new page object → update `src/index.ts` exports and `README.md` if needed.
- Changing configuration options → update `FRAMEWORK_GUIDE.md` and `GETTING_STARTED.md`.
- Adding a new test category → update `ARCHITECTURE.md`.
- Fixing a common issue → add it to `TROUBLESHOOTING.md`.

### Documentation style

- Use sentence case for headings.
- Use tables for structured data (options, properties, comparisons).
- Include code examples for every new API or pattern.
- Keep explanations concise – link to Playwright docs for details that are already documented there.

### Markdown conventions

- Use `##` for top-level sections and `###` for subsections.
- Use code blocks with language identifiers: ` ```typescript `, ` ```bash `.
- Wrap file paths in backticks: `` `src/selectors.ts` ``.
- Use `**bold**` for emphasis, not ALL CAPS.
