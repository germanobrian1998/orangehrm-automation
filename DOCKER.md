# 🐳 Docker Guide

Run the OrangeHRM automation tests inside isolated containers for consistent, reproducible results.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) 20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) v2+

## Quick Start

```bash
# Build the image
docker build -t orangehrm-automation .

# Run all tests
docker run --rm orangehrm-automation
```

## Using Docker Compose

```bash
# Run the full test suite
docker compose run --rm playwright

# Run smoke tests only
docker compose run --rm smoke

# Run regression tests only
docker compose run --rm regression
```

Test reports and results are saved to your local `playwright-report/` and `test-results/` directories via volume mounts.

## Viewing the Report

After a run, open the HTML report locally:

```bash
npx playwright show-report
```

## CI/CD Integration

The Docker image is suitable for use in any CI/CD pipeline:

```yaml
- name: Run tests in Docker
  run: docker compose run --rm smoke
```

## Image Details

The image is based on `mcr.microsoft.com/playwright:v1.40.0-jammy`, which ships with:

- Node.js 18
- All Playwright browser binaries (Chromium, Firefox, WebKit)
- Required OS-level dependencies

No additional browser installation step is needed inside the container.
