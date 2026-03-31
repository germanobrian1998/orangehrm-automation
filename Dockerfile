FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

# Copy workspace manifests first to leverage Docker layer caching
COPY package*.json ./
COPY .npmrc ./
COPY packages/core/package*.json ./packages/core/
COPY packages/shared-utils/package*.json ./packages/shared-utils/
COPY packages/orangehrm-suite/package*.json ./packages/orangehrm-suite/
COPY packages/hrm-api-suite/package*.json ./packages/hrm-api-suite/

RUN npm ci

# Copy the rest of the source
COPY . .

RUN mkdir -p test-results playwright-report allure-results

ENV CI=true

CMD ["npm", "test"]