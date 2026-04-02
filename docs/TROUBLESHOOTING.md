# 🔧 Troubleshooting Guide

Solutions for the most common issues you'll encounter with this framework.

---

## Table of Contents

- [Test Failures & Debugging](#-test-failures--debugging)
- [Environment Setup Issues](#-environment-setup-issues)
- [Docker Issues](#-docker-issues)
- [CI/CD Failures](#-cicd-failures)
- [Flaky Tests](#-flaky-tests)
- [Performance Problems](#-performance-problems)
- [API Errors](#-api-errors)
- [Browser-Specific Issues](#-browser-specific-issues)
- [FAQ](#-faq)

---

## 🧪 Test Failures & Debugging

### Browser not found

**Error:**
```
browserType.launch: Executable doesn't exist at ...
```

**Fix:**
```bash
# Install all browsers and system dependencies
npx playwright install --with-deps

# Install only Chromium (faster)
npx playwright install --with-deps chromium
```

---

### Authentication fails

**Error:**
```
Error: expect(received).toContain('dashboard')
```

**Likely causes:**
- OrangeHRM demo site credentials changed (they reset periodically)
- The demo site is temporarily down

**Fix:**
```bash
# Verify the demo site is reachable
curl -I https://opensource-demo.orangehrmlive.com

# Run a single test in headed mode to see what's happening
npx playwright test tests/smoke/login.spec.ts --headed --project=chromium
```

---

### Tests time out

**Error:**
```
Test timeout of 60000ms exceeded.
```

**Fix — increase global timeout:**
```typescript
// playwright.config.ts
export default defineConfig({
  timeout: 90000,        // increase test timeout
  expect: { timeout: 15000 }, // increase assertion timeout
  use: {
    actionTimeout: 15000,
    navigationTimeout: 45000,
  },
});
```

**Fix — add explicit wait in the test:**
```typescript
// Wait for a specific element before asserting
await page.waitForSelector('.oxd-topbar-header', { state: 'visible' });
```

---

### Element not found

**Error:**
```
Error: strict mode violation: locator('.oxd-button') resolved to 2 elements
```

**Fix — use a more specific selector:**
```typescript
// ❌ Too broad
page.locator('.oxd-button')

// ✅ Specific
page.locator('button[type="submit"]')
page.getByRole('button', { name: 'Login' })
```

---

### Tests pass locally but fail in CI

**Common causes and fixes:**

| Cause | Fix |
|-------|-----|
| Race condition hidden by slower CI | Add `await page.waitForLoadState('networkidle')` |
| Missing environment variable | Check GitHub Secrets are configured |
| Worker count difference | CI uses 2 workers; test with `WORKERS=2 npm test` |
| Demo site unavailable | Check site status; CI retries 2× automatically |

---

### How to debug a failing test

```bash
# Step 1 — run in debug mode (pauses at each step)
npx playwright test tests/smoke/login.spec.ts --debug

# Step 2 — generate and view a trace
npx playwright test tests/smoke/login.spec.ts --trace on
npx playwright show-trace test-results/trace.zip

# Step 3 — run in headed mode with slowdown
npx playwright test tests/smoke/login.spec.ts --headed --slowmo 500
```

---

## 🛠️ Environment Setup Issues

### Wrong Node.js version

**Error:**
```
The engine "node" is incompatible with this module.
```

**Fix — use Node Version Manager (nvm):**
```bash
nvm install 18
nvm use 18
node --version  # v18.x.x
```

---

### `npm ci` fails with peer dependency errors

**Fix:**
```bash
# Verify Node and npm versions
node --version   # must be 18+
npm --version    # must be 9+

# Clear npm cache and retry
npm cache clean --force
npm ci
```

---

### TypeScript compilation errors

**Error:**
```
error TS2307: Cannot find module '@qa-framework/core'
```

**Fix:**
```bash
# Build all workspace packages first
npm run build:packages

# Then run tests
npm test
```

---

### ESLint errors block runs

```bash
# Auto-fix most lint errors
npm run lint:fix

# Auto-format code
npm run format

# Check what's wrong
npm run lint
```

---

## 🐳 Docker Issues

### Docker build fails

**Error:**
```
ERROR [internal] load metadata for mcr.microsoft.com/playwright
```

**Fix:**
```bash
# Pull the base image manually
docker pull mcr.microsoft.com/playwright:v1.40.0-jammy

# Then build
docker build -t orangehrm-automation .
```

---

### Container exits immediately

**Fix — run interactively to see the error:**
```bash
docker run --rm -it orangehrm-automation bash
# Inside container:
npx playwright test --list  # verify tests are found
npm run test:smoke
```

---

### Docker Compose tests fail

```bash
# Check container logs
docker compose logs

# Rebuild without cache
docker compose build --no-cache

# Run a specific service
docker compose run --rm smoke
```

---

## ⚙️ CI/CD Failures

### GitHub Secrets not configured

**Symptoms:** Tests pass locally but fail in CI with auth errors.

**Required secrets** (Settings → Secrets → Actions):

| Secret | Value |
|--------|-------|
| `ORANGEHRM_BASE_URL` | `https://opensource-demo.orangehrmlive.com` |
| `ORANGEHRM_ADMIN_PASSWORD` | The admin password for the demo site |

---

### Workflow doesn't trigger

**Check:**
1. Branch name matches the trigger (e.g., `main`)
2. Workflow file is valid YAML: paste into [yaml-lint.com](https://www.yamllint.com/)
3. GitHub Actions is enabled in repo Settings → Actions

---

### Artifacts not uploaded

If the test run fails before the upload step, artifacts won't appear. To fix:

```yaml
# In your workflow, use if: always() to upload even on failure
- name: Upload report
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

---

### Manually triggering a workflow

```bash
# Via GitHub CLI
gh workflow run smoke-tests.yml --branch main

# Via GitHub UI: Actions → select workflow → Run workflow
```

---

## 🎲 Flaky Tests

### Identifying flaky tests

```bash
# Run tests multiple times to expose flakiness
for i in {1..5}; do npm run test:smoke; done

# Or use Playwright's built-in repeat
npx playwright test --repeat-each=3
```

---

### Common flakiness causes and fixes

| Problem | Fix |
|---------|-----|
| Hard-coded `sleep` / `waitForTimeout` | Replace with `waitForSelector` or `waitForResponse` |
| Race conditions on navigation | Add `await page.waitForLoadState('domcontentloaded')` |
| Shared test state between tests | Use `beforeEach` to reset state; never share page objects across tests |
| Selector matches multiple elements | Use `.first()`, `.nth()`, or a more specific locator |
| Network request timing | Use `page.waitForResponse()` to wait for API calls |

```typescript
// ❌ Flaky — arbitrary wait
await page.waitForTimeout(2000);

// ✅ Stable — wait for the actual condition
await page.waitForSelector('.oxd-topbar-header', { state: 'visible' });
await page.waitForURL('**/dashboard/**');
await page.waitForLoadState('networkidle');
```

---

## 🐢 Performance Problems

### Tests running slowly

**Diagnose:**
```bash
# Show timing per test
npx playwright test --reporter=list

# Find slowest tests
npx playwright test --reporter=json | node -e "
const data = require('/dev/stdin');
data.suites[0].specs
  .sort((a,b) => b.tests[0].results[0].duration - a.tests[0].results[0].duration)
  .slice(0,5)
  .forEach(s => console.log(s.tests[0].results[0].duration + 'ms', s.title));
"
```

**Common fixes:**
- Use API calls for test setup instead of UI flows (10× faster)
- Reduce `waitForLoadState('networkidle')` to `'domcontentloaded'` where possible
- Increase worker count locally: `npx playwright test --workers=4`

---

## 🔌 API Errors

### 401 Unauthorized

```bash
# Check credentials in .env.local
cat .env.local

# Verify token manually
curl -X POST https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Admin","password":"admin123"}'
```

---

### API response schema mismatch

**Error:**
```
expect(received).toMatchObject(expected)
```

The OrangeHRM demo API may update its response schema. Re-run with verbose logging to inspect the actual response:

```typescript
const response = await apiClient.getEmployee(id);
console.log(JSON.stringify(response, null, 2));
```

---

## 🌐 Browser-Specific Issues

### WebKit (Safari) failures

WebKit is stricter about:
- Mixed content (HTTP/HTTPS)
- Cookie handling
- CSS animations blocking clicks

**Fix — skip a test on WebKit:**
```typescript
test('employee create', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'Known WebKit timing issue');
  // ...
});
```

---

### Firefox failures

Firefox handles form submission differently. If clicks on `button[type="submit"]` are unreliable:

```typescript
// Alternative: press Enter on the focused input
await page.locator('#txtPassword').press('Enter');
```

---

## ❓ FAQ

**Q: Do I need a real OrangeHRM instance?**
A: No. Tests run against the public demo at `https://opensource-demo.orangehrmlive.com`.

**Q: Why do tests sometimes fail randomly in CI?**
A: The demo site is a shared public instance and can be slow or temporarily down. CI retries each test 2× automatically. Check the uploaded HTML report for screenshots.

**Q: How do I run a single test file?**
```bash
npx playwright test tests/smoke/login.spec.ts
```

**Q: How do I run tests matching a pattern?**
```bash
npx playwright test --grep "login"
```

**Q: Where are screenshots on failure?**
A: In `test-results/` locally, and in the GitHub Actions artifact (`playwright-report`) for CI runs.

**Q: How do I see all available npm scripts?**
```bash
npm run
```

**Q: How do I update Playwright to the latest version?**
```bash
npm install @playwright/test@latest
npx playwright install --with-deps
```

---

[← Back to docs/](.) | [QUICK_START.md](QUICK_START.md) | [Main README](../README.md)
