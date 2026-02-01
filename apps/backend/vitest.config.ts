import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'backend',
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.interface.ts',
        'src/**/*.dto.ts',
        'src/**/__tests__/**',
        'node_modules/**',
      ],
      thresholds: {
        statements: 80,
        functions: 80,
        branches: 75,
        lines: 80,
      },
    },
  },
});
