# Architecture & Design Documentation

This document describes the architecture, design patterns, and organisation of the OrangeHRM automation test framework.

## Table of Contents

- [Project Structure Overview](#project-structure-overview)
- [Folder Structure Diagram](#folder-structure-diagram)
- [Package Responsibilities](#package-responsibilities)
- [Page Object Model Pattern](#page-object-model-pattern)
- [Test Suite Hierarchy](#test-suite-hierarchy)
- [Utility Modules and Helpers](#utility-modules-and-helpers)
- [Configuration Management](#configuration-management)
- [Plugin and Extension System](#plugin-and-extension-system)

---

## Project Structure Overview

The project is organised as an **npm monorepo** using workspaces. Each package has a distinct responsibility and can be developed and tested independently.

```
orangehrm-automation/            ← repository root
├── packages/
│   ├── core/                    ← @qa-framework/core  (base framework)
│   ├── shared-utils/            ← @qa-framework/shared-utils
│   ├── orangehrm-suite/         ← @qa-framework/orangehrm-suite (UI tests)
│   ├── hrm-api-suite/           ← HRM API test suite
│   └── orangehrm-api-suite/     ← OrangeHRM API test suite
├── docs/                        ← repository-level documentation
├── src/                         ← shared source utilities
├── tests/                       ← repository-level integration tests
├── playwright.config.ts         ← root Playwright config
├── tsconfig.json                ← root TypeScript config
└── package.json                 ← workspace root
```

---

## Folder Structure Diagram

```
packages/orangehrm-suite/
├── docs/                        ← Package-level documentation (this folder)
│   ├── GETTING_STARTED.md
│   ├── ARCHITECTURE.md
│   ├── BEST_PRACTICES.md
│   ├── PAGE_OBJECT_MODEL.md
│   ├── FRAMEWORK_GUIDE.md
│   ├── API_TESTING_GUIDE.md
│   ├── PERFORMANCE_TESTING.md
│   ├── SECURITY_TESTING.md
│   ├── TROUBLESHOOTING.md
│   ├── CONTRIBUTING.md
│   ├── API_REFERENCE.md
│   └── examples/
│       ├── login-flow.spec.ts
│       ├── crud-operations.spec.ts
│       ├── api-testing.spec.ts
│       └── custom-page-object.ts
├── src/
│   ├── api/
│   │   └── employee.api-client.ts   ← EmployeeAPIClient extends BaseApiClient
│   ├── pages/
│   │   ├── login.page.ts            ← LoginPage extends BasePage
│   │   ├── dashboard.page.ts        ← DashboardPage extends BasePage
│   │   ├── pim.page.ts              ← PimPage extends BasePage
│   │   ├── leave.page.ts            ← LeavePage extends BasePage
│   │   └── reporting.page.ts        ← ReportingPage extends BasePage
│   ├── selectors.ts                 ← Centralised CSS/attribute selectors
│   └── index.ts                     ← Package public API
├── tests/
│   ├── auth/
│   │   └── login.spec.ts
│   ├── dashboard/
│   ├── employee/
│   ├── leave/
│   ├── performance/
│   ├── reporting/
│   ├── security/
│   ├── integration/
│   └── suite.spec.ts
├── playwright.config.ts
├── tsconfig.json
└── README.md

packages/core/
├── src/
│   ├── api-client/
│   │   └── base.api-client.ts       ← BaseApiClient with HTTP helpers
│   ├── config/
│   │   ├── Config.ts                ← Singleton configuration manager
│   │   ├── constants.ts             ← Shared constants (timeouts, etc.)
│   │   └── environment.ts           ← Environment variable accessors
│   ├── fixtures/                    ← Playwright fixture extensions
│   ├── logger/
│   │   └── logger.ts                ← Winston-based Logger
│   ├── page-objects/
│   │   └── base.page.ts             ← BasePage with shared browser actions
│   ├── types/                       ← Shared TypeScript types
│   ├── utils/
│   │   ├── wait-for.ts              ← WaitFor helpers
│   │   └── screenshot-manager.ts    ← Screenshot capture utilities
│   └── index.ts                     ← Package public API
├── tests/                           ← Core unit tests (Jest)
├── jest.config.js
└── package.json
```

---

## Package Responsibilities

### `@qa-framework/core`

The base framework that all test suites build upon. It provides:

- **`BasePage`** – abstract base class for all page objects. Wraps Playwright `Page` with logging, error handling, and commonly needed browser interactions.
- **`BaseApiClient`** – abstract base class for all API clients. Handles authentication (bearer tokens), request serialisation, and response parsing.
- **`Config`** – singleton configuration manager. Reads environment variables once and exposes typed getters.
- **`Logger`** – structured Winston logger with step tracking and assertion logging.
- **`WaitFor`** – collection of smart wait helpers (`loadingComplete`, `elementVisible`, `condition`).
- **`ScreenshotManager`** – captures and names screenshots automatically.
- **Playwright fixtures** – extended `test` object that injects `logger`, `config`, `basePage`, and `baseApiClient` into every test.

### `@qa-framework/orangehrm-suite`

OrangeHRM-specific automation. It provides:

- **Page objects** for each OrangeHRM module (Login, Dashboard, PIM, Leave, Reporting).
- **API clients** for OrangeHRM REST endpoints (`EmployeeAPIClient`).
- **Centralised selectors** (`selectors.ts`) for maintainability.
- **Test specs** organised by feature area.

### `@qa-framework/shared-utils`

Cross-cutting utilities shared between multiple suites:

- Date/time helpers
- String manipulation utilities
- Data generation helpers

---

## Page Object Model Pattern

The framework implements the **Page Object Model (POM)**, a design pattern that creates an abstraction layer between tests and the UI.

### Class hierarchy

```
BasePage (@qa-framework/core)
└── LoginPage
└── DashboardPage
└── PimPage
└── LeavePage
└── ReportingPage

BaseApiClient (@qa-framework/core)
└── EmployeeAPIClient
```

### Why POM?

- **Separation of concerns** – tests express *intent*, page objects handle *mechanics*.
- **Reusability** – the same `LoginPage.login()` method is used by every test that needs authentication.
- **Maintainability** – when a selector changes, only the selector file (or the page object) needs updating.
- **Readability** – test code reads like a specification: `await loginPage.login(adminCredentials)`.

For a detailed guide on creating and using page objects, see [PAGE_OBJECT_MODEL.md](./PAGE_OBJECT_MODEL.md).

---

## Test Suite Hierarchy

Tests are grouped by feature area and tagged with Playwright's `@tag` convention:

```
tests/
├── auth/        @auth, @smoke       Authentication flows
├── dashboard/   @dashboard          Dashboard and navigation
├── employee/    @pim, @regression   PIM / employee management
├── leave/       @leave              Leave management
├── performance/ @performance        Performance module
├── reporting/   @reporting          Report generation
├── security/    @security           Security and compliance
└── integration/ @integration        Cross-module integration tests
```

Tags can be composed at runtime:

```bash
npx playwright test --grep "@smoke"
npx playwright test --grep "@pim|@auth"
npx playwright test --grep-invert "@security"
```

---

## Utility Modules and Helpers

### `WaitFor`

Located in `packages/core/src/utils/wait-for.ts`. Exposes:

| Method | Description |
|---|---|
| `loadingComplete()` | Waits for the page network to be idle and spinners to disappear |
| `elementVisible(selector, timeout?)` | Waits until an element is visible |
| `elementHidden(selector, timeout?)` | Waits until an element is hidden |
| `condition(fn, timeout?)` | Polls until an async boolean function returns `true` |

### `ScreenshotManager`

Located in `packages/core/src/utils/screenshot-manager.ts`. Captures screenshots with structured names:

```
screenshots/<PageObject>/<stepName>-<timestamp>.png
```

### `Logger`

Located in `packages/core/src/logger/logger.ts`. A Winston-based logger that:

- Prefixes every log line with the calling class name.
- Supports structured step tracking via `logger.step(number, description)`.
- Supports explicit assertion logging via `logger.assertion(passed, description)`.

---

## Configuration Management

`Config` is a singleton that loads environment variables once on first access and exposes strongly-typed getters:

```typescript
import { config } from '@qa-framework/core';

const url     = config.baseURL;          // string
const timeout = config.testTimeout;      // number
const browser = config.browser;          // 'chromium' | 'firefox' | 'webkit'
```

Configuration is read from environment variables. In test mode (`NODE_ENV=test`) the `.env.local` file is loaded; otherwise `.env` is used.

See [FRAMEWORK_GUIDE.md](./FRAMEWORK_GUIDE.md) for full configuration reference.

---

## Plugin and Extension System

The framework is designed to be extended without modifying the core package.

### Extending page objects

Create a new file in `src/pages/` and extend `BasePage`:

```typescript
import { BasePage } from '@qa-framework/core';
import { selectors } from '../selectors';

export class MyFeaturePage extends BasePage {
  async doSomething(): Promise<void> {
    await this.click(selectors.myFeature.button);
  }
}
```

Export from `src/index.ts` to make it part of the public API.

### Extending API clients

Create a new file in `src/api/` and extend `BaseApiClient`:

```typescript
import { BaseApiClient } from '@qa-framework/core';

export class MyFeatureApiClient extends BaseApiClient {
  async getItems(): Promise<Item[]> {
    const response = await this.get<{ data: Item[] }>('/api/v2/my-feature');
    return response.data;
  }
}
```

### Extending Playwright fixtures

Custom fixtures can be added in `packages/core/src/fixtures/` or in the consuming suite. See the [Playwright fixtures documentation](https://playwright.dev/docs/test-fixtures) for details.
