# Test Strategy

> **📖 For the full Testing Strategy, see [docs/TEST-STRATEGY.md](docs/TEST-STRATEGY.md)**

This document provides a quick overview. The comprehensive version in `docs/` covers:

- Testing philosophy and principles
- What to automate vs what to keep manual
- Test coverage targets (%) by module
- Test execution strategy (smoke, regression, performance)
- Test data management approach
- Flaky test prevention strategies
- Known issues and workarounds
- Testing metrics and KPIs

---

## Quick Overview

### Testing Pyramid

```
        ┌───────────────────┐
        │   UI E2E Tests    │  ← Few (high value, slower)
        │   (Playwright)    │
        ├───────────────────┤
        │   API Tests       │  ← More (fast, reliable)
        │  (Playwright API) │
        ├───────────────────┤
        │   Unit Tests      │  ← Most (fastest, cheapest)
        │    (Jest)         │
        └───────────────────┘
```

### Test Suites

| Suite | Count | Speed | When |
|-------|-------|-------|------|
| Smoke | ~12 tests | < 5 min | Every PR |
| API | ~15 tests | < 8 min | Every PR |
| Regression | ~25 tests | ~30 min | Push to main + nightly |
| Performance | ~5 tests | ~10 min | Push to main |
| Cross-Browser | ~3 tests | ~15 min | Push to main |

### Coverage Targets

| Module | Target | Current |
|--------|--------|---------|
| Authentication | 90% | ✅ 95% |
| Employee Management | 80% | ✅ 85% |
| Leave Management | 80% | ✅ 82% |
| Attendance | 70% | ✅ 75% |
| Admin Functions | 70% | ✅ 72% |

---

→ **[Read the full Test Strategy document](docs/TEST-STRATEGY.md)**
