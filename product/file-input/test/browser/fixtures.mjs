import { buildNativeControlBrowserFixture } from '../../../../tooling/testing/native-control-browser-fixture.mjs';
await buildNativeControlBrowserFixture('file-input', process.argv[2] || 'web');
