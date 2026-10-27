import { buildNativeControlBrowserFixture } from '../../../../tooling/testing/native-control-browser-fixture.mjs';
await buildNativeControlBrowserFixture('toggle-button', process.argv[2] || 'web');
