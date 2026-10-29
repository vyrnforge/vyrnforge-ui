import { buildNativeControlBrowserFixture } from '../../../_test-support/native-controls/native-control-browser-fixture.mjs';

export const browserFixture = {
  component: 'native-select',
  prepare: ({ port }) => buildNativeControlBrowserFixture('native-select', port),
};
