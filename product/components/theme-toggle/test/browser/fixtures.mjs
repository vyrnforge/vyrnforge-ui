const dragonArt = `
  <svg class="vf-theme-toggle-dragon-art" viewBox="0 0 64 32" width="100%" height="100%" aria-hidden="true" focusable="false">
    <g transform="translate(25 0) scale(0.85 0.727)">
      <path d="M8 15L5 1L16 12L14 17ZM35 15L39 1L28 12L30 17Z" fill="var(--_vf-theme-toggle-dragon-horn)" stroke="var(--_vf-theme-toggle-dragon-horn-edge)" stroke-width="0.8" stroke-linejoin="round"/>
      <path d="M22 7L31 11L38 17L41 25L37 34L31 40L22 43L13 40L7 34L3 25L6 17L13 11Z" fill="var(--_vf-theme-toggle-dragon-mid)" stroke="var(--_vf-theme-toggle-dragon-highlight)" stroke-width="1.35" stroke-linejoin="round"/>
      <path d="M6 18L0 13L4 23L0 26L6 28ZM38 18L44 13L40 23L44 26L38 28Z" fill="var(--_vf-theme-toggle-dragon-shadow)" stroke="var(--_vf-theme-toggle-dragon-highlight)" stroke-width="0.65" stroke-linejoin="round"/>
      <path d="M9 18L18 15L20 21L12 22ZM35 18L26 15L24 21L32 22Z" fill="var(--_vf-theme-toggle-dragon-highlight)" opacity="0.78"/>
      <path class="vf-theme-toggle-dragon-eye" d="M11 19L18 18L16 22ZM33 19L26 18L28 22Z" fill="var(--_vf-theme-toggle-dragon-eye)"/>
      <path d="M14 22L22 20L30 22L32 28L28 31L22 30L16 31L12 28Z" fill="var(--_vf-theme-toggle-dragon-shadow)" stroke="var(--_vf-theme-toggle-dragon-highlight)" stroke-width="0.7" stroke-linejoin="round"/>
      <path d="M13 31L22 33L31 31L28 38L22 40L16 38Z" fill="var(--_vf-theme-toggle-night-start)" stroke="var(--_vf-theme-toggle-dragon-highlight)" stroke-width="0.65" stroke-linejoin="round"/>
      <path d="M15 31L19 32L17 36ZM29 31L25 32L27 36ZM20 33L22 34L21 38ZM24 33L22 34L23 38Z" fill="var(--_vf-theme-toggle-dragon-fang)"/>
      <path d="M22 7L18 0L22 3L26 0Z" fill="var(--_vf-theme-toggle-dragon-horn)" stroke="var(--_vf-theme-toggle-dragon-horn-edge)" stroke-width="0.55" stroke-linejoin="round"/>
      <path d="M9 27L14 30M35 27L30 30M12 34L17 37M32 34L27 37" fill="none" stroke="var(--_vf-theme-toggle-dragon-highlight)" stroke-width="0.8" stroke-linecap="round" opacity="0.76"/>
      <ellipse class="vf-theme-toggle-dragon-nostril" cx="17.5" cy="26" rx="1.7" ry="1.1" fill="var(--_vf-theme-toggle-ember-edge)"/>
      <ellipse class="vf-theme-toggle-dragon-nostril" cx="26.5" cy="26" rx="1.7" ry="1.1" fill="var(--_vf-theme-toggle-ember-edge)"/>
    </g>
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
