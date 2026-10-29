import { defineConfig, devices } from '@playwright/test';
import { discoverProductUnits } from './tooling/testing/discover-product-units.mjs';

const port = process.env.VF_COMPONENT_PORT || 'web';
const browserDeviceNames = {
  chromium: 'Desktop Chrome',
  firefox: 'Desktop Firefox',
  webkit: 'Desktop Safari',
};
const axeCompatibilityImport = '--import=./tooling/testing/axe-global.mjs';
if (!process.env.NODE_OPTIONS?.includes(axeCompatibilityImport)) {
  process.env.NODE_OPTIONS = [process.env.NODE_OPTIONS, axeCompatibilityImport].filter(Boolean).join(' ');
}

const discovery = discoverProductUnits();
const unsupportedComponentSpecs = discovery.components
  .filter((component) => !component.ports[port])
  .map((component) => `**/${component.component}/test/browser/tests/**/*.spec.mjs`);

export default defineConfig({
  testDir: './product',
  testMatch: '*/test/browser/tests/**/*.spec.mjs',
  testIgnore: unsupportedComponentSpecs,
  outputDir: `test-results/playwright-results/${port}`,
  snapshotPathTemplate: `{testDir}/{testFileDir}/__screenshots__/{arg}-{projectName}{ext}`,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['line'], ['html', { outputFolder: `test-results/playwright-report/${port}`, open: 'never' }]]
    : 'line',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node tooling/testing/prepare-browser-fixtures.mjs && node tooling/testing/browser-server.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: Object.entries(browserDeviceNames).map(([name, deviceName]) => ({
    name,
    use: { ...devices[deviceName] },
  })),
});