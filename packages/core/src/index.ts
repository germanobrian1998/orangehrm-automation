/**
 * @qa-framework/core - Framework base package
 * Exports all reusable page objects, API client, logger, config and utils
 */

// Page Objects
export { BasePage } from './page-objects/base.page';

// API Client
export { BaseApiClient } from './api-client/base.api-client';

// Logger
export { Logger, createLogger } from './logger/logger';
export type { LogLevel } from './logger/logger';

// Config
export { environment } from './config/environment';
export { constants } from './config/constants';
export type { Environment } from './config/environment';

// Utils
export { WaitFor, createWaitFor } from './utils/wait-for';
export { ScreenshotManager, createScreenshotManager } from './utils/screenshot-manager';
