import { buildNativeControlBrowserFixture } from '../../../_test-support/native-controls/native-control-browser-fixture.mjs';

export const browserFixture = {
  component: 'slider',
  prepare: ({ port }) => buildNativeControlBrowserFixture('slider', port),
};
