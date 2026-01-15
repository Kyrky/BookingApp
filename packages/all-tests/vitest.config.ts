import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'all-tests',
    include: [
      'apps/backend/src/**/__tests__/**/*.test.ts',
      'packages/dto/src/**/__tests__/**/*.test.ts',
      'packages/shared/src/**/__tests__/**/*.test.ts',
      'packages/validation/src/**/__tests__/**/*.test.ts',
    ],
    exclude: [
      'node_modules',
      '**/node_modules',
      'dist',
      '.next',
      '**/dist',
      'apps/frontend',
      'packages/all-tests',
    ],
    passWithNoTests: false,
    reporters: ['default', 'json'],
    outputFile: {
      json: 'packages/all-tests/reports/test-results.json',
    },
    setupFiles: ['packages/all-tests/src/summary.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['html', 'lcov', 'text'],
      reportsDirectory: 'packages/all-tests/coverage',
      all: true,
      include: [
        'apps/backend/src/**/*.ts',
        'packages/*/src/**/*.ts',
      ],
      exclude: [
        '**/*.test.ts',
        '**/__tests__/**',
        '**/node_modules/**',
        'apps/frontend/**',
        'packages/all-tests/**',
      ],
    },
  },
});
