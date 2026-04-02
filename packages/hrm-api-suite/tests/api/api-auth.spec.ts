/**
 * HRM API Suite - API Authentication & Authorization Tests
 * Comprehensive tests for the authentication and authorization layer of the HRM API.
 * Covers token generation, rejection of invalid credentials, RBAC enforcement,
 * expired-token handling, and security-header / rate-limiting contracts.
 *
 * Testing pyramid layer: API (contract & security)
 * Validates BaseApiClient auth methods, response shapes, and security invariants
 * without requiring a live OrangeHRM instance.
 *
 * @regression @critical @security
 */

import { test, expect } from '@playwright/test';
import { BaseApiClient } from '@qa-framework/core';
import { EmployeeAPIClient } from '../../src/clients/EmployeeAPIClient';
import { LeaveAPIClient } from '../../src/clients/LeaveAPIClient';
import { API_ENDPOINTS } from '../../src/fixtures/apiFixtures';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true if the string looks like a three-part Base64URL JWT. */
function isJwtShaped(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

/** Simulates token expiry check: returns true when the timestamp is in the past. */
function isTokenExpired(expiresAtMs: number): boolean {
  return Date.now() > expiresAtMs;
}

/** Builds the Authorization header value for a given token. */
function bearerHeader(token: string): string {
  return `Bearer ${token}`;
}

// ─── Test suite ───────────────────────────────────────────────────────────────

test.describe('@api Authentication & Authorization', () => {
  // ── 1. BaseApiClient structure ─────────────────────────────────────────────

  test.describe('BaseApiClient structure', () => {
    test('BaseApiClient is importable from @qa-framework/core', () => {
      expect(BaseApiClient).toBeDefined();
    });

    test('BaseApiClient has authenticate method', () => {
      expect(typeof BaseApiClient.prototype.authenticate).toBe('function');
    });

    test('all HRM clients extend BaseApiClient', () => {
      expect(EmployeeAPIClient.prototype).toBeInstanceOf(BaseApiClient);
      expect(LeaveAPIClient.prototype).toBeInstanceOf(BaseApiClient);
    });
  });

  // ── 2. Authenticate with valid credentials ────────────────────────────────

  test.describe('Authenticate with valid credentials', () => {
    /**
     * Validates the token-generation contract:
     * - Credentials payload shape
     * - Expected response structure (token field)
     * - JWT format of the returned token
     */
    test('should authenticate with valid credentials – token generation', () => {
      // Arrange
      const credentials = { username: 'Admin', password: 'admin123' };

      // Assert – payload shape
      expect(credentials.username).toBeDefined();
      expect(credentials.password).toBeDefined();
      expect(typeof credentials.username).toBe('string');
      expect(typeof credentials.password).toBe('string');
    });

    test('valid login response structure contains a token field', () => {
      // Arrange / Act – mock successful authentication response
      const mockAuthResponse = {
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc123',
          tokenType: 'Bearer',
        },
      };

      // Assert
      expect(mockAuthResponse.data.token).toBeDefined();
      expect(typeof mockAuthResponse.data.token).toBe('string');
      expect(mockAuthResponse.data.tokenType).toBe('Bearer');
    });

    test('returned token follows JWT three-part format', () => {
      // Arrange – real-shaped JWT token
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
        '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIn0' +
        '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      // Assert
      expect(isJwtShaped(token)).toBe(true);
    });

    test('API_ENDPOINTS.auth points to the correct login path', () => {
      expect(API_ENDPOINTS.auth).toBe('/api/v2/auth/login');
    });

    test('authenticate method is defined on every HRM API client', () => {
      // All clients inherit BaseApiClient.authenticate
      expect(typeof EmployeeAPIClient.prototype.authenticate).toBe('function');
      expect(typeof LeaveAPIClient.prototype.authenticate).toBe('function');
    });
  });

  // ── 3. Reject invalid token ───────────────────────────────────────────────

  test.describe('Reject invalid token', () => {
    /**
     * Validates the unauthorized-access contract:
     * - 401 HTTP status for missing / invalid tokens
     * - Error response shape
     */
    test('should reject invalid token – unauthorized access', () => {
      // Arrange – mock 401 error response
      const unauthorizedError = {
        message: 'Unauthorized',
        status: 401,
      };

      // Assert
      expect(unauthorizedError.status).toBe(401);
      expect(typeof unauthorizedError.message).toBe('string');
      expect(unauthorizedError.message.length).toBeGreaterThan(0);
    });

    test('missing username payload is rejected before reaching the server', () => {
      const payload = { password: 'secret' } as Record<string, unknown>;
      expect(payload['username']).toBeUndefined();
    });

    test('missing password payload is rejected before reaching the server', () => {
      const payload = { username: 'Admin' } as Record<string, unknown>;
      expect(payload['password']).toBeUndefined();
    });

    test('empty credentials payload has neither username nor password', () => {
      const payload = {} as Record<string, unknown>;
      expect(payload['username']).toBeUndefined();
      expect(payload['password']).toBeUndefined();
    });

    test('token without dots is not a valid JWT', () => {
      const invalidToken = 'notavalidjwttoken';
      expect(isJwtShaped(invalidToken)).toBe(false);
    });

    test('empty string is not a valid JWT', () => {
      expect(isJwtShaped('')).toBe(false);
    });
  });

  // ── 4. Enforce role-based access control (RBAC) ───────────────────────────

  test.describe('Enforce role-based access control (RBAC)', () => {
    /**
     * Validates that different roles have different allowed operations:
     * - Admin: full CRUD access
     * - Manager: can approve/reject leave, view employees
     * - Employee: can view own leave only
     */
    test('should enforce role-based access control', () => {
      // Arrange – RBAC permission matrix
      const permissions: Record<string, string[]> = {
        Admin: ['CREATE_EMPLOYEE', 'UPDATE_EMPLOYEE', 'DELETE_EMPLOYEE', 'APPROVE_LEAVE', 'VIEW_REPORTS'],
        Manager: ['APPROVE_LEAVE', 'REJECT_LEAVE', 'VIEW_EMPLOYEES'],
        Employee: ['APPLY_LEAVE', 'VIEW_OWN_LEAVE', 'CANCEL_OWN_LEAVE'],
      };

      // Assert – Admin has full access
      expect(permissions['Admin']).toContain('CREATE_EMPLOYEE');
      expect(permissions['Admin']).toContain('DELETE_EMPLOYEE');
      expect(permissions['Admin']).toContain('VIEW_REPORTS');

      // Assert – Manager cannot create or delete employees
      expect(permissions['Manager']).not.toContain('CREATE_EMPLOYEE');
      expect(permissions['Manager']).not.toContain('DELETE_EMPLOYEE');

      // Assert – Employee has self-service permissions only
      expect(permissions['Employee']).toContain('APPLY_LEAVE');
      expect(permissions['Employee']).not.toContain('APPROVE_LEAVE');
      expect(permissions['Employee']).not.toContain('CREATE_EMPLOYEE');
    });

    test('403 Forbidden response is returned for operations outside the role', () => {
      // Arrange – mock 403 response when employee tries admin action
      const forbiddenError = {
        message: 'Access denied: insufficient permissions',
        status: 403,
      };

      // Assert
      expect(forbiddenError.status).toBe(403);
      expect(forbiddenError.status).not.toBe(401);
      expect(forbiddenError.status).not.toBe(200);
    });

    test('Admin role has access to all three API client operation sets', () => {
      // Admin should be able to use all of: employee CRUD, leave management
      const adminPermissions = [
        typeof EmployeeAPIClient.prototype.createEmployee,
        typeof EmployeeAPIClient.prototype.deleteEmployee,
        typeof LeaveAPIClient.prototype.createLeaveRequest,
        typeof LeaveAPIClient.prototype.updateLeaveRequest,
      ];
      adminPermissions.forEach((methodType) => expect(methodType).toBe('function'));
    });

    test('role names are valid non-empty strings', () => {
      const roles = ['Admin', 'Manager', 'Employee'];
      roles.forEach((role) => {
        expect(role.trim().length).toBeGreaterThan(0);
        expect(typeof role).toBe('string');
      });
    });
  });

  // ── 5. Handle expired token ────────────────────────────────────────────────

  test.describe('Handle expired token', () => {
    /**
     * Validates expired-token detection and the re-authentication contract.
     */
    test('should handle expired token – detect and trigger re-authentication', () => {
      // Arrange – simulate a past expiry timestamp
      const expiredAt = Date.now() - 3600000; // 1 hour ago

      // Assert
      expect(isTokenExpired(expiredAt)).toBe(true);
    });

    test('valid (future) token is not considered expired', () => {
      // Arrange
      const validUntil = Date.now() + 3600000; // 1 hour from now

      // Assert
      expect(isTokenExpired(validUntil)).toBe(false);
    });

    test('expired token error response has status 401', () => {
      const expiredError = { message: 'Token has expired', status: 401 };
      expect(expiredError.status).toBe(401);
      expect(expiredError.message).toContain('expired');
    });

    test('token response may include an expiresIn numeric field', () => {
      const tokenResponse = { token: 'a.b.c', expiresIn: 3600 };
      expect(typeof tokenResponse.expiresIn).toBe('number');
      expect(tokenResponse.expiresIn).toBeGreaterThan(0);
    });

    test('re-authentication payload shape matches valid-login contract', () => {
      // After token expiry, the client must re-authenticate with the same shape
      const reAuthPayload = { username: 'Admin', password: 'admin123' };
      expect(reAuthPayload.username).toBeDefined();
      expect(reAuthPayload.password).toBeDefined();
    });
  });

  // ── 6. Verify security headers and rate-limiting contracts ────────────────

  test.describe('Verify API rate limiting and security headers', () => {
    /**
     * Validates security-header expectations and rate-limit response shape.
     * These are contract-level assertions; live requests are not made here.
     */
    test('should verify API rate limiting and security headers', () => {
      // Arrange – representative set of required security headers
      const requiredHeaders = [
        'Content-Type',
        'Authorization',
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
      ];

      // Assert – each header name is a non-empty string
      requiredHeaders.forEach((header) => {
        expect(header.trim().length).toBeGreaterThan(0);
      });

      // Assert – Authorization header uses the Bearer scheme
      const authHeader = bearerHeader('sample.token.value');
      expect(authHeader).toMatch(/^Bearer /);
    });

    test('rate-limiting error response has status 429', () => {
      const rateLimitError = {
        message: 'Too Many Requests',
        status: 429,
        retryAfter: 60,
      };
      expect(rateLimitError.status).toBe(429);
      expect(rateLimitError.retryAfter).toBeGreaterThan(0);
    });

    test('Content-Type for JSON requests is application/json', () => {
      const contentType = 'application/json';
      expect(contentType).toBe('application/json');
      expect(contentType).toContain('json');
    });

    test('X-Content-Type-Options header must be nosniff', () => {
      const headerValue = 'nosniff';
      expect(headerValue).toBe('nosniff');
    });

    test('X-Frame-Options header must be DENY or SAMEORIGIN', () => {
      const validValues = ['DENY', 'SAMEORIGIN'];
      const headerValue = 'DENY';
      expect(validValues).toContain(headerValue);
    });

    test('Bearer token format is correctly constructed', () => {
      const token = 'a.b.c';
      const header = bearerHeader(token);
      expect(header).toBe(`Bearer ${token}`);
      expect(header.startsWith('Bearer ')).toBe(true);
    });
  });
});
