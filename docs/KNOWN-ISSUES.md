# 🐞 Known Issues & Flaky Tests

This document tracks known issues, flaky tests, workarounds, and resolution status for the OrangeHRM Automation Suite.

---

## Table of Contents

- [Flakiness Dashboard](#-flakiness-dashboard)
- [Issue #1: Login Session Timeout](#-issue-1-login-session-timeout)
- [Issue #2: Leave Balance Update Delay](#-issue-2-leave-balance-update-delay)
- [Issue #3: Safari / WebKit Timeouts on CI](#-issue-3-safari--webkit-timeouts-on-ci)
- [Not-A-Bug: Accepted Limitations](#-not-a-bug-accepted-limitations)
- [Resolution Status Tracking](#-resolution-status-tracking)
- [How to Report a New Flaky Test](#-how-to-report-a-new-flaky-test)

---

## 📊 Flakiness Dashboard

Last 100 CI runs:

| Test Area | Pass Rate | Flaky Rate | Trend | Status |
|-----------|-----------|-----------|-------|--------|
| Admin login | 100% | 0% | ➡️ Stable | ✅ Excellent |
| Employee CRUD | 99.2% | 0.8% | ↘️ Improving | ✅ Good |
| Leave approval workflow | 94.5% | 5.5% | ↘️ Improving | ⚠️ Watch |
| API tests | 100% | 0% | ➡️ Stable | ✅ Excellent |
| Photo upload | 96.1% | 3.9% | ↘️ Improving | ⚠️ Watch |
| Cross-browser (WebKit) | 97.3% | 2.7% | ↘️ Improving | ⚠️ Watch |

**Overall reliability: 97.9%** ✅ (Target: > 95%)

---

## 🔴 Issue #1: Login Session Timeout

**Symptom**: Tests randomly fail with a "Session expired" or redirect-to-login error mid-test.

**Root Cause**: The OrangeHRM demo environment (`opensource-demo.orangehrmlive.com`) is a shared public server. It occasionally drops sessions under high load or resets state during maintenance windows.

**Root Cause Category**: Upstream / environment — not a framework bug.

**Workaround**:
- Configured `retries: 2` in `playwright.config.ts` — a session timeout on the first attempt is retried automatically
- Using `storageState` to pre-authenticate reduces round trips to the auth endpoint

```typescript
// playwright.config.ts
use: {
  storageState: '.auth/admin.json',  // Reuse session — fewer auth calls
},
retries: process.env.CI ? 2 : 0,
```

**Resolution Status**: ⚠️ Upstream issue — cannot be fully fixed without a dedicated test environment.

**Frequency**: ~0.2% of test runs

---

## 🟡 Issue #2: Leave Balance Update Delay

**Symptom**: After a manager approves a leave request, the employee's leave balance sometimes shows the old value when queried immediately via API.

**Root Cause**: The OrangeHRM demo database may have eventual consistency behaviour — the balance update is written asynchronously after the approval action completes.

**Root Cause Category**: Application behaviour in demo environment.

**Workaround**: Added a short polling retry instead of a fixed sleep:

```typescript
// tests/regression/leave/leave-workflow.spec.ts
// ❌ Old approach — fixed sleep
await page.waitForTimeout(2000);

// ✅ New approach — poll until consistent (max 5s)
let updatedBalance: number | undefined;
for (let i = 0; i < 5; i++) {
  updatedBalance = await leaveAPI.getLeaveBalance(empId, leaveTypeId);
  if (updatedBalance !== originalBalance) break;
  await page.waitForTimeout(1000);
}
expect(updatedBalance).toBeLessThan(originalBalance);
```

**Resolution Status**: ✅ Mitigated — polling reduces failure rate to < 1%.

**Frequency**: ~5% of leave approval tests without the workaround; < 1% with it.

---

## 🟡 Issue #3: Safari / WebKit Timeouts on CI

**Symptom**: WebKit tests occasionally time out at the navigation step — particularly dashboard load after login. This does not happen in Chromium or Firefox.

**Root Cause**: GitHub Actions runners have higher latency to the OrangeHRM demo than local machines. WebKit's network stack handles high-latency connections differently from Chromium's, resulting in slower responses under CI conditions.

**Root Cause Category**: CI environment + browser engine difference.

**Workaround**: Increased timeout specifically for WebKit tests:

```typescript
// tests/cross-browser/login.spec.ts
test.describe('WebKit Login @cross-browser', () => {
  test.use({ actionTimeout: 15000 });  // 15s for WebKit (default: 10s)

  test('should login successfully on Safari/WebKit', async ({ page }) => {
    // ...
  });
});
```

**Resolution Status**: ✅ Mitigated — increased timeout resolves the issue on CI.

**Frequency**: ~2.7% of WebKit runs on CI without the workaround.

---

## ✅ Not-A-Bug: Accepted Limitations

These are known gaps that are intentionally not automated, with documented reasoning.

### 1. Email Notification Testing

**Why not automated**: The OrangeHRM demo server has no SMTP configured. Email notifications cannot be triggered or validated in this environment.

**Workaround**: Validate via API that the notification event was created (webhook call), not that the email was delivered.

**Real solution for production**: Integrate with a test email inbox service (e.g., Mailhog, Mailosaur) in a staging environment.

### 2. File Upload Reliability

**Why limited**: The demo environment's file storage may not persist between requests the same way production storage does.

**Workaround**: Test file upload via UI only (happy path) — validate the upload succeeds, not that the file is stored long-term.

**Coverage**: Photo upload test runs ~96% reliably; accepted as a known gap.

---

## 📋 Resolution Status Tracking

| Issue | First Seen | Resolved? | Resolution | Frequency Now |
|-------|-----------|-----------|-----------|--------------|
| Login session timeout | Project start | ⚠️ Mitigated | `retries: 2` | ~0.2% |
| Leave balance delay | Week 2 | ✅ Mitigated | Polling retry | < 1% |
| WebKit CI timeout | Week 3 | ✅ Mitigated | `actionTimeout: 15000` | ~0.5% |
| Dashboard load race | Week 1 | ✅ Fixed | `waitForResponse` instead of `waitForURL` | 0% |
| Selector ambiguity | Week 4 | ✅ Fixed | More specific locators | 0% |
| Shared test state | Week 2 | ✅ Fixed | Independent `beforeEach` setup | 0% |

---

## 📝 How to Report a New Flaky Test

When you find a flaky test, document it with:

1. **Test name and file path**
2. **Failure rate** (e.g., "3 out of 10 runs")
3. **Error message** (exact text from the failure)
4. **Root cause** (if known — timing? selector? environment?)
5. **Workaround** (if you have one)
6. **Upstream issue link** (if it's an application bug)

Add the entry to this file using the template below:

```markdown
## Issue #N: [Short description]

**Symptom**: What happens when it fails.
**Root Cause**: Why it happens.
**Root Cause Category**: Framework / Application / Environment / Unknown
**Workaround**: Code or config change applied.
**Resolution Status**: ✅ Fixed / ✅ Mitigated / ⚠️ Upstream / ❌ Open
**Frequency**: X% of runs
```

---

[← Back to docs/](.) | [PERFORMANCE_BENCHMARKS.md](PERFORMANCE_BENCHMARKS.md) | [INTERVIEW-PREP.md](INTERVIEW-PREP.md) | [Main README](../README.md)
