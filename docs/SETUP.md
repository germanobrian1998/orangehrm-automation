🛠️ Environment Setup Guide

Complete guide to set up the project locally and in CI/CD.

## Local Development Setup

### Step 1: Prerequisites

```bash
# Check versions (should be 18+)
node -v
npm -v

# Install Git if not present
git --version
Step 2: Clone Repository
bash
git clone https://github.com/germanobrian1998/orangehrm-automation.git
cd orangehrm-automation
Step 3: Install Dependencies
bash
# Use npm ci (cleaner installs)
npm ci

# Install Playwright browsers
npx playwright install --with-deps chromium
Step 4: Create Local Environment File
bash
# Copy example
cp .env.example .env.local

# Edit .env.local (DON'T commit this!)
nano .env.local
Step 5: Verify Setup
bash
# Run a single test to verify everything works
npm run test tests/smoke/login.smoke.spec.ts

# Should output:
# ✓ Admin can login successfully
GitHub Secrets Setup
For CI/CD, add these secrets to your repo:

Go to: https://github.com/YOUR_USERNAME/orangehrm-automation/settings/secrets/actions

Add these secrets:

Code
ORANGEHRM_BASE_URL = https://opensource-demo.orangehrmlive.com
ORANGEHRM_ADMIN_USERNAME = Admin
ORANGEHRM_ADMIN_PASSWORD = admin123
Why separate from .env.local?

✅ Sensitive data not in code
✅ Can be different per environment
✅ Automatically encrypted by GitHub
Troubleshooting
Issue: "browser not found"
bash
npx playwright install --with-deps chromium
Issue: ".env.local not found"
bash
cp .env.example .env.local
nano .env.local  # Add credentials
Issue: "Cannot find module"
bash
rm -rf node_modules package-lock.json
npm ci
Verifying CI/CD
Push a test commit and check workflows:

bash
git add .
git commit -m "Test CI/CD"
git push origin main

# Check: https://github.com/YOUR_USERNAME/orangehrm-automation/actions
```
