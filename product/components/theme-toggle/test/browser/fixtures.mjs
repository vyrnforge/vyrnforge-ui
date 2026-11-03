const dragonArt = `
  <svg class="vf-theme-toggle-dragon-art" viewBox="0 0 104 48" width="100%" height="100%" aria-hidden="true" focusable="false">
    <path class="vf-theme-toggle-dragon-neck" d="M104 6C95 7 90 9 85 13C80 17 79 23 80 29C82 35 88 40 97 44L104 45Z"/>
    <path class="vf-theme-toggle-dragon-crest" d="M92 14C96 9 99 5 101 1C94 2 87 6 82 12C85 11 89 12 92 14ZM81 13C83 8 84 4 83 1C77 4 72 8 68 14C72 12 77 12 81 13Z"/>
    <path class="vf-theme-toggle-dragon-upper-jaw" d="M100 13C93 11 87 11 82 13L75 16L69 16L64 14L58 16L55 19L47 20L43 22L34 22L29 25L34 28L44 29L52 28L59 26L67 25L75 26L82 29L90 28L97 31L104 29L104 14Z"/>
    <path class="vf-theme-toggle-dragon-cheek" d="M79 25L88 28L96 27L101 31L96 36L88 35L81 32L73 31Z"/>
    <path class="vf-theme-toggle-dragon-brow" d="M56 19L66 14L77 15L72 20L61 22Z"/>
    <path class="vf-theme-toggle-dragon-lower-jaw" d="M104 34L96 33L89 34L82 33L75 32L68 31L60 32L53 33L45 32L38 31L43 36L51 40L61 43L72 44L82 42L91 39L99 42L104 44Z"/>
    <path class="vf-theme-toggle-dragon-fangs" d="M44 29L47 34L50 29ZM54 28L57 34L60 28ZM65 26L68 32L71 26ZM50 34L53 38L56 35ZM61 38L64 42L67 37Z"/>
    <path class="vf-theme-toggle-dragon-eye" d="M62 18L71 16L68 21L61 21Z"/>
    <ellipse class="vf-theme-toggle-dragon-nostril" cx="35.5" cy="25.3" rx="1.6" ry="1"/>
    <ellipse class="vf-theme-toggle-dragon-mouth-glow" cx="79" cy="31" rx="2.6" ry="1.7"/>
    <path class="vf-theme-toggle-dragon-scales" d="M85 17L92 14M87 21L95 19M88 37L95 34"/>
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
