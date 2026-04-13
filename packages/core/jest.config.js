/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/unit/**/*.spec.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/tests/unit/core-unit.spec.ts',
  ],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: true,
          skipLibCheck: true,
        },
        diagnostics: {
          warnOnly: true,
        },
      },
    ],
  },
  setupFiles: ['<rootDir>/tests/unit/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/types/**',
    '!src/fixtures/**',
    '!src/utils/wait-for.ts',
    '!src/utils/screenshot-manager.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 10000,
  verbose: true,
};
