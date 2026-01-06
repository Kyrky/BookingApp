import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'frontend',
    environment: 'jsdom',
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'dist'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/__tests__/**',
        'node_modules/**',
        '.next/**',
      ],
      thresholds: {
        statements: 70,
        functions: 70,
        branches: 65,
        lines: 70,
      },
    },
  },
});
