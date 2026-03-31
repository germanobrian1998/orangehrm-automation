# Setup Instructions

Step-by-step guide to set up the OrangeHRM Automation framework on a local development machine.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Clone the Repository](#clone-the-repository)
- [Install Dependencies](#install-dependencies)
- [Configure Environment Variables](#configure-environment-variables)
- [Run OrangeHRM Locally with Docker](#run-orangehrm-locally-with-docker)
- [Install Playwright Browsers](#install-playwright-browsers)
- [Verify the Setup](#verify-the-setup)
- [Run Tests](#run-tests)
- [IDE Setup](#ide-setup)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Ensure the following tools are installed before starting:

| Tool | Minimum version | How to verify |
|------|----------------|---------------|
| Node.js | 18 LTS | `node --version` |
| npm | 9 | `npm --version` |
| Git | 2.x | `git --version` |
| Docker | 20.x (optional) | `docker --version` |
| Docker Compose | 2.x (optional) | `docker compose version` |

> **Note:** Docker is required only if you want to run OrangeHRM locally. You can skip the Docker steps if you have access to a deployed OrangeHRM instance.

---

## Clone the Repository

```bash
git clone https://github.com/germanobrian1998/orangehrm-automation.git
cd orangehrm-automation
```

---

## Install Dependencies

This is an npm workspaces monorepo. Install all dependencies from the root:

```bash
npm ci
```

This installs dependencies for all packages:
- `packages/core` — core framework
- `packages/orangehrm-suite` — UI page objects and tests
- `packages/hrm-api-suite` — API clients and tests
- `packages/shared-utils` — shared utilities

---

## Configure Environment Variables

Create a `.env` file in the repository root (never commit this file):

```bash
cp .env.example .env   # if an example file exists, otherwise create it manually
```

Edit `.env` with your environment settings:

```dotenv
# OrangeHRM base URL
BASE_URL=http://localhost:80

# Authentication
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=admin123

# Timeouts (milliseconds)
TEST_TIMEOUT=30000
API_TIMEOUT=10000

# Browser settings
BROWSER=chromium
HEADLESS=true

# CI flag (set automatically in GitHub Actions)
CI=false
```

> **Security:** Never commit `.env` files. The `.gitignore` already excludes them.

Available environment variables are documented in `packages/core/src/config/environment.ts`.

---

## Run OrangeHRM Locally with Docker

If you do not have access to a remote OrangeHRM instance, start one locally:

```bash
docker compose up -d
```

Wait for the containers to start (approximately 60 seconds), then verify:

```bash
curl http://localhost:80/web/index.php/auth/login
```

You should receive an HTML response. The default credentials are:
- **Username:** `Admin`
- **Password:** `admin123`

To stop the containers:

```bash
docker compose down
```

To reset the database:

```bash
docker compose down -v
docker compose up -d
```

---

## Install Playwright Browsers

After installing npm dependencies, install the Playwright browser binaries:

```bash
# Install all browsers
npx playwright install --with-deps

# Or install only Chromium (faster for local development)
npx playwright install --with-deps chromium
```

---

## Verify the Setup

Run the core package unit tests (no live OrangeHRM required):

```bash
npm test --workspace=packages/core
```

Expected output:

```
PASS tests/unit/config.spec.ts
PASS tests/unit/logger.spec.ts
PASS tests/unit/base-page.spec.ts
...
Test Suites: X passed
Tests:       X passed
```

Run the integration smoke tests:

```bash
npm run test:smoke --workspace=packages/orangehrm-suite
```

---

## Run Tests

### All workspace unit tests (no browser required)

```bash
npm test
```

### Smoke tests only (fast, critical paths)

```bash
npx playwright test --grep @smoke --project=chromium
```

### Auth tests

```bash
npx playwright test --grep @auth --project=chromium
```

### Employee management tests

```bash
npx playwright test --grep @employee --project=chromium
```

### Leave management tests

```bash
npx playwright test --grep @leave --project=chromium
```

### API tests only

```bash
npx playwright test --grep @api
```

### All Playwright tests in a specific package

```bash
npx playwright test --config=packages/orangehrm-suite/playwright.config.ts
npx playwright test --config=packages/hrm-api-suite/playwright.config.ts
```

### Full test suite with HTML report

```bash
npx playwright test && npx playwright show-report
```

---

## IDE Setup

### Visual Studio Code

Install the recommended extensions:

1. **Playwright Test for VSCode** (`ms-playwright.playwright`) — run and debug tests from the editor
2. **ESLint** (`dbaeumer.vscode-eslint`) — inline lint errors
3. **Prettier** (`esbenp.prettier-vscode`) — auto-format on save

Add this to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["typescript"],
  "playwright.reuseBrowser": false
}
```

### JetBrains (WebStorm / IDEA)

- Enable ESLint: **Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint → Automatic ESLint configuration**
- Enable Prettier: **Settings → Languages & Frameworks → JavaScript → Prettier → Run on Save**

---

## Troubleshooting

### `npm ci` fails with peer dependency errors

```bash
npm ci --legacy-peer-deps
```

### Playwright browsers not found

```bash
npx playwright install --with-deps
```

### OrangeHRM login fails with `ERR_CONNECTION_REFUSED`

- Ensure Docker containers are running: `docker compose ps`
- Wait 60 seconds after `docker compose up -d` for the application to initialize
- Verify the `BASE_URL` in your `.env` matches the container port

### Tests time out

- Increase `TEST_TIMEOUT` in `.env` (default: 30 000 ms)
- Check that `HEADLESS=true` is set (headed mode is slower)
- Ensure the OrangeHRM instance is reachable

### TypeScript compilation errors

```bash
npm run build --workspace=packages/core
npm run build --workspace=packages/orangehrm-suite
npm run build --workspace=packages/hrm-api-suite
```

### ESLint errors

```bash
npm run lint:fix
```

### Port conflict (port 80 already in use)

Edit `docker-compose.yml` to use a different host port:

```yaml
ports:
  - "8080:80"   # change 8080 to an available port
```

Then update `BASE_URL=http://localhost:8080` in `.env`.
