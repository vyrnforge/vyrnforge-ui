import { buildL2BrowserFixture } from '../../../../tooling/testing/native-component-browser-fixture.mjs';
await buildL2BrowserFixture('link', process.argv[2] || 'web');
