import { defineConfig, devices } from '@playwright/test';

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
  readinessPath = '/next/',
  browsers = ['chromium'],
  perPortOutput = true,
  reporter = 'line',
  use = {},
  webServer = {},
  ...config
}) {
  if (!componentId) throw new Error('componentId is required for component browser configuration');
  if (!readinessPath.startsWith('/')) throw new Error('readinessPath must be an absolute URL path');

  const outputRoot = `${repositoryRootFromComponentBrowserConfig}/test-results/${componentId}-playwright-results`;
  const outputDir = perPortOutput ? `${outputRoot}/${port}` : outputRoot;

  return defineConfig({
    testDir: './tests',
    outputDir,
    reporter,
    use: { baseURL: componentBrowserBaseURL, ...use },
    webServer: {
      command: `cd ${repositoryRootFromComponentBrowserConfig} && node tooling/docs/serve.mjs`,
      url: `${componentBrowserBaseURL}${readinessPath}`,
      reuseExistingServer: !process.env.CI,
      ...webServer,
    },
    projects: projectsFor(browsers),
    ...config,
  });
}
