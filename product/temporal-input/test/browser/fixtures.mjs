import { buildNativeControlBrowserFixture } from '../../../_test-support/native-controls/native-control-browser-fixture.mjs';

export const browserFixture = {
  component: 'temporal-input',
  prepare: ({ port }) => buildNativeControlBrowserFixture('temporal-input', port),
};
