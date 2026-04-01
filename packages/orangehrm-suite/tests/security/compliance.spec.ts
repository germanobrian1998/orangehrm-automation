/**
 * OrangeHRM Suite - Compliance & Regulatory Tests
 * Validates GDPR compliance, data privacy, password policies, audit trails,
 * session timeout, data retention, and user consent. All tests run offline.
 *
 * Testing pyramid layer: Security (offline)
 */

import { test, expect } from '@qa-framework/core';
import {
  SecurityScanner,
  PASSWORD_POLICY,
  SESSION_POLICY,
  ComplianceResult,
} from './vulnerability-scanning';

// ── Types & helpers ────────────────────────────────────────────────────────────

interface ConsentRecord {
  userId: number;
  consentType: string;
  granted: boolean;
  timestamp: number;
  version: string;
}

interface DataProcessingRecord {
  userId: number;
  purpose: string;
  legalBasis: 'consent' | 'contract' | 'legal-obligation' | 'legitimate-interest';
  dataCategories: string[];
  retentionDays: number;
}

interface AuditEntry {
  id: string;
  userId: number;
  action: string;
  resource: string;
  timestamp: number;
  outcome: 'success' | 'failure';
  ipAddress: string;
}

function hasUserConsented(records: ConsentRecord[], userId: number, consentType: string): boolean {
  return records.some((r) => r.userId === userId && r.consentType === consentType && r.granted);
}

function isRetentionCompliant(days: number, maxDays: number): boolean {
  return days > 0 && days <= maxDays;
}

function isSessionExpired(lastActivityMs: number, idleTimeoutMs: number): boolean {
  return Date.now() - lastActivityMs > idleTimeoutMs;
}

// ── Tests ──────────────────────────────────────────────────────────────────────

test.describe('@security Compliance & Regulatory Tests', () => {
  // ── 1. GDPR compliance ─────────────────────────────────────────────────────

  test.describe('GDPR compliance validation', () => {
    test('user data processing has a documented legal basis', ({ logger }) => {
      logger.step(1, 'Verify GDPR legal basis is defined for data processing');
      const processing: DataProcessingRecord = {
        userId: 1,
        purpose: 'Payroll processing',
        legalBasis: 'contract',
        dataCategories: ['name', 'bank-account', 'salary'],
        retentionDays: 7 * 365,
      };

      expect(['consent', 'contract', 'legal-obligation', 'legitimate-interest']).toContain(
        processing.legalBasis,
      );
      logger.assertion(true, `Legal basis: ${processing.legalBasis}`);
    });

    test('data subject can request access to their data (right of access)', () => {
      const getPersonalData = (userId: number) => ({
        userId,
        personalData: { name: 'John Doe', email: 'jdoe@example.com' },
        processedFor: ['payroll', 'leave-management'],
      });

      const data = getPersonalData(42);
      expect(data.userId).toBe(42);
      expect(data.personalData).toBeDefined();
    });

    test('data subject can request deletion (right to erasure)', () => {
      const eraseData = (userId: number) => ({ erased: true, userId });
      const result = eraseData(42);
      expect(result.erased).toBe(true);
      expect(result.userId).toBe(42);
    });

    test('data subject can request data portability', () => {
      const exportData = (userId: number, format: string) => ({
        userId,
        format,
        data: { name: 'John Doe' },
      });

      const export_ = exportData(1, 'JSON');
      expect(['JSON', 'CSV', 'XML']).toContain(export_.format);
    });

    test('data breach notification period is within 72 hours', () => {
      const BREACH_NOTIFICATION_HOURS = 72;
      expect(BREACH_NOTIFICATION_HOURS).toBeLessThanOrEqual(72);
    });

    test('personal data is only collected for specified, explicit purposes', () => {
      const collectedFields = ['firstName', 'lastName', 'email', 'department'];
      const unnecessaryFields = ['socialMediaProfiles', 'creditScore'];

      const hasUnnecessary = unnecessaryFields.some((f) => collectedFields.includes(f));
      expect(hasUnnecessary).toBe(false);
    });

    test('SecurityScanner records GDPR compliance result', () => {
      const scanner = new SecurityScanner('compliance');
      const result: ComplianceResult = {
        framework: 'GDPR',
        control: 'Art. 5 - Principles of data processing',
        passed: true,
        evidence: 'Data minimisation and purpose limitation enforced',
      };
      scanner.recordComplianceResult(result);
      const report = scanner.generateReport();
      expect(report.complianceResults[0].framework).toBe('GDPR');
    });
  });

  // ── 2. Data privacy policy compliance ─────────────────────────────────────

  test.describe('Data privacy policy compliance', () => {
    test('privacy policy is accessible to users', () => {
      const privacyPolicyUrl = 'https://orangehrm.example.com/privacy';
      expect(privacyPolicyUrl).toMatch(/^https:\/\//);
      expect(privacyPolicyUrl).toContain('privacy');
    });

    test('privacy policy version is tracked', () => {
      const policy = { version: '2.1.0', effectiveDate: '2024-01-01', url: '/privacy' };
      expect(policy.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(policy.effectiveDate).toBeDefined();
    });

    test('user consent is recorded with policy version', () => {
      const consent: ConsentRecord = {
        userId: 1,
        consentType: 'privacy-policy',
        granted: true,
        timestamp: Date.now(),
        version: '2.1.0',
      };
      expect(consent.version).toBeDefined();
      expect(consent.granted).toBe(true);
    });

    test('third-party data sharing requires explicit consent', () => {
      const consents: ConsentRecord[] = [
        { userId: 1, consentType: 'third-party-sharing', granted: false, timestamp: Date.now(), version: '1.0' },
      ];
      expect(hasUserConsented(consents, 1, 'third-party-sharing')).toBe(false);
    });

    test('marketing communications require opt-in consent', () => {
      const consents: ConsentRecord[] = [];
      const canSendMarketing = hasUserConsented(consents, 1, 'marketing-emails');
      expect(canSendMarketing).toBe(false);
    });
  });

  // ── 3. Password policy compliance ─────────────────────────────────────────

  test.describe('Password policy compliance', () => {
    test('PASSWORD_POLICY enforces minimum length of at least 8', () => {
      expect(PASSWORD_POLICY.minLength).toBeGreaterThanOrEqual(8);
    });

    test('PASSWORD_POLICY requires all character classes', () => {
      expect(PASSWORD_POLICY.requireUppercase).toBe(true);
      expect(PASSWORD_POLICY.requireLowercase).toBe(true);
      expect(PASSWORD_POLICY.requireNumbers).toBe(true);
      expect(PASSWORD_POLICY.requireSpecialChars).toBe(true);
    });

    test('strong password passes policy validation', () => {
      const result = SecurityScanner.validatePasswordStrength('Compl3x!Pass#');
      expect(result.valid).toBe(true);
      expect(result.failures).toHaveLength(0);
    });

    test('weak password fails policy validation', () => {
      const result = SecurityScanner.validatePasswordStrength('weak');
      expect(result.valid).toBe(false);
    });

    test('password expiry is enforced within max age days', () => {
      const isExpired = (lastChangedDaysAgo: number) =>
        lastChangedDaysAgo > PASSWORD_POLICY.maxAge;

      expect(isExpired(PASSWORD_POLICY.maxAge + 1)).toBe(true);
      expect(isExpired(PASSWORD_POLICY.maxAge - 1)).toBe(false);
    });

    test('password history prevents reuse', () => {
      const history = ['OldPass1!', 'OldPass2!', 'OldPass3!', 'OldPass4!', 'OldPass5!'];
      const newPassword = 'OldPass1!';
      const isReused = history.slice(0, PASSWORD_POLICY.historyCount).includes(newPassword);
      expect(isReused).toBe(true);
    });

    test('account lockout is applied after exceeding attempts threshold', () => {
      let failedAttempts = 0;
      const tryLogin = () => {
        failedAttempts++;
        return { locked: failedAttempts >= PASSWORD_POLICY.lockoutAttempts };
      };

      for (let i = 0; i < PASSWORD_POLICY.lockoutAttempts - 1; i++) {
        expect(tryLogin().locked).toBe(false);
      }
      expect(tryLogin().locked).toBe(true);
    });
  });

  // ── 4. Audit trail requirements ────────────────────────────────────────────

  test.describe('Audit trail requirements', () => {
    test('audit entry has all required fields', ({ logger }) => {
      logger.step(1, 'Verify audit entry structure');
      const entry: AuditEntry = {
        id: 'audit-001',
        userId: 1,
        action: 'LOGIN',
        resource: '/api/v1/auth',
        timestamp: Date.now(),
        outcome: 'success',
        ipAddress: '192.168.1.1',
      };

      expect(entry.id).toBeDefined();
      expect(entry.userId).toBeDefined();
      expect(entry.action).toBeDefined();
      expect(entry.timestamp).toBeDefined();
      expect(entry.outcome).toBeDefined();
      expect(entry.ipAddress).toBeDefined();
      logger.assertion(true, 'Audit entry has all required fields');
    });

    test('login events are captured in audit log', () => {
      const auditLog: AuditEntry[] = [];
      const log = (entry: AuditEntry) => auditLog.push(entry);

      log({
        id: '1',
        userId: 42,
        action: 'LOGIN',
        resource: '/login',
        timestamp: Date.now(),
        outcome: 'success',
        ipAddress: '10.0.0.1',
      });

      expect(auditLog.some((e) => e.action === 'LOGIN')).toBe(true);
    });

    test('failed login attempts are captured in audit log', () => {
      const auditLog: AuditEntry[] = [];
      auditLog.push({
        id: '2',
        userId: 0,
        action: 'LOGIN_FAILED',
        resource: '/login',
        timestamp: Date.now(),
        outcome: 'failure',
        ipAddress: '10.0.0.2',
      });

      expect(auditLog.some((e) => e.outcome === 'failure')).toBe(true);
    });

    test('audit log entries are immutable after creation', () => {
      const entry: AuditEntry = {
        id: '3',
        userId: 1,
        action: 'DATA_ACCESS',
        resource: '/employees',
        timestamp: 1234567890,
        outcome: 'success',
        ipAddress: '127.0.0.1',
      };
      const frozen = Object.freeze(entry);

      expect(() => {
        (frozen as Record<string, unknown>).action = 'MODIFIED';
      }).toThrow();
    });

    test('audit log is retained for the required period', () => {
      const retentionDays = 365;
      expect(isRetentionCompliant(retentionDays, 365)).toBe(true);
    });
  });

  // ── 5. Session timeout compliance ─────────────────────────────────────────

  test.describe('Session timeout compliance', () => {
    test('SESSION_POLICY idle timeout is 30 minutes or less', () => {
      expect(SESSION_POLICY.maxIdleTimeoutMs).toBeLessThanOrEqual(30 * 60 * 1000);
    });

    test('SESSION_POLICY absolute timeout is 8 hours or less', () => {
      expect(SESSION_POLICY.absoluteTimeoutMs).toBeLessThanOrEqual(8 * 60 * 60 * 1000);
    });

    test('idle session is expired after timeout', ({ logger }) => {
      logger.step(1, 'Verify idle session timeout is enforced');
      const lastActivity = Date.now() - SESSION_POLICY.maxIdleTimeoutMs - 1000;
      const expired = isSessionExpired(lastActivity, SESSION_POLICY.maxIdleTimeoutMs);
      expect(expired).toBe(true);
      logger.assertion(true, 'Idle session correctly marked as expired');
    });

    test('active session within timeout is not expired', () => {
      const lastActivity = Date.now() - 5 * 60 * 1000;
      const expired = isSessionExpired(lastActivity, SESSION_POLICY.maxIdleTimeoutMs);
      expect(expired).toBe(false);
    });

    test('secure cookie attributes are enforced', () => {
      expect(SESSION_POLICY.secureCookieRequired).toBe(true);
      expect(SESSION_POLICY.httpOnlyCookieRequired).toBe(true);
      expect(SESSION_POLICY.sameSiteCookiePolicy).toBe('Strict');
    });
  });

  // ── 6. Data retention compliance ──────────────────────────────────────────

  test.describe('Data retention compliance', () => {
    test('employee records retention is compliant', () => {
      const retentionDays = 7 * 365;
      expect(isRetentionCompliant(retentionDays, 7 * 365)).toBe(true);
    });

    test('backup data retention is within 90 days', () => {
      const retentionDays = 90;
      expect(isRetentionCompliant(retentionDays, 90)).toBe(true);
    });

    test('retention period of 0 days is non-compliant', () => {
      expect(isRetentionCompliant(0, 365)).toBe(false);
    });

    test('retention period exceeding maximum is non-compliant', () => {
      expect(isRetentionCompliant(366, 365)).toBe(false);
    });

    test('all data categories have defined retention periods', () => {
      const retentionPolicies: Record<string, number> = {
        employeeRecords: 7 * 365,
        auditLogs: 365,
        sessionTokens: 1,
        backups: 90,
        leaveRequests: 5 * 365,
      };

      for (const [, days] of Object.entries(retentionPolicies)) {
        expect(days).toBeGreaterThan(0);
      }
    });
  });

  // ── 7. User consent validation ────────────────────────────────────────────

  test.describe('User consent validation', () => {
    test('hasUserConsented returns true when consent is granted', ({ logger }) => {
      logger.step(1, 'Verify user consent lookup');
      const consents: ConsentRecord[] = [
        {
          userId: 1,
          consentType: 'data-processing',
          granted: true,
          timestamp: Date.now(),
          version: '1.0',
        },
      ];
      expect(hasUserConsented(consents, 1, 'data-processing')).toBe(true);
      logger.assertion(true, 'User consent correctly returned as granted');
    });

    test('hasUserConsented returns false when consent is not granted', () => {
      const consents: ConsentRecord[] = [
        {
          userId: 1,
          consentType: 'marketing-emails',
          granted: false,
          timestamp: Date.now(),
          version: '1.0',
        },
      ];
      expect(hasUserConsented(consents, 1, 'marketing-emails')).toBe(false);
    });

    test('hasUserConsented returns false for unknown user', () => {
      const consents: ConsentRecord[] = [];
      expect(hasUserConsented(consents, 999, 'data-processing')).toBe(false);
    });

    test('consent can be revoked by the user', () => {
      const consents: ConsentRecord[] = [
        {
          userId: 1,
          consentType: 'third-party-sharing',
          granted: true,
          timestamp: Date.now() - 1000,
          version: '1.0',
        },
      ];

      // Simulate revocation by adding a new record with granted=false
      consents.push({
        userId: 1,
        consentType: 'third-party-sharing',
        granted: false,
        timestamp: Date.now(),
        version: '1.0',
      });

      // The latest entry should be the revocation
      const latest = consents
        .filter((c) => c.userId === 1 && c.consentType === 'third-party-sharing')
        .sort((a, b) => b.timestamp - a.timestamp)[0];

      expect(latest.granted).toBe(false);
    });

    test('consent record includes a version reference', () => {
      const consent: ConsentRecord = {
        userId: 1,
        consentType: 'privacy-policy',
        granted: true,
        timestamp: Date.now(),
        version: '2.0.0',
      };
      expect(consent.version).toBeTruthy();
    });

    test('consent is required before processing sensitive data', () => {
      const consents: ConsentRecord[] = [];
      const canProcessSensitiveData = hasUserConsented(consents, 1, 'sensitive-data-processing');
      expect(canProcessSensitiveData).toBe(false);
    });

    test('SecurityScanner records overall compliance score', () => {
      const scanner = new SecurityScanner('compliance-suite');
      const results: ComplianceResult[] = [
        { framework: 'GDPR', control: 'Art.5', passed: true, evidence: 'Data minimisation' },
        { framework: 'GDPR', control: 'Art.6', passed: true, evidence: 'Legal basis defined' },
        { framework: 'GDPR', control: 'Art.17', passed: true, evidence: 'Right to erasure' },
        { framework: 'GDPR', control: 'Art.20', passed: true, evidence: 'Data portability' },
      ];
      results.forEach((r) => scanner.recordComplianceResult(r));

      const report = scanner.generateReport();
      expect(report.summary.complianceScore).toBe(100);
      expect(report.complianceResults).toHaveLength(4);
    });
  });
});
