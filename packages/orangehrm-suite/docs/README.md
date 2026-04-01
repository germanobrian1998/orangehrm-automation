# OrangeHRM Suite Documentation

Welcome to the comprehensive documentation for the `@qa-framework/orangehrm-suite` automation test package.

## Documents

| Document | Description |
|---|---|
| [Getting Started](./GETTING_STARTED.md) | Installation, environment setup, and first test run |
| [Architecture](./ARCHITECTURE.md) | Project structure, POM pattern, package responsibilities |
| [Best Practices](./BEST_PRACTICES.md) | Test naming, assertions, waits, flakiness prevention |
| [Page Object Model](./PAGE_OBJECT_MODEL.md) | Creating page objects, locators, examples |
| [Framework Guide](./FRAMEWORK_GUIDE.md) | Test execution flow, config, logging, CI/CD |
| [API Testing Guide](./API_TESTING_GUIDE.md) | API clients, authentication, validation, mocking |
| [Performance Testing](./PERFORMANCE_TESTING.md) | Load testing, metrics collection, benchmarking |
| [Security Testing](./SECURITY_TESTING.md) | OWASP compliance, vulnerability scanning, data protection |
| [Troubleshooting](./TROUBLESHOOTING.md) | Common errors, debug mode, CI issues |
| [Contributing](./CONTRIBUTING.md) | Development workflow, PR process, commit conventions |
| [API Reference](./API_REFERENCE.md) | Public API, all classes, methods, and configuration options |

## Examples

The [`examples/`](./examples/) directory contains runnable example files:

| File | Description |
|---|---|
| [`login-flow.spec.ts`](./examples/login-flow.spec.ts) | Complete authentication flow tests |
| [`crud-operations.spec.ts`](./examples/crud-operations.spec.ts) | Employee CRUD via UI and API |
| [`api-testing.spec.ts`](./examples/api-testing.spec.ts) | API contract and lifecycle tests |
| [`report-generation.spec.ts`](./examples/report-generation.spec.ts) | Report generation and export |
| [`custom-page-object.ts`](./examples/custom-page-object.ts) | Creating a custom page object |

## Quick links

- [Main README](../README.md)
- [Core Package](../../core/README.md)
- [Playwright Docs](https://playwright.dev/docs/intro)
