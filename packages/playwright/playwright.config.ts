import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['line'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: [
    {
      command: 'pnpm --filter frontend dev',
      url: 'http://127.0.0.1:3000',
      reuseExistingServer: !process.env.CI,
      cwd: '../../',
    },
    {
      command: 'pnpm --filter backend dev',
      url: 'http://127.0.0.1:3001/health',
      reuseExistingServer: !process.env.CI,
      cwd: '../../',
    },
  ],
});
