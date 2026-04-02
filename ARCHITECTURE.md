# Architecture

> **📖 For the full Architecture & Technical Deep Dive, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**

This document provides a high-level overview. The comprehensive version in `docs/` covers:

- Design philosophy and decisions
- API-first testing strategy
- Page Object Model implementation
- Fixture and Test Data Factory patterns
- Technology decisions (Why Playwright, Why TypeScript, Why monorepo)
- Scalability considerations
- Performance optimization strategies
- Security practices
- Code organization rationale
- Dependency graph and package relationships

---

## Quick Summary

### Design Philosophy

```
PRINCIPLE: API for Setup, UI for Validation

✅ FAST:       Create test data via API (1 second)
✅ RELIABLE:   No UI flakiness on setup
✅ REALISTIC:  Validate what users actually see
✅ CLEAN:      Teardown via API (guaranteed cleanup)
```

### Package Structure

```
packages/
├── core/                 # @qa-framework/core       – Base framework (reusable)
├── orangehrm-suite/      # @qa-framework/orangehrm-suite – OrangeHRM UI tests
├── hrm-api-suite/        # @qa-framework/hrm-api-suite   – HRM REST API tests
├── orangehrm-api-suite/  # @qa-framework/orangehrm-api-suite – Additional API tests
└── shared-utils/         # @qa-framework/shared-utils    – Shared utilities
```

### Key Design Patterns

| Pattern | Where Used | Why |
|---------|-----------|-----|
| Page Object Model | `packages/*/src/pages/` | Separates UI structure from test logic |
| Fixture Pattern | `packages/*/fixtures/` | Automatic setup and teardown |
| Factory Pattern | `packages/shared-utils/` | Consistent test data generation |
| API Client Pattern | `packages/*/src/api/` | Reusable API interaction layer |

---

→ **[Read the full Architecture document](docs/ARCHITECTURE.md)**