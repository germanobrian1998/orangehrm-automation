# 🎬 Demo Guide — See the Tests in Action

A step-by-step guide for running the OrangeHRM automation suite and viewing the visual results. Perfect for portfolio walkthroughs and technical interviews.

---

## Table of Contents

- [Quick Demo (2 minutes)](#-quick-demo-2-minutes)
- [Full Demo Walkthrough](#-full-demo-walkthrough)
- [Visual Regression Tests](#-visual-regression-tests)
- [HTML Report Walkthrough](#-html-report-walkthrough)
- [Allure Report Walkthrough](#-allure-report-walkthrough)
- [CI/CD Pipeline Demo](#-cicd-pipeline-demo)
- [Cross-Browser Execution](#-cross-browser-execution)
- [Performance Test Metrics](#-performance-test-metrics)
- [Downloading CI Artifacts](#-downloading-ci-artifacts)

---

## ⚡ Quick Demo (2 minutes)

```bash
# 1. Clone and install
git clone https://github.com/germanobrian1998/orangehrm-automation.git
cd orangehrm-automation
npm ci
npx playwright install --with-deps chromium

# 2. Run smoke tests with browser visible
npm run test:smoke -- --headed

# 3. Open the HTML report
npm run report
```

> **What you'll see:** Chromium launches, navigates to the OrangeHRM demo app, runs login/employee/leave validations, and produces a rich HTML report with timings.

---

## 🎯 Full Demo Walkthrough

### Step 1 — Run smoke tests (headed mode)

```bash
npm run test:smoke -- --headed --project=chromium
```

**Expected output:**

```
Running 6 tests using 2 workers

  ✓  [chromium] › smoke/login.spec.ts:13:3 › Login Tests @smoke › should login with valid credentials (3.2s)
  ✓  [chromium] › smoke/login.spec.ts:30:3 › Login Tests @smoke › should handle invalid credentials gracefully (2.8s)
  ✓  [chromium] › smoke/login.spec.ts:48:3 › Login Tests @smoke › should display validation for empty fields (1.9s)
  ✓  [chromium] › smoke/employee.spec.ts:20:3 › Employee Management Tests @employee › should navigate to employee list (4.1s)
  ✓  [chromium] › smoke/employee.spec.ts:38:3 › Employee Management Tests @employee › should verify employee list page loads (3.5s)
  ✓  [chromium] › smoke/leave.spec.ts:18:3 › Leave Management Tests @smoke › should navigate to leave module (2.9s)

  6 passed (18.4s)
```

### Step 2 — View the HTML report

```bash
npm run report
```

The Playwright HTML report opens in your browser. It shows:

- Test names, durations, and pass/fail status
- Screenshots attached on failure
- Trace files for debugging (click **Retry** on any failed test)
- Filter by test name, status, or tag

### Step 3 — Run with trace for step-by-step replay

```bash
npx playwright test tests/smoke/login.spec.ts --trace=on --project=chromium
npx playwright show-trace test-results/*/trace.zip
```

The **Playwright Trace Viewer** shows:

- Each action with its exact timing
- DOM snapshot before and after every step
- Network requests and console logs
- Screenshots at every step

---

## 🖼️ Visual Regression Tests

Visual regression tests capture pixel-perfect baseline screenshots and alert you to unintended UI changes.

### Create baselines (first time only)

```bash
npx playwright test tests/visual --update-snapshots --project=visual
```

Baselines are saved to `tests/visual/*.spec.ts-snapshots/` and committed to git.

### Run visual comparisons

```bash
npx playwright test tests/visual --project=visual
```

**What gets tested:**
| Test | Screenshot | Tolerance |
|------|-----------|-----------|
| Login page full view | `login-page.png` | 2% pixel diff |
| Login card element | `login-card.png` | 2% pixel diff |
| Login page branding | `login-full-branding.png` | 2% pixel diff |
| Dashboard full view | `dashboard-page.png` | 2% pixel diff |
| Dashboard sidebar | `dashboard-sidebar.png` | 2% pixel diff |

### Updating baselines after intentional UI changes

```bash
npx playwright test tests/visual --update-snapshots --project=visual
git add tests/visual/*-snapshots/
git commit -m "chore: update visual regression baselines"
```

---

## 📊 HTML Report Walkthrough

After running any test suite, a rich HTML report is generated:

```bash
# Run tests then open report
npm run test:smoke
npm run report
```

**Report features:**

- 📋 Test list with pass/fail indicators
- ⏱️ Per-test and per-step duration
- 📸 Screenshots attached to failed tests
- 🔍 Trace viewer links (click to open interactive replay)
- 🎥 Video recordings (available when `video: 'retain-on-failure'` is set)
- 🔖 Filter by test name, file, tag, or status

**Share the report:**

```bash
# Zip the report for sharing
zip -r playwright-report.zip playwright-report/

# Or serve it locally on a specific port
npx playwright show-report --port 9323
```

---

## 📈 Allure Report Walkthrough

Allure provides a richer analytics dashboard with historical trends.

```bash
# Generate and open Allure report
npm run test:report

# Or serve live
npm run test:report:serve
```

**Allure report sections:**

- **Overview** — Pass/fail donut, total tests, duration
- **Suites** — Tests grouped by Epic → Feature → Story (matches the `allure.*` annotations in test files)
- **Graphs** — Pass rate trends, duration trends
- **Categories** — Product defects vs. test defects
- **Timeline** — When each test ran and on which worker

---

## ⚙️ CI/CD Pipeline Demo

### View live workflow runs

→ **[GitHub Actions](https://github.com/germanobrian1998/orangehrm-automation/actions)**

| Workflow            | When it runs           | What to look for              |
| ------------------- | ---------------------- | ----------------------------- |
| 🔥 Smoke Tests      | Every push & PR        | Fast 5-min validation         |
| 🔄 Regression Tests | Push to main + nightly | Full suite pass rate          |
| 📊 Code Quality     | PRs to main            | ESLint + TypeScript           |
| 🌐 Full Matrix      | Push to main + nightly | 3-browser results             |
| 📄 Publish Report   | Push to main           | Deploy report to GitHub Pages |

### Download CI artifacts

1. Open any completed workflow run on GitHub Actions
2. Scroll to the **Artifacts** section at the bottom
3. Download `smoke-report` or `regression-report` (ZIP)
4. Extract and open `index.html` in your browser

---

## 🌐 Cross-Browser Execution

Run the same tests across all three browsers simultaneously:

```bash
# Run smoke tests on all browsers
npx playwright test tests/smoke --project=chromium --project=firefox --project=webkit

# Or run the full cross-browser suite
npm run test:regression
```

**Browser project summary:**

| Browser  | Engine | Viewport | Typical Duration |
| -------- | ------ | -------- | ---------------- |
| Chromium | Blink  | 1280×720 | ~5 min           |
| Firefox  | Gecko  | 1280×720 | ~5.5 min         |
| WebKit   | WebKit | 1280×720 | ~6 min           |

CI runs all three in parallel, reducing total time to the longest individual run.

---

## ⚡ Performance Test Metrics

Performance tests capture Web Vitals and custom timing metrics:

```bash
# Run performance tests
npx playwright test tests/performance --project=performance

# View k6 load test results
npm run load:smoke
```

**What is measured:**

- Page load time (navigation timing)
- Time to First Contentful Paint (FCP)
- Time to Interactive (TTI)
- API response times for CRUD operations

See [PERFORMANCE.md](PERFORMANCE.md) for full benchmarks and targets.

---

## 📥 Downloading CI Artifacts

### From GitHub Actions UI

1. Go to [Actions tab](https://github.com/germanobrian1998/orangehrm-automation/actions)
2. Click on any completed run
3. Scroll to **Artifacts**
4. Download `smoke-report` or `regression-report`
5. Extract the ZIP and open `index.html`

### From GitHub CLI

```bash
# List artifacts for the latest run
gh run list --limit 5
gh run download <run-id> --name smoke-report

# Open the downloaded report
open smoke-report/index.html
```

---

## 💡 Pro Tips for Portfolio Demos

1. **Record your demo** with QuickTime (macOS), OBS Studio (Linux/Windows), or Loom (all platforms)
2. **Show the trace viewer** — it's the most impressive visual of Playwright's capabilities
3. **Open a failed test** in the HTML report and click through screenshots + trace
4. **Show the GitHub Actions run** with green checks — it demonstrates CI/CD in practice
5. **Highlight parallelism** — show the timeline view in the HTML report where multiple workers run simultaneously

See [VIDEO-WALKTHROUGH.md](VIDEO-WALKTHROUGH.md) for full recording scripts and LinkedIn templates.

---

[← Back to docs/](.) | [README.md](../README.md) | [VIDEO-WALKTHROUGH.md](VIDEO-WALKTHROUGH.md)
