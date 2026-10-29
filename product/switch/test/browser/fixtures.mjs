import { buildNativeControlBrowserFixture } from '../../../_test-support/native-controls/native-control-browser-fixture.mjs';

export const browserFixture = {
  component: 'switch',
  prepare: ({ port }) => buildNativeControlBrowserFixture('switch', port),
};
