/**
 * MSW Mock Handlers for OrangeHRM API
 * Intercepts HTTP requests and returns mock responses for offline testing.
 */

import { http, HttpResponse } from 'msw';

const API_BASE = process.env.ORANGEHRM_BASE_URL || 'https://opensource-demo.orangehrmlive.com';

export const handlers = [
  // Authentication endpoint
  http.post(`${API_BASE}/api/v2/oauth/token`, () => {
    return HttpResponse.json({
      access_token: 'mock-token-12345',
      token_type: 'Bearer',
      expires_in: 3600,
    });
  }),

  // Error scenario: 404 for missing employee (must be before /:id catch-all)
  http.get(`${API_BASE}/api/v2/employees/99999`, () => {
    return HttpResponse.json(
      { error: 'Employee not found' },
      { status: 404 }
    );
  }),

  // Error scenario: 401 for unauthorized
  http.get(`${API_BASE}/api/v2/protected`, () => {
    return HttpResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }),

  // GET /api/v2/employees
  http.get(`${API_BASE}/api/v2/employees`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          empNumber: 1,
          firstName: 'John',
          lastName: 'Doe',
          middleName: 'M',
          email: 'john@example.com',
          status: 'Active',
        },
        {
          id: 2,
          empNumber: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          status: 'Active',
        },
      ],
      meta: {
        total: 2,
        offset: 0,
        limit: 50,
      },
    });
  }),

  // POST /api/v2/employees
  http.post(`${API_BASE}/api/v2/employees`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json(
      {
        data: {
          id: 3,
          ...body,
        },
      },
      { status: 201 }
    );
  }),

  // GET /api/v2/employees/:id
  http.get(`${API_BASE}/api/v2/employees/:id`, ({ params }) => {
    return HttpResponse.json({
      data: {
        id: params.id,
        empNumber: params.id,
        firstName: 'Employee',
        lastName: 'Name',
        email: 'emp@example.com',
        status: 'Active',
      },
    });
  }),

  // PUT /api/v2/employees/:id
  http.put(`${API_BASE}/api/v2/employees/:id`, async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      data: {
        id: params.id,
        ...body,
      },
    });
  }),

  // DELETE /api/v2/employees/:id
  http.delete(`${API_BASE}/api/v2/employees/:id`, () => {
    return HttpResponse.json({}, { status: 204 });
  }),
];
