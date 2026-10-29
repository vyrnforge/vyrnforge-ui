import { buildNativeControlBrowserFixture } from '../../../_test-support/native-controls/native-control-browser-fixture.mjs';

export const browserFixture = {
  component: 'link',
  prepare: ({ port }) => buildNativeControlBrowserFixture('link', port),
};
