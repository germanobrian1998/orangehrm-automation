/**
 * Unit tests for BasePage
 * Mocks the Playwright Page object and verifies BasePage behaviour.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { BasePage } from '../../src/page-objects/base.page';
import { createMockPage } from './mocks/mock-page';
import type { Page } from '@playwright/test';

/** Concrete subclass so we can instantiate the abstract-like BasePage */
class TestPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** Expose protected page for assertions */
  getPage(): Page {
    return this.page;
  }
}

describe('BasePage', () => {
  let mockPage: ReturnType<typeof createMockPage>;
  let basePage: TestPage;

  beforeEach(() => {
    mockPage = createMockPage();
    basePage = new TestPage(mockPage as unknown as Page);
    jest.clearAllMocks();
  });

  // ── Initialization ────────────────────────────────────────────────────────

  it('should instantiate successfully with a mock page', () => {
    expect(basePage).toBeInstanceOf(BasePage);
  });

  it('should expose the underlying Playwright page', () => {
    expect(basePage.getPage()).toBe(mockPage);
  });

  // ── getCurrentUrl() ────────────────────────────────────────────────────────

  it('should return the current URL via getCurrentUrl()', () => {
    const url = basePage.getCurrentUrl();
    expect(typeof url).toBe('string');
  });

  // ── isVisible() ────────────────────────────────────────────────────────────

  it('should return true when element is visible', async () => {
    const visible = await basePage.isVisible('[data-testid="button"]');
    expect(visible).toBe(true);
  });

  it('should return false when locator throws', async () => {
    (mockPage.locator as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Element not found');
    });
    const visible = await basePage.isVisible('[data-testid="missing"]');
    expect(visible).toBe(false);
  });

  // ── goto() ────────────────────────────────────────────────────────────────

  it('should call page.goto() with the correct URL', async () => {
    await basePage.goto('/web/index.php/auth/login');
    expect(mockPage.goto).toHaveBeenCalledWith(
      expect.stringContaining('/web/index.php/auth/login'),
      expect.any(Object)
    );
  });

  it('should throw when page.goto() rejects', async () => {
    (mockPage.goto as jest.Mock).mockRejectedValueOnce(new Error('Navigation failed'));
    await expect(basePage.goto('/bad-path')).rejects.toThrow('Navigation failed');
  });

  // ── fill() ───────────────────────────────────────────────────────────────

  it('should call locator methods when filling an input', async () => {
    const mockLocator = {
      waitFor: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
      fill: jest.fn().mockResolvedValue(undefined),
      blur: jest.fn().mockResolvedValue(undefined),
    };
    (mockPage.locator as jest.Mock).mockReturnValue(mockLocator);

    await basePage.fill('[name="username"]', 'Admin');
    expect(mockLocator.clear).toHaveBeenCalled();
    expect(mockLocator.fill).toHaveBeenCalledWith('Admin');
    expect(mockLocator.blur).toHaveBeenCalled();
  });

  // ── click() ───────────────────────────────────────────────────────────────

  it('should call scrollIntoViewIfNeeded and click on the locator', async () => {
    const mockLocator = {
      waitFor: jest.fn().mockResolvedValue(undefined),
      scrollIntoViewIfNeeded: jest.fn().mockResolvedValue(undefined),
      click: jest.fn().mockResolvedValue(undefined),
    };
    (mockPage.locator as jest.Mock).mockReturnValue(mockLocator);

    await basePage.click('[data-testid="submit"]');
    expect(mockLocator.scrollIntoViewIfNeeded).toHaveBeenCalled();
    expect(mockLocator.click).toHaveBeenCalled();
  });

  it('should throw when click fails', async () => {
    const mockLocator = {
      waitFor: jest.fn().mockResolvedValue(undefined),
      scrollIntoViewIfNeeded: jest.fn().mockResolvedValue(undefined),
      click: jest.fn().mockRejectedValue(new Error('Click failed')),
    };
    (mockPage.locator as jest.Mock).mockReturnValue(mockLocator);

    await expect(basePage.click('[data-testid="disabled"]')).rejects.toThrow('Click failed');
  });

  // ── getText() ─────────────────────────────────────────────────────────────

  it('should return trimmed text content of an element', async () => {
    const mockLocator = {
      waitFor: jest.fn().mockResolvedValue(undefined),
      textContent: jest.fn().mockResolvedValue('  Hello World  '),
    };
    (mockPage.locator as jest.Mock).mockReturnValue(mockLocator);

    const text = await basePage.getText('[data-testid="heading"]');
    expect(text).toBe('Hello World');
  });

  it('should return empty string when textContent is null', async () => {
    const mockLocator = {
      waitFor: jest.fn().mockResolvedValue(undefined),
      textContent: jest.fn().mockResolvedValue(null),
    };
    (mockPage.locator as jest.Mock).mockReturnValue(mockLocator);

    const text = await basePage.getText('[data-testid="empty"]');
    expect(text).toBe('');
  });

  // ── waitForElement() ──────────────────────────────────────────────────────

  it('should resolve without throwing when element reaches visible state', async () => {
    const mockLocator = { waitFor: jest.fn().mockResolvedValue(undefined) };
    (mockPage.locator as jest.Mock).mockReturnValue(mockLocator);

    await expect(basePage.waitForElement('[data-testid="modal"]')).resolves.toBeUndefined();
  });

  it('should throw when element does not reach expected state', async () => {
    const mockLocator = {
      waitFor: jest.fn().mockRejectedValue(new Error('Timeout')),
    };
    (mockPage.locator as jest.Mock).mockReturnValue(mockLocator);

    await expect(basePage.waitForElement('[data-testid="missing"]')).rejects.toThrow();
  });
});
