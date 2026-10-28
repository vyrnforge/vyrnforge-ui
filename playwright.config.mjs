import { defineConfig, devices } from '@playwright/test';

const browserDeviceNames = {
  chromium: 'Desktop Chrome',
  firefox: 'Desktop Firefox',
  webkit: 'Desktop Safari',
};

export default defineConfig({
  testDir: './product',
  testMatch: '*/test/browser/tests/**/*.spec.mjs',
  outputDir: 'test-results/playwright-results',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['line'], ['html', { outputFolder: 'test-results/playwright-report', open: 'never' }]]
    : 'line',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node tooling/testing/browser-server.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
  projects: Object.entries(browserDeviceNames).map(([name, deviceName]) => ({
    name,
    use: { ...devices[deviceName] },
  })),
});
