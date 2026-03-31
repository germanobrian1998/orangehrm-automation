/**
 * Mock Playwright Page object for unit testing
 */

import type { Page, Locator } from '@playwright/test';

/** Create a mock Locator */
const createMockLocator = (): jest.Mocked<Partial<Locator>> => ({
  waitFor: jest.fn().mockResolvedValue(undefined),
  click: jest.fn().mockResolvedValue(undefined),
  fill: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
  blur: jest.fn().mockResolvedValue(undefined),
  scrollIntoViewIfNeeded: jest.fn().mockResolvedValue(undefined),
  textContent: jest.fn().mockResolvedValue('mock text'),
  isVisible: jest.fn().mockResolvedValue(true),
  count: jest.fn().mockResolvedValue(0),
});

/** Create a mock Playwright Page for unit tests */
export const createMockPage = (): jest.Mocked<Partial<Page>> => {
  const locator = createMockLocator();

  return {
    goto: jest.fn().mockResolvedValue(null),
    waitForURL: jest.fn().mockResolvedValue(undefined),
    waitForLoadState: jest.fn().mockResolvedValue(undefined),
    waitForTimeout: jest.fn().mockResolvedValue(undefined),
    waitForSelector: jest.fn().mockResolvedValue(null),
    reload: jest.fn().mockResolvedValue(null),
    screenshot: jest.fn().mockResolvedValue(Buffer.from('')),
    url: jest.fn().mockReturnValue('https://test.orangehrmlive.com'),
    title: jest.fn().mockResolvedValue('OrangeHRM'),
    locator: jest.fn().mockReturnValue(locator),
    request: {
      get: jest.fn().mockResolvedValue({
        ok: () => true,
        status: () => 200,
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(''),
      }),
      post: jest.fn().mockResolvedValue({
        ok: () => true,
        status: () => 201,
        json: jest.fn().mockResolvedValue({ data: { token: 'mock-token-12345' } }),
        text: jest.fn().mockResolvedValue(''),
      }),
      put: jest.fn().mockResolvedValue({
        ok: () => true,
        status: () => 200,
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(''),
      }),
      delete: jest.fn().mockResolvedValue({
        ok: () => true,
        status: () => 204,
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(''),
      }),
      patch: jest.fn().mockResolvedValue({
        ok: () => true,
        status: () => 200,
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(''),
      }),
    } as unknown as Page['request'],
  } as unknown as jest.Mocked<Partial<Page>>;
};

export type MockPage = ReturnType<typeof createMockPage>;
