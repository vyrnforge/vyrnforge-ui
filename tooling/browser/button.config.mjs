import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './button-tests',
  outputDir: '../../test-results/button-playwright-results',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}-{projectName}{ext}',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [['line'], ['html', { outputFolder: '../../test-results/button-playwright-report', open: 'never' }]] : 'line',
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: { command: 'node ../docs/serve.mjs', url: 'http://127.0.0.1:4173/next/', reuseExistingServer: !process.env.CI, timeout: 15_000 },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
});
