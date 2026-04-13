# API Documentation

## Base URL

- **Production**: https://prod-api.example.com
- **Staging**: https://staging.example.com
- **Demo**: https://opensource-demo.orangehrmlive.com

## Authentication

All API endpoints (except login) require Bearer token authentication:

```
Authorization: Bearer <access_token>
```

### Obtaining a Token

**POST** `/api/v2/oauth/token`

```json
{
  "username": "Admin",
  "password": "admin123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

---

## Endpoints

### Employees

#### GET `/api/v2/employees`

Retrieve a list of all employees.

**Query Parameters:**

| Parameter | Type    | Description                 |
| --------- | ------- | --------------------------- |
| `limit`   | integer | Number of records to return |
| `offset`  | integer | Record offset               |

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "empNumber": 1001,
      "firstName": "John",
      "lastName": "Doe",
      "middleName": "",
      "email": "john.doe@example.com",
      "status": "Active"
    }
  ]
}
```

---

#### POST `/api/v2/employees`

Create a new employee.

**Request Body:**

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "middleName": "M",
  "email": "jane.smith@example.com"
}
```

**Response (201):**

```json
{
  "data": {
    "id": 2,
    "empNumber": 1002,
    "firstName": "Jane",
    "lastName": "Smith",
    "middleName": "M",
    "email": "jane.smith@example.com",
    "status": "Active"
  }
}
```

---

#### GET `/api/v2/employees/{id}`

Retrieve details of a specific employee.

**Path Parameters:**

| Parameter | Type    | Description |
| --------- | ------- | ----------- |
| `id`      | integer | Employee ID |

**Response (200):**

```json
{
  "data": {
    "id": 1,
    "empNumber": 1001,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "status": "Active"
  }
}
```

---

#### PUT `/api/v2/employees/{id}`

Update an existing employee.

**Path Parameters:**

| Parameter | Type    | Description |
| --------- | ------- | ----------- |
| `id`      | integer | Employee ID |

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Updated",
  "email": "john.updated@example.com"
}
```

**Response (200):**

```json
{
  "data": {
    "id": 1,
    "empNumber": 1001,
    "firstName": "John",
    "lastName": "Updated",
    "email": "john.updated@example.com",
    "status": "Active"
  }
}
```

---

#### DELETE `/api/v2/employees/{id}`

Delete an employee.

**Path Parameters:**

| Parameter | Type    | Description |
| --------- | ------- | ----------- |
| `id`      | integer | Employee ID |

**Response (204):** No content

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Invalid request body"
}
```

### 401 Unauthorized

```json
{
  "error": "Missing or invalid authentication token"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found"
}
```

---

## Interactive API Explorer

The Swagger UI is available at `/api-docs` when running the local documentation server.

To serve the interactive documentation locally:

```bash
# Validate the OpenAPI specification
npm run api-docs:validate

# Preview the API documentation (available at http://localhost:8888)
npm run api-docs:preview
```

The full OpenAPI 3.0 specification is located at [`docs/openapi.yml`](./openapi.yml).

---

## Writing API Tests

### API test checklist

- [ ] Use fixtures from `apiFixtures.ts` — do not hardcode test data
- [ ] Assert both the happy path and error scenarios
- [ ] Verify response schema (required fields, correct types)
- [ ] Clean up created resources in `afterEach` or at the end of the test
- [ ] Tag tests with `@api` for targeted runs

### Running API Tests

```bash
# Run all API tests
npm run test:api:staging

# Run API tests in the hrm-api-suite package
npm run test:hrm-api
```
