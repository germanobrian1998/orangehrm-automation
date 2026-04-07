# Architecture

## Project Structure

```
orangehrm-automation/
├── packages/
│   ├── core/                 # Core test utilities
│   └── hrm-api-suite/        # API client and mocks
├── tests/
│   ├── smoke/                # Smoke tests
│   ├── api/                  # API tests
│   ├── performance/          # Load tests
│   └── cross-browser/        # Multi-browser tests
├── docs/                     # Documentation
├── .github/
│   └── workflows/            # CI/CD workflows
└── playwright.config.ts      # Playwright configuration
```

## Testing Layers

- **UI Layer**: Playwright E2E tests
- **API Layer**: Axios API tests
- **Mock Layer**: MSW mock server
- **Performance Layer**: k6 load tests
