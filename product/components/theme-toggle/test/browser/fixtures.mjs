export const browserFixture = {
  component: 'theme-toggle',
  title: 'Theme Toggle fixture',
  heading: 'Theme Toggle contract fixture',
  ports: {
    web: {
      body: `
      <section data-visual-matrix aria-label="Theme Toggle visual states">
        <label data-vf-theme-toggle>
          <input id="light-theme" type="checkbox" role="switch" data-vf-theme-toggle-control aria-label="Dark theme">
          <span data-vf-theme-toggle-track aria-hidden="true">
            <span data-vf-theme-toggle-clouds></span>
            <span data-vf-theme-toggle-stars></span>
            <span data-vf-theme-toggle-thumb>
              <span data-vf-theme-toggle-sun></span>
              <span data-vf-theme-toggle-moon></span>
            </span>
          </span>
        </label>
        <label data-vf-theme-toggle>
          <input id="dark-theme" type="checkbox" role="switch" data-vf-theme-toggle-control aria-label="Dark theme selected" checked>
          <span data-vf-theme-toggle-track aria-hidden="true">
            <span data-vf-theme-toggle-clouds></span>
            <span data-vf-theme-toggle-stars></span>
            <span data-vf-theme-toggle-thumb>
              <span data-vf-theme-toggle-sun></span>
              <span data-vf-theme-toggle-moon></span>
            </span>
          </span>
        </label>
        <label data-vf-theme-toggle>
          <input id="disabled-theme" type="checkbox" role="switch" data-vf-theme-toggle-control aria-label="Disabled dark theme" disabled>
          <span data-vf-theme-toggle-track aria-hidden="true">
            <span data-vf-theme-toggle-clouds></span>
            <span data-vf-theme-toggle-stars></span>
            <span data-vf-theme-toggle-thumb>
              <span data-vf-theme-toggle-sun></span>
              <span data-vf-theme-toggle-moon></span>
            </span>
          </span>
        </label>
      </section>`,
    },
  },
};
