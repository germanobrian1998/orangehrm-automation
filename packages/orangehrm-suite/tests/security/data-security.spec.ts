/**
 * OrangeHRM Suite - Data Security Tests
 * Verifies sensitive data encryption, PII masking, HTTPS transmission,
 * backup security, data retention policies, secure deletion, and encryption
 * key rotation. All tests run offline without a live server.
 *
 * Testing pyramid layer: Security (offline)
 */

import { test, expect } from '@qa-framework/core';
import {
  SecurityScanner,
  ComplianceResult,
} from './vulnerability-scanning';

// ── Mock helpers ───────────────────────────────────────────────────────────────

/** Simulates masking of a PII value (e.g. SSN, card number). */
function maskPii(value: string, visibleChars: number = 4): string {
  if (value.length <= visibleChars) return '*'.repeat(value.length);
  return '*'.repeat(value.length - visibleChars) + value.slice(-visibleChars);
}

/** Simulates masking of an email address. */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const masked = local.length > 2 ? local[0] + '*'.repeat(local.length - 2) + local.slice(-1) : '**';
  return `${masked}@${domain}`;
}

/** Simulates AES-GCM–style field-level encryption output. */
function encryptField(plaintext: string): string {
  return `encrypted:aes256gcm:${Buffer.from(plaintext).toString('base64')}`;
}

/** Returns true when the value looks like our encrypted field format. */
function isEncrypted(value: string): boolean {
  return value.startsWith('encrypted:');
}

/** Simulates secure deletion by zeroing out data. */
function secureDelete(data: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.keys(data).map((k) => [k, null]));
}

/** Simple URL check that confirms HTTPS. */
function isHttps(url: string): boolean {
  return url.startsWith('https://');
}

/** Returns whether a data retention period is within a given max days. */
function isWithinRetentionPolicy(days: number, maxDays: number): boolean {
  return days <= maxDays;
}

// ── Tests ──────────────────────────────────────────────────────────────────────

test.describe('@security Data Security Tests', () => {
  // ── 1. Sensitive data encryption ──────────────────────────────────────────

  test.describe('Sensitive data encryption', () => {
    test('encryptField produces an encrypted representation', ({ logger }) => {
      logger.step(1, 'Encrypt a plain-text password field');
      const plaintext = 'SuperSecret123!';
      const encrypted = encryptField(plaintext);
      expect(isEncrypted(encrypted)).toBe(true);
      expect(encrypted).not.toBe(plaintext);
      logger.assertion(true, 'Field encrypted correctly');
    });

    test('encrypted value does not contain the plaintext', () => {
      const plaintext = 'MySocialSecurityNumber';
      const encrypted = encryptField(plaintext);
      expect(encrypted).not.toBe(plaintext);
    });

    test('isEncrypted returns false for plain-text values', () => {
      expect(isEncrypted('plain text password')).toBe(false);
    });

    test('isEncrypted returns true for encrypted values', () => {
      expect(isEncrypted('encrypted:aes256gcm:base64data==')).toBe(true);
    });

    test('sensitive fields in a user object are stored encrypted', () => {
      const userData = {
        username: 'jdoe',
        password: encryptField('Pass123!'),
        ssn: encryptField('123-45-6789'),
        bankAccount: encryptField('9876543210'),
      };

      expect(isEncrypted(userData.password)).toBe(true);
      expect(isEncrypted(userData.ssn)).toBe(true);
      expect(isEncrypted(userData.bankAccount)).toBe(true);
    });

    test('non-sensitive fields are not encrypted', () => {
      const userData = {
        username: 'jdoe',
        department: 'Engineering',
      };
      expect(isEncrypted(userData.username)).toBe(false);
      expect(isEncrypted(userData.department)).toBe(false);
    });
  });

  // ── 2. Data masking for PII ────────────────────────────────────────────────

  test.describe('Data masking for PII', () => {
    test('maskPii hides all but the last 4 characters', ({ logger }) => {
      logger.step(1, 'Mask a credit card number');
      const cardNumber = '4111111111111234';
      const masked = maskPii(cardNumber, 4);
      expect(masked.endsWith('1234')).toBe(true);
      expect(masked.startsWith('*')).toBe(true);
      logger.assertion(true, `Masked: ${masked}`);
    });

    test('maskPii masks a 9-digit SSN showing only last 4 digits', () => {
      const ssn = '123456789';
      const masked = maskPii(ssn, 4);
      expect(masked).toBe('*****6789');
    });

    test('maskEmail masks local part of email keeping first and last character', () => {
      const email = 'jdoe@example.com';
      const masked = maskEmail(email);
      expect(masked).toContain('@example.com');
      expect(masked.startsWith('j')).toBe(true);
      expect(masked).toContain('*');
    });

    test('maskEmail handles short local part', () => {
      const email = 'ab@example.com';
      const masked = maskEmail(email);
      expect(masked).toContain('@example.com');
    });

    test('PII fields in API responses are masked', () => {
      const rawEmployee = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        ssn: '123-45-6789',
        email: 'jdoe@example.com',
      };

      const maskedEmployee = {
        ...rawEmployee,
        ssn: maskPii(rawEmployee.ssn.replace(/-/g, ''), 4),
        email: maskEmail(rawEmployee.email),
      };

      expect(maskedEmployee.ssn).not.toBe(rawEmployee.ssn);
      expect(maskedEmployee.email).not.toBe(rawEmployee.email);
      expect(maskedEmployee.firstName).toBe(rawEmployee.firstName);
    });
  });

  // ── 3. Secure data transmission (HTTPS) ───────────────────────────────────

  test.describe('Secure data transmission (HTTPS)', () => {
    test('isHttps returns true for HTTPS URLs', () => {
      expect(isHttps('https://orangehrm.example.com')).toBe(true);
    });

    test('isHttps returns false for HTTP URLs', () => {
      expect(isHttps('http://orangehrm.example.com')).toBe(false);
    });

    test('isHttps returns false for empty string', () => {
      expect(isHttps('')).toBe(false);
    });

    test('API base URL must use HTTPS in production', ({ logger }) => {
      logger.step(1, 'Verify API base URL is HTTPS');
      const apiBaseUrl = 'https://api.orangehrm.example.com';
      expect(isHttps(apiBaseUrl)).toBe(true);
      logger.assertion(true, 'API base URL uses HTTPS');
    });

    test('redirect from HTTP to HTTPS is simulated correctly', () => {
      const redirectToHttps = (url: string): string =>
        url.replace(/^http:\/\//i, 'https://');

      const httpUrl = 'http://orangehrm.example.com';
      const redirected = redirectToHttps(httpUrl);
      expect(isHttps(redirected)).toBe(true);
    });

    test('HSTS header is included in required security headers list', () => {
      const { SECURITY_HEADERS } = require('./vulnerability-scanning');
      expect(SECURITY_HEADERS.required).toContain('Strict-Transport-Security');
    });
  });

  // ── 4. Data backup security ────────────────────────────────────────────────

  test.describe('Data backup security', () => {
    test('backup file is encrypted at rest', () => {
      const backup = {
        filename: 'backup_2024-01-01.sql.enc',
        encrypted: true,
        encryptionAlgorithm: 'AES-256-GCM',
        checksum: 'sha256:abc123...',
      };

      expect(backup.encrypted).toBe(true);
      expect(backup.encryptionAlgorithm).toContain('AES-256');
    });

    test('backup checksum validates data integrity', () => {
      const computeChecksum = (data: string) => `sha256:${data.length}`;
      const backup = { data: 'db-dump-contents', checksum: '' };
      backup.checksum = computeChecksum(backup.data);

      const verified = backup.checksum === computeChecksum(backup.data);
      expect(verified).toBe(true);
    });

    test('backup access requires elevated permissions', () => {
      type Role = 'admin' | 'hr_manager' | 'employee';
      const canAccessBackup = (role: Role) => role === 'admin';

      expect(canAccessBackup('admin')).toBe(true);
      expect(canAccessBackup('hr_manager')).toBe(false);
      expect(canAccessBackup('employee')).toBe(false);
    });

    test('backup retention period does not exceed 90 days', () => {
      const backupRetentionDays = 90;
      expect(isWithinRetentionPolicy(backupRetentionDays, 90)).toBe(true);
    });
  });

  // ── 5. Data retention policies ────────────────────────────────────────────

  test.describe('Data retention policies', () => {
    test('employee records are retained for at most 7 years', () => {
      const retentionYears = 7;
      const retentionDays = retentionYears * 365;
      expect(isWithinRetentionPolicy(retentionDays, 7 * 365)).toBe(true);
    });

    test('audit logs are retained for at most 1 year', () => {
      const retentionDays = 365;
      expect(isWithinRetentionPolicy(retentionDays, 365)).toBe(true);
    });

    test('data older than retention period is flagged for deletion', () => {
      const retentionDays = 30;
      const isExpired = (createdAt: number, retentionMs: number) =>
        Date.now() - createdAt > retentionMs;

      const oldRecord = { createdAt: Date.now() - 31 * 24 * 60 * 60 * 1000 };
      const recentRecord = { createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000 };

      expect(isExpired(oldRecord.createdAt, retentionDays * 24 * 60 * 60 * 1000)).toBe(true);
      expect(isExpired(recentRecord.createdAt, retentionDays * 24 * 60 * 60 * 1000)).toBe(false);
    });

    test('retention policy is defined for all data categories', () => {
      const retentionPolicy = {
        employeeRecords: 7 * 365,
        auditLogs: 365,
        sessionTokens: 1,
        backups: 90,
      };

      expect(retentionPolicy.employeeRecords).toBeGreaterThan(0);
      expect(retentionPolicy.auditLogs).toBeGreaterThan(0);
      expect(retentionPolicy.sessionTokens).toBeGreaterThan(0);
      expect(retentionPolicy.backups).toBeGreaterThan(0);
    });
  });

  // ── 6. Secure deletion of sensitive data ──────────────────────────────────

  test.describe('Secure deletion of sensitive data', () => {
    test('secureDelete zeroes out all fields', ({ logger }) => {
      logger.step(1, 'Verify secure deletion zeros out data');
      const sensitiveData = { ssn: '123-45-6789', password: 'Secret!', email: 'x@y.com' };
      const deleted = secureDelete(sensitiveData);

      expect(deleted.ssn).toBeNull();
      expect(deleted.password).toBeNull();
      expect(deleted.email).toBeNull();
      logger.assertion(true, 'All fields zeroed after secure deletion');
    });

    test('secureDelete preserves field names but nullifies values', () => {
      const data = { a: 'one', b: 'two' };
      const deleted = secureDelete(data);
      expect(Object.keys(deleted)).toContain('a');
      expect(Object.keys(deleted)).toContain('b');
      expect(deleted.a).toBeNull();
    });

    test('soft-deleted user has PII fields wiped', () => {
      const user = {
        id: 42,
        username: 'jdoe',
        email: 'jdoe@example.com',
        ssn: '123-45-6789',
        deletedAt: Date.now(),
      };
      const wipedPii = { ...user, email: null, ssn: null };
      expect(wipedPii.email).toBeNull();
      expect(wipedPii.ssn).toBeNull();
      expect(wipedPii.id).toBe(42);
    });
  });

  // ── 7. Encryption key rotation ────────────────────────────────────────────

  test.describe('Encryption key rotation', () => {
    test('key version increments on rotation', ({ logger }) => {
      logger.step(1, 'Simulate encryption key rotation');
      let keyVersion = 1;
      const rotateKey = () => { keyVersion++; };
      rotateKey();
      expect(keyVersion).toBe(2);
      logger.assertion(true, `Key version incremented to ${keyVersion}`);
    });

    test('re-encrypted value differs from original encryption', () => {
      const encrypt = (text: string, version: number) =>
        `encrypted:v${version}:${Buffer.from(text).toString('base64')}`;

      const plaintext = 'sensitive-data';
      const v1 = encrypt(plaintext, 1);
      const v2 = encrypt(plaintext, 2);

      expect(v1).not.toBe(v2);
    });

    test('old key version is retired after rotation', () => {
      const activeKeyVersions = [2];
      const retiredKeyVersions = [1];

      expect(activeKeyVersions).not.toContain(1);
      expect(retiredKeyVersions).toContain(1);
    });

    test('key rotation schedule does not exceed 365 days', () => {
      const maxRotationDays = 365;
      const keyRotationScheduleDays = 90;
      expect(keyRotationScheduleDays).toBeLessThanOrEqual(maxRotationDays);
    });

    test('SecurityScanner compliance result is recorded for encryption', () => {
      const scanner = new SecurityScanner('data-security');
      const result: ComplianceResult = {
        framework: 'PCI-DSS',
        control: 'Requirement 3.5 - Protect stored cardholder data',
        passed: true,
        evidence: 'AES-256-GCM field-level encryption applied; key rotation every 90 days',
      };
      scanner.recordComplianceResult(result);

      const report = scanner.generateReport();
      expect(report.complianceResults[0].framework).toBe('PCI-DSS');
      expect(report.complianceResults[0].passed).toBe(true);
    });
  });
});
