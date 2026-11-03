const dragonArt = `
  <svg class="vf-theme-toggle-dragon-art" viewBox="0 0 72 56" width="100%" height="100%" aria-hidden="true" focusable="false">
          <path class="vf-theme-toggle-dragon-body" d="M31 17C38 24 38 34 32 42C26 50 14 51 8 43C2 36 4 25 12 19C17 15 24 15 29 20"/>
          <path class="vf-theme-toggle-dragon-tail" d="M29 42C39 49 50 47 58 41C61 39 63 36 65 33"/>
          <path class="vf-theme-toggle-dragon-body-detail" d="M31 20C35 25 35 31 32 36M30 44C41 46 51 43 57 39"/>
          <path class="vf-theme-toggle-dragon-tail-plume" d="M59 39C64 38 68 35 71 31C69 36 69 40 71 44C67 42 63 42 58 44C61 42 61 41 59 39Z"/>
          <path class="vf-theme-toggle-dragon-head" d="M18 13C20 9 25 7 30 8L32 4L33 9L39 6L36 12C41 12 45 15 47 18L42 18L46 21L41 22L37 20C34 22 31 24 27 24C22 24 18 22 16 19L11 19L14 16L9 15L12 12L16 13Z"/>
          <path class="vf-theme-toggle-dragon-mane" d="M30 12C35 12 40 14 43 18C40 17 38 18 37 21C35 18 32 16 28 15ZM35 14C39 15 43 18 44 23L40 21L39 26L36 22L33 27L33 21L29 24C32 19 33 16 31 13Z"/>
          <path class="vf-theme-toggle-dragon-horns" d="M22 9C22 5 24 2 27 0M27 10C29 5 33 2 38 1M31 11C34 7 39 5 43 6"/>
          <path class="vf-theme-toggle-dragon-whiskers" d="M12 15C8 11 4 11 1 14M13 18C8 21 4 22 0 20"/>
          <path class="vf-theme-toggle-dragon-foreleg" d="M32 27C35 29 38 30 41 29M37 29C38 32 38 34 36 36M40 29C42 31 43 33 43 35M36 36L34 38M36 36L38 39M43 35L41 38M43 35L45 38"/>
          <path class="vf-theme-toggle-dragon-face-detail" d="M22 20C24 21 26 21 28 20"/>
          <circle class="vf-theme-toggle-dragon-eye" cx="30.2" cy="15.5" r="1.15"/>
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
