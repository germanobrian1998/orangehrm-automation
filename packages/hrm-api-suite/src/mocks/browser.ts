/**
 * MSW Browser Worker for E2E tests that run in a real browser context.
 * Intercepts fetch/XHR requests made inside the browser page.
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
