import { buildL2BrowserFixture } from '../../../../testing/l2/browser/fixture.mjs';
await buildL2BrowserFixture('switch', process.argv[2] || 'web');
