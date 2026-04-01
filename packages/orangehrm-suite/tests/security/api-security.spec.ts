/**
 * OrangeHRM Suite - API Security Tests
 * Tests API rate limiting, authentication tokens, input validation,
 * response sanitization, security headers, versioning security, and
 * endpoint vulnerability scanning. All tests run offline.
 *
 * Testing pyramid layer: Security (offline)
 */

import { test, expect } from '@qa-framework/core';
import {
  SecurityScanner,
  SECURITY_HEADERS,
  RATE_LIMIT_POLICY,
  INJECTION_PAYLOADS,
  validateRateLimit,
} from './vulnerability-scanning';

// ── Mock API helpers ───────────────────────────────────────────────────────────

interface ApiRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: unknown;
  token?: string;
}

interface ApiResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

/** Simulates a minimal API gateway that validates auth tokens. */
function mockApiGateway(req: ApiRequest): ApiResponse {
  if (!req.token) {
    return { status: 401, headers: {}, body: { error: 'Unauthorized' } };
  }
  if (req.token === 'expired-token') {
    return { status: 401, headers: {}, body: { error: 'Token expired' } };
  }
  if (req.token === 'invalid-token') {
    return { status: 401, headers: {}, body: { error: 'Invalid token' } };
  }
  return {
    status: 200,
    headers: {
      'strict-transport-security': 'max-age=31536000; includeSubDomains',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'content-security-policy': "default-src 'self'",
      'x-xss-protection': '1; mode=block',
      'referrer-policy': 'strict-origin-when-cross-origin',
    },
    body: { data: 'ok' },
  };
}

/** Sanitizes API response body by removing HTML/script tags and dangerous URL schemes. */
function sanitizeResponse(body: unknown): unknown {
  if (typeof body === 'string') {
    // Iteratively strip tags to handle nested/partial patterns, then remove
    // all dangerous URL schemes (javascript:, data:, vbscript:).
    let result = body;
    let prev = '';
    while (prev !== result) {
      prev = result;
      result = result.replace(/<[^>]*>/g, '');
    }
    return result.replace(/(javascript|data|vbscript):/gi, '');
  }
  if (Array.isArray(body)) {
    return body.map(sanitizeResponse);
  }
  if (body !== null && typeof body === 'object') {
    return Object.fromEntries(
      Object.entries(body as Record<string, unknown>).map(([k, v]) => [
        k,
        sanitizeResponse(v),
      ]),
    );
  }
  return body;
}

/** Validates that API input does not contain injection payloads. */
function validateApiInput(input: string): { valid: boolean; reason?: string } {
  if (SecurityScanner.containsSqlInjection(input)) {
    return { valid: false, reason: 'SQL injection detected' };
  }
  if (SecurityScanner.containsXss(input)) {
    return { valid: false, reason: 'XSS payload detected' };
  }
  return { valid: true };
}

/** Extracts the major version from an API path like /api/v2/employees. */
function extractApiVersion(path: string): number | null {
  const match = path.match(/\/v(\d+)\//);
  return match ? parseInt(match[1], 10) : null;
}

// ── Tests ──────────────────────────────────────────────────────────────────────

test.describe('@security API Security Tests', () => {
  // ── 1. API rate limiting ───────────────────────────────────────────────────

  test.describe('API rate limiting', () => {
    test('validateRateLimit is importable', () => {
      expect(validateRateLimit).toBeDefined();
    });

    test('RATE_LIMIT_POLICY is defined with expected fields', () => {
      expect(RATE_LIMIT_POLICY.maxRequestsPerMinute).toBeGreaterThan(0);
      expect(RATE_LIMIT_POLICY.maxLoginAttemptsPerMinute).toBeGreaterThan(0);
      expect(RATE_LIMIT_POLICY.maxApiCallsPerHour).toBeGreaterThan(0);
    });

    test('rate limit is enforced after the configured threshold', async ({ logger }) => {
      logger.step(1, 'Simulate rate limiting after 5 requests per minute');
      const limit = 5;
      let callCount = 0;

      const result = await validateRateLimit(
        async (n) => {
          callCount = n;
          return { rateLimited: n > limit };
        },
        limit,
      );

      expect(result.enforced).toBe(true);
      expect(result.limitHitAt).toBeGreaterThan(limit);
      logger.assertion(true, `Rate limit enforced at request ${result.limitHitAt}`);
    });

    test('requests within the rate limit are not blocked', async () => {
      const limit = 100;
      const result = await validateRateLimit(
        async () => ({ rateLimited: false }),
        limit,
      );
      expect(result.enforced).toBe(false);
      expect(result.limitHitAt).toBeNull();
    });

    test('burst limit is a multiple of the base limit', () => {
      const burst = RATE_LIMIT_POLICY.maxRequestsPerMinute * RATE_LIMIT_POLICY.burstLimitMultiplier;
      expect(burst).toBeGreaterThan(RATE_LIMIT_POLICY.maxRequestsPerMinute);
    });
  });

  // ── 2. API authentication tokens ──────────────────────────────────────────

  test.describe('API authentication token verification', () => {
    test('request without token returns 401', ({ logger }) => {
      logger.step(1, 'Make API call without auth token');
      const response = mockApiGateway({
        method: 'GET',
        path: '/api/v1/employees',
        headers: {},
      });
      expect(response.status).toBe(401);
      logger.assertion(true, 'Unauthenticated request correctly returned 401');
    });

    test('request with expired token returns 401', () => {
      const response = mockApiGateway({
        method: 'GET',
        path: '/api/v1/employees',
        headers: {},
        token: 'expired-token',
      });
      expect(response.status).toBe(401);
    });

    test('request with invalid token returns 401', () => {
      const response = mockApiGateway({
        method: 'GET',
        path: '/api/v1/employees',
        headers: {},
        token: 'invalid-token',
      });
      expect(response.status).toBe(401);
    });

    test('request with valid token returns 200', () => {
      const response = mockApiGateway({
        method: 'GET',
        path: '/api/v1/employees',
        headers: { authorization: 'Bearer valid-jwt-token' },
        token: 'valid-jwt-token',
      });
      expect(response.status).toBe(200);
    });

    test('JWT token has three base64url parts separated by dots', () => {
      const mockJwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const parts = mockJwt.split('.');
      expect(parts).toHaveLength(3);
    });

    test('token payload contains required claims', () => {
      const payload = { sub: '42', iat: Date.now(), exp: Date.now() + 3600_000, role: 'employee' };
      expect(payload.sub).toBeDefined();
      expect(payload.iat).toBeDefined();
      expect(payload.exp).toBeDefined();
      expect(payload.exp).toBeGreaterThan(payload.iat);
    });
  });

  // ── 3. API input validation ────────────────────────────────────────────────

  test.describe('API input validation', () => {
    test('validateApiInput accepts clean input', () => {
      const result = validateApiInput('John Doe');
      expect(result.valid).toBe(true);
    });

    test('validateApiInput rejects SQL injection input', ({ logger }) => {
      logger.step(1, 'Validate SQL injection is rejected at API layer');
      const payload = INJECTION_PAYLOADS.sql[0];
      const result = validateApiInput(payload);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('SQL injection detected');
      logger.assertion(true, `Input rejected: ${result.reason}`);
    });

    test('validateApiInput rejects XSS payload', () => {
      const payload = INJECTION_PAYLOADS.xss[0];
      const result = validateApiInput(payload);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('XSS payload detected');
    });

    test('all SQL injection payloads are rejected at API layer', () => {
      for (const payload of INJECTION_PAYLOADS.sql) {
        const result = validateApiInput(payload);
        expect(result.valid).toBe(false);
      }
    });

    test('all XSS payloads are rejected at API layer', () => {
      for (const payload of INJECTION_PAYLOADS.xss) {
        const result = validateApiInput(payload);
        expect(result.valid).toBe(false);
      }
    });

    test('empty string passes input validation', () => {
      const result = validateApiInput('');
      expect(result.valid).toBe(true);
    });
  });

  // ── 4. API response sanitization ──────────────────────────────────────────

  test.describe('API response sanitization', () => {
    test('sanitizeResponse removes script tags from strings', ({ logger }) => {
      logger.step(1, 'Sanitize a string containing a script tag');
      const input = 'Hello <script>alert(1)</script> World';
      const output = sanitizeResponse(input) as string;
      expect(output).not.toContain('<script>');
      expect(output).not.toContain('</script>');
      logger.assertion(true, `Sanitized output: ${output}`);
    });

    test('sanitizeResponse removes javascript: protocol', () => {
      const input = 'javascript:alert(1)';
      const output = sanitizeResponse(input) as string;
      expect(output.toLowerCase()).not.toContain('javascript:');
    });

    test('sanitizeResponse removes data: and vbscript: URL schemes', () => {
      expect((sanitizeResponse('data:text/html,<h1>XSS</h1>') as string).toLowerCase()).not.toContain('data:');
      expect((sanitizeResponse('vbscript:MsgBox(1)') as string).toLowerCase()).not.toContain('vbscript:');
    });

    test('sanitizeResponse recursively sanitizes objects', () => {
      const body = { name: '<script>xss</script>', age: 30 };
      const result = sanitizeResponse(body) as Record<string, unknown>;
      expect((result.name as string)).not.toContain('<script>');
      expect(result.age).toBe(30);
    });

    test('sanitizeResponse handles arrays', () => {
      const body = ['<img onerror=alert(1)>', 'normal text'];
      const result = sanitizeResponse(body) as string[];
      expect(result[0]).not.toContain('<img');
      expect(result[1]).toBe('normal text');
    });

    test('sanitizeResponse does not alter numbers or booleans', () => {
      expect(sanitizeResponse(42)).toBe(42);
      expect(sanitizeResponse(true)).toBe(true);
      expect(sanitizeResponse(null)).toBeNull();
    });
  });

  // ── 5. Secure API headers ──────────────────────────────────────────────────

  test.describe('Secure API headers (HSTS, CSP, etc.)', () => {
    test('SecurityScanner.validateSecurityHeaders is importable', () => {
      expect(SecurityScanner.validateSecurityHeaders).toBeDefined();
    });

    test('response with all required headers passes validation', ({ logger }) => {
      logger.step(1, 'Validate all required security headers are present');
      const response = mockApiGateway({
        method: 'GET',
        path: '/api/v1/employees',
        headers: {},
        token: 'valid-token',
      });

      const result = SecurityScanner.validateSecurityHeaders(response.headers);
      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
      logger.assertion(true, 'All required security headers present');
    });

    test('response missing Strict-Transport-Security fails validation', () => {
      const headers: Record<string, string> = {
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'DENY',
        'content-security-policy': "default-src 'self'",
        'x-xss-protection': '1; mode=block',
        'referrer-policy': 'strict-origin-when-cross-origin',
      };
      const result = SecurityScanner.validateSecurityHeaders(headers);
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('Strict-Transport-Security');
    });

    test('SECURITY_HEADERS.required contains HSTS', () => {
      expect(SECURITY_HEADERS.required).toContain('Strict-Transport-Security');
    });

    test('SECURITY_HEADERS.required contains CSP', () => {
      expect(SECURITY_HEADERS.required).toContain('Content-Security-Policy');
    });

    test('SECURITY_HEADERS.required contains X-Frame-Options', () => {
      expect(SECURITY_HEADERS.required).toContain('X-Frame-Options');
    });

    test('header validation is case-insensitive', () => {
      const headers: Record<string, string> = {
        'strict-transport-security': 'max-age=31536000',
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'DENY',
        'content-security-policy': "default-src 'self'",
        'x-xss-protection': '1; mode=block',
        'referrer-policy': 'strict-origin-when-cross-origin',
      };
      const result = SecurityScanner.validateSecurityHeaders(headers);
      expect(result.valid).toBe(true);
    });
  });

  // ── 6. API versioning security ─────────────────────────────────────────────

  test.describe('API versioning security', () => {
    test('extractApiVersion parses version from URL path', () => {
      expect(extractApiVersion('/api/v1/employees')).toBe(1);
      expect(extractApiVersion('/api/v2/employees')).toBe(2);
    });

    test('extractApiVersion returns null for unversioned paths', () => {
      expect(extractApiVersion('/api/employees')).toBeNull();
    });

    test('deprecated API version returns deprecation warning', () => {
      const DEPRECATED_VERSIONS = [1];
      const version = extractApiVersion('/api/v1/employees');
      const isDeprecated = version !== null && DEPRECATED_VERSIONS.includes(version);
      expect(isDeprecated).toBe(true);
    });

    test('current API version is not deprecated', () => {
      const DEPRECATED_VERSIONS = [1];
      const version = extractApiVersion('/api/v2/employees');
      const isDeprecated = version !== null && DEPRECATED_VERSIONS.includes(version);
      expect(isDeprecated).toBe(false);
    });

    test('unsupported version is rejected', () => {
      const SUPPORTED_VERSIONS = [1, 2];
      const requestedVersion = 99;
      expect(SUPPORTED_VERSIONS.includes(requestedVersion)).toBe(false);
    });
  });

  // ── 7. API endpoint vulnerability scanning ────────────────────────────────

  test.describe('API endpoint vulnerability scanning', () => {
    test('SecurityScanner can be instantiated for API scanning', () => {
      const scanner = new SecurityScanner('api-security');
      expect(scanner).toBeInstanceOf(SecurityScanner);
    });

    test('security finding can be recorded for an endpoint', () => {
      const scanner = new SecurityScanner('api-security');
      scanner.recordFinding({
        ruleId: 'API-001',
        ruleName: 'Missing rate limiting',
        severity: 'medium',
        file: 'routes/employees.ts',
        line: 42,
        message: 'Endpoint /api/v1/employees lacks rate limiting middleware',
        scanType: 'SAST',
      });

      const report = scanner.generateReport();
      expect(report.findings).toHaveLength(1);
      expect(report.findings[0].ruleId).toBe('API-001');
    });

    test('dependency vulnerability can be recorded', () => {
      const scanner = new SecurityScanner('api-security');
      scanner.recordDependencyVulnerability({
        id: 'DEP-001',
        title: 'Prototype pollution in lodash < 4.17.21',
        description: 'lodash is vulnerable to prototype pollution',
        severity: 'high',
        scanType: 'dependency',
        cve: 'CVE-2019-10744',
        cvss: 9.8,
        packageName: 'lodash',
        packageVersion: '4.17.10',
        fixedVersion: '4.17.21',
        affectedComponent: 'package.json',
        remediation: 'Update lodash to version 4.17.21 or later',
        status: 'open',
        discoveredAt: Date.now(),
      });

      const report = scanner.generateReport();
      expect(report.metrics.highCount).toBe(1);
    });

    test('security report includes scan types from findings', () => {
      const scanner = new SecurityScanner('api-security');
      scanner.recordFinding({
        ruleId: 'DAST-001',
        ruleName: 'Open redirect detected',
        severity: 'medium',
        message: 'Endpoint allows unvalidated redirect to external URLs',
        scanType: 'DAST',
      });

      const report = scanner.generateReport();
      expect(report.scanTypes).toContain('DAST');
    });

    test('risk score is minimal when no vulnerabilities are recorded', () => {
      const scanner = new SecurityScanner('api-security-clean');
      const report = scanner.generateReport();
      expect(report.metrics.riskScore).toBe(0);
      expect(report.summary.riskLevel).toBe('minimal');
    });
  });
});
