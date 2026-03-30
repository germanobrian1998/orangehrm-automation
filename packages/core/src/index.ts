/**
 * @qa-framework/core — public API
 *
 * Import everything you need from this single entry point:
 *
 *   import { BasePage, BaseApiClient, Logger, Config, TestHelpers, test, expect } from '@qa-framework/core';
 */

// Page Objects
export { BasePage } from './page-objects/BasePage';

// API Client
export { BaseApiClient } from './api-client/BaseApiClient';

// Logger
export { Logger, createLogger } from './logger/Logger';

// Configuration
export { Config } from './config/Config';

// Utilities
export { TestHelpers } from './utils/TestHelpers';

// Fixtures
export { test, expect } from './fixtures/TestFixtures';
export type { CoreFixtures } from './fixtures/TestFixtures';

// Types
export type {
  HTTPMethod,
  APIResponse,
  APIError,
  APIRequestOptions,
  PaginatedResponse,
  AuthToken,
  LoginRequest,
  LoginResponse,
  Environment,
  EnvironmentConfig,
  LogLevel,
  WaitOptions,
  RetryOptions,
  TestDataGeneratorOptions,
  BaseFixtures,
  NavigationOptions,
} from './types';
