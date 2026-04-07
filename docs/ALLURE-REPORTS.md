# 📊 Allure Test Reports

Comprehensive guide for generating, viewing, and understanding Allure test reports for the OrangeHRM automation suite.

## Overview

[Allure Framework](https://allurereport.org/) provides rich, interactive test reports with:
- Visual test result dashboard
- Test history and trends
- Epic / Feature / Story hierarchy
- Severity levels and categorization
- Step-by-step test breakdowns
- Screenshots and traces attached to failures

---

## Generating Reports Locally

### 1. Run tests (results go to `allure-results/`)

```bash
npm test
```

### 2. Generate the Allure HTML report

```bash
npm run test:report
```

This runs `allure generate allure-results --clean -o allure-report` and opens the report in your browser.

### 3. Serve results interactively (live server)

```bash
npm run test:report:serve
```

### 4. Open a previously generated report

```bash
npm run report:open
```

### 5. Generate report with history tracking

```bash
npm run test:report:history
```

---

## Understanding the Allure Dashboard

After opening the report you will see several views:

| View | Description |
|------|-------------|
| **Overview** | Summary of passed / failed / broken / skipped tests |
| **Suites** | Tests grouped by test file / describe block |
| **Behaviors** | Tests grouped by Epic → Feature → Story hierarchy |
| **Timeline** | When each test ran (useful for parallel runs) |
| **Categories** | Failures grouped by defect type |
| **Graphs** | Charts for status distribution and duration |

---

## Test Categorization (Epic, Feature, Story)

Tests are annotated using the Allure API imported from `allure-playwright`:

```typescript
import { allure } from 'allure-playwright';

test('my test', async () => {
  await allure.epic('Authentication');
  await allure.feature('Login');
  await allure.story('User logs in with valid credentials');
});
```

### Hierarchy used in this project

| Level | Examples |
|-------|---------|
| **Epic** | Authentication, Employee Management |
| **Feature** | Login, Employee List, Create Employee |
| **Story** | User logs in with valid credentials, Admin creates new employee |

---

## Severity Levels

Severity is set per test and is shown as a label in the report:

```typescript
await allure.severity('critical'); // blocker | critical | normal | minor | trivial
```

| Severity | Usage |
|----------|-------|
| `blocker` | System cannot be used at all |
| `critical` | Core functionality broken |
| `normal` | Standard business functionality |
| `minor` | Minor inconvenience |
| `trivial` | Cosmetic issues |

---

## Custom Steps and Attachments

### Steps

Group multiple actions into named steps for clearer reports:

```typescript
await allure.step('Login as admin', async () => {
  await page.fill('[name="username"]', 'Admin');
  await page.fill('[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
});
```

### Attachments

Attach screenshots, logs, or other files to a test:

```typescript
const screenshot = await page.screenshot();
await allure.attachment('Screenshot', screenshot, 'image/png');
```

### Tags and Descriptions

```typescript
await allure.tag('smoke', 'auth');
await allure.description('Verify that a user can login with valid admin credentials');
```

---

## Categories Configuration

The file `allure-configs/categories.json` defines how failures are classified:

```json
[
  { "name": "Product defects", "matchedStatuses": ["failed"] },
  { "name": "Test defects",    "matchedStatuses": ["broken"] },
  { "name": "Skipped",         "matchedStatuses": ["skipped"] }
]
```

To apply categories, copy the file into the `allure-results/` directory before generating the report:

```bash
cp allure-configs/categories.json allure-results/categories.json
npx allure generate allure-results --clean -o allure-report
```

---

## GitHub Pages Integration

The [allure-report.yml](./../.github/workflows/allure-report.yml) workflow:

1. Runs all tests on every push/PR to `main`
2. Generates an Allure report from `allure-results/`
3. Publishes it to GitHub Pages under `allure/<run_number>/`
4. Posts a comment on PRs with a direct link to the report

Report URL pattern:
```
https://<owner>.github.io/<repo>/allure/<run_number>/
```

---

## Report History

To preserve historical trend data across CI runs:

1. Download the previous `allure-report/history` directory
2. Copy it into `allure-results/history` before generating the new report
3. Generate the new report — the **Trend** graph will show history

The `test:report:history` npm script does this locally:

```bash
npm run test:report:history
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ALLURE_RESULTS_DIR` | `./allure-results` | Where Allure writes raw results |
| `ALLURE_REPORT_DIR` | `./allure-report` | Where the generated HTML report is saved |

These are set in `.env.ci` for CI runs.
