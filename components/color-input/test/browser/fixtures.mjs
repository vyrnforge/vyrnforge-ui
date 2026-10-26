import { buildL2BrowserFixture } from '../../../../tooling/testing/native-component-browser-fixture.mjs';
await buildL2BrowserFixture('color-input', process.argv[2] || 'web');
