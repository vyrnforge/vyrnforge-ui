import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'foundation.spec.mjs',
  outputDir: 'test-results/playwright-results/foundation-visual',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [['line'], ['html', { outputFolder: 'test-results/playwright-report/foundation-visual', open: 'never' }]] : 'line',
  use: {
    browserName: 'chromium',
    viewport: { width: 480, height: 260 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    reducedMotion: 'no-preference',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
