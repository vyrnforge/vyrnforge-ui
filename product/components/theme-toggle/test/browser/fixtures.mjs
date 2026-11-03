const dragonArt = `
  <svg class="vf-theme-toggle-dragon-art" viewBox="0 0 64 56" width="100%" height="100%" aria-hidden="true" focusable="false">
    <path class="vf-theme-toggle-dragon-neck" d="M64 9C57 7 52 9 48 13C45 17 44 22 45 28C46 36 51 44 60 51L64 53Z"/>
    <path class="vf-theme-toggle-dragon-crest" d="M48 14C54 10 59 5 62 0C54 1 46 5 40 11C43 10 46 11 48 14ZM39 13C42 9 44 4 43 0C37 3 31 8 28 14C32 12 36 12 39 13Z"/>
    <path class="vf-theme-toggle-dragon-upper-jaw" d="M61 14C55 11 49 12 44 15L38 18L32 17L27 15L23 18L20 21L14 22L10 24L4 24L1 27L4 30L11 31L17 30L23 28L30 27L36 28L42 31L49 31L55 29L61 32L64 31L64 16Z"/>
    <path class="vf-theme-toggle-dragon-cheek" d="M39 18L49 16L57 19L52 25L43 27L35 24Z"/>
    <path class="vf-theme-toggle-dragon-brow" d="M23 20L31 16L40 17L35 22L27 23Z"/>
    <path class="vf-theme-toggle-dragon-lower-jaw" d="M64 35L58 33L52 34L46 33L40 32L34 31L28 32L23 34L17 34L11 32L6 32L9 37L15 42L23 46L32 49L42 49L51 46L58 43L64 47Z"/>
    <path class="vf-theme-toggle-dragon-fangs" d="M12 31L15 35L18 31ZM21 29L24 34L27 29ZM31 28L34 33L37 28ZM17 35L20 39L23 35ZM27 39L30 43L33 38Z"/>
    <path class="vf-theme-toggle-dragon-eye" d="M27 19L35 18L32 22L26 22Z"/>
    <ellipse class="vf-theme-toggle-dragon-nostril" cx="6.5" cy="27.2" rx="1.6" ry="1"/>
    <ellipse class="vf-theme-toggle-dragon-mouth-glow" cx="44" cy="32" rx="2.4" ry="1.6"/>
    <path class="vf-theme-toggle-dragon-scales" d="M45 20L52 18M47 24L55 22M49 41L56 38"/>
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
