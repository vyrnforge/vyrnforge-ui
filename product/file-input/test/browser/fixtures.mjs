import { buildNativeControlBrowserFixture } from '../../../_test-support/native-controls/native-control-browser-fixture.mjs';

export const browserFixture = {
  component: 'file-input',
  prepare: ({ port }) => buildNativeControlBrowserFixture('file-input', port),
};
