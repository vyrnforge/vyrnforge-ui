import { defineConfig, devices } from '@playwright/test';
import { componentBrowserServerManagedEnv } from './component-browser-runtime.mjs';

const repositoryRootFromComponentBrowserConfig = '../../../..';
const componentBrowserBaseURL = 'http://127.0.0.1:4173';
const browserDeviceNames = {
  chromium: 'Desktop Chrome',
  firefox: 'Desktop Firefox',
  webkit: 'Desktop Safari',
};

function projectsFor(browsers) {
  return browsers.map((browser) => {
    const deviceName = browserDeviceNames[browser];
    if (!deviceName) throw new Error(`Unsupported component browser project: ${browser}`);
    return { name: browser, use: { ...devices[deviceName] } };
  });
}

export function createComponentBrowserConfig({
  componentId,
  port = process.env.VF_COMPONENT_PORT || 'react',
  readinessPath,
  browsers = ['chromium'],
  perPortOutput = true,
  reporter = 'line',
  use = {},
  webServer = {},
  ...config
}) {
  if (!componentId) throw new Error('componentId is required for component browser configuration');

  const resolvedReadinessPath = readinessPath ?? `/components/${componentId}/${port}.html`;
  if (!resolvedReadinessPath.startsWith('/')) throw new Error('readinessPath must be an absolute URL path');

  const outputRoot = `${repositoryRootFromComponentBrowserConfig}/test-results/${componentId}-playwright-results`;
  const outputDir = perPortOutput ? `${outputRoot}/${port}` : outputRoot;
  const managedServer = process.env[componentBrowserServerManagedEnv] === '1';

  return defineConfig({
    testDir: './tests',
    outputDir,
    reporter,
    use: { baseURL: componentBrowserBaseURL, ...use },
    webServer: managedServer ? undefined : {
      command: `cd ${repositoryRootFromComponentBrowserConfig} && node tooling/testing/browser-server.mjs`,
      url: `${componentBrowserBaseURL}${resolvedReadinessPath}`,
      reuseExistingServer: !process.env.CI,
      ...webServer,
    },
    projects: projectsFor(browsers),
    ...config,
  });
}

export function createCrossBrowserComponentBrowserConfig({
  componentId,
  port = process.env.VF_COMPONENT_PORT || 'web',
  readinessPath,
  perPortOutput = false,
  ...config
}) {
  if (!componentId) throw new Error('componentId is required for component browser configuration');
  const reportRoot = `${repositoryRootFromComponentBrowserConfig}/test-results/${componentId}-playwright-report`;
  const outputFolder = perPortOutput ? `${reportRoot}/${port}` : reportRoot;
  return createComponentBrowserConfig({
    componentId,
    port,
    readinessPath,
    perPortOutput,
    browsers: ['chromium', 'firefox', 'webkit'],
    timeout: 30_000,
    expect: { timeout: 5_000 },
    fullyParallel: false,
    forbidOnly: Boolean(process.env.CI),
    retries: 0,
    reporter: process.env.CI ? [['line'], ['html', { outputFolder, open: 'never' }]] : 'line',
    use: { trace: 'retain-on-failure', screenshot: 'only-on-failure' },
    webServer: { timeout: 15_000 },
    ...config,
  });
}
