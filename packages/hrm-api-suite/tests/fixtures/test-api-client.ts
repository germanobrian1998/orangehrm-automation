/**
 * TestApiClient - lightweight HTTP client for mock API tests.
 * Uses native fetch so MSW (msw/node) can intercept all requests.
 */

export class TestApiClient {
  private token: string | null = null;

  constructor(private readonly baseURL: string) {}

  /** Authenticate against the (mocked) token endpoint and store the access token. */
  async authenticate(): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/v2/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'password',
        client_id: 'api_oauth_id',
        client_secret: 'oauth_secret',
        username: 'Admin',
        password: 'admin123',
      }),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: HTTP ${response.status}`);
    }

    const data = (await response.json()) as { access_token: string };
    this.token = data.access_token;
  }

  /** Make an authenticated HTTP request. Throws on non-2xx responses. */
  async request(method: string, path: string, body?: unknown): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }

  /** GET /api/v2/employees */
  async getEmployees(): Promise<{ data: unknown[]; meta: unknown }> {
    const response = await this.request('GET', '/api/v2/employees');
    return response.json() as Promise<{ data: unknown[]; meta: unknown }>;
  }

  /** GET /api/v2/employees/:id */
  async getEmployee(id: number): Promise<{ data: Record<string, unknown> }> {
    const response = await this.request('GET', `/api/v2/employees/${id}`);
    return response.json() as Promise<{ data: Record<string, unknown> }>;
  }

  /** POST /api/v2/employees */
  async createEmployee(employee: Record<string, unknown>): Promise<{ data: Record<string, unknown> }> {
    const response = await this.request('POST', '/api/v2/employees', employee);
    return response.json() as Promise<{ data: Record<string, unknown> }>;
  }

  /** PUT /api/v2/employees/:id */
  async updateEmployee(id: number, employee: Record<string, unknown>): Promise<{ data: Record<string, unknown> }> {
    const response = await this.request('PUT', `/api/v2/employees/${id}`, employee);
    return response.json() as Promise<{ data: Record<string, unknown> }>;
  }

  /** DELETE /api/v2/employees/:id */
  async deleteEmployee(id: number): Promise<void> {
    await this.request('DELETE', `/api/v2/employees/${id}`);
  }
}
