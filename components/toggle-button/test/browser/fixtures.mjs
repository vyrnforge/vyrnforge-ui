import { buildL2BrowserFixture } from '../../../../testing/l2/browser/fixture.mjs';
await buildL2BrowserFixture('toggle-button', process.argv[2] || 'web');
