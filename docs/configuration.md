# Configuration

## Environment Variables

Configuration is managed through environment files:

- `.env.dev` - Development environment
- `.env.staging` - Staging environment
- `.env.ci` - CI environment
- `.env.mock` - Mock API environment
- `.env.prod` - Production environment

## Key Variables

```bash
BASE_URL=https://opensource-demo.orangehrmlive.com
API_BASE_URL=https://opensource-demo.orangehrmlive.com
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=admin123
```

## Playwright Configuration

See `playwright.config.ts` for browser and test settings:

```typescript
// playwright.config.ts
export default defineConfig({
  timeout: 30000,
  retries: 2,
  workers: 4,
  reporter: [['allure-playwright']],
});
```
