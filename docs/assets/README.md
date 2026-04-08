# docs/assets — Visual Portfolio Resources

This directory contains screenshots, GIFs, and visual assets that demonstrate the
OrangeHRM automation framework in action.

---

## 📂 Directory Structure

```
docs/assets/
├── README.md                        ← this file
├── demo/
│   ├── smoke-test-run.gif           ← Animated GIF of smoke tests executing
│   ├── trace-viewer-walkthrough.gif ← Playwright trace viewer replay
│   └── ci-pipeline-green.png        ← GitHub Actions run with all checks passing
├── reports/
│   ├── playwright-report-sample.png ← Screenshot of the HTML report
│   ├── allure-overview.png          ← Allure report overview page
│   ├── allure-suites.png            ← Allure suites/stories breakdown
│   └── allure-timeline.png          ← Allure parallel execution timeline
├── browsers/
│   ├── chromium-results.png         ← Chromium test results
│   ├── firefox-results.png          ← Firefox test results
│   └── webkit-results.png           ← WebKit test results
└── visual-regression/
    ├── login-page-baseline.png      ← Login page visual baseline
    ├── dashboard-baseline.png       ← Dashboard visual baseline
    └── diff-example.png             ← Example of a caught visual regression
```

---

## 📸 How to Capture These Assets

### 1. Record a smoke test GIF

```bash
# Run smoke tests with video recording enabled
npx playwright test tests/smoke --project=chromium --headed \
  --config="{ \"use\": { \"video\": \"on\" } }"

# Videos are saved to test-results/*/video.webm
# Convert to GIF with ffmpeg:
ffmpeg -i test-results/smoke-login-*/video.webm \
  -vf "fps=10,scale=1280:-1:flags=lanczos" \
  -loop 0 docs/assets/demo/smoke-test-run.gif
```

### 2. Screenshot the HTML report

```bash
npm run test:smoke
npm run report
# Take a screenshot of the browser window showing the report
# Save to docs/assets/reports/playwright-report-sample.png
```

### 3. Screenshot the Allure report

```bash
npm run test:report
# Take a screenshot of the Allure overview page
# Save to docs/assets/reports/allure-overview.png
```

### 4. Capture visual regression baselines

```bash
npx playwright test tests/visual --update-snapshots --project=visual
# Baselines are auto-saved to tests/visual/*-snapshots/
# Copy noteworthy ones here for the README gallery:
cp tests/visual/login-visual.spec.ts-snapshots/login-page-chromium-linux.png \
   docs/assets/visual-regression/login-page-baseline.png
```

### 5. Screenshot the CI/CD pipeline

1. Open a successful GitHub Actions run
2. Take a screenshot showing all green checks
3. Save to `docs/assets/demo/ci-pipeline-green.png`

---

## 🖼️ Adding Assets to README

Once assets are captured, reference them in `README.md`:

```markdown
## 🎬 Demo

![Smoke Tests Running](docs/assets/demo/smoke-test-run.gif)

## 📊 Test Reports

| Playwright HTML Report | Allure Overview |
|---|---|
| ![Report](docs/assets/reports/playwright-report-sample.png) | ![Allure](docs/assets/reports/allure-overview.png) |
```

---

## 💡 Tools for Creating GIFs

| Tool | Platform | Notes |
|------|----------|-------|
| [LICEcap](https://www.cockos.com/licecap/) | macOS/Windows | Free, easy screen-to-GIF |
| [Gifski](https://gif.ski/) | All (via ffmpeg) | High-quality GIF from video |
| [Kap](https://getkap.co/) | macOS | Free, high quality |
| [ffmpeg](https://ffmpeg.org/) | All | CLI — convert webm to GIF |

---

[← Back to docs/](.) | [DEMO.md](../DEMO.md) | [Main README](../../README.md)
