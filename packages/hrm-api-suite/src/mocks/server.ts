/**
 * MSW Node Server for unit and integration tests (Jest / Playwright in Node context).
 * Intercepts fetch/http requests made in the Node.js process.
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
