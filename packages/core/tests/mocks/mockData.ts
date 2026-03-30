/**
 * Mock data used across unit tests for the core framework.
 */

export const mockCredentials = {
  username: 'admin',
  password: 'Admin1234!',
};

export const mockEmployee = {
  id: 1,
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  status: 'Enabled' as const,
};

export const mockApiResponse = {
  data: mockEmployee,
  success: true,
  message: 'OK',
  status: 200,
};

export const mockPaginatedResponse = {
  data: [mockEmployee],
  meta: {
    total: 1,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  },
};
