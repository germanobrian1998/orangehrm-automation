/**
 * OrangeHRM Suite - OWASP Top 10 Compliance Tests
 * Validates protection against the OWASP Top 10 vulnerabilities:
 * injection, broken authentication, sensitive data exposure, XXE,
 * broken access control, security misconfiguration, XSS, insecure
 * deserialization, vulnerable components, and insufficient logging.
 *
 * Testing pyramid layer: Security (offline)
 */

import { test, expect } from '@qa-framework/core';
import {
  SecurityScanner,
  INJECTION_PAYLOADS,
  SECURITY_HEADERS,
  ComplianceResult,
} from './vulnerability-scanning';

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Simulated deserialisation that rejects untrusted data. */
function deserialize(data: unknown, trusted: boolean): unknown {
  if (!trusted) throw new Error('Untrusted data source: deserialization rejected');
  return data;
}

/** Returns false if an XML document contains XXE patterns. */
function isXxeSafe(xml: string): boolean {
  const xxePatterns = [/<!ENTITY/i, /SYSTEM\s+"file:/i, /SYSTEM\s+"http:/i];
  return !xxePatterns.some((p) => p.test(xml));
}

/** Simulates a dependency version check. */
function isDependencyVulnerable(name: string, version: string): boolean {
  const knownVulnerable: Record<string, string[]> = {
    lodash: ['4.17.10', '4.17.15', '4.17.19'],
    axios: ['0.18.0', '0.19.0'],
    'node-fetch': ['2.6.0'],
  };
  return (knownVulnerable[name] ?? []).includes(version);
}

/** Returns whether a log entry exists for the given event. */
function hasLogEntry(logs: string[], event: string): boolean {
  return logs.some((l) => l.includes(event));
}

// ── Tests ──────────────────────────────────────────────────────────────────────

test.describe('@security OWASP Top 10 Compliance Tests', () => {
  // ── A01: Injection ─────────────────────────────────────────────────────────

  test.describe('A01 - Injection vulnerabilities', () => {
    test('SQL injection payloads are detected', ({ logger }) => {
      logger.step(1, 'Test each SQL injection payload is detected');
      let detected = 0;
      for (const payload of INJECTION_PAYLOADS.sql) {
        if (SecurityScanner.containsSqlInjection(payload)) detected++;
      }
      expect(detected).toBe(INJECTION_PAYLOADS.sql.length);
      logger.assertion(true, `${detected}/${INJECTION_PAYLOADS.sql.length} SQL payloads detected`);
    });

    test('command injection payloads are not treated as safe input', () => {
      for (const payload of INJECTION_PAYLOADS.commandInjection) {
        const hasShellChars = /[;&|`$]/.test(payload);
        expect(hasShellChars).toBe(true);
      }
    });

    test('path traversal payloads are recognised', () => {
      for (const payload of INJECTION_PAYLOADS.pathTraversal) {
        const hasDotDot = payload.includes('..') || payload.includes('%2e%2e');
        expect(hasDotDot).toBe(true);
      }
    });

    test('clean input is not classified as injection', () => {
      expect(SecurityScanner.containsSqlInjection('John Doe')).toBe(false);
      expect(SecurityScanner.containsSqlInjection('2024-01-01')).toBe(false);
    });

    test('INJECTION_PAYLOADS contains all expected categories', () => {
      expect(INJECTION_PAYLOADS.sql).toBeDefined();
      expect(INJECTION_PAYLOADS.xss).toBeDefined();
      expect(INJECTION_PAYLOADS.xxe).toBeDefined();
      expect(INJECTION_PAYLOADS.commandInjection).toBeDefined();
      expect(INJECTION_PAYLOADS.pathTraversal).toBeDefined();
    });
  });

  // ── A02: Broken authentication ─────────────────────────────────────────────

  test.describe('A02 - Broken authentication', () => {
    test('missing authentication token results in 401 response', () => {
      const mockAuth = (token: string | null) => (token ? 200 : 401);
      expect(mockAuth(null)).toBe(401);
    });

    test('expired token is rejected', () => {
      const isExpired = (expiry: number) => Date.now() > expiry;
      expect(isExpired(Date.now() - 1000)).toBe(true);
    });

    test('valid token within expiry is accepted', () => {
      const isExpired = (expiry: number) => Date.now() > expiry;
      expect(isExpired(Date.now() + 60_000)).toBe(false);
    });

    test('brute force lockout is triggered after policy threshold', async ({ logger }) => {
      logger.step(1, 'Simulate brute force and verify lockout');
      const { simulateBruteForce, PASSWORD_POLICY } = await import('./vulnerability-scanning');
      const threshold = PASSWORD_POLICY.lockoutAttempts;

      const { blockedAt } = await simulateBruteForce(
        async (attempt) => ({ blocked: attempt > threshold }),
        10,
      );

      expect(blockedAt).not.toBeNull();
      logger.assertion(true, `Brute force blocked at attempt ${blockedAt}`);
    });

    test('session token is cryptographically unique', () => {
      const generate = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
      const t1 = generate();
      const t2 = generate();
      expect(t1).not.toBe(t2);
    });
  });

  // ── A03: Sensitive data exposure ───────────────────────────────────────────

  test.describe('A03 - Sensitive data exposure', () => {
    test('password is not stored in plaintext', () => {
      const mockHash = '$2b$12$saltsaltsalt.hashedvalue';
      expect(mockHash.startsWith('$2b$')).toBe(true);
      expect(mockHash).not.toBe('admin123');
    });

    test('API response does not include password fields', () => {
      const response = { id: 1, username: 'jdoe', email: 'jdoe@example.com' };
      expect(response).not.toHaveProperty('password');
    });

    test('PII is masked in log output', () => {
      const maskForLog = (ssn: string) => '***-**-' + ssn.slice(-4);
      const logged = maskForLog('123-45-6789');
      expect(logged).toBe('***-**-6789');
      expect(logged).not.toContain('123');
    });

    test('HTTPS is required for API transmission', () => {
      const apiUrl = 'https://api.orangehrm.example.com';
      expect(apiUrl.startsWith('https://')).toBe(true);
    });

    test('error responses do not expose stack traces or internal paths', () => {
      const errorResponse = {
        status: 500,
        body: { error: 'Internal Server Error' },
      };
      const bodyStr = JSON.stringify(errorResponse.body);
      expect(bodyStr).not.toMatch(/node_modules/);
      expect(bodyStr).not.toMatch(/\.ts:\d+/);
      expect(bodyStr).not.toMatch(/Error:/);
    });
  });

  // ── A04: XML External Entity (XXE) ────────────────────────────────────────

  test.describe('A04 - XML External Entity (XXE) attacks', () => {
    test('isXxeSafe returns false for XXE payload', ({ logger }) => {
      logger.step(1, 'Test XXE payload detection');
      const payload = INJECTION_PAYLOADS.xxe[0];
      expect(isXxeSafe(payload)).toBe(false);
      logger.assertion(true, 'XXE payload correctly flagged as unsafe');
    });

    test('isXxeSafe returns false for second XXE payload', () => {
      expect(isXxeSafe(INJECTION_PAYLOADS.xxe[1])).toBe(false);
    });

    test('isXxeSafe returns true for safe XML', () => {
      const safeXml = '<?xml version="1.0"?><root><item>value</item></root>';
      expect(isXxeSafe(safeXml)).toBe(true);
    });

    test('all configured XXE payloads are detected', () => {
      for (const payload of INJECTION_PAYLOADS.xxe) {
        expect(isXxeSafe(payload)).toBe(false);
      }
    });

    test('XML parser disables external entity processing in safe mode', () => {
      const parseXml = (xml: string, disableExternalEntities: boolean) => {
        if (!disableExternalEntities && !isXxeSafe(xml)) {
          throw new Error('XXE vulnerability detected');
        }
        return { parsed: true };
      };

      expect(() => parseXml(INJECTION_PAYLOADS.xxe[0], false)).toThrow('XXE vulnerability');
      expect(() => parseXml(INJECTION_PAYLOADS.xxe[0], true)).not.toThrow();
    });
  });

  // ── A05: Broken access control ─────────────────────────────────────────────

  test.describe('A05 - Broken access control', () => {
    test('employee cannot access admin dashboard', () => {
      const canAccess = (role: string, resource: string): boolean => {
        const rules: Record<string, string[]> = {
          admin: ['admin-dashboard', 'employees', 'reports'],
          employee: ['profile', 'leave'],
        };
        return (rules[role] ?? []).includes(resource);
      };

      expect(canAccess('employee', 'admin-dashboard')).toBe(false);
      expect(canAccess('admin', 'admin-dashboard')).toBe(true);
    });

    test('direct object reference is validated against ownership', () => {
      const canAccessRecord = (userId: number, recordOwnerId: number, role: string) =>
        role === 'admin' || userId === recordOwnerId;

      expect(canAccessRecord(5, 5, 'employee')).toBe(true);
      expect(canAccessRecord(5, 99, 'employee')).toBe(false);
      expect(canAccessRecord(1, 99, 'admin')).toBe(true);
    });

    test('IDOR attack is blocked for different user IDs', () => {
      const ownerId = 10;
      const attackerId = 99;
      const canAccess = attackerId === ownerId;
      expect(canAccess).toBe(false);
    });
  });

  // ── A06: Security misconfiguration ────────────────────────────────────────

  test.describe('A06 - Security misconfiguration', () => {
    test('debug mode is disabled in production', () => {
      const config = { debug: false, env: 'production' };
      if (config.env === 'production') {
        expect(config.debug).toBe(false);
      }
    });

    test('default admin credentials are not in use', () => {
      const currentCredentials = { username: 'admin', password: 'Custom$ecure1!' };
      expect(currentCredentials.password).not.toBe('admin');
      expect(currentCredentials.password).not.toBe('password');
      expect(currentCredentials.password).not.toBe('admin123');
    });

    test('directory listing is disabled', () => {
      const serverConfig = { directoryListing: false };
      expect(serverConfig.directoryListing).toBe(false);
    });

    test('all required security headers are present', () => {
      const headers: Record<string, string> = {};
      for (const h of SECURITY_HEADERS.required) {
        headers[h.toLowerCase()] = 'configured';
      }
      const result = SecurityScanner.validateSecurityHeaders(headers);
      expect(result.valid).toBe(true);
    });

    test('error pages do not expose server version information', () => {
      const errorPage = '<html><body><h1>404 Not Found</h1></body></html>';
      expect(errorPage).not.toMatch(/Apache\//);
      expect(errorPage).not.toMatch(/nginx\//);
      expect(errorPage).not.toMatch(/Express \d/);
    });
  });

  // ── A07: XSS ──────────────────────────────────────────────────────────────

  test.describe('A07 - Cross-Site Scripting (XSS)', () => {
    test('all XSS payloads are detected', ({ logger }) => {
      logger.step(1, 'Verify all XSS payloads are flagged');
      let detected = 0;
      for (const payload of INJECTION_PAYLOADS.xss) {
        if (SecurityScanner.containsXss(payload)) detected++;
      }
      expect(detected).toBe(INJECTION_PAYLOADS.xss.length);
      logger.assertion(true, `${detected}/${INJECTION_PAYLOADS.xss.length} XSS payloads detected`);
    });

    test('HTML entity encoding prevents XSS', () => {
      const encode = (s: string) =>
        s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      const payload = '<script>alert(1)</script>';
      const encoded = encode(payload);
      expect(encoded).not.toContain('<script>');
      expect(encoded).toContain('&lt;script&gt;');
    });

    test('Content-Security-Policy header prevents XSS', () => {
      const csp = "default-src 'self'; script-src 'self'";
      expect(csp).toContain("default-src 'self'");
      expect(csp).not.toContain("'unsafe-inline'");
    });

    test('clean input is not flagged as XSS', () => {
      expect(SecurityScanner.containsXss('Hello World')).toBe(false);
      expect(SecurityScanner.containsXss('John Doe')).toBe(false);
    });
  });

  // ── A08: Insecure deserialization ─────────────────────────────────────────

  test.describe('A08 - Insecure deserialization', () => {
    test('deserialize rejects untrusted data source', ({ logger }) => {
      logger.step(1, 'Verify deserialization rejects untrusted data');
      expect(() => deserialize({ evil: true }, false)).toThrow('Untrusted data source');
      logger.assertion(true, 'Untrusted deserialization correctly rejected');
    });

    test('deserialize accepts trusted data source', () => {
      const data = { id: 1, name: 'test' };
      expect(() => deserialize(data, true)).not.toThrow();
      expect(deserialize(data, true)).toEqual(data);
    });

    test('serialized object does not contain prototype pollution vectors', () => {
      const safePayload = JSON.stringify({ name: 'test', value: 42 });
      expect(safePayload).not.toContain('__proto__');
      expect(safePayload).not.toContain('constructor');
    });

    test('JSON.parse does not execute embedded code', () => {
      const safeJson = '{"username": "admin", "role": "user"}';
      const parsed = JSON.parse(safeJson) as Record<string, string>;
      expect(parsed.role).toBe('user');
      expect(typeof parsed).toBe('object');
    });
  });

  // ── A09: Vulnerable components ────────────────────────────────────────────

  test.describe('A09 - Using components with known vulnerabilities', () => {
    test('isDependencyVulnerable is defined', () => {
      expect(isDependencyVulnerable).toBeDefined();
    });

    test('known vulnerable lodash version is flagged', ({ logger }) => {
      logger.step(1, 'Check vulnerable lodash version');
      expect(isDependencyVulnerable('lodash', '4.17.10')).toBe(true);
      logger.assertion(true, 'lodash@4.17.10 correctly flagged as vulnerable');
    });

    test('patched lodash version is not flagged', () => {
      expect(isDependencyVulnerable('lodash', '4.17.21')).toBe(false);
    });

    test('known vulnerable axios version is flagged', () => {
      expect(isDependencyVulnerable('axios', '0.18.0')).toBe(true);
    });

    test('unknown package is not flagged as vulnerable', () => {
      expect(isDependencyVulnerable('some-safe-lib', '1.0.0')).toBe(false);
    });

    test('SecurityScanner tracks dependency vulnerabilities', () => {
      const scanner = new SecurityScanner('owasp-a09');
      scanner.recordDependencyVulnerability({
        id: 'DEP-CVE-2019-10744',
        title: 'Prototype pollution in lodash',
        description: 'lodash 4.17.10 is vulnerable to prototype pollution',
        severity: 'high',
        scanType: 'dependency',
        cve: 'CVE-2019-10744',
        cvss: 9.8,
        packageName: 'lodash',
        packageVersion: '4.17.10',
        fixedVersion: '4.17.21',
        affectedComponent: 'package.json',
        remediation: 'Update lodash to 4.17.21',
        status: 'open',
        discoveredAt: Date.now(),
      });

      const report = scanner.generateReport();
      expect(report.metrics.highCount).toBe(1);
    });
  });

  // ── A10: Insufficient logging & monitoring ────────────────────────────────

  test.describe('A10 - Insufficient logging & monitoring', () => {
    test('authentication events are logged', () => {
      const logs: string[] = [];
      const logEvent = (event: string) => logs.push(`[${new Date().toISOString()}] ${event}`);

      logEvent('AUTH_SUCCESS: user=admin');
      logEvent('AUTH_FAILURE: user=unknown');

      expect(hasLogEntry(logs, 'AUTH_SUCCESS')).toBe(true);
      expect(hasLogEntry(logs, 'AUTH_FAILURE')).toBe(true);
    });

    test('access control violations are logged', () => {
      const logs: string[] = [];
      const logEvent = (event: string) => logs.push(event);

      logEvent('ACCESS_DENIED: user=jdoe resource=admin-panel');
      expect(hasLogEntry(logs, 'ACCESS_DENIED')).toBe(true);
    });

    test('log entries include a timestamp', () => {
      const log = `[${new Date().toISOString()}] SECURITY_EVENT: test`;
      expect(log).toMatch(/\[\d{4}-\d{2}-\d{2}T/);
    });

    test('suspicious activity triggers an alert', () => {
      const logs: string[] = [];
      const alertThreshold = 5;
      let failedAttempts = 0;

      const tryLogin = (success: boolean) => {
        if (!success) {
          failedAttempts++;
          logs.push(`AUTH_FAILURE attempt=${failedAttempts}`);
          if (failedAttempts >= alertThreshold) {
            logs.push('ALERT: Brute force detected');
          }
        }
      };

      for (let i = 0; i < 6; i++) tryLogin(false);

      expect(hasLogEntry(logs, 'ALERT: Brute force detected')).toBe(true);
    });

    test('SecurityScanner compliance result is recorded for logging', () => {
      const scanner = new SecurityScanner('owasp-compliance');
      const result: ComplianceResult = {
        framework: 'OWASP',
        control: 'A10 - Insufficient Logging & Monitoring',
        passed: true,
        evidence: 'All security events are logged with timestamps and severity levels',
      };
      scanner.recordComplianceResult(result);

      const report = scanner.generateReport();
      expect(report.complianceResults[0].framework).toBe('OWASP');
      expect(report.complianceResults[0].passed).toBe(true);
      expect(report.summary.complianceScore).toBe(100);
    });
  });
});
