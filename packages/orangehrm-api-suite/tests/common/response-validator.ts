/**
 * OrangeHRM API Suite - Response Validator
 * Utilities for validating HTTP status codes, headers, body schemas, and error formats.
 */

import { APIResponse, expect } from '@playwright/test';

/**
 * Validates that the response has the expected HTTP status code.
 */
export function validateStatusCode(actual: number, expected: number): void {
  expect(actual, `Expected status ${expected}, got ${actual}`).toBe(expected);
}

/**
 * Validates that a response object contains a non-null data field.
 */
export function validateResponseHasData(response: unknown): void {
  expect(response).toBeDefined();
  expect(response).not.toBeNull();
  const obj = response as Record<string, unknown>;
  expect(obj).toHaveProperty('data');
  expect(obj['data']).not.toBeNull();
}

/**
 * Validates that an API error response contains a message field.
 */
export function validateErrorFormat(error: unknown): void {
  const obj = error as Record<string, unknown>;
  expect(obj).toBeDefined();
  expect(
    typeof obj['message'] === 'string' || typeof obj['error'] === 'string',
    'Error response must contain a "message" or "error" string field'
  ).toBe(true);
}

/**
 * Validates that an array response contains the expected fields in each item.
 */
export function validateArrayItems<T extends Record<string, unknown>>(
  items: T[],
  requiredFields: (keyof T)[]
): void {
  expect(Array.isArray(items)).toBe(true);
  for (const item of items) {
    for (const field of requiredFields) {
      expect(item, `Each item must have field "${String(field)}"`).toHaveProperty(String(field));
    }
  }
}

/**
 * Validates paginated list response structure.
 */
export function validatePaginatedResponse(response: unknown): void {
  const obj = response as Record<string, unknown>;
  expect(obj).toHaveProperty('data');
  expect(obj).toHaveProperty('meta');
  const meta = obj['meta'] as Record<string, unknown>;
  expect(typeof meta['total']).toBe('number');
}

/**
 * Validates that an APIResponse object has an expected Content-Type header.
 */
export async function validateContentType(
  response: APIResponse,
  expectedContentType = 'application/json'
): Promise<void> {
  const contentType = response.headers()['content-type'] || '';
  expect(
    contentType.includes(expectedContentType),
    `Expected Content-Type to include "${expectedContentType}", got "${contentType}"`
  ).toBe(true);
}

/**
 * Validates that a JWT token string has the correct format (three base64url segments).
 */
export function validateJwtFormat(token: string): void {
  expect(typeof token).toBe('string');
  const parts = token.split('.');
  expect(parts.length, 'JWT must have three dot-separated parts').toBe(3);
  for (const part of parts) {
    expect(part.length, 'Each JWT part must be non-empty').toBeGreaterThan(0);
  }
}

/**
 * Validates employee schema fields on a given object.
 */
export function validateEmployeeSchema(employee: Record<string, unknown>): void {
  expect(typeof employee['empNumber']).toBe('number');
  expect(typeof employee['firstName']).toBe('string');
  expect(typeof employee['lastName']).toBe('string');
  expect(typeof employee['employeeId']).toBe('string');
}

/**
 * Validates leave request schema fields on a given object.
 */
export function validateLeaveRequestSchema(request: Record<string, unknown>): void {
  expect(typeof request['id']).toBe('number');
  expect(typeof request['employeeId']).toBe('number');
  expect(typeof request['leaveTypeId']).toBe('number');
  expect(typeof request['fromDate']).toBe('string');
  expect(typeof request['toDate']).toBe('string');
  expect(typeof request['status']).toBe('string');
  expect(typeof request['days']).toBe('number');
}
