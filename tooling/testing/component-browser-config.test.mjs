import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createComponentBrowserConfig,
  createCrossBrowserComponentBrowserConfig,
} from './component-browser-config.mjs';

test('component browser config waits for the generated component fixture by default', () => {
  const config = createComponentBrowserConfig({ componentId: 'checkbox', port: 'vue' });
  assert.equal(config.webServer.url, 'http://127.0.0.1:4173/next/checkbox-fixtures/vue.html');
  assert.equal(config.outputDir, '../../../../test-results/checkbox-playwright-results/vue');
});

test('cross-browser profile preserves the legacy web default and generated fixture readiness', () => {
  const config = createCrossBrowserComponentBrowserConfig({ componentId: 'checkbox' });
  assert.equal(config.webServer.url, 'http://127.0.0.1:4173/next/checkbox-fixtures/web.html');
  assert.equal(config.outputDir, '../../../../test-results/checkbox-playwright-results');
  assert.deepEqual(config.projects.map((project) => project.name), ['chromium', 'firefox', 'webkit']);
});

test('component-specific readiness paths remain supported', () => {
  const config = createComponentBrowserConfig({
    componentId: 'toolbar',
    port: 'react',
    readinessPath: '/next/custom-toolbar-fixture.html',
  });
  assert.equal(config.webServer.url, 'http://127.0.0.1:4173/next/custom-toolbar-fixture.html');
});
