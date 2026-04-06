# Multi-Environment Configuration

This document describes how to configure and run the OrangeHRM automation
suite against different target environments.

---

## Environment Files

Each environment is driven by a dedicated `.env.*` file at the repository root.

| File | Purpose |
|------|---------|
| `.env.example` | Template – copy and rename to create your own |
| `.env.dev` | Local / development server |
| `.env.staging` | Shared staging server |
| `.env.prod` | Production (smoke tests only) |
| `.env.ci` | Values used by GitHub Actions CI |

> **Security note:** `.env`, `.env.local`, and `*.local` files are listed in
> `.gitignore` and will never be committed.  
> The named environment files (`.env.dev`, `.env.staging`, `.env.prod`,
> `.env.ci`) **are** committed because they contain no real secrets; production
> credentials should always be injected via CI/CD secrets.

---

## Configuration Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ENVIRONMENT` | Environment label (`development`, `staging`, `production`, `ci`) | `development` |
| `ORANGEHRM_BASE_URL` | Base URL of the OrangeHRM instance under test | `https://opensource-demo.orangehrmlive.com` |
| `ORANGEHRM_ADMIN_USERNAME` | Admin username | `Admin` |
| `ORANGEHRM_ADMIN_PASSWORD` | Admin password | `admin123` |
| `TEST_TIMEOUT` | Global test timeout in ms | `30000` |
| `API_TIMEOUT` | HTTP request timeout in ms | `10000` |
| `BROWSER` | Browser to use (`chromium`, `firefox`, `webkit`) | `chromium` |
| `HEADLESS` | Run browsers headlessly (`true` / `false`) | `true` |
| `LOG_LEVEL` | Logging verbosity (`debug`, `info`, `warn`, `error`) | `info` |
| `DEBUG` | Enable verbose debug output | `false` |
| `ALLURE_RESULTS_DIR` | Output directory for Allure results | `./allure-results` |
| `CI` | Set to `true` inside CI runners | `false` |

---

## Running Tests for a Specific Environment

The active environment is selected via the `ENVIRONMENT` variable.
Convenience npm scripts are provided at the root:

```bash
# Run all tests against the development environment
npm run test:dev

# Run all tests against staging
npm run test:staging

# Smoke tests only against production
npm run test:prod

# CI mode (used by GitHub Actions)
npm run test:ci
```

You can also pass the variable directly:

```bash
ENVIRONMENT=staging npx playwright test
```

### Tag-based filtering

Tests should be tagged so they can be filtered per environment:

```bash
# Smoke tests for development
npm run test:smoke:dev

# Regression tests for staging
npm run test:regression:staging

# API tests against production
npm run test:api:prod
```

---

## Adding a New Environment

1. Copy `.env.example` to `.env.<name>` and fill in the values.
2. Add an npm script in `package.json`:
   ```json
   "test:<name>": "ENVIRONMENT=<name> playwright test"
   ```
3. Add a job to `.github/workflows/test-all-environments.yml` following the
   existing pattern.
4. Update this document.

---

## Test Tags and Environment Compatibility

Annotate tests to indicate which environments they should run against:

```typescript
// Runs on every environment
test('Login @smoke', async ({ page }) => { /* … */ });

// Staging and below only (e.g. uses test data that does not exist in prod)
test('Create employee @dev @staging', async ({ page }) => { /* … */ });

// Production smoke only
test('Homepage loads @prod', async ({ page }) => { /* … */ });
```

Filter with `--grep`:

```bash
# Only @smoke tests on staging
ENVIRONMENT=staging npx playwright test --grep @smoke

# Only tests safe for production
ENVIRONMENT=production npx playwright test --grep @prod
```

---

## CI/CD Integration

The `.github/workflows/test-all-environments.yml` workflow runs three
parallel jobs on every push / pull-request to `main`:

| Job | Environment | Notes |
|-----|-------------|-------|
| `test-dev` | `development` | Uses `.env.dev` |
| `test-staging` | `staging` | Uses `.env.staging` |
| `test-ci` | `ci` | Uses `.env.ci`, `CI=true` |

Production tests are intentionally excluded from automatic runs to avoid
hitting a live system on every commit. Add a manual trigger or a separate
scheduled workflow when needed.

### Injecting secrets in CI

For environments that require real credentials, use GitHub repository secrets
and pass them as environment variables:

```yaml
- name: Run production smoke tests
  run: npm run test:prod
  env:
    ENVIRONMENT: production
    ORANGEHRM_BASE_URL: ${{ secrets.PROD_BASE_URL }}
    ORANGEHRM_ADMIN_USERNAME: ${{ secrets.PROD_USERNAME }}
    ORANGEHRM_ADMIN_PASSWORD: ${{ secrets.PROD_PASSWORD }}
```

---

## How Config.ts Loads the Environment File

`packages/core/src/config/Config.ts` uses the following resolution order:

1. If `NODE_ENV=test` and `.env.local` exists → load `.env.local` (unit tests).
2. If `ENVIRONMENT` is set and `.env.<ENVIRONMENT>` exists → load that file.
3. Otherwise → load `.env` (or rely on defaults).

This means no code change is required to point the suite at a new
environment – only an env file and the `ENVIRONMENT` variable are needed.
