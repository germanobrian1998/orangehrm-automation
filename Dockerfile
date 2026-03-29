FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN mkdir -p test-results playwright-report

CMD ["npx", "playwright", "test"]
