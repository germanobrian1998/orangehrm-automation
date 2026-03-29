# 🎯 OrangeHRM QA Automation Suite

[![Smoke Tests](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/smoke-tests.yml/badge.svg)](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/smoke-tests.yml)
[![Regression Tests](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/regression-tests.yml/badge.svg)](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/regression-tests.yml)
[![Code Quality](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/code-quality.yml/badge.svg)](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/code-quality.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.40+-green?logo=playwright)](https://playwright.dev/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue?logo=docker)](./DOCKER.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A **production-ready QA automation framework** for [OrangeHRM](https://opensource-demo.orangehrmlive.com) using Playwright, TypeScript, and GitHub Actions CI/CD.

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Project Architecture](#-project-architecture)
- [Test Coverage](#-test-coverage)
- [Running Tests](#-running-tests)
- [Docker](#-docker)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Documentation](#-documentation)
- [Contributing](#-contributing)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧪 **57 Test Runs** | 19 test specs × 3 browsers — smoke, API, cross-browser, and data-driven |
| 🌐 **Cross-Browser** | Chromium, Firefox, and WebKit (Safari) |
| 🔌 **API Testing** | REST API validation integrated with UI tests |
| 📄 **Page Object Model** | Clean separation of test logic and page structure |
| 🔒 **Type-Safe** | Full TypeScript with strict mode |
| 🐳 **Docker Ready** | Containerised test execution |
| ⚡ **CI/CD** | GitHub Actions with parallel browser execution |
| 📊 **HTML Reports** | Playwright's built-in reporting with screenshots on failure |
| 🔄 **Anti-Flaky Patterns** | Explicit waits, retries, and stable selectors |

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

**Total: 19 test specs across 3 browsers (57 total runs)**

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

The project uses GitHub Actions with three workflows:

| Workflow | Trigger | What it does |
|---|---|---|
| **Smoke Tests** | Push / PR to `main` | Runs smoke suite on Chromium |
| **Regression Tests** | Push to `main` + nightly cron | Full regression on Chromium |
| **Code Quality** | PR to `main` | ESLint + TypeScript type check |
| **Full Matrix** | Push / PR to `main` | Runs all tests on Chromium, Firefox, WebKit in parallel |

Artifacts (HTML reports, screenshots) are uploaded for every run and retained for 7–30 days.

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

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to submit pull requests, report issues, and contribute to the codebase.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).