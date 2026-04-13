# ⚡ Quick Start — 5-Minute Setup

Get the OrangeHRM Automation Suite running in under 5 minutes.

---

## Prerequisites

| Tool                           | Version | Check            |
| ------------------------------ | ------- | ---------------- |
| [Node.js](https://nodejs.org/) | 18+     | `node --version` |
| [npm](https://www.npmjs.com/)  | 9+      | `npm --version`  |
| [Git](https://git-scm.com/)    | any     | `git --version`  |

---

## 3-Step Installation

### Step 1 — Clone & install

```bash
git clone https://github.com/germanobrian1998/orangehrm-automation.git
cd orangehrm-automation
npm ci
```

### Step 2 — Install browsers

```bash
npx playwright install --with-deps chromium
```

### Step 3 — Run your first smoke test

```bash
npm run test:smoke
```

---

## ✅ You're Done When You See

```
Running 19 tests using 2 workers

  ✓  [chromium] › smoke/login.spec.ts › Login › valid credentials (3.2s)
  ✓  [chromium] › smoke/employee.spec.ts › Employee › create employee (4.1s)
  ...

  19 passed (45s)
```

Open the HTML report:

```bash
npm run report
```

---

## Common Next Steps

| What you want            | Command                   |
| ------------------------ | ------------------------- |
| Run all tests            | `npm test`                |
| Run regression suite     | `npm run test:regression` |
| Watch tests run (headed) | `npm run test:headed`     |
| Debug a failing test     | `npm run test:debug`      |
| Use the interactive UI   | `npm run test:ui`         |

---

## 📚 Further Reading

- [ARCHITECTURE.md](../ARCHITECTURE.md) — How the framework is structured
- [BEST-PRACTICES.md](BEST-PRACTICES.md) — Coding standards and patterns
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — Something not working? Start here
- [CI-CD.md](CI-CD.md) — GitHub Actions pipeline details
- [CONTRIBUTING.md](CONTRIBUTING.md) — How to add new tests
- [INTERVIEW-PREP.md](INTERVIEW-PREP.md) — Ready to talk about this project?

---

[← Back to docs/README.md](README.md) | [Main README](../README.md)
