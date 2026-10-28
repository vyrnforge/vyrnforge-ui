import { buildNativeControlBrowserFixture } from '../../../_test-support/native-controls/native-control-browser-fixture.mjs';
await buildNativeControlBrowserFixture('color-input', process.argv[2] || 'web');
