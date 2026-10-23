import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function createL2BrowserConfig(componentId, configUrl) {
  const configDir = path.dirname(fileURLToPath(configUrl));
  const root = path.resolve(configDir, '../../../..');
  return defineConfig({
    testDir: path.join(configDir, 'tests'),
    outputDir: path.join(root, `test-results/${componentId}-playwright-results`),
    timeout: 30_000,
    expect: { timeout: 5_000 },
    fullyParallel: false,
    forbidOnly: Boolean(process.env.CI),
    retries: 0,
    reporter: process.env.CI ? [['line'], ['html', { outputFolder: path.join(root, `test-results/${componentId}-playwright-report`), open: 'never' }]] : 'line',
    use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
    webServer: { command: 'node tooling/docs/serve.mjs', cwd: root, url: 'http://127.0.0.1:4173/next/', reuseExistingServer: !process.env.CI, timeout: 15_000 },
    projects: [
      { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
      { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
      { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    ],
  });
}
