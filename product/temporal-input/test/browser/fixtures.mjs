import { buildNativeControlBrowserFixture } from '../../../../tooling/testing/native-control-browser-fixture.mjs';
await buildNativeControlBrowserFixture('temporal-input', process.argv[2] || 'web');
