🎯 OrangeHRM QA Automation Suite

[![Smoke Tests](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/smoke-tests.yml/badge.svg)](https://github.com/germanobrian1998/orangehrm-automation/actions)
[![Code Quality](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/code-quality.yml/badge.svg)](https://github.com/germanobrian1998/orangehrm-automation/actions)

A **production-ready QA automation framework** for OrangeHRM using Playwright, TypeScript, and GitHub Actions.

## 🚀 Quick Start

```bash
npm ci
npx playwright install chromium
npm run test:smoke
📚 Documentation
Full Setup Guide
Architecture Decisions
Testing Strategy
Known Issues
📊 Project Features
✅ 25+ Tests (Smoke + Regression)
✅ API Testing integrated with UI tests
✅ CI/CD Pipeline with GitHub Actions
✅ Professional Documentation for interviews
✅ Anti-Flaky Patterns (explicit waits, API setup)
✅ Type-Safe with TypeScript
🏗️ Architecture
Code
src/
├── api/           # API helpers
├── pages/         # Page Objects
├── fixtures/      # Test data builders
├── utils/         # Shared utilities
├── config/        # Configuration
└── types/         # TypeScript types

tests/
├── smoke/         # Quick validation tests
└── regression/    # Full test suite
📖 Key Points for Interviews
This project demonstrates:

Strategic Testing: 80/20 approach (80% coverage, 20% effort)
API-First Setup: Fast, reliable test data creation
Real-World CI/CD: Parallelization, reportes, artifacts
Clean Architecture: POM without overengineering
Professional Practices: Logging, error handling, documentation
🧪 Running Tests
bash
# Smoke tests
npm run test:smoke

# Full regression
npm run test:regression

# Watch mode
npm run test:watch

# UI mode
npm run test:ui

# Generate report
npx playwright show-report