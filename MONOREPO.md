# Monorepo Structure Guide

This repository is organized as an **npm workspaces monorepo** to provide a scalable, reusable QA automation framework.

---

## 📦 Package Overview

```
packages/
├── core/                    # @qa-framework/core       – Framework base (reusable)
├── orangehrm-suite/         # @qa-framework/orangehrm-suite – OrangeHRM UI tests
├── hrm-api-suite/           # @qa-framework/hrm-api-suite   – HRM REST API tests
└── shared-utils/            # @qa-framework/shared-utils    – Shared utilities
```

| Package | Description | Depends on |
|---|---|---|
| `@qa-framework/core` | Base page objects, API client, logger, config, utils | – |
| `@qa-framework/shared-utils` | Test data factory, date/string helpers | – |
| `@qa-framework/orangehrm-suite` | OrangeHRM-specific page objects and tests | `core`, `shared-utils` |
| `@qa-framework/hrm-api-suite` | HRM REST API clients and API tests | `core`, `shared-utils` |

---

## 🚀 Quick Start

### Install all workspace dependencies

```bash
npm install
```

### Run all tests (root suite)

```bash
npm test
```

### Run tests for a specific package

```bash
npm run test:core
npm run test:orangehrm
npm run test:hrm-api
```

### Build all packages

```bash
npm run build:packages
```

### Lint all packages

```bash
npm run lint
```

---

## 🏗️ Architecture

### `packages/core`

The heart of the framework. Every other package depends on it.

```
packages/core/src/
├── page-objects/        # BasePage – extend this for any UI page object
├── api-client/          # BaseApiClient – extend for any API client
├── logger/              # Winston-based structured logger
├── config/              # Environment config, shared constants
└── utils/               # WaitFor, ScreenshotManager
```

**Usage:**

```typescript
import { BasePage, BaseApiClient, createLogger, constants } from '@qa-framework/core';
```

### `packages/shared-utils`

Framework-agnostic helpers shared across all suites.

```
packages/shared-utils/src/
├── test-data-factory.ts # Faker-based random data generators
├── date-helper.ts       # Date formatting / arithmetic
└── string-helper.ts     # String manipulation helpers
```

**Usage:**

```typescript
import { TestDataFactory, DateHelper } from '@qa-framework/shared-utils';

const employee = TestDataFactory.employee();
const tomorrow = DateHelper.tomorrow();
```

### `packages/orangehrm-suite`

OrangeHRM-specific page objects and end-to-end tests that consume `@qa-framework/core`.

```
packages/orangehrm-suite/
├── src/
│   ├── pages/           # LoginPage, PimPage (extend BasePage from core)
│   └── selectors.ts     # Centralized OrangeHRM CSS selectors
└── tests/               # Playwright test specs
```

### `packages/hrm-api-suite`

REST API tests for OrangeHRM's v2 API. Uses `HrmApiClient` (extends `BaseApiClient` from core).

```
packages/hrm-api-suite/
├── src/
│   └── clients/         # HrmApiClient
└── tests/               # API test specs
```

---

## 🔧 Adding a New Suite

1. Create a new directory under `packages/`:

   ```bash
   mkdir -p packages/my-new-suite/src packages/my-new-suite/tests
   ```

2. Create `packages/my-new-suite/package.json`:

   ```json
   {
     "name": "@qa-framework/my-new-suite",
     "version": "1.0.0",
     "scripts": { "test": "playwright test", "build": "tsc -p tsconfig.json" },
     "dependencies": { "@qa-framework/core": "*" },
     "devDependencies": { "@playwright/test": "^1.40.0", "typescript": "^5.0.0" }
   }
   ```

3. Create `packages/my-new-suite/tsconfig.json` referencing `../core`.

4. Re-run `npm install` from the repository root to link workspaces.

5. Add a new job to `.github/workflows/monorepo-ci.yml`.

---

## 🤝 Cross-Package Dependencies

All inter-package dependencies are declared with `"*"` as the version, which npm workspaces resolves to the local symlinked package automatically:

```json
"dependencies": {
  "@qa-framework/core": "*",
  "@qa-framework/shared-utils": "*"
}
```

No publishing to npm is required — workspaces link the packages locally.

---

## 📊 CI/CD

The monorepo CI workflow (`.github/workflows/monorepo-ci.yml`) runs **separate jobs per package** with a dependency graph:

```
core ──┬─── shared-utils ──┬─── orangehrm-suite
       │                   └─── hrm-api-suite
       └─── root-suite (cross-browser)
```

This means:
- `core` builds first.
- `shared-utils` builds after `core`.
- Feature suites run in parallel once their dependencies pass.
- A unified report is published to GitHub Pages.

---

## 📁 Root vs Package Scripts

| Command | Scope |
|---|---|
| `npm test` | Root Playwright config (all existing tests) |
| `npm run test:orangehrm` | `packages/orangehrm-suite` only |
| `npm run test:hrm-api` | `packages/hrm-api-suite` only |
| `npm run build:packages` | Build all `packages/*` |
| `npm run test:all-packages` | Run `test` script in every package |
