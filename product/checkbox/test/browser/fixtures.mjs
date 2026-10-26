import { buildNativeControlBrowserFixture } from '../../../../tooling/testing/native-control-browser-fixture.mjs';
await buildNativeControlBrowserFixture('checkbox', process.argv[2] || 'web');
