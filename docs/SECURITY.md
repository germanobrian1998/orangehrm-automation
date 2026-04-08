# 🔒 Security Practices

How credentials, secrets, and sensitive data are handled in the OrangeHRM Automation Suite.

---

## Table of Contents

- [Credential Management](#-credential-management)
- [GitHub Secrets Setup for CI/CD](#-github-secrets-setup-for-cicd)
- [Never Commit Secrets](#-never-commit-secrets)
- [Sensitive Data in Tests](#-sensitive-data-in-tests)
- [API Key Rotation](#-api-key-rotation)
- [Audit Logging](#-audit-logging)
- [Security Testing Practices](#-security-testing-practices)
- [Environment-Specific Security Concerns](#-environment-specific-security-concerns)
- [Security Audit Trail](#-security-audit-trail)
- [Anti-Patterns: What NOT to Do](#-anti-patterns-what-not-to-do)

---

## 🔑 Credential Management

### How credentials flow in this project

```
Local development:
  .env.local (gitignored) → loaded by dotenv → used in tests

CI/CD:
  GitHub Secrets → injected as env vars → used in tests

Docker:
  docker run -e ORANGEHRM_ADMIN_PASSWORD=... → env var in container
```

### `.env.example` — the safe template

The repo contains `.env.example` (committed) and `.env.local` (gitignored):

```bash
# .env.example — safe to commit; no real values
ORANGEHRM_BASE_URL=https://opensource-demo.orangehrmlive.com
ORANGEHRM_ADMIN_USERNAME=Admin
ORANGEHRM_ADMIN_PASSWORD=your_password_here
```

Copy this to create your local config:
```bash
cp .env.example .env.local
# Edit .env.local with real values — this file is gitignored
```

### Loading credentials in tests

```typescript
// packages/core/src/config/environment.ts
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export const config = {
  baseURL: process.env.ORANGEHRM_BASE_URL ?? 'https://opensource-demo.orangehrmlive.com',
  adminUsername: process.env.ORANGEHRM_ADMIN_USERNAME ?? 'Admin',
  adminPassword: process.env.ORANGEHRM_ADMIN_PASSWORD!,  // must be set
};
```

---

## ⚙️ GitHub Secrets Setup for CI/CD

### Required secrets

Navigate to: **Repository → Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value | Required? |
|-------------|-------|-----------|
| `ORANGEHRM_BASE_URL` | `https://opensource-demo.orangehrmlive.com` | Optional (has default) |
| `ORANGEHRM_ADMIN_USERNAME` | `Admin` | Optional (has default) |
| `ORANGEHRM_ADMIN_PASSWORD` | The admin password | ✅ Required |

### Using secrets in workflows

```yaml
# .github/workflows/smoke-tests.yml
env:
  ORANGEHRM_BASE_URL: ${{ secrets.ORANGEHRM_BASE_URL }}
  ORANGEHRM_ADMIN_PASSWORD: ${{ secrets.ORANGEHRM_ADMIN_PASSWORD }}
```

Secrets are **never** printed in logs — GitHub masks them automatically with `***`.

### Environment-specific secrets

For staging/production environments, use [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment):

```yaml
jobs:
  staging-tests:
    environment: staging  # links to the 'staging' environment's secrets
    steps:
      - run: npm run test:smoke
        env:
          ORANGEHRM_BASE_URL: ${{ secrets.STAGING_BASE_URL }}
```

---

## 🚫 Never Commit Secrets

### What is protected by `.gitignore`

```gitignore
# Never commit these
.env
.env.local
.env.*.local
*.pem
*.key
auth/**
.auth/
```

### Pre-commit guard

Add a pre-commit hook to catch accidental secret commits:

```bash
# .git/hooks/pre-commit (chmod +x)
#!/bin/sh
if git diff --cached --name-only | xargs grep -l "password\|secret\|token\|api_key" 2>/dev/null; then
  echo "⚠️  Possible secret detected in staged files. Review before committing."
  exit 1
fi
```

### If a secret is accidentally committed

1. **Rotate the credential immediately** — treat it as compromised
2. Remove from git history:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" HEAD
   git push origin --force --all
   ```
3. Use [BFG Repo Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) for large repos
4. Audit GitHub's [secret scanning alerts](https://github.com/settings/security-analysis)

---

## 🗂️ Sensitive Data in Tests

### Masking data in reports

Playwright screenshots and traces may capture form inputs. Mask sensitive fields:

```typescript
// Fill password without capturing it in traces
await page.locator('#txtPassword').fill(config.adminPassword);
// Playwright automatically masks inputs with type="password" in traces
```

### Generated test data

Use the Faker library for realistic but fake test data:

```typescript
import { faker } from '@faker-js/faker';

const testEmployee = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email({ provider: 'example.com' }),  // non-real domain
  phone: faker.phone.number('###-###-####'),
};
```

Never use real PII (names, emails, phone numbers) in test data.

### Cleaning up test data

Always delete test data created during tests:

```typescript
test.afterEach(async ({ request }) => {
  if (createdEmployeeId) {
    await employeeApi.delete(request, createdEmployeeId);
    createdEmployeeId = null;
  }
});
```

---

## 🔄 API Key Rotation

For automated frameworks that use long-lived API tokens:

### Rotation schedule
- Rotate API credentials every **90 days** at minimum
- Rotate immediately if a secret is suspected compromised

### Rotation procedure

1. Generate a new credential in OrangeHRM (or your app)
2. Update the GitHub Secret: Settings → Secrets → Edit
3. Update `.env.local` on local machines
4. Verify CI passes with the new credential
5. Revoke the old credential

### Automated rotation (advanced)

```yaml
# .github/workflows/rotate-credentials.yml
on:
  schedule:
    - cron: '0 9 1 */3 *'  # First day of every quarter
  workflow_dispatch:
jobs:
  notify:
    steps:
      - name: Remind team to rotate credentials
        run: |
          echo "⚠️ Quarterly credential rotation reminder"
          # Post to Slack, create a GitHub issue, etc.
```

---

## 📋 Audit Logging

The framework uses Winston for structured logging. Log entries include:

```typescript
// packages/core/src/logger/logger.ts
import { createLogger } from '@qa-framework/core';

const logger = createLogger('EmployeeTest');

logger.info('Creating employee via API', {
  firstName: employee.firstName,
  // ❌ Never log passwords or tokens
});

logger.error('API call failed', {
  statusCode: response.status(),
  endpoint: response.url(),
  // ❌ Never log response bodies that may contain credentials
});
```

### Log retention

Logs rotate daily and are retained for 14 days by default (configured in Winston `DailyRotateFile`). CI run logs are retained per GitHub Actions artifact settings (7–30 days).

---

## 🛡️ Security Testing Practices

### What this framework tests

- **Authentication flows** — valid/invalid credentials, session handling
- **Authorization** — ensure non-admin users cannot access admin endpoints
- **Input validation** — boundary values, special characters in form fields
- **API security** — unauthenticated requests return 401, not data

### Example auth security test

```typescript
test('unauthenticated API returns 401 @security', async ({ request }) => {
  const response = await request.get(
    'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/pim/employees',
    // No auth headers
  );
  expect(response.status()).toBe(401);
});
```

### OWASP considerations for test frameworks

| Risk | Mitigation in this project |
|------|---------------------------|
| Credential exposure | GitHub Secrets + .gitignore |
| Log injection | Structured Winston logging (no raw string concat) |
| Dependency vulnerabilities | `npm audit` in CI pipeline |
| Supply chain attacks | `package-lock.json` committed; `npm ci` (not `npm install`) in CI |

---

## 🌍 Environment-Specific Security Concerns

### Local Development

| Concern | Risk | Mitigation |
|---------|------|------------|
| `.env.local` accidentally committed | Credentials exposed in git | `.gitignore` + pre-commit hook |
| Verbose logging exposes credentials | Logs visible to teammates | Never log passwords or tokens (see Audit Logging) |
| Browser traces capture passwords | Password visible in trace | Playwright auto-masks `type="password"` inputs |

### CI/CD (GitHub Actions)

| Concern | Risk | Mitigation |
|---------|------|------------|
| Secrets visible in workflow logs | Credential exposure | GitHub automatically masks `***` |
| Fork PRs access secrets | Malicious fork steals credentials | GitHub blocks secret access for fork PRs by default |
| Workflow file edited by attacker | Runs malicious code with secrets | Branch protection rules; require PR review |
| Long-lived tokens | Broad attack surface if leaked | Rotate credentials every 90 days |

### Docker

| Concern | Risk | Mitigation |
|---------|------|------------|
| Credentials baked into image | Exposed in `docker history` | Pass as runtime env vars, never `COPY .env` |
| Public Docker Hub push with secrets | Credentials in image layers | Use multi-stage builds; secrets never in final layer |

### Staging / Production

| Concern | Risk | Mitigation |
|---------|------|------------|
| Test accounts with broad permissions | Over-privileged test user | Create a dedicated test role with minimal permissions |
| Test data pollutes production | Real users see test entries | Use dedicated staging; never run against production |
| PII in test data | GDPR/compliance violations | Use Faker for all personal data; never real PII |

---

## 🔍 Security Audit Trail

This section documents the security posture of the project over time.

### Audit Checklist (Run Before Any Release)

- [ ] `npm audit` passes with no high/critical vulnerabilities
- [ ] No credentials in git history (`git log -p | grep -i password`)
- [ ] GitHub Secrets configured and not expired
- [ ] `.env.local` is listed in `.gitignore` and not tracked
- [ ] No hardcoded credentials in test files or page objects
- [ ] Playwright traces do not capture raw password values
- [ ] Test data uses generated (Faker) values — no real PII

### Running a Security Audit

```bash
# Check for dependency vulnerabilities
npm audit

# Auto-fix fixable vulnerabilities
npm audit fix

# Check for accidentally staged secrets
git diff --cached | grep -i "password\|secret\|token\|api_key"

# Verify no secrets in committed files
git log --all -p | grep -i "admin123\|password" | head -20
```

### Historical Audit Log

| Date | Auditor | Findings | Actions Taken |
|------|---------|---------|--------------|
| Project start | Team | No secrets in git | Pre-commit hook added |
| Ongoing | CI (`npm audit`) | Dependency vulnerabilities | Auto-fixed via `npm audit fix` |

---



### Never hardcode credentials

```typescript
// ❌ NEVER — exposed in source control and logs
await loginPage.login('Admin', 'admin123');

// ✅ Always use environment variables
await loginPage.login(config.adminUsername, config.adminPassword);
```

### Never log sensitive values

```typescript
// ❌ Exposes token in CI logs
console.log('Using token:', authToken);
logger.info(`Password: ${config.adminPassword}`);

// ✅ Log only non-sensitive context
logger.info('Authenticating as admin user');
```

### Never commit `.env.local`

```bash
# ❌ This exposes all your credentials
git add .env.local

# ✅ The file is gitignored — this should be a no-op
```

### Never store secrets in test data files

```typescript
// ❌ Checked into source control
const TEST_DATA = {
  admin: { username: 'Admin', password: 'admin123' }  // ← in source control!
};

// ✅ Read from environment
const TEST_DATA = {
  admin: { username: config.adminUsername, password: config.adminPassword }
};
```

### Never disable SSL verification in tests

```typescript
// ❌ Makes MITM attacks possible
const request = await playwright.request.newContext({ ignoreHTTPSErrors: true });

// ✅ Fix the actual SSL issue instead
```

---

[← Back to docs/](.) | [CONTRIBUTING.md](CONTRIBUTING.md) | [Main README](../README.md)
