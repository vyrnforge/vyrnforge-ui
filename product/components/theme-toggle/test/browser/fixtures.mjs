const dragonArt = `
  <svg class="vf-theme-toggle-dragon-art" viewBox="0 0 104 48" width="100%" height="100%" aria-hidden="true" focusable="false">
  <path class="vf-theme-toggle-dragon-upper-jaw" d="M104 8L98 7L95 2L92 13L86 7L84 15L76 12L71 17L64 18L57 21L50 22L45 25L52 29L61 28L69 25L77 25L84 29L91 27L97 30L104 28Z"/>
  <path class="vf-theme-toggle-dragon-horns" d="M83 13L91 0L91 15L100 4L97 18Z"/>
  <path class="vf-theme-toggle-dragon-lower-jaw" d="M104 32L97 30L91 32L84 31L77 33L69 31L61 33L53 31L46 33L53 38L61 40L70 40L78 42L86 39L95 43L104 44Z"/>
  <path class="vf-theme-toggle-dragon-fangs" d="M60 28L57 34L64 30ZM71 27L68 34L75 30ZM80 28L78 33L84 30Z"/>
  <path class="vf-theme-toggle-dragon-eye" d="M70 16L82 13L77 20Z"/>
  <path class="vf-theme-toggle-dragon-brow" d="M66 21L79 21L84 25L76 24L70 25Z"/>
  <ellipse class="vf-theme-toggle-dragon-nostril" cx="52" cy="24" rx="1.8" ry="1.15"/>
  <ellipse class="vf-theme-toggle-dragon-mouth-glow" cx="80" cy="30" rx="3.8" ry="1.8"/>
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
