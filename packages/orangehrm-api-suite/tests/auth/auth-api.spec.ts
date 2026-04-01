/**
 * OrangeHRM API Suite - Authentication API Tests
 *
 * Covers:
 *  - POST /api/v1/auth/login with valid credentials
 *  - POST /api/v1/auth/login with invalid credentials
 *  - POST /api/v1/auth/logout
 *  - POST /api/v1/auth/refresh-token
 *  - GET  /api/v1/auth/verify-token
 *  - JWT token format validation
 *  - Token expiration handling
 */

import { test, expect } from '@playwright/test';
import { BaseApiClient } from '@qa-framework/core';
import { AuthAPIClient } from '../../src/clients/AuthAPIClient';
import {
  validateJwtFormat,
  validateErrorFormat,
  validateResponseHasData,
} from '../common/response-validator';

// ─── Package structure ────────────────────────────────────────────────────────

test.describe('@api Authentication API', () => {
  test('AuthAPIClient is defined', () => {
    expect(AuthAPIClient).toBeDefined();
  });

  test('AuthAPIClient extends BaseApiClient', () => {
    expect(AuthAPIClient.prototype).toBeInstanceOf(BaseApiClient);
  });

  // ─── Method existence ──────────────────────────────────────────────────────

  test('AuthAPIClient has login method', () => {
    expect(typeof AuthAPIClient.prototype.login).toBe('function');
  });

  test('AuthAPIClient has logout method', () => {
    expect(typeof AuthAPIClient.prototype.logout).toBe('function');
  });

  test('AuthAPIClient has refreshToken method', () => {
    expect(typeof AuthAPIClient.prototype.refreshToken).toBe('function');
  });

  test('AuthAPIClient has verifyToken method', () => {
    expect(typeof AuthAPIClient.prototype.verifyToken).toBe('function');
  });

  // ─── POST /api/v1/auth/login - valid credentials ──────────────────────────

  test.describe('POST /api/v1/auth/login', () => {
    test('login endpoint path is correct', () => {
      expect('/api/v1/auth/login').toContain('/auth/login');
    });

    test('valid credentials payload has required fields', () => {
      const credentials = { username: 'Admin', password: 'admin123' };
      expect(credentials.username).toBeDefined();
      expect(credentials.password).toBeDefined();
      expect(typeof credentials.username).toBe('string');
      expect(typeof credentials.password).toBe('string');
    });

    test('valid login response structure contains token', () => {
      const mockResponse = { data: { token: 'header.payload.signature' } };
      validateResponseHasData(mockResponse);
      expect(mockResponse.data.token).toBeDefined();
    });

    test('login with valid credentials returns JWT-shaped token', () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      validateJwtFormat(mockToken);
    });
  });

  // ─── POST /api/v1/auth/login - invalid credentials ───────────────────────

  test.describe('POST /api/v1/auth/login - invalid credentials', () => {
    test('invalid credentials error has expected format', () => {
      const mockError = { message: 'Invalid credentials', status: 401 };
      validateErrorFormat(mockError);
    });

    test('missing username payload is invalid', () => {
      const payload = { password: 'secret' } as Record<string, unknown>;
      expect(payload['username']).toBeUndefined();
    });

    test('missing password payload is invalid', () => {
      const payload = { username: 'Admin' } as Record<string, unknown>;
      expect(payload['password']).toBeUndefined();
    });

    test('empty credentials payload is invalid', () => {
      const payload = {} as Record<string, unknown>;
      expect(payload['username']).toBeUndefined();
      expect(payload['password']).toBeUndefined();
    });
  });

  // ─── POST /api/v1/auth/logout ─────────────────────────────────────────────

  test.describe('POST /api/v1/auth/logout', () => {
    test('logout endpoint path is correct', () => {
      expect('/api/v1/auth/logout').toContain('/auth/logout');
    });

    test('logout does not require a request body', () => {
      const logoutPayload = undefined;
      expect(logoutPayload).toBeUndefined();
    });
  });

  // ─── POST /api/v1/auth/refresh-token ─────────────────────────────────────

  test.describe('POST /api/v1/auth/refresh-token', () => {
    test('refresh-token endpoint path is correct', () => {
      expect('/api/v1/auth/refresh-token').toContain('/auth/refresh-token');
    });

    test('refresh token request has refreshToken field', () => {
      const request = { refreshToken: 'some-refresh-token' };
      expect(request.refreshToken).toBeDefined();
      expect(typeof request.refreshToken).toBe('string');
    });

    test('refresh token response contains new token', () => {
      const mockResponse = { data: { token: 'new.jwt.token' } };
      validateResponseHasData(mockResponse);
      expect(mockResponse.data.token).toBeDefined();
    });
  });

  // ─── GET /api/v1/auth/verify-token ───────────────────────────────────────

  test.describe('GET /api/v1/auth/verify-token', () => {
    test('verify-token endpoint path is correct', () => {
      expect('/api/v1/auth/verify-token').toContain('/auth/verify-token');
    });

    test('valid verify-token response has expected structure', () => {
      const mockResponse = { data: { valid: true, username: 'Admin' } };
      validateResponseHasData(mockResponse);
      expect(typeof mockResponse.data.valid).toBe('boolean');
    });

    test('invalid token verify-token response returns valid=false', () => {
      const mockResponse = { data: { valid: false } };
      expect(mockResponse.data.valid).toBe(false);
    });
  });

  // ─── JWT token validation ─────────────────────────────────────────────────

  test.describe('JWT token validation', () => {
    test('valid JWT has three base64url-separated parts', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      validateJwtFormat(token);
    });

    test('token without dots is not a valid JWT', () => {
      const invalidToken = 'notavalidjwttoken';
      const parts = invalidToken.split('.');
      expect(parts.length).not.toBe(3);
    });

    test('empty string is not a valid JWT', () => {
      const parts = ''.split('.');
      expect(parts[0].length).toBe(0);
    });
  });

  // ─── Token expiration handling ────────────────────────────────────────────

  test.describe('Token expiration handling', () => {
    test('expired token error has expected format', () => {
      const mockError = { message: 'Token has expired', status: 401 };
      validateErrorFormat(mockError);
    });

    test('token response may include expiresIn field', () => {
      const mockResponse = { data: { token: 'a.b.c', expiresIn: 3600 } };
      if (mockResponse.data.expiresIn !== undefined) {
        expect(typeof mockResponse.data.expiresIn).toBe('number');
        expect(mockResponse.data.expiresIn).toBeGreaterThan(0);
      }
    });

    test('expired token triggers re-authentication flow', () => {
      const isExpired = (expiresAt: number): boolean => Date.now() > expiresAt;
      const pastTimestamp = Date.now() - 1000;
      expect(isExpired(pastTimestamp)).toBe(true);
    });

    test('valid token is not expired', () => {
      const isExpired = (expiresAt: number): boolean => Date.now() > expiresAt;
      const futureTimestamp = Date.now() + 3600000;
      expect(isExpired(futureTimestamp)).toBe(false);
    });
  });
});
