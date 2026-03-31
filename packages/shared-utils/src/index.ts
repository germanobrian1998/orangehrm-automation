/**
 * @qa-framework/shared-utils
 * Shared test utilities, data generators and helpers
 */

// ─── Legacy helpers (kept for backwards-compatibility) ────────────────────────
export { TestDataFactory } from './test-data-factory';
export type { EmployeeData, UserData } from './test-data-factory';
export { DateHelper } from './date-helper';
export { StringHelper } from './string-helper';

// ─── Date & Time Utilities ────────────────────────────────────────────────────
export * from './utils/dateTime';

// ─── String Utilities ─────────────────────────────────────────────────────────
export * from './utils/strings';

// ─── Wait & Retry Utilities ───────────────────────────────────────────────────
export * from './utils/waits';

// ─── Data Generators ──────────────────────────────────────────────────────────
export * from './utils/generators';

// ─── Logger Service ───────────────────────────────────────────────────────────
export { Logger, createLogger } from './services/logger';
export type { LogLevel, LogEntry, LoggerOptions } from './services/logger';

// ─── Configuration Loader ─────────────────────────────────────────────────────
export { ConfigLoader, sharedConfig } from './services/config';
export type { SharedConfig, BrowserName } from './services/config';
