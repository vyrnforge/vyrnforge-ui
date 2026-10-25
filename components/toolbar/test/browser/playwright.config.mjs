import { defineConfig, devices } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'react';
const fixtureUrl = `http://127.0.0.1:4173/next/toolbar-fixtures/${port}.html`;

export default defineConfig({
  testDir: './tests',
  outputDir: `../../../../test-results/toolbar-playwright-results/${port}`,
  reporter: 'line',
  use: { baseURL: 'http://127.0.0.1:4173' },
  webServer: {
    command: 'cd ../../../.. && node tooling/docs/serve.mjs',
    url: fixtureUrl,
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
