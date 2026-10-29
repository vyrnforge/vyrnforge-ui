import { buildNativeControlBrowserFixture } from '../../../_test-support/native-controls/native-control-browser-fixture.mjs';

export const browserFixture = {
  component: 'color-input',
  prepare: ({ port }) => buildNativeControlBrowserFixture('color-input', port),
};
