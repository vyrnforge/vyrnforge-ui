const dragonArt = `
  <svg class="vf-theme-toggle-dragon-art" viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true" focusable="false">
    <path class="vf-theme-toggle-dragon-body" d="M40.5 21.5C40.2 15.9 37.4 10.8 32.8 7.9C25.1 3 14.5 5 8.8 12.4C2.5 20.5 4.6 32.6 13.6 38C22.4 43.3 34 39.9 38.5 31.2"/>
    <path class="vf-theme-toggle-dragon-wing" d="M17.1 10.7C20.2 4.7 27.6 2 34 4.3C30.5 5.9 27.8 8.4 25.8 11.8C23.4 10.6 20.1 10.2 17.1 10.7Z"/>
    <path class="vf-theme-toggle-dragon-head" d="M40.2 18.2C43.8 17.4 46.2 19.2 46.7 21.5L43.7 21.5L46 24L43.3 24.8L41 28.8L37.7 26.2L39 23.1L36.5 21.5Z"/>
    <circle class="vf-theme-toggle-dragon-eye" cx="42.4" cy="21.1" r="0.9"/>
  </svg>`;

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
            <span data-vf-theme-toggle-breath></span>
            <span data-vf-theme-toggle-dragon data-vf-theme-toggle-dragon-artwork>${dragonArt}</span>
            <span data-vf-theme-toggle-thumb>
              <span data-vf-theme-toggle-ember></span>
            </span>
          </span>
        </label>
        <label data-vf-theme-toggle>
          <input id="dark-theme" type="checkbox" role="switch" data-vf-theme-toggle-control aria-label="Dark theme selected" checked>
          <span data-vf-theme-toggle-track aria-hidden="true">
            <span data-vf-theme-toggle-breath></span>
            <span data-vf-theme-toggle-dragon data-vf-theme-toggle-dragon-artwork>${dragonArt}</span>
            <span data-vf-theme-toggle-thumb>
              <span data-vf-theme-toggle-ember></span>
            </span>
          </span>
        </label>
        <label data-vf-theme-toggle>
          <input id="disabled-theme" type="checkbox" role="switch" data-vf-theme-toggle-control aria-label="Disabled dark theme" disabled>
          <span data-vf-theme-toggle-track aria-hidden="true">
            <span data-vf-theme-toggle-breath></span>
            <span data-vf-theme-toggle-dragon data-vf-theme-toggle-dragon-artwork>${dragonArt}</span>
            <span data-vf-theme-toggle-thumb>
              <span data-vf-theme-toggle-ember></span>
            </span>
          </span>
        </label>
      </section>`,
    },
  },
};
