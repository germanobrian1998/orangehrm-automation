/**
 * Unit tests for BaseApiClient
 * Mocks the Playwright Page/APIRequestContext and verifies HTTP method behaviour.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { BaseApiClient } from '../../src/api-client/base.api-client';
import type { Page } from '@playwright/test';

/** Helper to build a mock Playwright API response */
const makeMockResponse = (opts: {
  ok?: boolean;
  status?: number;
  json?: unknown;
  text?: string;
}) => ({
  ok: jest.fn().mockReturnValue(opts.ok ?? true),
  status: jest.fn().mockReturnValue(opts.status ?? 200),
  json: jest.fn<() => Promise<unknown>>().mockResolvedValue(opts.json ?? {}),
  text: jest.fn<() => Promise<string>>().mockResolvedValue(opts.text ?? ''),
});

type MockResponse = ReturnType<typeof makeMockResponse>;
type MockHTTPMethod = (url: string, options?: Record<string, unknown>) => Promise<MockResponse>;

/** Build a fresh set of mock request context methods */
const setupMockRequestContext = () => ({
  get: jest.fn<MockHTTPMethod>().mockResolvedValue(makeMockResponse({ json: { data: [] } })),
  post: jest.fn<MockHTTPMethod>().mockResolvedValue(makeMockResponse({ status: 201, json: { data: { token: 'mock-token-abc123' } } })),
  put: jest.fn<MockHTTPMethod>().mockResolvedValue(makeMockResponse({ json: { updated: true } })),
  delete: jest.fn<MockHTTPMethod>().mockResolvedValue(makeMockResponse({ status: 204, json: {} })),
  patch: jest.fn<MockHTTPMethod>().mockResolvedValue(makeMockResponse({ json: { patched: true } })),
});

/** Concrete subclass that exposes protected helpers for testing */
class TestApiClient extends BaseApiClient {
  constructor(page: Page) {
    super(page);
  }

  setToken(token: string): void {
    this.authToken = token;
  }

  getToken(): string | null {
    return this.authToken;
  }

  callGet<T>(endpoint: string): Promise<T> {
    return this.get<T>(endpoint);
  }

  callPost<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.post<T>(endpoint, data);
  }

  callPut<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.put<T>(endpoint, data);
  }

  callDelete<T>(endpoint: string): Promise<T> {
    return this.delete<T>(endpoint);
  }

  callPatch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.patch<T>(endpoint, data);
  }
}

describe('BaseApiClient', () => {
  let mockRequestContext: ReturnType<typeof setupMockRequestContext>;
  let mockPage: Partial<Page>;
  let client: TestApiClient;

  beforeEach(() => {
    mockRequestContext = setupMockRequestContext();

    mockPage = {
      request: mockRequestContext as unknown as Page['request'],
      url: jest.fn<() => string>().mockReturnValue('https://test.orangehrmlive.com'),
    };

    client = new TestApiClient(mockPage as Page);
    client.setToken('initial-token');
    jest.clearAllMocks();
    // Re-apply mocks after clearAllMocks resets the mock functions
    Object.assign(mockRequestContext, setupMockRequestContext());
  });

  // ── Initialization ────────────────────────────────────────────────────────

  it('should instantiate successfully', () => {
    expect(client).toBeInstanceOf(BaseApiClient);
  });

  it('should start with authToken set by setToken()', () => {
    expect(client.getToken()).toBe('initial-token');
  });

  it('should start with null authToken on a fresh client', () => {
    const freshClient = new TestApiClient(mockPage as Page);
    expect(freshClient.getToken()).toBeNull();
  });

  // ── Authentication ────────────────────────────────────────────────────────

  it('should store the bearer token after authenticate()', async () => {
    const authResponse = makeMockResponse({
      status: 200,
      json: { data: { token: 'bearer-xyz-789' } },
    });
    mockRequestContext.post = jest.fn<MockHTTPMethod>().mockResolvedValue(authResponse);

    const freshClient = new TestApiClient(mockPage as Page);
    await freshClient.authenticate('Admin', 'admin123');
    expect(freshClient.getToken()).toBe('bearer-xyz-789');
  });

  it('should throw when authenticate() returns a non-ok response', async () => {
    const failResponse = makeMockResponse({ ok: false, status: 401 });
    mockRequestContext.post = jest.fn<MockHTTPMethod>().mockResolvedValue(failResponse);

    const freshClient = new TestApiClient(mockPage as Page);
    await expect(freshClient.authenticate('wrong', 'creds')).rejects.toThrow();
  });

  // ── getAuthHeader() via protected access ─────────────────────────────────

  it('should throw when get() is called without a token', async () => {
    const freshClient = new TestApiClient(mockPage as Page);
    await expect(freshClient.callGet('/api/v2/employees')).rejects.toThrow('Not authenticated');
  });

  // ── GET ───────────────────────────────────────────────────────────────────

  it('should call requestContext.get() for GET requests', async () => {
    await client.callGet('/api/v2/employees');
    expect(mockRequestContext.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/v2/employees'),
      expect.any(Object)
    );
  });

  it('should return the parsed JSON response from GET', async () => {
    const payload = { data: [{ id: 1, name: 'Alice' }] };
    mockRequestContext.get.mockResolvedValueOnce(makeMockResponse({ json: payload }));
    const result = await client.callGet<typeof payload>('/api/v2/employees');
    expect(result).toEqual(payload);
  });

  // ── POST ──────────────────────────────────────────────────────────────────

  it('should call requestContext.post() for POST requests', async () => {
    const body = { firstName: 'John', lastName: 'Doe' };
    await client.callPost('/api/v2/employees', body);
    expect(mockRequestContext.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/v2/employees'),
      expect.objectContaining({ data: body })
    );
  });

  it('should return the parsed JSON response from POST', async () => {
    const payload = { data: { id: 99 } };
    mockRequestContext.post.mockResolvedValueOnce(makeMockResponse({ json: payload }));
    const result = await client.callPost<typeof payload>('/api/v2/employees', {});
    expect(result).toEqual(payload);
  });

  // ── PUT ───────────────────────────────────────────────────────────────────

  it('should call requestContext.put() for PUT requests', async () => {
    await client.callPut('/api/v2/employees/1', { firstName: 'Jane' });
    expect(mockRequestContext.put).toHaveBeenCalledWith(
      expect.stringContaining('/api/v2/employees/1'),
      expect.any(Object)
    );
  });

  it('should return the parsed JSON response from PUT', async () => {
    const payload = { updated: true };
    mockRequestContext.put.mockResolvedValueOnce(makeMockResponse({ json: payload }));
    const result = await client.callPut<typeof payload>('/api/v2/employees/1', {});
    expect(result).toEqual(payload);
  });

  // ── DELETE ────────────────────────────────────────────────────────────────

  it('should call requestContext.delete() for DELETE requests', async () => {
    await client.callDelete('/api/v2/employees/1');
    expect(mockRequestContext.delete).toHaveBeenCalledWith(
      expect.stringContaining('/api/v2/employees/1'),
      expect.any(Object)
    );
  });

  // ── PATCH ─────────────────────────────────────────────────────────────────

  it('should call requestContext.patch() for PATCH requests', async () => {
    await client.callPatch('/api/v2/employees/1', { status: 'active' });
    expect(mockRequestContext.patch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v2/employees/1'),
      expect.any(Object)
    );
  });

  // ── Error Handling ────────────────────────────────────────────────────────

  it('should throw when the API returns a non-ok response', async () => {
    const errorResponse = makeMockResponse({
      ok: false,
      status: 404,
      text: 'Not Found',
    });
    mockRequestContext.get.mockResolvedValueOnce(errorResponse);
    await expect(client.callGet('/api/v2/missing')).rejects.toThrow(/404/);
  });

  it('should throw when the network call itself fails', async () => {
    mockRequestContext.get.mockRejectedValueOnce(new Error('Network error'));
    await expect(client.callGet('/api/v2/employees')).rejects.toThrow('Network error');
  });

  it('should include the Authorization Bearer token in request headers', async () => {
    client.setToken('super-secret-token');
    await client.callGet('/api/v2/employees');
    const callArgs = mockRequestContext.get.mock.calls[0] as unknown as [string, { headers: Record<string, string> }];
    expect(callArgs[1].headers['Authorization']).toBe('Bearer super-secret-token');
  });
});
