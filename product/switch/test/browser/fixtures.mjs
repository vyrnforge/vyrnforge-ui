import { buildNativeControlBrowserFixture } from '../../../../tooling/testing/native-control-browser-fixture.mjs';
await buildNativeControlBrowserFixture('switch', process.argv[2] || 'web');
