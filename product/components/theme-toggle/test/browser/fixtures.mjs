const dragonArt = `
  <svg class="vf-theme-toggle-dragon-art" viewBox="0 0 70 44" width="100%" height="100%" aria-hidden="true" focusable="false" style="position: relative; z-index: 1">
    <path d="M69 40L58 35L53 29L45 25L35 22L26 23L18 27L12 30L3 30L9 26L4 23L15 21L21 16L31 17L41 20L51 21L60 26Z" fill="var(--_vf-theme-toggle-dragon-highlight)" stroke="var(--_vf-theme-toggle-dragon-eye)" stroke-opacity="0.34" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M22 17L25 3L30 18ZM34 18L43 5L40 21ZM47 22L59 10L54 26Z" fill="var(--_vf-theme-toggle-dragon-mid)" stroke="var(--_vf-theme-toggle-dragon-highlight)" stroke-width="1.1" stroke-linejoin="round"/>
    <path d="M21 32L9 34L14 40L31 42L45 37L53 30L42 33L31 36Z" fill="var(--_vf-theme-toggle-dragon-shadow)" stroke="var(--_vf-theme-toggle-dragon-highlight)" stroke-width="1.25" stroke-linejoin="round"/>
    <path d="M17 30L22 30L19.5 35ZM24 29L29 29L26.5 33ZM23 36L29 36L26 32Z" fill="var(--_vf-theme-toggle-ember-core)"/>
    <path d="M22 20L34 18L39 22L30 22Z" fill="var(--_vf-theme-toggle-dragon-shadow)"/>
    <path d="M26 23L35 20.5L31 25Z" fill="var(--_vf-theme-toggle-dragon-eye)"/>
    <path d="M44 26L51 28L47 32L40 29ZM53 29L60 31L56 35L49 32Z" fill="var(--_vf-theme-toggle-dragon-mid)" opacity="0.9"/>
    <ellipse cx="10" cy="27" rx="2.3" ry="1.35" fill="var(--_vf-theme-toggle-ember-edge)"/>
    <ellipse cx="30" cy="22.5" rx="5" ry="3" fill="var(--_vf-theme-toggle-dragon-eye)" opacity="0.24"/>
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
