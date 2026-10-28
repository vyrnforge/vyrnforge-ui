import { buildNativeControlBrowserFixture } from '../../../_test-support/native-controls/native-control-browser-fixture.mjs';
await buildNativeControlBrowserFixture('checkbox', process.argv[2] || 'web');
