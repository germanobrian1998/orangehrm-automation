/**
 * Mock axios client for unit testing BaseApiClient
 */

import type { AxiosInstance, AxiosResponse } from 'axios';

/** Create a mock Axios response */
export const createMockAxiosResponse = <T>(data: T, status = 200): AxiosResponse<T> => ({
  data,
  status,
  statusText: status === 200 ? 'OK' : String(status),
  headers: { 'content-type': 'application/json' },
  config: { headers: {} } as AxiosResponse['config'],
});

/** Create a mock Axios instance */
export const createMockAxios = (): jest.Mocked<AxiosInstance> => {
  const instance: jest.Mocked<AxiosInstance> = {
    get: jest.fn().mockResolvedValue(createMockAxiosResponse({})),
    post: jest.fn().mockResolvedValue(createMockAxiosResponse({}, 201)),
    put: jest.fn().mockResolvedValue(createMockAxiosResponse({})),
    delete: jest.fn().mockResolvedValue(createMockAxiosResponse({}, 204)),
    patch: jest.fn().mockResolvedValue(createMockAxiosResponse({})),
    request: jest.fn().mockResolvedValue(createMockAxiosResponse({})),
    head: jest.fn().mockResolvedValue(createMockAxiosResponse({})),
    options: jest.fn().mockResolvedValue(createMockAxiosResponse({})),
    interceptors: {
      request: {
        use: jest.fn(),
        eject: jest.fn(),
        clear: jest.fn(),
        forEach: jest.fn(),
      },
      response: {
        use: jest.fn(),
        eject: jest.fn(),
        clear: jest.fn(),
        forEach: jest.fn(),
      },
    },
    defaults: {
      headers: {
        common: {},
        delete: {},
        get: {},
        head: {},
        post: {},
        put: {},
        patch: {},
      },
      baseURL: '',
      timeout: 0,
    } as unknown as AxiosInstance['defaults'],
  } as unknown as jest.Mocked<AxiosInstance>;

  return instance;
};

export type MockAxios = ReturnType<typeof createMockAxios>;
