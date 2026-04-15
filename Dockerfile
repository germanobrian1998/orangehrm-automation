FROM node:18-alpine

WORKDIR /app

# Install system dependencies for Playwright
RUN apk add --no-cache \
    chromium \
    curl \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Install dependencies
COPY package*.json ./
COPY .npmrc ./
COPY packages/core/package*.json ./packages/core/
COPY packages/shared-utils/package*.json ./packages/shared-utils/
COPY packages/orangehrm-suite/package*.json ./packages/orangehrm-suite/
COPY packages/hrm-api-suite/package*.json ./packages/hrm-api-suite/
RUN npm ci

# Install Playwright browsers used in CI
RUN npx playwright install chromium

# Copy application code
COPY . .
COPY scripts/health-check.sh /app/scripts/health-check.sh

RUN mkdir -p test-results playwright-report allure-results
RUN chmod +x /app/scripts/health-check.sh

ENV CI=true

# Default command
CMD ["npm", "test"]
