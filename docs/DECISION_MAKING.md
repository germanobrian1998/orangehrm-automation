# 🧠 Test Coverage Decision Making

How we decide *what* to test, *how much* to test, and *why* — with a real-world case study.

---

## Table of Contents

- [Philosophy: Value vs. Effort](#-philosophy-value-vs-effort)
- [Case Study: Leave Management Module](#-case-study-leave-management-module)
- [Coverage Strategy Framework](#-coverage-strategy-framework)
- [Decision Matrix Template](#-decision-matrix-template)
- [Business Impact Analysis](#-business-impact-analysis)
- [When NOT to Automate](#-when-not-to-automate)
- [Coverage Targets by Layer](#-coverage-targets-by-layer)

---

## 💡 Philosophy: Value vs. Effort

This framework applies the **Pareto Principle (80/20 rule)** to test coverage decisions:

> **80% of the value comes from 20% of the test cases.**

The goal is not maximum coverage — it is **maximum risk reduction per test written**.

```
High value │  ✅ Automate first    │  ✅ Automate          │
           │  (quick wins)         │  (high-value tests)   │
           ├───────────────────────┼───────────────────────┤
Low value  │  ❌ Skip              │  ⚠️ Low priority      │
           │  (waste)              │  (nice to have)       │
           └───────────────────────┴───────────────────────┘
                 Low effort              High effort
```

---

## 🏖️ Case Study: Leave Management Module

### Context

The Leave Management module is used by 100% of employees at least once per month. It involves:
- Submitting leave requests (employee role)
- Approving/rejecting requests (manager role)
- Balance tracking (system)
- Email notifications (background job)

### Step 1: Risk Assessment

| Feature | Business Impact | Failure Likelihood | Priority |
|---------|----------------|-------------------|----------|
| Submit leave request | 🔴 High — blocks employees | Medium | **P0** |
| Manager approval flow | 🔴 High — blocks managers | Medium | **P0** |
| Leave balance update | 🔴 High — wrong data causes disputes | High (API) | **P0** |
| Rejection with reason | 🟡 Medium — poor UX if broken | Low | **P1** |
| Leave history view | 🟡 Medium — informational | Low | **P1** |
| Email notification | 🟢 Low — backup of UI feedback | High (flaky) | **P2** |
| Delete old records | 🟢 Low — admin only, rare | Very Low | **P3** |

### Step 2: Coverage Decision

```
P0 — Automate fully (happy path + critical edge cases)
P1 — Automate happy path only
P2 — Validate via API only (no UI test)
P3 — Do not automate (manual if needed)
```

### Step 3: Test Cases Written

| Test | Layer | Tags | ROI |
|------|-------|------|-----|
| Submit leave request (valid dates) | UI + API | `@smoke` | ⭐⭐⭐ |
| Submit leave request (insufficient balance) | UI | `@regression` | ⭐⭐⭐ |
| Manager approves leave | UI + API | `@smoke` | ⭐⭐⭐ |
| Manager rejects leave with reason | UI | `@regression` | ⭐⭐ |
| Verify balance decrements after approval | API | `@regression` | ⭐⭐⭐ |
| Verify leave appears in history | UI | `@regression` | ⭐⭐ |
| Email notification sent (webhook check) | API | — | ⭐ (P2) |
| Delete old leave records | — | — | ❌ Not automated |

### Result

- **3 tests** cover 80% of business risk (P0 cases)
- **3 more tests** cover the remaining medium-risk scenarios
- **Total: 6 tests** vs. potential 20+ for near-complete coverage
- **Time saved**: ~14 tests × 2h authoring = ~28 hours

---

## 📐 Coverage Strategy Framework

Use this framework for any new module or feature:

### 1. Identify the User Journeys

List every meaningful action a user can take in the module.

### 2. Score Each Journey

| Criterion | Score (1–5) |
|-----------|-------------|
| Business impact if broken | 1 = cosmetic, 5 = blocks all users |
| Failure likelihood | 1 = very stable, 5 = high churn area |
| Test complexity | 1 = easy, 5 = hard to automate |
| Existing manual coverage | 1 = well covered, 5 = no manual tests |

**Automation Priority = (Impact × Likelihood) / Complexity**

### 3. Apply Thresholds

| Score | Decision |
|-------|----------|
| > 15 | Automate immediately (`@smoke` + `@regression`) |
| 8–15 | Automate in next sprint (`@regression`) |
| 4–7 | Automate if time permits |
| < 4 | Manual test or skip |

---

## 📊 Decision Matrix Template

Copy this template for any new module:

```markdown
## Module: [Name]

| Journey | Impact (1-5) | Likelihood (1-5) | Complexity (1-5) | Score | Decision |
|---------|-------------|-----------------|-----------------|-------|----------|
| Happy path | | | | | |
| Validation error | | | | | |
| Auth/permission check | | | | | |
| Edge case 1 | | | | | |
| Edge case 2 | | | | | |

**Selected for automation**: [List test IDs]
**Skipped**: [List and reason]
```

---

## 💼 Business Impact Analysis

### How automated tests protect the business

| Test Suite | Tests | Business Risk Covered |
|------------|-------|----------------------|
| Smoke | 6 | Login, employee create, leave request — core system health |
| API | 8 | Data integrity, auth boundaries, CRUD correctness |
| Regression | 25 | Full employee lifecycle, leave workflow, cross-module |
| Cross-Browser | 6 | Compatibility for all user environments |

### Cost of a missed regression

| Scenario | Impact | Detection Method |
|----------|--------|-----------------|
| Login broken | 100% of users blocked | Smoke test — detected in < 5 min |
| Leave balance wrong | Payroll disputes | API regression test |
| Employee create fails | HR operations blocked | Smoke + API test |
| Cross-browser layout bug | 30% of users affected | WebKit smoke test |

### ROI Calculation

```
Manual testing cost (per release):
  2 testers × 4h × 26 releases/year = 208 person-hours/year

Automated testing cost:
  Initial: 40h (framework + tests)
  Maintenance: 2h/month = 24h/year
  CI time: negligible

Savings after year 1:
  208h - 24h - 40h = 144 person-hours = ~$10,800 at $75/h
```

---

## 🚫 When NOT to Automate

Knowing what **not** to automate is as important as knowing what to automate.

| Scenario | Reason to Skip |
|----------|----------------|
| One-time setup tasks | Not worth the investment |
| Exploratory testing | Requires human creativity |
| Frequently changing UI | Maintenance cost outweighs value |
| Email/SMS content validation | External dependencies, high flakiness |
| Very complex test data setup | Manual setup faster; automate the assertion |
| Features being deprecated | Soon gone — don't invest |

---

## 🎯 Coverage Targets by Layer

| Layer | Target | Rationale |
|-------|--------|-----------|
| Unit (core utilities) | 80%+ | Fast, cheap, catches regressions early |
| API contracts | 100% of P0 endpoints | Broken APIs block everything above them |
| UI smoke | 100% of critical journeys | Fast gate — catches show-stoppers in 5 min |
| UI regression | P0 + P1 journeys | Full confidence before release |
| Cross-browser | Top 3 journeys × 3 browsers | Covers 95%+ of user environments |

---

[← Back to docs/](.) | [INTERVIEW-PREP.md](INTERVIEW-PREP.md) | [BEST-PRACTICES.md](../BEST-PRACTICES.md) | [Main README](../README.md)
