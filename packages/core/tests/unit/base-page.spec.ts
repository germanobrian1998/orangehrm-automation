/**
 * Unit tests for BasePage
 * Mocks the Playwright Page object and verifies BasePage behaviour.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { BasePage } from '../../src/page-objects/base.page';
import { createMockPage } from './mocks/mock-page';
import type { Page, Locator } from '@playwright/test';

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
    mockPage.locator!.mockImplementationOnce(() => {
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
    mockPage.goto!.mockRejectedValueOnce(new Error('Navigation failed'));
    await expect(basePage.goto('/bad-path')).rejects.toThrow('Navigation failed');
  });

  // ── fill() ───────────────────────────────────────────────────────────────

  it('should call locator methods when filling an input', async () => {
    const mockLocator = {
      waitFor: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      clear: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      fill: jest.fn<(value: string) => Promise<void>>().mockResolvedValue(undefined),
      blur: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };
    mockPage.locator!.mockReturnValue(mockLocator as unknown as Locator);

    await basePage.fill('[name="username"]', 'Admin');
    expect(mockLocator.clear).toHaveBeenCalled();
    expect(mockLocator.fill).toHaveBeenCalledWith('Admin');
    expect(mockLocator.blur).toHaveBeenCalled();
  });

  // ── click() ───────────────────────────────────────────────────────────────

  it('should call scrollIntoViewIfNeeded and click on the locator', async () => {
    const mockLocator = {
      waitFor: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      scrollIntoViewIfNeeded: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      click: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };
    mockPage.locator!.mockReturnValue(mockLocator as unknown as Locator);

    await basePage.click('[data-testid="submit"]');
    expect(mockLocator.scrollIntoViewIfNeeded).toHaveBeenCalled();
    expect(mockLocator.click).toHaveBeenCalled();
  });

  it('should throw when click fails', async () => {
    const mockLocator = {
      waitFor: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      scrollIntoViewIfNeeded: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      click: jest.fn<() => Promise<void>>().mockRejectedValue(new Error('Click failed')),
    };
    mockPage.locator!.mockReturnValue(mockLocator as unknown as Locator);

    await expect(basePage.click('[data-testid="disabled"]')).rejects.toThrow('Click failed');
  });

  // ── getText() ─────────────────────────────────────────────────────────────

  it('should return trimmed text content of an element', async () => {
    const mockLocator = {
      waitFor: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      textContent: jest.fn<() => Promise<string | null>>().mockResolvedValue('  Hello World  '),
    };
    mockPage.locator!.mockReturnValue(mockLocator as unknown as Locator);

    const text = await basePage.getText('[data-testid="heading"]');
    expect(text).toBe('Hello World');
  });

  it('should return empty string when textContent is null', async () => {
    const mockLocator = {
      waitFor: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      textContent: jest.fn<() => Promise<string | null>>().mockResolvedValue(null),
    };
    mockPage.locator!.mockReturnValue(mockLocator as unknown as Locator);

    const text = await basePage.getText('[data-testid="empty"]');
    expect(text).toBe('');
  });

  // ── waitForElement() ──────────────────────────────────────────────────────

  it('should resolve without throwing when element reaches visible state', async () => {
    const mockLocator = { waitFor: jest.fn<() => Promise<void>>().mockResolvedValue(undefined) };
    mockPage.locator!.mockReturnValue(mockLocator as unknown as Locator);

    await expect(basePage.waitForElement('[data-testid="modal"]')).resolves.toBeUndefined();
  });

  it('should throw when element does not reach expected state', async () => {
    const mockLocator = {
      waitFor: jest.fn<() => Promise<void>>().mockRejectedValue(new Error('Timeout')),
    };
    mockPage.locator!.mockReturnValue(mockLocator as unknown as Locator);

    await expect(basePage.waitForElement('[data-testid="missing"]')).rejects.toThrow();
  });

  // ── doubleClick() ─────────────────────────────────────────────────────────

  it('should call dblclick on the locator', async () => {
    const mockLocator = {
      waitFor: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      dblclick: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };
    mockPage.locator!.mockReturnValue(mockLocator as unknown as Locator);

    await basePage.doubleClick('[data-testid="item"]');
    expect(mockLocator.dblclick).toHaveBeenCalled();
  });

  it('should throw when doubleClick fails', async () => {
    const mockLocator = {
      waitFor: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      dblclick: jest.fn<() => Promise<void>>().mockRejectedValue(new Error('Double-click failed')),
    };
    mockPage.locator!.mockReturnValue(mockLocator as unknown as Locator);

    await expect(basePage.doubleClick('[data-testid="item"]')).rejects.toThrow('Double-click failed');
  });

  // ── rightClick() ──────────────────────────────────────────────────────────

  it('should call click with right button on the locator', async () => {
    const mockLocator = {
      waitFor: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      click: jest.fn<(options?: { button?: string }) => Promise<void>>().mockResolvedValue(undefined),
    };
    mockPage.locator!.mockReturnValue(mockLocator as unknown as Locator);

    await basePage.rightClick('[data-testid="context-target"]');
    expect(mockLocator.click).toHaveBeenCalledWith({ button: 'right' });
  });

  // ── hover() ───────────────────────────────────────────────────────────────

  it('should call hover on the locator', async () => {
    const mockLocator = {
      waitFor: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      hover: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };
    mockPage.locator!.mockReturnValue(mockLocator as unknown as Locator);

    await basePage.hover('[data-testid="tooltip-trigger"]');
    expect(mockLocator.hover).toHaveBeenCalled();
  });

  // ── getInputValue() ───────────────────────────────────────────────────────

  it('should return the value of an input element', async () => {
    const mockLocator = {
      inputValue: jest.fn<() => Promise<string>>().mockResolvedValue('john.doe'),
    };
    mockPage.locator!.mockReturnValue(mockLocator as unknown as Locator);

    const value = await basePage.getInputValue('[name="username"]');
    expect(value).toBe('john.doe');
  });

  it('should return empty string when inputValue is empty', async () => {
    const mockLocator = {
      inputValue: jest.fn<() => Promise<string>>().mockResolvedValue(''),
    };
    mockPage.locator!.mockReturnValue(mockLocator as unknown as Locator);

    const value = await basePage.getInputValue('[name="search"]');
    expect(value).toBe('');
  });

  // ── getAttribute() ────────────────────────────────────────────────────────

  it('should return the attribute value of an element', async () => {
    const mockLocator = {
      waitFor: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      getAttribute: jest.fn<() => Promise<string | null>>().mockResolvedValue('btn-primary'),
    };
    mockPage.locator!.mockReturnValue(mockLocator as unknown as Locator);

    const attr = await basePage.getAttribute('[data-testid="btn"]', 'class');
    expect(attr).toBe('btn-primary');
  });

  it('should return null when attribute does not exist', async () => {
    const mockLocator = {
      waitFor: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      getAttribute: jest.fn<() => Promise<string | null>>().mockResolvedValue(null),
    };
    mockPage.locator!.mockReturnValue(mockLocator as unknown as Locator);

    const attr = await basePage.getAttribute('[data-testid="btn"]', 'nonexistent');
    expect(attr).toBeNull();
  });

  // ── isEnabled() ───────────────────────────────────────────────────────────

  it('should return true when element is enabled', async () => {
    const mockLocator = {
      isEnabled: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
    };
    mockPage.locator!.mockReturnValue(mockLocator as unknown as Locator);

    const enabled = await basePage.isEnabled('[data-testid="submit"]');
    expect(enabled).toBe(true);
  });

  it('should return false when element is disabled', async () => {
    const mockLocator = {
      isEnabled: jest.fn<() => Promise<boolean>>().mockResolvedValue(false),
    };
    mockPage.locator!.mockReturnValue(mockLocator as unknown as Locator);

    const enabled = await basePage.isEnabled('[data-testid="disabled-btn"]');
    expect(enabled).toBe(false);
  });

  it('should return false when isEnabled throws', async () => {
    mockPage.locator!.mockImplementationOnce(() => {
      throw new Error('Locator error');
    });

    const enabled = await basePage.isEnabled('[data-testid="missing"]');
    expect(enabled).toBe(false);
  });

  // ── selectOption() ────────────────────────────────────────────────────────

  it('should call selectOption on the locator', async () => {
    const mockLocator = {
      selectOption: jest.fn<(values: string | string[]) => Promise<string[]>>().mockResolvedValue([]),
    };
    mockPage.locator!.mockReturnValue(mockLocator as unknown as Locator);

    await basePage.selectOption('select[name="country"]', 'US');
    expect(mockLocator.selectOption).toHaveBeenCalledWith('US');
  });

  it('should throw when selectOption fails', async () => {
    const mockLocator = {
      selectOption: jest.fn<() => Promise<string[]>>().mockRejectedValue(new Error('Option not found')),
    };
    mockPage.locator!.mockReturnValue(mockLocator as unknown as Locator);

    await expect(basePage.selectOption('select[name="country"]', 'XX')).rejects.toThrow('Option not found');
  });

  // ── check() ───────────────────────────────────────────────────────────────

  it('should call check on the locator', async () => {
    const mockLocator = {
      check: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };
    mockPage.locator!.mockReturnValue(mockLocator as unknown as Locator);

    await basePage.check('[data-testid="agree-checkbox"]');
    expect(mockLocator.check).toHaveBeenCalled();
  });

  // ── uncheck() ─────────────────────────────────────────────────────────────

  it('should call uncheck on the locator', async () => {
    const mockLocator = {
      uncheck: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };
    mockPage.locator!.mockReturnValue(mockLocator as unknown as Locator);

    await basePage.uncheck('[data-testid="agree-checkbox"]');
    expect(mockLocator.uncheck).toHaveBeenCalled();
  });

  // ── acceptAlert() / dismissAlert() ────────────────────────────────────────

  it('should register a once handler for "dialog" event on acceptAlert()', () => {
    basePage.acceptAlert();
    expect(mockPage.once as unknown as jest.Mock).toHaveBeenCalledWith('dialog', expect.any(Function));
  });

  it('should register a once handler for "dialog" event on dismissAlert()', () => {
    basePage.dismissAlert();
    expect(mockPage.once as unknown as jest.Mock).toHaveBeenCalledWith('dialog', expect.any(Function));
  });
});
