# 🎬 Video Walkthrough & Portfolio Guide

How to record, share, and showcase your test automation framework for interviews and portfolios.

---

## Table of Contents

- [What to Record](#-what-to-record)
- [Recording with Playwright's Built-in Video](#-recording-with-playwrights-built-in-video)
- [Screen Recording for Demo Videos](#-screen-recording-for-demo-videos)
- [Suggested Demo Script](#-suggested-demo-script)
- [Sharing Results](#-sharing-results)
- [LinkedIn & Portfolio Showcase](#-linkedin--portfolio-showcase)

---

## 🎯 What to Record

Record **short, focused clips** — not marathon sessions. Interviewers and hiring managers have limited attention spans.

| Demo Type | Duration | What to Show |
|-----------|----------|--------------|
| Smoke test run | 1–2 min | `npm run test:smoke` — tests passing in terminal + browser |
| Cross-browser run | 2–3 min | Same test running on Chromium, Firefox, WebKit |
| CI/CD pipeline | 1–2 min | GitHub Actions run completing with green checks |
| HTML report walkthrough | 1 min | Open report, show test names, screenshot on failure |
| Playwright trace viewer | 1–2 min | Step through a test replay with DOM snapshots |
| Code walkthrough | 3–5 min | Page Object, BasePage, playwright.config.ts |

**Recommended playlist order:**
1. 30-second intro (what the project is)
2. Smoke test run (1 min)
3. HTML report (30 sec)
4. CI pipeline (1 min)
5. Code walkthrough (3 min)

---

## 📹 Recording with Playwright's Built-in Video

### Enable video capture in config

```typescript
// playwright.config.ts — for recording specific runs
use: {
  video: 'on',               // record every test
  // or
  video: 'retain-on-failure', // only keep videos for failed tests
  // or
  video: 'off',              // default (saves disk space)
}
```

### Record a specific test

```bash
# Record a single test with video
npx playwright test tests/smoke/login.spec.ts \
  --video=on \
  --project=chromium \
  --headed

# Videos saved to: test-results/<test-name>/video.webm
```

### View traces (interactive replay)

```bash
# Run with trace enabled
npx playwright test tests/smoke/login.spec.ts --trace=on

# Open the trace viewer (interactive step-by-step replay)
npx playwright show-trace test-results/*/trace.zip
```

The trace viewer is excellent for demos — it shows:
- Each Playwright action with timing
- DOM snapshot at every step
- Network requests
- Console logs

---

## 🖥️ Screen Recording for Demo Videos

### Tools by platform

| Platform | Free Tool | Notes |
|----------|-----------|-------|
| macOS | QuickTime Player | Built-in, HD quality |
| Windows | Xbox Game Bar (Win+G) | Built-in |
| Linux | OBS Studio | Free, professional quality |
| All | Loom | Browser extension, easy sharing |
| All | OBS Studio | Most control, free |

### Recording setup checklist

- [ ] Close unnecessary browser tabs (clean browser)
- [ ] Use a clean terminal (dark theme, readable font size 16+)
- [ ] Set desktop resolution to 1920×1080 if possible
- [ ] Close notifications (macOS: Do Not Disturb; Windows: Focus Assist)
- [ ] Run the test once before recording so there are no surprises
- [ ] Have the HTML report pre-generated for the report walkthrough segment

### Optimal browser window layout for demos

```
┌─────────────────────────────────────────┐
│  Terminal (left half)  │  Browser (right)│
│  $ npm run test:smoke  │  [OrangeHRM]    │
│  ✓ login (3.2s)        │                 │
│  ✓ employee (4.1s)     │                 │
└─────────────────────────────────────────┘
```

---

## 🎬 Suggested Demo Script

### Video 1: Smoke Test Run (~90 seconds)

```
[0:00] "Hi, this is my OrangeHRM QA Automation Suite, built with 
       Playwright and TypeScript. Let me show it in action."

[0:08] [Type in terminal]
       npm run test:smoke

[0:12] "This runs 19 smoke test specs against the OrangeHRM demo 
       application using Chromium. Watch how Playwright auto-navigates 
       the application and validates each step."

[0:15] [Tests run — browser visible on right side]
       [Let terminal output scroll — don't narrate every test]

[1:05] "All 19 tests passed in about 90 seconds. Let me open the 
       HTML report..."

[1:10] npm run report

[1:15] "The report shows each test, its duration, and any screenshots 
       taken on failure. This is what I'd attach to a CI run artifact."

[1:25] [End]
```

### Video 2: CI/CD Pipeline (~60 seconds)

```
[0:00] [Open GitHub Actions tab in browser]
       "Let me walk through the CI/CD pipeline."

[0:05] [Click on a completed workflow run]
       "Every push to main triggers four workflows: smoke tests, 
       regression, cross-browser matrix, and code quality checks."

[0:20] [Click through the steps]
       "Playwright browsers are cached between runs — this step 
       takes 5 seconds instead of 60."

[0:40] [Show artifacts section]
       "HTML reports and screenshots are uploaded as artifacts 
       for every run, retained for 7 to 30 days."

[0:55] [End]
```

### Video 3: Code Architecture (~3 minutes)

```
[0:00] "Let me walk through the code architecture."

[0:05] [Open VS Code, show src/pages/LoginPage.ts]
       "Page objects encapsulate selectors and actions. No selectors 
       appear in test files — only method calls."

[0:30] [Show tests/smoke/login.spec.ts]
       "Tests follow the Arrange-Act-Assert pattern. They're 
       readable — you don't need to know Playwright to understand what's tested."

[1:00] [Show packages/core/src/page-objects/BasePage.ts]
       "BasePage provides shared helpers used by all page objects — 
       navigation, form filling, waiting. The monorepo shares this 
       across all test suites."

[1:30] [Show playwright.config.ts]
       "The config defines all four browser projects, timeout settings, 
       and reporters — HTML and Allure."

[2:00] [Show .github/workflows/smoke-tests.yml]
       "GitHub Actions workflows define the CI pipeline. 
       Credentials come from GitHub Secrets — never hardcoded."

[2:30] [End]
```

---

## 📤 Sharing Results

### Option 1: GitHub Pages (free, public)

Deploy the Playwright HTML report as a static site:

```yaml
# .github/workflows/publish-report.yml
name: Publish Report
on:
  push:
    branches: [main]
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:smoke
      - uses: actions/upload-pages-artifact@v3
        with:
          path: playwright-report/
      - uses: actions/deploy-pages@v4
```

After enabling GitHub Pages in Settings → Pages → Source: GitHub Actions, your report is at:
`https://yourusername.github.io/orangehrm-automation/`

### Option 2: Allure Report

```bash
# Generate and serve Allure report locally
npm test
allure serve ./allure-results

# For sharing: generate static site
allure generate ./allure-results -o ./allure-report --clean
# Host on GitHub Pages, Netlify, or Vercel
```

### Option 3: GitHub Actions artifact download

Provide a direct link in your portfolio:
```
[View Latest Test Report] → https://github.com/user/repo/actions
```
Download the `playwright-report` artifact from the latest run.

---

## 💼 LinkedIn & Portfolio Showcase

### LinkedIn post template

```
🚀 Just completed my OrangeHRM QA Automation Framework!

🔧 Tech stack:
• Playwright + TypeScript for UI & API testing
• GitHub Actions CI/CD with cross-browser matrix
• Monorepo architecture with shared core framework
• 58+ tests across smoke, regression, API, and performance suites

📊 Highlights:
• 3 browsers tested in parallel (Chromium, Firefox, WebKit)
• Tests run in < 10 minutes on every PR
• Zero-flakiness design with explicit waits & auto-retry
• Production-ready patterns: POM, AAA, Allure reporting

🔗 GitHub: [link]
▶️ Demo video: [link]

#QAAutomation #Playwright #TypeScript #TestAutomation #SDET
```

### Portfolio project description

```markdown
## OrangeHRM QA Automation Suite

A production-ready test automation framework built with Playwright and TypeScript.

**What it demonstrates:**
- Page Object Model with TypeScript strict mode
- Integrated UI + API testing in a single framework
- Cross-browser testing (Chromium, Firefox, WebKit)
- CI/CD with GitHub Actions (parallel execution, artifact upload)
- Monorepo architecture with shared core package
- Allure reporting with test history and screenshots

**Metrics:** 58+ tests | 3 browsers | < 10 min CI run | 0 flaky tests

[GitHub Repository](https://github.com/germanobrian1998/orangehrm-automation) |
[Live Report](https://germanobrian1998.github.io/orangehrm-automation/)
```

### GitHub README badges that impress

Already in the README, but ensure these are current:

```markdown
[![Tests Passing](https://img.shields.io/badge/tests-58%2F58-brightgreen)](...)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-strict%20mode-blue)](...)
[![Playwright](https://img.shields.io/badge/Playwright-1.40+-green)](...)
[![Docker Ready](https://img.shields.io/badge/Docker-ready-2496ED)](...)
```

---

[← Back to docs/](.) | [INTERVIEW-PREP.md](INTERVIEW-PREP.md) | [Main README](../README.md)
