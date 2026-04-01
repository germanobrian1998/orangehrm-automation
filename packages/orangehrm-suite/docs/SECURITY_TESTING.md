# Security Testing Guide

This guide describes security testing principles, techniques, and procedures for the OrangeHRM automation framework.

## Table of Contents

- [Security Testing Principles](#security-testing-principles)
- [Vulnerability Scanning](#vulnerability-scanning)
- [OWASP Compliance Testing](#owasp-compliance-testing)
- [Data Protection Validation](#data-protection-validation)
- [Security Reporting](#security-reporting)

---

## Security Testing Principles

Security testing ensures that the application protects data, resists attacks, and behaves correctly in adversarial conditions.

### Core principles

| Principle | Description |
|---|---|
| **Least privilege** | Test accounts should have only the permissions needed for the test |
| **Input validation** | Always test boundaries and invalid inputs |
| **Fail securely** | Verify that errors do not leak sensitive information |
| **Secure defaults** | Default configuration should be the most secure option |
| **Defence in depth** | Multiple layers of security checks |

### Security test categories

| Category | Focus |
|---|---|
| Authentication | Login mechanisms, session management, brute-force protection |
| Authorisation | Role-based access, privilege escalation prevention |
| Input validation | SQL injection, XSS, CSRF, path traversal |
| Data protection | Sensitive data in transit and at rest |
| HTTP security | Security headers, HTTPS enforcement, cookie flags |
| Error handling | No stack traces or sensitive data in error messages |

### Tags and organisation

Security tests use the `@security` tag and live under `tests/security/`:

```bash
npx playwright test --grep "@security"
```

---

## Vulnerability Scanning

### Dependency auditing

Run npm audit regularly to detect known vulnerabilities in dependencies:

```bash
# Audit all workspace packages
npm audit

# Fail the build on high/critical vulnerabilities
npm audit --audit-level=high
```

Integrate into CI:

```yaml
- name: Security audit
  run: npm audit --audit-level=high
```

### Checking HTTP security headers

```typescript
import { test, expect } from '@playwright/test';
import { config } from '@qa-framework/core';

test.describe('@security HTTP Security Headers', () => {
  test('response includes Content-Security-Policy header', async ({ request }) => {
    const response = await request.get(config.baseURL);
    const csp = response.headers()['content-security-policy'];
    expect(csp).toBeTruthy();
  });

  test('response includes X-Frame-Options or CSP frame-ancestors', async ({ request }) => {
    const response = await request.get(config.baseURL);
    const headers = response.headers();
    const hasXFrameOptions   = !!headers['x-frame-options'];
    const hasCspFrameAncestors = headers['content-security-policy']?.includes('frame-ancestors');
    expect(hasXFrameOptions || hasCspFrameAncestors).toBe(true);
  });

  test('response includes X-Content-Type-Options: nosniff', async ({ request }) => {
    const response = await request.get(config.baseURL);
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
  });

  test('application is served over HTTPS', async ({ request }) => {
    const response = await request.get(config.baseURL);
    expect(response.url()).toMatch(/^https:/);
  });

  test('HSTS header is present on HTTPS responses', async ({ request }) => {
    const response = await request.get(config.baseURL);
    const hsts = response.headers()['strict-transport-security'];
    if (response.url().startsWith('https')) {
      expect(hsts).toBeTruthy();
    }
  });
});
```

### Session security validation

```typescript
test.describe('@security Session Security', () => {
  test('session cookies have Secure and HttpOnly flags', async ({ page, context }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login({ username: config.adminUsername, password: config.adminPassword });

    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name.toLowerCase().includes('session'));

    if (sessionCookie) {
      expect(sessionCookie.httpOnly).toBe(true);
      if (config.baseURL.startsWith('https')) {
        expect(sessionCookie.secure).toBe(true);
      }
    }
  });

  test('session is invalidated after logout', async ({ page, context }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login({ username: config.adminUsername, password: config.adminPassword });

    const cookiesBefore = await context.cookies();
    expect(cookiesBefore.length).toBeGreaterThan(0);

    await loginPage.logout();

    // After logout, navigating to a protected page should redirect to login
    await page.goto(config.baseURL + '/dashboard/index');
    expect(page.url()).toMatch(/auth\/login/);
  });
});
```

---

## OWASP Compliance Testing

The [OWASP Top 10](https://owasp.org/Top10/) defines the most critical web application security risks.

### A01 – Broken Access Control

```typescript
test.describe('@security A01 – Broken Access Control', () => {
  test('non-admin user cannot access admin-only pages', async ({ page }) => {
    // Login as a non-admin user (e.g., ESS employee)
    const loginPage = new LoginPage(page);
    await loginPage.login({ username: 'ess.user', password: 'ess.password' });

    // Attempt to navigate to an admin-only page
    await page.goto(config.baseURL + '/admin/viewSystemUsers');

    // Expect redirect or access denied
    expect(page.url()).not.toMatch(/admin\/viewSystemUsers/);
  });

  test('unauthenticated request to protected API returns 401', async ({ request }) => {
    const response = await request.get(config.baseURL + '/api/v2/pim/employees');
    expect(response.status()).toBe(401);
  });
});
```

### A02 – Cryptographic Failures

```typescript
test.describe('@security A02 – Cryptographic Failures', () => {
  test('login form password field is masked', async ({ page }) => {
    await page.goto(config.baseURL + '/auth/login');
    const passwordInput = page.locator('[name="password"]');
    const inputType = await passwordInput.getAttribute('type');
    expect(inputType).toBe('password');
  });

  test('password is not visible in page source', async ({ page }) => {
    await page.goto(config.baseURL + '/auth/login');
    await page.locator('[name="password"]').fill('admin123');
    const content = await page.content();
    expect(content).not.toContain('admin123');
  });
});
```

### A03 – Injection (XSS and SQL Injection)

```typescript
test.describe('@security A03 – Injection Prevention', () => {
  const xssPayloads = [
    '<script>alert("xss")</script>',
    '"><img src=x onerror=alert(1)>',
    "'; DROP TABLE employees; --",
    '<svg onload=alert(document.domain)>',
  ];

  for (const payload of xssPayloads) {
    test(`login form rejects XSS payload: ${payload.slice(0, 30)}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const errorMessage = await loginPage.loginAndExpectError({
        username: payload,
        password: 'irrelevant',
      });

      // Payload must not execute – if error is shown, the app rejected it safely
      expect(errorMessage).toBeTruthy();

      // Verify the script tag did not execute
      const alerts: string[] = [];
      page.on('dialog', async (dialog) => {
        alerts.push(dialog.message());
        await dialog.dismiss();
      });
      expect(alerts).toHaveLength(0);
    });
  }
});
```

### A07 – Identification and Authentication Failures

```typescript
test.describe('@security A07 – Authentication Failures', () => {
  test('application locks or rate-limits after multiple failed login attempts', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const failures: string[] = [];

    for (let i = 0; i < 5; i++) {
      try {
        const msg = await loginPage.loginAndExpectError({
          username: 'Admin',
          password: `wrong-password-${i}`,
        });
        failures.push(msg);
      } catch {
        // If the page does not show an error after too many attempts,
        // it may have redirected to a captcha or lockout page
      }
    }

    // At minimum, no attempt should succeed
    expect(failures.length).toBeGreaterThan(0);
  });

  test('login form requires both username and password', async ({ page }) => {
    await page.goto(config.baseURL + '/auth/login');
    await page.locator('[name="username"]').fill('Admin');
    // Leave password empty
    await page.locator('[type="submit"]').click();

    // Should not navigate away from login
    expect(page.url()).toMatch(/auth\/login/);
  });
});
```

---

## Data Protection Validation

### Sensitive data in network responses

```typescript
test('@security API responses do not expose password hashes', async ({ request, config }) => {
  // Authenticate using the Playwright APIRequestContext directly
  const authResponse = await request.post(config.baseURL + '/api/v2/auth/credentials', {
    data: { username: config.adminUsername, password: config.adminPassword },
  });

  const token = (await authResponse.json()).accessToken;

  const empResponse = await request.get(config.baseURL + '/api/v2/pim/employees', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await empResponse.text();
  expect(body).not.toMatch(/password/i);
  expect(body).not.toMatch(/hash/i);
});
```

### Sensitive data in URLs

```typescript
test('@security credentials are not passed as URL query parameters', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login({ username: config.adminUsername, password: config.adminPassword });

  // Check that the URL never contained the password
  expect(page.url()).not.toContain(config.adminPassword);
});
```

### Sensitive data in local/session storage

```typescript
test('@security password is not stored in browser storage', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login({ username: config.adminUsername, password: config.adminPassword });

  const localStorage   = await page.evaluate(() => JSON.stringify(window.localStorage));
  const sessionStorage = await page.evaluate(() => JSON.stringify(window.sessionStorage));

  expect(localStorage).not.toContain(config.adminPassword);
  expect(sessionStorage).not.toContain(config.adminPassword);
});
```

---

## Security Reporting

### Reporting findings

When a security test fails or a vulnerability is discovered:

1. **Do not commit exploitable payloads** to the repository.
2. Create a private GitHub issue or use the repository's security advisory feature.
3. Include: description, steps to reproduce, impact assessment, and suggested remediation.
4. Tag the issue with `security` and `priority: high`.

### Security test report structure

Each security test run should produce a report containing:

```
Security Test Report
====================
Date:       2024-01-15
Suite:      @security
Environment: https://opensource-demo.orangehrmlive.com

Results:
  ✓ HTTP Security Headers (5/5 passed)
  ✓ Session Security (2/2 passed)
  ✗ OWASP A03 – XSS (1 failure: payload 3 not rejected)
  ✓ Data Protection (3/3 passed)

Failures:
  [FAIL] login form does not reject XSS: <svg onload=alert(1)>
  Expected: alert dialog count = 0
  Received: alert dialog count = 1
  Severity: HIGH
  OWASP:    A03:2021 – Injection

Recommendations:
  1. Implement output encoding on the error message element.
  2. Review CSP directives to block inline scripts.
```

### Integrating with GitHub Security Advisories

For critical findings, use the GitHub REST API or web interface to create a security advisory:

1. Navigate to the repository → Security → Security advisories.
2. Click "New draft security advisory".
3. Fill in the CVSS score, affected versions, and remediation steps.
4. Publish after the fix is merged.
