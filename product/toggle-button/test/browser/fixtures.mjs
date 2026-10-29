import { buildNativeControlBrowserFixture } from '../../../_test-support/native-controls/native-control-browser-fixture.mjs';

export const browserFixture = {
  component: 'toggle-button',
  prepare: ({ port }) => buildNativeControlBrowserFixture('toggle-button', port),
};
