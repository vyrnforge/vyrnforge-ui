import { createComponentBrowserConfig } from '../../../../tooling/testing/component-browser-config.mjs';

const port = process.env.VF_COMPONENT_PORT || 'react';

export default createComponentBrowserConfig({
  componentId: 'toolbar',
  port,
  readinessPath: `/next/toolbar-fixtures/${port}.html`,
});
