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

# Install Playwright browsers
RUN npx playwright install chromium

# Copy application code
COPY . .

RUN mkdir -p test-results playwright-report allure-results
RUN chmod +x scripts/health-check.sh

ENV CI=true
ENV ORANGEHRM_BASE_URL=https://opensource-demo.orangehrmlive.com

HEALTHCHECK --interval=30s --timeout=35s --start-period=20s --retries=5 \
  CMD /app/scripts/health-check.sh

# Default command
CMD ["npm", "test"]
