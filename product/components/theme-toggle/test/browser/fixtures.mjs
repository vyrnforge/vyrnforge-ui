const dragonArt = `
  <svg class="vf-theme-toggle-dragon-art" viewBox="0 0 104 48" width="100%" height="100%" aria-hidden="true" focusable="false">
    <path class="vf-theme-toggle-dragon-crest" d="M101 6C94 5 90 7 85 11L91 1C83 4 77 9 72 14L76 3C68 8 63 13 60 18L70 20L84 19L97 22Z"/>
    <path class="vf-theme-toggle-dragon-upper-jaw" d="M104 8C96 8 90 10 84 13C78 16 72 17 66 17C61 17 57 18 53 20L47 20L43 23L35 24L42 27L51 28L59 27C64 25 69 23 75 23C82 23 88 25 94 28L104 27Z"/>
    <path class="vf-theme-toggle-dragon-brow" d="M58 18L69 14L80 15L73 20L62 21Z"/>
    <path class="vf-theme-toggle-dragon-lower-jaw" d="M104 34C96 33 91 34 85 35C78 36 72 34 67 32C62 31 57 31 53 32L47 34L42 36L48 39C56 43 64 45 73 45C82 45 90 42 96 40L104 43Z"/>
    <path class="vf-theme-toggle-dragon-fangs" d="M47 27L50 33L53 28ZM56 27L59 34L62 27ZM67 25L70 32L73 24ZM50 35L53 31L56 36ZM61 39L64 33L68 40Z"/>
    <path class="vf-theme-toggle-dragon-eye" d="M65 18L73 16L70 21L64 21Z"/>
    <ellipse class="vf-theme-toggle-dragon-nostril" cx="42.5" cy="24.5" rx="1.8" ry="1.2"/>
    <ellipse class="vf-theme-toggle-dragon-mouth-glow" cx="79" cy="30.5" rx="4" ry="2.3"/>
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
