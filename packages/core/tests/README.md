# @qa-framework/core – Unit Tests

This directory contains the unit test suite for the `@qa-framework/core` package.
Unit tests run with **Jest** (+ ts-jest) and do **not** require a browser.

---

## Running Tests

```bash
# From the package root (packages/core)
npm test                 # Run all unit tests once
npm run test:watch       # Run in watch mode (re-runs on file change)
npm run test:coverage    # Run with coverage report (target: 80%+)

# From the monorepo root
npm run test:core
```

---

## Test Structure

```
tests/
├── core.spec.ts              # Playwright-based integration smoke tests
└── unit/
    ├── setup.ts              # Jest global setup (env vars, mocks)
    ├── logger.spec.ts        # Logger – log levels, step(), assertion()
    ├── config.spec.ts        # Config – singleton, env vars, typed getters
    ├── test-helpers.spec.ts  # TestHelpers – all utility functions
    ├── base-page.spec.ts     # BasePage – navigation, interaction, waits
    ├── base-api-client.spec.ts # BaseApiClient – HTTP methods, auth, errors
    ├── fixtures.spec.ts      # TestFixtures – fixture exports and shapes
    ├── core-unit.spec.ts     # Playwright-based extended unit tests (68 tests)
    └── mocks/
        ├── mock-page.ts      # Mock Playwright Page object
        ├── mock-axios.ts     # Mock Axios instance
        └── mock-logger.ts    # Mock Winston Logger
```

---

## Writing Tests for New Framework Features

### 1. Pure Utility Functions

Add to an existing `*.spec.ts` or create a new one following the naming convention
`<module>.spec.ts`.  Use **Jest globals** directly:

```typescript
import { describe, it, expect } from '@jest/globals';
import { myHelper } from '../../src/utils/TestHelpers';

describe('myHelper()', () => {
  it('should do X', () => {
    expect(myHelper('input')).toBe('expected');
  });
});
```

### 2. Classes that Depend on Playwright `Page`

Use the `createMockPage()` helper from `mocks/mock-page.ts`:

```typescript
import { createMockPage } from './mocks/mock-page';
import { MyPageObject } from '../../src/page-objects/my-page';
import type { Page } from '@playwright/test';

describe('MyPageObject', () => {
  it('should navigate', async () => {
    const mockPage = createMockPage();
    const po = new MyPageObject(mockPage as unknown as Page);
    await po.goto('/my-path');
    expect(mockPage.goto).toHaveBeenCalled();
  });
});
```

### 3. API Clients

Use the `createMockPage()` which already mocks `page.request`:

```typescript
import { createMockPage } from './mocks/mock-page';
import { MyApiClient } from '../../src/api-client/my-api-client';

describe('MyApiClient', () => {
  it('should fetch employees', async () => {
    const mockPage = createMockPage();
    const client = new MyApiClient(mockPage as unknown as Page);
    // ...
  });
});
```

---

## Mocking Patterns

| Pattern | Tool | File |
|---------|------|------|
| Mock Playwright `Page` | `jest.fn()` | `mocks/mock-page.ts` |
| Mock Axios | `jest.fn()` | `mocks/mock-axios.ts` |
| Mock Logger | `jest.fn()` | `mocks/mock-logger.ts` |
| Mock env vars | `process.env.X = '...'` | `setup.ts` |

---

## Coverage Targets

| Metric | Target |
|--------|--------|
| Statements | ≥ 80% |
| Branches | ≥ 70% |
| Functions | ≥ 80% |
| Lines | ≥ 80% |

Run `npm run test:coverage` to see the HTML report in `coverage/`.
