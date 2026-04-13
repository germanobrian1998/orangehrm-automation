# 📦 Monorepo Guide

How the OrangeHRM Automation Suite is structured as an npm workspaces monorepo, and how to work within it.

---

## Table of Contents

- [Why a Monorepo?](#-why-a-monorepo)
- [Package Overview](#-package-overview)
- [Inter-Package Dependencies](#-inter-package-dependencies)
- [Package Scripts and Commands](#-package-scripts-and-commands)
- [Adding a New Package](#-adding-a-new-package)
- [When to Create a New Package](#-when-to-create-a-new-package)
- [Version Management](#-version-management)
- [Workspace Configuration](#-workspace-configuration)

---

## 🤔 Why a Monorepo?

A monorepo lets us share the `@qa-framework/core` base framework across multiple test suites **without publishing to npm**. Changes to core are immediately available to all packages — no version bumps, no `npm link`, no publish step.

**Benefits:**

| Benefit         | Detail                                                               |
| --------------- | -------------------------------------------------------------------- |
| Shared core     | `BasePage`, `BaseApiClient`, `Logger`, `Config` used by all packages |
| Single install  | `npm install` at root installs everything                            |
| Unified scripts | `npm run lint` checks all packages                                   |
| Atomic changes  | A single PR can update both core and consumer packages               |
| Clear ownership | Each package has distinct responsibility                             |

**Tool:** [npm workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) (no external tool like Turborepo or Lerna required)

---

## 📦 Package Overview

```
packages/
├── core/                   # @qa-framework/core
├── shared-utils/           # @qa-framework/shared-utils
├── orangehrm-suite/        # @qa-framework/orangehrm-suite
├── hrm-api-suite/          # @qa-framework/hrm-api-suite
└── orangehrm-api-suite/    # @qa-framework/orangehrm-api-suite
```

| Package               | npm name                            | Description                                                         | Depends on             |
| --------------------- | ----------------------------------- | ------------------------------------------------------------------- | ---------------------- |
| `core`                | `@qa-framework/core`                | BasePage, BaseApiClient, Logger, Config, WaitFor, ScreenshotManager | —                      |
| `shared-utils`        | `@qa-framework/shared-utils`        | Test data factory, date/string helpers, Faker wrappers              | —                      |
| `orangehrm-suite`     | `@qa-framework/orangehrm-suite`     | OrangeHRM-specific page objects and UI tests                        | `core`, `shared-utils` |
| `hrm-api-suite`       | `@qa-framework/hrm-api-suite`       | HRM REST API clients and API tests                                  | `core`, `shared-utils` |
| `orangehrm-api-suite` | `@qa-framework/orangehrm-api-suite` | Additional OrangeHRM API tests                                      | `core`, `shared-utils` |

### `packages/core` — The Foundation

```
packages/core/src/
├── page-objects/       # BasePage — extend for every UI page object
│   └── BasePage.ts
├── api-client/         # BaseApiClient — extend for every API client
│   └── BaseApiClient.ts
├── logger/             # Winston-based structured logger
│   └── logger.ts
├── config/             # Environment config, shared constants
│   └── environment.ts
└── utils/              # WaitFor helpers, ScreenshotManager
    ├── WaitFor.ts
    └── ScreenshotManager.ts
```

Usage:

```typescript
import { BasePage, BaseApiClient, createLogger, config } from '@qa-framework/core';
```

### `packages/orangehrm-suite` — OrangeHRM UI Tests

```
packages/orangehrm-suite/src/
├── pages/              # OrangeHRM-specific page objects
│   ├── LoginPage.ts
│   ├── EmployeePage.ts
│   └── LeavePage.ts
└── tests/              # OrangeHRM UI test specs
    ├── login.spec.ts
    ├── employee.spec.ts
    └── leave.spec.ts
```

### `packages/hrm-api-suite` — HRM API Tests

```
packages/hrm-api-suite/src/
├── clients/            # API client implementations
│   ├── EmployeeApiClient.ts
│   └── LeaveApiClient.ts
└── tests/              # API test specs
    ├── employee-api.spec.ts
    └── leave-api.spec.ts
```

---

## 🔗 Inter-Package Dependencies

### Dependency graph

```
@qa-framework/core
        │
        ├──────────────────────────────┐
        ▼                              ▼
@qa-framework/orangehrm-suite   @qa-framework/hrm-api-suite
        ▲                              ▲
        │                              │
@qa-framework/shared-utils ────────────┘
        │
        └──► @qa-framework/orangehrm-api-suite
```

### How workspace dependencies are declared

```json
// packages/orangehrm-suite/package.json
{
  "name": "@qa-framework/orangehrm-suite",
  "dependencies": {
    "@qa-framework/core": "*",
    "@qa-framework/shared-utils": "*"
  }
}
```

Using `"*"` means "any version in the workspace" — npm workspaces resolves this to the local package automatically. No publishing required.

### Importing across packages

```typescript
// In orangehrm-suite — import from core
import { BasePage } from '@qa-framework/core';
import { TestDataFactory } from '@qa-framework/shared-utils';

export class LoginPage extends BasePage {
  // ...
}
```

---

## 🚀 Package Scripts and Commands

### Root-level scripts (run from repo root)

```bash
# Install all workspace dependencies
npm install

# Run all tests (root playwright.config.ts)
npm test

# Run smoke tests
npm run test:smoke

# Run regression tests
npm run test:regression

# Run tests for a specific package
npm run test:orangehrm        # packages/orangehrm-suite
npm run test:hrm-api          # packages/hrm-api-suite
npm run test:orangehrm-api    # packages/orangehrm-api-suite

# Run all package tests
npm run test:all-packages

# Build all packages
npm run build:packages

# Lint all packages
npm run lint

# Format all files
npm run format
```

### Running commands in a specific workspace

```bash
# npm workspace syntax
npm run test --workspace=packages/core
npm run build --workspace=packages/orangehrm-suite

# Or cd into the package
cd packages/hrm-api-suite && npm test
```

### Per-package package.json scripts

Each package declares its own scripts:

```json
// packages/orangehrm-suite/package.json
{
  "scripts": {
    "test": "playwright test",
    "build": "tsc --noEmit",
    "lint": "eslint src --ext .ts"
  }
}
```

---

## ➕ Adding a New Package

### Step 1 — Create the package directory

```bash
mkdir -p packages/my-new-suite/src/{pages,tests}
```

### Step 2 — Create `package.json`

```json
// packages/my-new-suite/package.json
{
  "name": "@qa-framework/my-new-suite",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "playwright test",
    "build": "tsc --noEmit",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "@qa-framework/core": "*",
    "@qa-framework/shared-utils": "*"
  },
  "devDependencies": {
    "@playwright/test": "*",
    "typescript": "*"
  }
}
```

### Step 3 — Create `tsconfig.json`

```json
// packages/my-new-suite/tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*"]
}
```

### Step 4 — Run install at root

```bash
# npm workspaces picks up the new package automatically
npm install
```

### Step 5 — Add a root script

```json
// root package.json — add to scripts
{
  "scripts": {
    "test:my-new-suite": "npm run test --workspace=packages/my-new-suite"
  }
}
```

---

## 📋 When to Create a New Package

| ✅ Create a new package                                        | ❌ Don't create a new package               |
| -------------------------------------------------------------- | ------------------------------------------- |
| Tests are for a **different application**                      | New OrangeHRM module (Recruitment, Reports) |
| Tests need **different npm dependencies**                      | New test suite tag (`@regression`)          |
| A **different team** owns the tests                            | Minor refactoring                           |
| Tests have a **different execution cadence**                   | New page object within OrangeHRM            |
| Tests use a **different technology** (e.g., Appium for mobile) | Adding API tests for existing HRM endpoints |

**Rule of thumb:** If it fits in an existing package with no new dependencies, it doesn't need its own package.

---

## 🔢 Version Management

### Current approach: all `"*"` versions

All workspace packages use `"*"` for cross-package dependencies. This means:

- Always uses the local workspace version
- No version coordination needed
- Changes to `core` are immediately reflected in all consumers

### For externally published packages (future)

If you ever need to publish packages to npm:

```bash
# Bump all package versions consistently
npm version patch --workspaces

# Publish all packages
npm publish --workspaces
```

For a framework that stays private (like this one), `"*"` workspace references are the right approach.

---

## ⚙️ Workspace Configuration

### Root `package.json`

```json
{
  "name": "orangehrm-automation",
  "private": true,
  "workspaces": ["packages/*"]
}
```

The `"workspaces": ["packages/*"]` glob tells npm to treat every directory in `packages/` as a workspace package.

### How npm resolves workspace references

When `orangehrm-suite` declares `"@qa-framework/core": "*"`:

1. npm looks for `@qa-framework/core` in the workspaces list
2. Finds it at `packages/core`
3. Creates a symlink in `node_modules/@qa-framework/core` → `packages/core`
4. No publishing required — changes are live immediately

### Shared `node_modules`

npm hoists shared dependencies to the root `node_modules/`. Each package's `node_modules/` only contains what can't be hoisted (version conflicts). This avoids duplicate installations.

```
node_modules/
├── @playwright/test/     ← shared across all packages
├── typescript/           ← shared
└── @qa-framework/
    ├── core/             ← symlink → packages/core
    ├── orangehrm-suite/  ← symlink → packages/orangehrm-suite
    └── hrm-api-suite/    ← symlink → packages/hrm-api-suite
```

---

[← Back to docs/](.) | [CONTRIBUTING.md](CONTRIBUTING.md) | [CI-CD.md](CI-CD.md) | [Main README](../README.md)
