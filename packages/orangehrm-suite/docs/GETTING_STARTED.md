# Getting Started Guide

This guide walks you through setting up the OrangeHRM automation test suite, configuring your environment, and running your first test.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Dependencies and Requirements](#dependencies-and-requirements)
- [First Test Execution](#first-test-execution)
- [IDE Setup and Debugging](#ide-setup-and-debugging)
- [Troubleshooting Common Issues](#troubleshooting-common-issues)

---

## Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Minimum Version | Notes |
|---|---|---|
| Node.js | 18.x | LTS recommended |
| npm | 9.x | Bundled with Node.js 18+ |
| Git | 2.x | For cloning the repository |

Optional (recommended):
- [Visual Studio Code](https://code.visualstudio.com/) with the [Playwright Test for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) extension

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/germanobrian1998/orangehrm-automation.git
cd orangehrm-automation
```

### 2. Install all workspace dependencies

Run this from the repository root. npm workspaces will install dependencies for every package automatically:

```bash
npm install
```

### 3. Install Playwright browsers

```bash
npx playwright install
```

To install only specific browsers:

```bash
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

---

## Environment Configuration

### Create a local environment file

```bash
cp .env.example .env.local
```

Edit `.env.local` with your target application settings:

```env
# OrangeHRM Application
ORANGEHRM_BASE_URL=https://opensource-demo.orangehrmlive.com
ORANGEHRM_ADMIN_USERNAME=Admin
ORANGEHRM_ADMIN_PASSWORD=admin123

# Test Configuration
TEST_TIMEOUT=30000
API_TIMEOUT=10000

# Browser
BROWSER=chromium
HEADLESS=true

# Logging
LOG_LEVEL=info
DEBUG=false
```

### Available environment variables

| Variable | Default | Description |
|---|---|---|
| `ORANGEHRM_BASE_URL` | `https://opensource-demo.orangehrmlive.com` | Target application base URL |
| `ORANGEHRM_ADMIN_USERNAME` | `Admin` | Administrator username |
| `ORANGEHRM_ADMIN_PASSWORD` | `admin123` | Administrator password |
| `TEST_TIMEOUT` | `30000` | Global test timeout in milliseconds |
| `API_TIMEOUT` | `10000` | API request timeout in milliseconds |
| `BROWSER` | `chromium` | Browser to use: `chromium`, `firefox`, or `webkit` |
| `HEADLESS` | `true` | Run browsers headlessly (`false` for headed mode) |
| `LOG_LEVEL` | `info` | Log verbosity: `error`, `warn`, `info`, `debug` |
| `DEBUG` | `false` | Enable debug-level logging |
| `CI` | `false` | Set to `true` in CI pipelines (auto-set by GitHub Actions) |

---

## Dependencies and Requirements

### Workspace packages

The monorepo is organised into packages with the following dependency graph:

```
@qa-framework/core           ← Base framework (BasePage, BaseApiClient, Config, Logger)
@qa-framework/shared-utils   ← Shared utilities (date helpers, string helpers, etc.)
@qa-framework/orangehrm-suite ← OrangeHRM-specific tests (depends on core + shared-utils)
```

### Key runtime dependencies

| Package | Version | Purpose |
|---|---|---|
| `@playwright/test` | ^1.40.0 | Browser automation and test runner |
| `@faker-js/faker` | ^8.0.0 | Test data generation |
| `typescript` | ^5.0.0 | Language toolchain |
| `dotenv` | latest | Environment variable loading |

---

## First Test Execution

### Run the full suite

```bash
# From the repository root
npm run test:orangehrm

# From the orangehrm-suite package
cd packages/orangehrm-suite
npm test
```

### Run only smoke tests

```bash
npm run test:smoke
```

### Run only regression tests

```bash
npm run test:regression
```

### Run a specific test file

```bash
npx playwright test tests/auth/login.spec.ts
```

### Run tests in headed mode (for visual debugging)

```bash
HEADLESS=false npx playwright test
```

### Run tests in a specific browser

```bash
BROWSER=firefox npx playwright test
```

### View the HTML report after a run

```bash
npx playwright show-report
```

---

## IDE Setup and Debugging

### Visual Studio Code

1. Install the [Playwright Test for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) extension.
2. Open the Testing panel (⌘+Shift+T on macOS, Ctrl+Shift+T on Windows/Linux).
3. Tests will appear in a tree view. Click ▶ to run any test.

#### Recommended VS Code settings (`.vscode/settings.json`)

```json
{
  "playwright.reuseBrowser": false,
  "playwright.showTrace": true,
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true
}
```

#### Launch configuration for debugging (`.vscode/launch.json`)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Playwright Tests",
      "program": "${workspaceFolder}/node_modules/.bin/playwright",
      "args": ["test", "--debug", "${relativeFile}"],
      "cwd": "${workspaceFolder}/packages/orangehrm-suite",
      "env": {
        "HEADLESS": "false",
        "DEBUG": "true"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

### Playwright Inspector

Run any test with `--debug` to open the Playwright Inspector:

```bash
npx playwright test tests/auth/login.spec.ts --debug
```

The Inspector lets you step through actions, inspect selectors, and record new interactions.

### Trace viewer

Traces are captured on first retry in CI. To view a trace locally:

```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

---

## Troubleshooting Common Issues

### `Error: browserType.launch: Executable doesn't exist`

Playwright browsers are not installed. Run:

```bash
npx playwright install
```

### Tests fail with `net::ERR_CONNECTION_REFUSED`

The `ORANGEHRM_BASE_URL` is unreachable. Verify the URL is correct and the application is running.

### `Cannot find module '@qa-framework/core'`

Workspace dependencies are not linked. Run `npm install` from the repository root.

### Environment variables not loaded

Ensure `.env.local` exists in the repository root and that `NODE_ENV` is set to `test`:

```bash
NODE_ENV=test npm test
```

### Tests are flaky in CI

Set `CI=true` to enable automatic retries and stricter timeouts:

```bash
CI=true npx playwright test
```

For more detailed troubleshooting guidance, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).
