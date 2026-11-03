const dragonArt = `
  <svg class="vf-theme-toggle-dragon-art" viewBox="0 0 116 68" aria-hidden="true" focusable="false">
    <path d="M116 68C104 60 95 55 86 51L73 44L81 36L99 40L111 49Z" fill="var(--_vf-theme-toggle-dragon-shadow)"/>
    <path d="M98 44C87 37 77 31 67 27L73 14L60 21L57 6L48 21C39 20 30 22 23 27L15 34L1 38L17 41L8 47L30 48C35 49 39 51 43 54L57 54C66 51 73 47 79 43L95 51Z" fill="var(--_vf-theme-toggle-dragon-mid)" stroke="var(--_vf-theme-toggle-dragon-highlight)" stroke-opacity="0.34" stroke-width="1.5"/>
    <path d="M66 28C55 25 43 25 32 29L21 36L39 35L48 32L63 35L76 40L82 37Z" fill="var(--_vf-theme-toggle-dragon-highlight)" opacity="0.78"/>
    <path d="M58 22L72 8L66 25ZM50 21L51 3L43 22ZM39 22L34 7L31 24Z" fill="var(--_vf-theme-toggle-dragon-shadow)"/>
    <path d="M49 53L29 52L15 54L27 61L49 61L63 56L72 50L61 53Z" fill="var(--_vf-theme-toggle-dragon-shadow)" stroke="var(--_vf-theme-toggle-dragon-mid)" stroke-width="1.25"/>
    <path d="M25 52L31 52L28 58ZM31 47L36 47L33 53Z" fill="var(--_vf-theme-toggle-dragon-eye)" opacity="0.94"/>
    <ellipse cx="19" cy="40" rx="2.2" ry="1.2" fill="var(--_vf-theme-toggle-dragon-shadow)"/>
    <ellipse cx="42" cy="31" rx="4.2" ry="2.8" fill="var(--_vf-theme-toggle-dragon-eye)" opacity="0.24"/>
    <path d="M38 31L46 29L43 33Z" fill="var(--_vf-theme-toggle-dragon-eye)"/>
    <path d="M33 27L47 25L55 29L43 29Z" fill="var(--_vf-theme-toggle-dragon-shadow)"/>
    <path d="M66 36L74 38L68 42L60 39ZM78 41L86 43L80 47L72 44Z" fill="var(--_vf-theme-toggle-dragon-highlight)" opacity="0.48"/>
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
            <span data-vf-theme-toggle-dragon>${dragonArt}</span>
            <span data-vf-theme-toggle-thumb>
              <span data-vf-theme-toggle-ember></span>
            </span>
          </span>
        </label>
        <label data-vf-theme-toggle>
          <input id="dark-theme" type="checkbox" role="switch" data-vf-theme-toggle-control aria-label="Dark theme selected" checked>
          <span data-vf-theme-toggle-track aria-hidden="true">
            <span data-vf-theme-toggle-breath></span>
            <span data-vf-theme-toggle-dragon>${dragonArt}</span>
            <span data-vf-theme-toggle-thumb>
              <span data-vf-theme-toggle-ember></span>
            </span>
          </span>
        </label>
        <label data-vf-theme-toggle>
          <input id="disabled-theme" type="checkbox" role="switch" data-vf-theme-toggle-control aria-label="Disabled dark theme" disabled>
          <span data-vf-theme-toggle-track aria-hidden="true">
            <span data-vf-theme-toggle-breath></span>
            <span data-vf-theme-toggle-dragon>${dragonArt}</span>
            <span data-vf-theme-toggle-thumb>
              <span data-vf-theme-toggle-ember></span>
            </span>
          </span>
        </label>
      </section>`,
    },
  },
};
