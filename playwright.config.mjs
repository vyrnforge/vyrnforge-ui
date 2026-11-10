import { defineConfig, devices } from '@playwright/test';
import { discoverProductGraph } from './tooling/product/discover-product-graph.mjs';

const port = process.env.VF_COMPONENT_PORT || 'web';
const selectedComponents = new Set(
  (process.env.VF_COMPONENTS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
);
const browserDeviceNames = {
  chromium: 'Desktop Chrome',
  firefox: 'Desktop Firefox',
  webkit: 'Desktop Safari',
};

const graph = discoverProductGraph();
const browserOwners = [...graph.components, ...graph.patterns];
const unsupportedComponentSpecs = browserOwners
  .filter((owner) => !owner.surfaces[port])
  .map((owner) => `**/${owner.unitId}/test/browser/tests/**/*.spec.mjs`);
const unselectedComponentSpecs =
  selectedComponents.size > 0
    ? browserOwners
        .filter((owner) => !selectedComponents.has(owner.unitId))
        .map((owner) => `**/${owner.unitId}/test/browser/tests/**/*.spec.mjs`)
    : [];

export default defineConfig({
  testDir: './product',
  testMatch: '*/test/browser/tests/**/*.spec.mjs',
  testIgnore: [...new Set([...unsupportedComponentSpecs, ...unselectedComponentSpecs])],
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
    use: { ...devices[deviceName], colorScheme: 'light' },
  })),
});
