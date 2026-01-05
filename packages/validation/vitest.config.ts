import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'validation',
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/__tests__/**', 'node_modules/**'],
      thresholds: {
        statements: 85,
        functions: 85,
        branches: 80,
        lines: 85,
      },
    },
  },
});
