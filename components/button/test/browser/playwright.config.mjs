import { createComponentBrowserConfig } from '../../../../tooling/testing/component-browser-config.mjs';

export default createComponentBrowserConfig({
  componentId: 'button',
  perPortOutput: false,
  browsers: ['chromium', 'firefox', 'webkit'],
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}-{projectName}{ext}',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI
    ? [['line'], ['html', { outputFolder: '../../../../test-results/button-playwright-report', open: 'never' }]]
    : 'line',
  use: { trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: { timeout: 15_000 },
});
