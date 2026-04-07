# API Reference

See [OpenAPI Specification](https://github.com/germanobrian1998/orangehrm-automation/blob/main/docs/openapi.yml) for the complete endpoint reference.

## Authentication

All endpoints require Bearer token:

```
Authorization: Bearer <access_token>
```

## Endpoints

- `POST /api/v2/oauth/token` - Authenticate
- `GET /api/v2/employees` - List employees
- `POST /api/v2/employees` - Create employee
- `GET /api/v2/employees/{id}` - Get employee
- `PUT /api/v2/employees/{id}` - Update employee
- `DELETE /api/v2/employees/{id}` - Delete employee
