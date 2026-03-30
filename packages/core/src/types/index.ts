/**
 * Core framework - Shared TypeScript types and interfaces
 */

// ─── Environment / Config ────────────────────────────────────────────────────

export interface EnvironmentConfig {
  baseURL: string;
  adminUsername: string;
  adminPassword: string;
  testTimeout: number;
  apiTimeout: number;
  logLevel: string;
  debug: boolean;
  isCI: boolean;
  isDev: boolean;
}

// ─── HTTP / API ───────────────────────────────────────────────────────────────

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  data?: unknown;
  timeout?: number;
}

// ─── Logging ─────────────────────────────────────────────────────────────────

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  timestamp?: string;
  data?: unknown;
}

// ─── Page Objects ─────────────────────────────────────────────────────────────

export interface NavigationOptions {
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  timeout?: number;
}

export interface WaitOptions {
  timeout?: number;
  state?: 'visible' | 'hidden' | 'attached' | 'detached';
}

// ─── Test ─────────────────────────────────────────────────────────────────────

export interface TestUser {
  username: string;
  password: string;
  role?: string;
}

export interface TestEmployee {
  firstName: string;
  lastName: string;
  middleName?: string;
  employeeId?: string;
}

export interface Credentials {
  username: string;
  password: string;
}

// ─── Screenshot ──────────────────────────────────────────────────────────────

export interface ScreenshotOptions {
  fullPage?: boolean;
  directory?: string;
}
