/**
 * Shared TypeScript types for the QA automation framework.
 * All packages that depend on @qa-framework/core import their common
 * types from here.
 */

// ─── HTTP / API ──────────────────────────────────────────────────────────────

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface APIResponse<T = unknown> {
  data?: T;
  success: boolean;
  message?: string;
  errors?: APIError[];
  status?: number;
}

export interface APIError {
  code: string;
  message: string;
  field?: string;
  details?: unknown;
}

export interface APIRequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// ─── Environment / Config ────────────────────────────────────────────────────

export type Environment = 'development' | 'staging' | 'production' | 'test';

export interface EnvironmentConfig {
  baseUrl: string;
  apiUrl?: string;
  timeout: number;
  retries: number;
  logLevel: LogLevel;
  environment: Environment;
}

// ─── Logging ─────────────────────────────────────────────────────────────────

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// ─── Test helpers ────────────────────────────────────────────────────────────

export interface WaitOptions {
  timeout?: number;
  interval?: number;
}

export interface RetryOptions {
  maxRetries: number;
  delay: number;
  backoff?: boolean;
}

export interface TestDataGeneratorOptions {
  prefix?: string;
  suffix?: string;
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

export interface BaseFixtures {
  baseUrl: string;
  apiUrl: string;
  timeout: number;
}

// ─── Page Objects ────────────────────────────────────────────────────────────

export interface NavigationOptions {
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  timeout?: number;
}
