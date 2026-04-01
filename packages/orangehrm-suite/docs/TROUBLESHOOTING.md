# Troubleshooting & FAQ

This guide covers the most common errors encountered when working with the OrangeHRM automation framework and how to resolve them.

## Table of Contents

- [Common Errors and Solutions](#common-errors-and-solutions)
- [Debug Mode Usage](#debug-mode-usage)
- [Log Analysis](#log-analysis)
- [Performance Issues](#performance-issues)
- [CI/CD Pipeline Issues](#cicd-pipeline-issues)
- [Browser Compatibility Issues](#browser-compatibility-issues)

---

## Common Errors and Solutions

### `Error: browserType.launch: Executable doesn't exist at ...`

**Cause:** Playwright browsers are not installed.

**Solution:**
```bash
npx playwright install
# Install only specific browsers
npx playwright install chromium firefox webkit
# Install with system dependencies (Linux)
npx playwright install --with-deps
```

---

### `Cannot find module '@qa-framework/core'` or `@qa-framework/shared-utils`

**Cause:** npm workspaces are not linked, or `node_modules` is missing.

**Solution:**
```bash
# From the repository root
npm install

# If the issue persists, clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### `Error: net::ERR_CONNECTION_REFUSED`

**Cause:** The `ORANGEHRM_BASE_URL` is unreachable.

**Solution:**
1. Verify the URL in your `.env.local` file.
2. Check that the OrangeHRM application is running.
3. If testing against a local instance, ensure the server is started.
4. Verify network/VPN access if the target is on a private network.

```bash
# Test connectivity
curl -I https://opensource-demo.orangehrmlive.com
```

---

### `Timeout exceeded while waiting for ...`

**Cause:** An element did not appear within the configured timeout, or the page took too long to load.

**Solution:**
1. Increase `TEST_TIMEOUT` in `.env.local`:
   ```env
   TEST_TIMEOUT=60000
   ```
2. Run in headed mode to visually inspect what happens:
   ```bash
   HEADLESS=false npx playwright test tests/auth/login.spec.ts
   ```
3. Use the Playwright Inspector to debug interactively:
   ```bash
   npx playwright test --debug tests/auth/login.spec.ts
   ```

---

### `Error: page.locator: Unknown engine ...`

**Cause:** An invalid selector syntax is used.

**Solution:** Check `src/selectors.ts` for typos. Verify selectors in the browser DevTools Console:
```javascript
document.querySelector('.orangehrm-login-button')
```

---

### `Environment variables not loaded`

**Cause:** `.env.local` does not exist or `NODE_ENV` is not set to `test`.

**Solution:**
```bash
# Create the env file from the example
cp .env.example .env.local

# Run with explicit NODE_ENV
NODE_ENV=test npm test
```

---

### `Error: expect(received).toBe(expected)` – unexpected test failure

**Cause:** Application state from a previous test leaked into the current test, or the selector matched the wrong element.

**Solution:**
1. Ensure tests are independent (no shared state).
2. Use `test.beforeEach` to reset state.
3. Check that `test.afterEach` cleanup is running.
4. Run the failing test in isolation:
   ```bash
   npx playwright test tests/auth/login.spec.ts --grep "test name"
   ```

---

### `Error: page.waitForURL: Timeout` after login

**Cause:** The login did not redirect as expected – possibly wrong credentials or the application is slow.

**Solution:**
1. Verify credentials in `.env.local`.
2. Increase timeout:
   ```typescript
   await this.page.waitForURL(/dashboard/, { timeout: 60000 });
   ```
3. Check the application login page manually.

---

### TypeScript compilation errors

**Cause:** Type mismatches, outdated type definitions, or workspace link issues.

**Solution:**
```bash
# Rebuild the core package
cd packages/core && npm run build

# Check TypeScript from the suite root
cd packages/orangehrm-suite && npx tsc --noEmit
```

---

## Debug Mode Usage

### Playwright Inspector

Run any test with `--debug` to open the Playwright Inspector. It pauses before each action and lets you step through interactions:

```bash
npx playwright test tests/auth/login.spec.ts --debug
```

### Headed mode

Run tests in a visible browser window:

```bash
HEADLESS=false npx playwright test
```

### Slow motion

Add `slowMo` to the config for slowed-down execution:

```typescript
// playwright.config.ts
use: {
  launchOptions: { slowMo: 500 },  // 500ms between actions
},
```

Or set it for a single run via environment (if wired up in config):
```bash
SLOW_MO=500 npx playwright test
```

### `page.pause()`

Insert `await page.pause()` anywhere in a page object or test to pause execution and open the Inspector at that point. **Remove before committing.**

```typescript
async riskyOperation(): Promise<void> {
  await this.page.pause(); // DEBUG: remove before committing
  await this.click(selectors.feature.button);
}
```

### Enable debug logging

```bash
LOG_LEVEL=debug DEBUG=true npm test
```

### Trace viewer

Traces are automatically captured on the first retry in CI. To enable traces locally:

```typescript
// playwright.config.ts
use: {
  trace: 'on',  // or 'retain-on-failure'
},
```

View a trace:
```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

---

## Log Analysis

### Log file location

By default, logs are written to the console. To save them to a file, redirect output:

```bash
npm test 2>&1 | tee test-results/test.log
```

### Reading logs

Each log line contains:
- Timestamp
- Class name (page object or fixture)
- Log level
- Message

```
[2024-01-15 10:23:45] [LoginPage] STEP 1 : Logging in as Admin
[2024-01-15 10:23:46] [LoginPage] INFO   : ✓ Login successful for Admin
[2024-01-15 10:23:47] [PimPage]   ERROR  : Failed to create employee | Error: Timeout
```

### Finding errors in logs

```bash
grep "ERROR" test-results/test.log
grep "FAIL" test-results/test.log
```

### Correlating logs with test names

Enable `--reporter=line` for a compact view, or `--reporter=list` (default) for one line per test:

```bash
npx playwright test --reporter=list 2>&1 | grep -E "(PASS|FAIL|ERROR)"
```

---

## Performance Issues

### Tests take too long

1. **Run only the failing subset:**
   ```bash
   npx playwright test --grep "@smoke"
   ```
2. **Increase parallelism locally:**
   ```bash
   npx playwright test --workers=4
   ```
3. **Disable unnecessary browsers:**
   ```typescript
   // Comment out firefox and webkit projects in playwright.config.ts
   projects: [
     { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
   ],
   ```
4. **Profile slow tests** by checking test durations in the HTML report.

### Memory issues during large runs

1. Reduce the number of workers: `--workers=2`
2. Add `test.afterEach` cleanup to close pages and contexts.
3. Enable garbage collection between test files.

---

## CI/CD Pipeline Issues

### Tests pass locally but fail in CI

**Common causes and solutions:**

| Cause | Solution |
|---|---|
| Missing environment variables | Add secrets to GitHub Actions; check `.env.example` for required vars |
| Browser not installed | Add `npx playwright install --with-deps chromium` step |
| Race conditions / timing | Enable retries: `retries: 2` in `playwright.config.ts` |
| Headless rendering differences | Test with `HEADLESS=true` locally before pushing |
| Locale/timezone differences | Set `TZ=UTC` in CI environment |
| Network latency to target | Use a CI runner closer to the target or mock external APIs |

### CI runs take too long

1. Use sharding to split across multiple runners:
   ```yaml
   strategy:
     matrix:
       shard: [1, 2, 3]
   steps:
     - run: npx playwright test --shard=${{ matrix.shard }}/3
   ```
2. Cache Playwright browsers:
   ```yaml
   - uses: actions/cache@v4
     with:
       path: ~/.cache/ms-playwright
       key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
   ```

### Artifact upload fails

```yaml
- name: Upload report
  if: always()   # ← always upload, even on failure
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: packages/orangehrm-suite/playwright-report/
```

### `forbidOnly` failure in CI

**Cause:** A `test.only()` or `test.describe.only()` was committed.

**Solution:** Remove `.only()` from all tests before merging. The CI config has `forbidOnly: true` to prevent this:

```typescript
forbidOnly: environment.isCI,
```

---

## Browser Compatibility Issues

### Test passes in Chromium but fails in Firefox/WebKit

1. **Inspect the difference** by running the test in both browsers:
   ```bash
   npx playwright test --project=chromium tests/auth/login.spec.ts
   npx playwright test --project=firefox  tests/auth/login.spec.ts
   ```
2. **Take screenshots** from both browsers and compare visually.
3. **Check for browser-specific CSS/JS** differences in the application.
4. **Use browser-agnostic selectors** (avoid vendor-prefixed CSS selectors).

### WebKit (Safari) timing issues

WebKit is stricter about network timing. Solutions:
- Increase `navigationTimeout`:
  ```typescript
  use: { navigationTimeout: 45000 },
  ```
- Use `waitUntil: 'domcontentloaded'` instead of `'networkidle'` for faster-loading pages.

### Firefox and iframes

Firefox handles iframes differently. When interacting with iframe content:

```typescript
const frame = page.frameLocator('iframe[name="content"]');
await frame.locator(selectors.feature.button).click();
```

### Mobile viewport emulation

If tests fail on mobile-emulated viewports:

```typescript
// playwright.config.ts
projects: [
  { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
],
```

For more help, see the [Playwright documentation](https://playwright.dev/docs/intro) or open an issue in the repository.
