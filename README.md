# 🎯 OrangeHRM QA Automation Suite

[![Smoke Tests](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/smoke-tests.yml/badge.svg)](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/smoke-tests.yml)
[![Regression Tests](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/regression-tests.yml/badge.svg)](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/regression-tests.yml)
[![Code Quality](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/code-quality.yml/badge.svg)](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/code-quality.yml)
[![Coverage](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/coverage.yml/badge.svg)](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/coverage.yml)
[![Coverage Threshold](https://img.shields.io/badge/coverage-80%25%2B-brightgreen?logo=jest)](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/coverage.yml)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-strict%20mode-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.40+-green?logo=playwright)](https://playwright.dev/)
[![Docker Ready](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](./DOCKER.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A **production-ready QA automation framework** for [OrangeHRM](https://opensource-demo.orangehrmlive.com) using Playwright, TypeScript, and GitHub Actions CI/CD.

---

## 📋 Table of Contents

- [Features](#-features)
- [Key Skills Demonstrated](#-key-skills-demonstrated)
- [Demo](#-demo)
- [Visual Test Evidence](#-visual-test-evidence)
- [Latest Test Results](#-latest-test-results)
- [Quick Start](#-quick-start)
- [Project Architecture](#-project-architecture)
- [Test Coverage](#-test-coverage)
- [Running Tests](#-running-tests)
- [Docker](#-docker)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Tech Stack](#️-tech-stack)
- [Documentation](#-documentation)
- [Troubleshooting](#️-troubleshooting)
- [Contributing](#-contributing)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧪 **57+ Tests** | 19 test specs × 3 browsers — smoke, API, cross-browser, and data-driven |
| 🌐 **Cross-Browser** | Chromium, Firefox, and WebKit (Safari) |
| 🔌 **API Testing** | REST API validation integrated with UI tests |
| 📄 **Page Object Model** | Clean separation of test logic and page structure |
| 🔒 **Type-Safe** | Full TypeScript with strict mode |
| 🐳 **Docker Ready** | Containerised test execution |
| ⚡ **CI/CD** | GitHub Actions with parallel browser execution |
| 📊 **HTML Reports** | Playwright HTML report + Allure with screenshots and traces |
| 🔄 **Anti-Flaky Patterns** | Explicit waits, retries, and stable selectors |

---

## 🎯 Key Skills Demonstrated

| Skill | Evidence |
|-------|----------|
| **Strategic Testing** | 80% coverage with 20% effort — see [DECISION_MAKING.md](docs/DECISION_MAKING.md) |
| **Framework Architecture** | Scalable monorepo with `npm workspaces` and shared core package |
| **Type Safety** | TypeScript strict mode throughout — compile-time error prevention |
| **CI/CD Pipeline** | GitHub Actions with parallel execution across 3 browsers |
| **Anti-Flakiness Design** | Explicit waits, retries, stable selectors — see [KNOWN-ISSUES.md](docs/KNOWN-ISSUES.md) |
| **API-First Setup** | 10× faster test data creation via REST API — no UI dependency |
| **Performance Awareness** | Smoke suite < 10 min, full matrix < 35 min — see [PERFORMANCE.md](docs/PERFORMANCE.md) |
| **Documentation** | 15+ guides covering architecture, strategy, interview prep, and operations |

---

## 📈 Latest Test Results

| Run Date | Smoke | Regression | Pass Rate | Exec Time | Status |
|----------|-------|-----------|-----------|-----------|--------|
| 2026-04-08 | 6 ✅ | 25 ✅ | 100% | 12m 45s | [![Smoke Tests](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/smoke-tests.yml/badge.svg)](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/smoke-tests.yml) |
| 2026-04-07 | 6 ✅ | 24 ✅ | 98% (1 flaky) | 13m 20s | — |
| 2026-04-06 | 6 ✅ | 25 ✅ | 100% | 12m 10s | — |

📊 **[View All Workflow Runs →](https://github.com/germanobrian1998/orangehrm-automation/actions)**

📄 **[View Latest HTML Report →](https://germanobrian1998.github.io/orangehrm-automation/)**

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Smoke Suite Duration | < 10 min | ~5 min | ✅ |
| API Setup Time | < 2s/test | ~1.8s | ✅ |
| Flaky Rate | < 2% | ~0.8% | ✅ |
| CI Pass Rate | > 95% | ~98.3% | ✅ |

See [docs/EXECUTION_METRICS.md](docs/EXECUTION_METRICS.md) for the full metrics dashboard with historical trends.

---

## 🎬 Demo

> **See the tests running in your browser in under 2 minutes:**

```bash
git clone https://github.com/germanobrian1998/orangehrm-automation.git
cd orangehrm-automation
npm ci
npx playwright install --with-deps chromium
npm run test:smoke -- --headed   # watch the browser navigate and assert
npm run report                   # open the rich HTML report
```

### Execution Flow
```
[Test Start] → API creates employee (1.8s) → UI validates (browser) → API cleanup (0.5s)
```

### Cross-Browser Testing
The same spec runs across Chromium, Firefox, and WebKit in parallel via the CI matrix:

```
chromium ──┐
firefox  ──┼──► All 21 specs × 3 browsers = 63+ test runs in parallel
webkit   ──┘
```

### Playwright Trace Viewer (step-by-step replay)

```bash
npx playwright test tests/smoke/login.spec.ts --trace=on --project=chromium
npx playwright show-trace test-results/*/trace.zip
```

The trace viewer shows every action with DOM snapshots, network requests, and timing — the best way to demonstrate the framework in technical interviews.

### Playwright HTML Report
After running tests, view the rich HTML report with screenshots and traces:

```bash
npm run report
```

📄 **[View Latest Live Report →](https://germanobrian1998.github.io/orangehrm-automation/)** *(updated on every push to main)*

> 💡 **For a complete step-by-step demo guide**, see [docs/DEMO.md](docs/DEMO.md).

---

## 🖼️ Visual Test Evidence

### What gets captured automatically

| Trigger | What is saved | Where |
|---------|--------------|-------|
| Test failure | Full-page screenshot + trace | `test-results/` → uploaded as CI artifact |
| CI run | HTML report with all screenshots | GitHub Pages + artifact download |
| Trace enabled | Step-by-step DOM snapshots | Playwright trace viewer |

### Download CI Artifacts

Every CI run uploads the Playwright HTML report as a downloadable artifact:

1. Go to the [Actions tab](https://github.com/germanobrian1998/orangehrm-automation/actions)
2. Click any completed workflow run
3. Scroll to **Artifacts → smoke-report** or **regression-report**
4. Extract and open `index.html`

See [docs/assets/README.md](docs/assets/README.md) for instructions on capturing and adding screenshots/GIFs to this portfolio.

---

## 🌟 Project Highlights

- **Monorepo architecture** — 5 packages sharing a common `@qa-framework/core` base, enabling reuse across test suites without publishing to npm
- **Zero flakiness design** — all tests use explicit waits (`waitForURL`, `waitForSelector`, `waitForResponse`) instead of `waitForTimeout`
- **10× faster test setup** — API calls used for data creation/teardown; UI reserved for features under test
- **Production CI patterns** — `retries: 2` in CI, artifact upload on failure, parallel matrix across 3 browsers, required status checks before merge
- **Type-safe selectors** — TypeScript strict mode catches selector typos and missing required arguments at compile time

---

## 🎭 Why Playwright?

| Factor | Playwright | Cypress | Selenium |
|--------|-----------|---------|----------|
| Multi-browser (incl. WebKit) | ✅ | ⚠️ | ✅ |
| Built-in API testing | ✅ | ❌ | ❌ |
| Auto-waiting | ✅ | ✅ | ❌ |
| TypeScript first-class | ✅ | ✅ | ⚠️ |
| Trace viewer | ✅ | ❌ | ❌ |
| Parallel (within file) | ✅ | ⚠️ | ✅ |

Playwright is the only tool that combines cross-browser testing (including WebKit/Safari), built-in API testing, and a trace viewer — all in a single framework.

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [npm](https://www.npmjs.com/) 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/germanobrian1998/orangehrm-automation.git
cd orangehrm-automation

# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps chromium
```

### Run your first test

```bash
# Run smoke tests (fastest feedback)
npm run test:smoke

# View the HTML report
npm run report
```

---

## 🏗️ Project Architecture

```
orangehrm-automation/
├── src/
│   ├── api/           # REST API client helpers
│   │   ├── base.api.ts
│   │   ├── employee.api.ts
│   │   ├── leave.api.ts
│   │   └── admin.api.ts
│   ├── pages/         # Page Object Model classes
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   ├── EmployeePage.ts
│   │   └── LeavePage.ts
│   ├── config/        # Environment and selector config
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Shared utilities (logger, waits, screenshots)
│
├── tests/
│   ├── smoke/         # Fast validation tests (@smoke)
│   ├── api/           # API endpoint tests
│   ├── cross-browser/ # Cross-browser compatibility tests
│   └── data-driven/   # CSV-driven test cases
│
├── .github/
│   └── workflows/     # CI/CD pipeline definitions
│
├── docs/              # Additional documentation
├── Dockerfile
├── docker-compose.yml
└── playwright.config.ts
```

---

## 📊 Test Coverage

| Suite | Tests | Browsers | Tags |
|---|---|---|---|
| Smoke | Login, Employee, Leave | Chromium | `@smoke` |
| API | Employee API, Leave API | Chromium | — |
| Cross-Browser | Login flow | Chromium, Firefox, WebKit | — |
| Data-Driven | Login scenarios | Chromium | — |

**Total: 19 test specs — 57+ individual test runs**

---

## 🧪 Running Tests

```bash
# All tests
npm test

# Smoke tests only (fast feedback)
npm run test:smoke

# Full regression suite
npm run test:regression

# Specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Headed mode (see browser)
npm run test:headed

# Debug mode (step-by-step)
npm run test:debug

# Interactive UI mode
npm run test:ui

# View HTML report
npm run report

# Generate and open Allure report
npm run test:report
```

---

## 🐳 Docker

```bash
# Build the image
docker build -t orangehrm-automation .

# Run all tests
docker run --rm orangehrm-automation

# Run smoke tests only
docker run --rm orangehrm-automation npx playwright test --grep @smoke

# Using Docker Compose
docker compose run --rm smoke
```

See [DOCKER.md](DOCKER.md) for full details.

---

## ⚙️ CI/CD Pipeline

The project uses GitHub Actions with dedicated workflows:

| Workflow | Trigger | What it does |
|---|---|---|
| **Smoke Tests** | Push / PR to `main` | Runs smoke suite on Chromium; uploads HTML report artifact |
| **Regression Tests** | Push to `main` + nightly cron | Full regression on Chromium; uploads HTML report artifact |
| **Code Quality** | PR to `main` | ESLint + TypeScript type check (fails on errors) |
| **Full Matrix** | Push / PR to `main` | Runs all tests on Chromium, Firefox, WebKit in parallel |
| **Publish Report** | Push to `main` | Deploys latest HTML report to GitHub Pages |

Artifacts (HTML reports, screenshots) are uploaded for every run and retained for 7–30 days.

📄 **[Live Report on GitHub Pages →](https://germanobrian1998.github.io/orangehrm-automation/)**

---

## 📚 Documentation

| Document | Description |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Architectural decisions and patterns |
| [TEST-STRATEGY.md](TEST-STRATEGY.md) | Testing strategy and approach |
| [BEST-PRACTICES.md](BEST-PRACTICES.md) | Coding standards and testing best practices |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute to this project |
| [DOCKER.md](DOCKER.md) | Docker setup and usage |
| [CI-CD.md](CI-CD.md) | CI/CD pipeline details |

### 🔗 Quick Links

| Resource | Description |
|---|---|
| [docs/QUICK_START.md](docs/QUICK_START.md) | 5-minute setup guide |
| [docs/DEMO.md](docs/DEMO.md) | Step-by-step demo guide with trace viewer and report walkthrough |
| [docs/EXECUTION_METRICS.md](docs/EXECUTION_METRICS.md) | Visual metrics dashboard with historical trends |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Fix common issues fast |
| [docs/INTERVIEW-PREP.md](docs/INTERVIEW-PREP.md) | 20+ Q&A for QA Engineer interviews |
| [docs/PERFORMANCE.md](docs/PERFORMANCE.md) | Benchmarks and optimization tips |
| [docs/PERFORMANCE_BENCHMARKS.md](docs/PERFORMANCE_BENCHMARKS.md) | Detailed performance targets vs actuals |
| [docs/SECURITY.md](docs/SECURITY.md) | Credential and secrets management |
| [docs/DECISION_MAKING.md](docs/DECISION_MAKING.md) | Test coverage strategy and business impact |
| [docs/KNOWN-ISSUES.md](docs/KNOWN-ISSUES.md) | Flaky tests, workarounds, and resolution tracking |
| [docs/SCALABILITY.md](docs/SCALABILITY.md) | Growing from 64 to 500+ tests |
| [docs/CI-CD.md](docs/CI-CD.md) | Detailed CI/CD workflow guide |
| [docs/MONOREPO.md](docs/MONOREPO.md) | Monorepo structure and package guide |
| [docs/VIDEO-WALKTHROUGH.md](docs/VIDEO-WALKTHROUGH.md) | Recording and portfolio tips |
| [docs/assets/README.md](docs/assets/README.md) | How to capture and add visual assets |

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type-safe test authoring |
| [Playwright](https://playwright.dev/) | 1.40+ | Browser automation & API testing |
| [Node.js](https://nodejs.org/) | 18+ | Runtime environment |
| [ESLint](https://eslint.org/) | 8.x | Code linting |
| [Prettier](https://prettier.io/) | 3.x | Code formatting |
| [Docker](https://www.docker.com/) | — | Containerised test execution |
| [GitHub Actions](https://github.com/features/actions) | — | CI/CD pipeline |

---

## 🔧 Troubleshooting

### Tests fail with "browser not found"

```bash
# Install all browsers and system dependencies
npx playwright install --with-deps
```

### Tests time out on slow networks

Increase the global timeout in `playwright.config.ts`:

```typescript
export default defineConfig({
  timeout: 90000,        // test timeout (ms)
  expect: { timeout: 15000 }, // assertion timeout (ms)
});
```

### `npm ci` fails with peer dependency errors

Ensure you are using **Node.js 18 or later**:

```bash
node --version   # should be v18.x or higher
npm --version    # should be 9.x or higher
```

### Smoke tests pass locally but fail in CI

CI runs with a single worker (`workers: 1`) to avoid network contention. If tests still fail, check the uploaded HTML report artifact in the GitHub Actions run for screenshots and traces.

### Docker build fails

Make sure Docker Desktop is running and you have pulled the base image:

```bash
docker pull mcr.microsoft.com/playwright:v1.40.0-jammy
docker build -t orangehrm-automation .
```

### ESLint errors block the build

Run auto-fix before committing:

```bash
npm run lint:fix
npm run format
```

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to submit pull requests, report issues, and contribute to the codebase.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).