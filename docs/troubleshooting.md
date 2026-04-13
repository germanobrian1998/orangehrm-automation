# Troubleshooting

## Common Issues

### Tests fail with "Executable doesn't exist"

Ensure Playwright browsers are installed:

```bash
npx playwright install --with-deps
```

### Timeout errors

Increase timeout in playwright.config.ts:

```typescript
timeout: 30000,  // 30 seconds
```

### Network errors

Use mock API for offline testing:

```bash
npm run test:mock
```

## Getting Help

- Check [FAQ](faq.md)
- Review test logs in `test-results/`
- Check Allure reports: `npm run test:report`
