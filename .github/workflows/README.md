# GitHub Workflows Hardening Guide

This folder contains CI/CD workflows hardened to avoid hidden failures.

## Standards applied

- No `continue-on-error: true` in test/build critical paths
- No `|| true` on lint/build/test commands
- Explicit `timeout-minutes` for jobs
- `scripts/health-check.sh` before OrangeHRM-dependent tests
- Retry loops for flaky browser test commands
- Path validation before artifact/report publish steps
- Correct root Playwright config usage in regression workflows
- Modern k6 apt installation (no deprecated `apt-key adv`)

## Reusable template

`_template.yml` is available as a reusable baseline for future workflows using `workflow_call`.

## Health check usage

```bash
./scripts/health-check.sh
```

Optional environment variables:

- `ORANGEHRM_BASE_URL`
- `HEALTH_CHECK_MAX_ATTEMPTS` (default: 15)
- `HEALTH_CHECK_BASE_DELAY_SECONDS` (default: 2)
- `HEALTH_CHECK_MAX_DELAY_SECONDS` (default: 30)
- `HEALTH_CHECK_CONNECT_TIMEOUT_SECONDS` (default: 5)
- `HEALTH_CHECK_MAX_TIME_SECONDS` (default: 20)
