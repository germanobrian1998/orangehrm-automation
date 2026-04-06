# Mock API Server (MSW)

This project uses [Mock Service Worker (MSW)](https://mswjs.io/) to intercept HTTP requests at the network level and return mock responses. This enables fully offline testing without hitting the real OrangeHRM API.

## Overview

| Mode | Description |
|------|-------------|
| **Real API** | Tests hit `ORANGEHRM_BASE_URL` (default: `https://opensource-demo.orangehrmlive.com`) |
| **Mock API** | MSW intercepts all HTTP calls and returns predefined mock responses |

## File Structure

```
packages/hrm-api-suite/
├── src/
│   └── mocks/
│       ├── handlers.ts    – HTTP request handlers (mock responses)
│       ├── server.ts      – Node.js server (Playwright / Jest in Node context)
│       ├── browser.ts     – Browser worker (real-browser E2E tests)
│       └── index.ts       – Barrel export
├── tests/
│   ├── fixtures/
│   │   └── test-api-client.ts  – Lightweight fetch-based client for mock tests
│   └── api/
│       └── mock-employee.spec.ts – Mock API tests (tagged @mock)
└── package.json

.env.mock                  – Environment variables for mock mode
docs/MOCK-API.md           – This file
```

## Running Mock Tests

```bash
# From the repository root
npm run test:mock

# From packages/hrm-api-suite
npm run test:mock

# Run only mock-tagged tests with Playwright
USE_MOCK_API=true npx playwright test --grep @mock
```

## How It Works

1. **Handlers** (`src/mocks/handlers.ts`) define URL patterns and mock responses using MSW's `http` helper.
2. **Server** (`src/mocks/server.ts`) wraps the handlers with `setupServer` from `msw/node`, which patches Node.js's `fetch` and `http` module so all outgoing requests are intercepted.
3. **Tests** start the server in `beforeAll`, reset overrides in `afterEach`, and shut it down in `afterAll`.
4. **TestApiClient** (`tests/fixtures/test-api-client.ts`) uses native `fetch`, which is intercepted by MSW automatically.

## Adding New Mock Handlers

Edit `packages/hrm-api-suite/src/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';

const API_BASE = process.env.ORANGEHRM_BASE_URL || 'https://opensource-demo.orangehrmlive.com';

// Add your handler to the handlers array:
http.get(`${API_BASE}/api/v2/leave/leave-types`, () => {
  return HttpResponse.json({
    data: [
      { id: 1, name: 'Annual', color: '#00B0F0' },
      { id: 2, name: 'Sick',   color: '#FF0000' },
    ],
  });
}),
```

Handlers are matched **in order** — place more specific routes (e.g. `/employees/99999`) before generic catch-all routes (e.g. `/employees/:id`).

## Overriding Handlers in a Specific Test

Use `server.use()` inside a test to temporarily override a handler. The override is automatically removed by `server.resetHandlers()` in `afterEach`.

```typescript
import { server } from '../../src/mocks/server';
import { http, HttpResponse } from 'msw';

test('should handle empty employee list', async ({ baseURL }) => {
  server.use(
    http.get(`${baseURL}/api/v2/employees`, () => {
      return HttpResponse.json({ data: [], meta: { total: 0 } });
    })
  );

  const client = new TestApiClient(baseURL!);
  await client.authenticate();
  const result = await client.getEmployees();

  expect(result.data).toHaveLength(0);
});
```

## Testing Error Scenarios

MSW makes it trivial to test HTTP error responses:

```typescript
import { server } from '../../src/mocks/server';
import { http, HttpResponse } from 'msw';

test('should handle server error', async ({ baseURL }) => {
  server.use(
    http.get(`${baseURL}/api/v2/employees`, () => {
      return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    })
  );

  // ... assert the error is handled correctly
});
```

## Mocked Endpoints

| Method | URL | Mock Response |
|--------|-----|---------------|
| `POST` | `/api/v2/oauth/token` | `{ access_token: 'mock-token-12345', ... }` |
| `GET`  | `/api/v2/employees` | List of 2 mock employees |
| `POST` | `/api/v2/employees` | Created employee with `id: 3` |
| `GET`  | `/api/v2/employees/:id` | Single mock employee |
| `PUT`  | `/api/v2/employees/:id` | Updated employee |
| `DELETE` | `/api/v2/employees/:id` | `{}` with status 204 |
| `GET`  | `/api/v2/employees/99999` | `{ error: 'Employee not found' }` with status 404 |
| `GET`  | `/api/v2/protected` | `{ error: 'Unauthorized' }` with status 401 |

## When to Use Mock vs Real API

| Scenario | Use Mock | Use Real API |
|----------|----------|--------------|
| Unit / integration tests | ✅ | — |
| CI pipelines (fast, stable) | ✅ | — |
| Error / edge case scenarios | ✅ | — |
| Offline development | ✅ | — |
| Contract / schema validation | — | ✅ |
| End-to-end smoke tests | — | ✅ |
| Performance / load testing | — | ✅ |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ORANGEHRM_BASE_URL` | `https://opensource-demo.orangehrmlive.com` | Base URL used by handlers and clients |
| `USE_MOCK_API` | `false` | Set to `true` to indicate mock mode |

Load the mock environment with:

```bash
# Copy .env.mock settings into your shell:
set -a && source .env.mock && set +a && npm run test:mock
```
