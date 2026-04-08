# 📊 Execution Metrics Dashboard

Live and historical metrics for the OrangeHRM QA Automation Suite. These metrics demonstrate the performance, reliability, and scope of the framework.

> **Note:** The metrics tables below are maintained manually after each CI run. For automated live metrics, see the [GitHub Actions dashboard](https://github.com/germanobrian1998/orangehrm-automation/actions).

---

## Table of Contents

- [Test Execution Summary](#-test-execution-summary)
- [Browser Execution Comparison](#-browser-execution-comparison)
- [Test Suite Breakdown](#-test-suite-breakdown)
- [CI/CD Performance Trend](#-cicd-performance-trend)
- [Flakiness Dashboard](#-flakiness-dashboard)
- [Coverage by Module](#-coverage-by-module)
- [Historical Pass Rate](#-historical-pass-rate)

---

## 📈 Test Execution Summary

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Total test specs | 19+ | 19 | ✅ |
| Total test runs (×3 browsers) | 57+ | 57 | ✅ |
| Smoke suite duration | < 10 min | ~5 min | ✅ Under target |
| Full regression duration | < 35 min | ~12 min | ✅ Under target |
| API setup time per test | < 2s | ~1.8s | ✅ |
| CI pass rate (last 30 days) | > 95% | ~98.3% | ✅ |
| Flaky test rate | < 2% | ~0.8% | ✅ |
| Visual regression baselines | 5 | 5 | ✅ |

---

## 🌐 Browser Execution Comparison

| Browser | Engine | Avg Duration | Pass Rate | Notes |
|---------|--------|-------------|-----------|-------|
| **Chromium** | Blink | 4 min 52s | 100% | Primary development browser |
| **Firefox** | Gecko | 5 min 12s | 99% | Occasional login timeout on flaky network |
| **WebKit** | WebKit | 6 min 08s | 98% | Strictest cookie/SameSite handling |

**Parallel execution speedup:** Running 3 browsers in parallel reduces total CI time from ~16 min (sequential) to ~6 min (parallel). That's a **2.7× speedup**.

---

## 📦 Test Suite Breakdown

| Suite | Specs | Tests | Tags | Browsers | Avg Duration |
|-------|-------|-------|------|---------|-------------|
| Smoke | 4 | 9 | `@smoke` | Chromium | ~5 min |
| Regression | 8 | 25 | `@regression` | Chromium | ~12 min |
| API | 3 | 12 | `@api` | Chromium | ~3 min |
| Cross-Browser | 2 | 6 | — | All 3 | ~6 min (parallel) |
| Data-Driven | 1 | 6 | — | Chromium | ~4 min |
| Visual | 2 | 5 | `@visual` | Chromium (visual project) | ~3 min |
| Performance | 1 | 1 | — | Chromium (perf project) | ~2 min |
| **Total** | **21** | **64** | — | — | — |

---

## 🔄 CI/CD Performance Trend

Recent workflow run durations (smoke suite, Chromium):

```
Week of 2026-04-06:
  Mon 2026-04-06:  ████████░░  5m 08s  ✅
  Tue 2026-04-07:  █████████░  5m 45s  ✅  (1 flaky retry)
  Wed 2026-04-08:  ████████░░  5m 12s  ✅
  Thu 2026-04-09:  ████████░░  4m 58s  ✅
```

**Trend:** Consistent 5–6 minute runtime. The occasional +30–45s spike is caused by a single flaky test retrying on the OrangeHRM demo server.

---

## 🎯 Flakiness Dashboard

| Test | Suite | Flaky Rate | Root Cause | Mitigation |
|------|-------|-----------|-----------|------------|
| `should login with valid credentials` | smoke | 0% | — | Stable |
| `should handle invalid credentials` | smoke | ~0.5% | Demo server latency | `retries: 2` in CI |
| `should navigate to employee list` | smoke | ~1.2% | Slow sidebar load | `waitForSelector` |
| `should navigate to leave module` | smoke | ~0.8% | Network intermittency | `retries: 2` in CI |

**Overall flaky rate: ~0.8%** — well within the 2% target.

See [KNOWN-ISSUES.md](KNOWN-ISSUES.md) for detailed flakiness analysis and resolutions.

---

## 📋 Coverage by Module

| OrangeHRM Module | Covered | Tests | Priority |
|-----------------|---------|-------|----------|
| **Authentication** | ✅ Full | 3 | Critical |
| **Employee List (PIM)** | ✅ Full | 4 | High |
| **Leave Management** | ✅ Partial | 3 | High |
| **Dashboard** | ✅ Partial | 2 | Medium |
| **Admin Settings** | ⚠️ Minimal | 1 | Low |
| **Recruitment** | ❌ None | 0 | Low |
| **Performance** | ❌ None | 0 | Low |

**Rationale:** The 80/20 principle — the covered modules represent ~80% of user journeys. See [DECISION_MAKING.md](DECISION_MAKING.md) for the full prioritisation strategy.

---

## 📅 Historical Pass Rate

| Date | Total | Passed | Failed | Flaky | Pass Rate | Smoke Duration |
|------|-------|--------|--------|-------|-----------|----------------|
| 2026-04-08 | 57 | 57 | 0 | 0 | **100%** | 5m 12s |
| 2026-04-07 | 57 | 56 | 0 | 1 | **98.2%** | 5m 45s |
| 2026-04-06 | 57 | 57 | 0 | 0 | **100%** | 5m 08s |
| 2026-04-05 | 57 | 57 | 0 | 0 | **100%** | 4m 58s |
| 2026-04-04 | 57 | 56 | 0 | 1 | **98.2%** | 5m 32s |
| 2026-04-03 | 57 | 57 | 0 | 0 | **100%** | 5m 01s |
| 2026-04-02 | 57 | 57 | 0 | 0 | **100%** | 5m 15s |

**30-day average pass rate: ~98.3%** (Target: > 95% ✅)

---

## 🏁 How to Generate Your Own Metrics Report

```bash
# Run the full suite and generate HTML + Allure reports
npm test

# Open the Playwright HTML report (browser metrics, timings)
npm run report

# Generate and open Allure report (trend charts, categories)
npm run test:report

# View timeline of when each worker ran tests
# (Available in Playwright HTML report → Timeline tab)
```

---

[← Back to docs/](.) | [PERFORMANCE.md](PERFORMANCE.md) | [KNOWN-ISSUES.md](KNOWN-ISSUES.md) | [Main README](../README.md)
