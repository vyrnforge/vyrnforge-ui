import { buildNativeControlBrowserFixture } from '../../../_test-support/native-controls/native-control-browser-fixture.mjs';

export const browserFixture = {
  component: 'number-input',
  prepare: ({ port }) => buildNativeControlBrowserFixture('number-input', port),
};
