import { createCrossBrowserComponentBrowserConfig } from '../../../../tooling/testing/component-browser-config.mjs';

const port = process.env.VF_COMPONENT_PORT || 'web';

export default createCrossBrowserComponentBrowserConfig({ componentId: 'layout', port, perPortOutput: true });
