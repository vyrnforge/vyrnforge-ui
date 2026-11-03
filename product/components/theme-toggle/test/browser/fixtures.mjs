const dragonArt = `
  <svg class="vf-theme-toggle-dragon-art" viewBox="0 0 104 48" width="100%" height="100%" aria-hidden="true" focusable="false">
  <path class="vf-theme-toggle-dragon-neck" d="M104 5L94 5L87 10L86 17L90 23L87 29L90 36L96 43L104 45Z"/>
  <path class="vf-theme-toggle-dragon-upper-jaw" d="M104 8L97 7L93 2L91 13L83 6L82 15L75 12L70 16L65 17L60 20L53 20L48 22L42 22L37 25L43 28L51 27L58 27L65 25L72 25L78 28L84 28L91 25L99 28L104 27Z"/>
  <path class="vf-theme-toggle-dragon-brow" d="M65 18L74 15L82 17L78 22L68 22Z"/>
  <path class="vf-theme-toggle-dragon-lower-jaw" d="M104 33L97 31L90 32L83 31L76 32L69 31L61 33L54 32L47 33L41 35L48 39L57 40L66 39L74 41L82 43L90 40L98 44L104 44Z"/>
  <path class="vf-theme-toggle-dragon-fangs" d="M58 27L56 33L62 29ZM69 26L67 33L73 29ZM77 28L75 33L81 30Z"/>
  <path class="vf-theme-toggle-dragon-eye" d="M68 18L77 16L74 21Z"/>
  <circle class="vf-theme-toggle-dragon-eye-glint" cx="72.5" cy="18.6" r="0.8"/>
  <ellipse class="vf-theme-toggle-dragon-nostril" cx="43" cy="25" rx="1.8" ry="1.1"/>
  <ellipse class="vf-theme-toggle-dragon-mouth-glow" cx="82" cy="31" rx="3.2" ry="1.6"/>
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
