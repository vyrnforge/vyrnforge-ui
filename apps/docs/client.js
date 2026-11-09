const storedThemeValues = new Set(['light', 'dark', 'system']);
const explicitThemes = new Set(['light', 'dark']);
const themeStorageKey = 'vf-docs-theme';
const themeToggleDragonArtwork = (gradientId) => `
  <svg class="vf-theme-toggle-dragon-art" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
    viewBox="0 0 650 740"
    aria-hidden="true"
    focusable="false"
    shape-rendering="geometricPrecision">
    <defs>
      <radialGradient id="${gradientId}" cx="35%" cy="30%" r="72%">
        <stop offset="0" stop-color="var(--_vf-theme-toggle-orb-highlight, #ffe58d)"/>
        <stop offset="1" stop-color="var(--_vf-theme-toggle-orb-core, #ff9700)"/>
      </radialGradient>
    </defs>
  
    <g data-vf-theme-toggle-dragon-mark>
      <path class="vf-theme-toggle-dragon-silhouette"
        d="M 280 51 C 292 83 317 109 350 124 C 377 137 406 151 426 167 C 389 151 356 151 335 161 C 322 166 315 169 310 172 C 326 176 344 182 356 192 C 333 193 313 193 294 189 C 281 186 267 166 264 159 C 261 153 263 140 266 134 C 269 128 287 113 287 113  C 287.0 113.0 236.2 111.8 217.0 117.0 C 197.8 122.2 165.9 138.5 148.0 151.0 C 130.1 163.5 104.8 187.6 91.0 205.0 C 77.2 222.4 52.0 261.9 42.0 285.0 C 32.0 308.1 21.7 345.9 19.0 371.0 C 16.3 396.1 23.0 462.0 23.0 462.0 C 23.0 462.0 40.2 415.5 46.0 407.0 C 51.8 398.5 75.0 385.0 75.0 385.0 C 75.0 385.0 95.5 394.4 99.0 402.0 C 102.5 409.6 110.0 460.0 110.0 460.0 C 110.0 460.0 122.3 377.9 133.0 351.0 C 143.7 324.1 188.0 265.0 188.0 265.0 C 188.0 265.0 155.5 271.9 144.0 278.0 C 132.5 284.1 105.9 300.6 95.0 314.0 C 84.1 327.4 29.0 419.0 29.0 419.0 C 29.0 419.0 37.8 354.0 49.0 331.0 C 60.2 308.0 110.2 242.0 122.0 229.0 C 133.8 216.0 158.9 200.6 173.0 194.0 C 187.1 187.4 226.0 180.0 226.0 180.0 C 226.0 180.0 229.0 214.0 229.0 214.0 C 229.0 214.0 295.0 227.0 295.0 227.0 C 295.0 227.0 243.8 256.9 227.0 273.0 C 210.2 289.1 175.4 328.9 161.0 355.0 C 146.6 381.1 126.0 439.8 122.0 463.0 C 118.0 486.2 120.9 523.5 128.0 546.0 C 135.1 568.5 155.3 600.8 171.0 619.0 C 186.7 637.2 217.8 663.8 240.0 676.0 C 262.2 688.2 305.0 702.4 330.0 706.0 C 355.0 709.6 396.5 706.8 419.0 702.0 C 441.5 697.2 474.7 683.5 494.0 671.0 C 513.3 658.5 550.6 627.1 568.0 605.0 C 585.4 582.9 623.2 516.9 631.0 497.0 C 638.8 477.1 640.0 422.0 640.0 422.0 C 640.0 422.0 612.0 465.0 612.0 465.0 C 612.0 465.0 625.9 401.2 620.0 381.0 C 614.1 360.8 571.0 325.0 571.0 325.0 C 571.0 325.0 597.4 370.0 599.0 390.0 C 600.6 410.0 584.0 489.0 584.0 489.0 C 584.0 489.0 577.0 421.0 577.0 421.0 C 577.0 421.0 559.5 441.8 558.0 452.0 C 556.5 462.2 563.0 509.0 562.0 522.0 C 561.0 535.0 555.3 554.6 549.0 566.0 C 542.7 577.4 520.8 607.3 508.0 619.0 C 495.2 630.7 471.9 644.6 456.0 651.0 C 440.1 657.4 414.1 663.1 397.0 664.0 C 379.9 664.9 351.9 664.0 336.0 657.0 C 320.1 650.0 255.2 610.4 238.0 594.0 C 220.8 577.6 202.5 542.4 195.0 522.0 C 187.5 501.6 182.0 467.7 184.0 446.0 C 186.0 424.3 198.5 381.0 210.0 359.0 C 221.5 337.0 246.2 307.1 265.0 291.0 C 283.8 274.9 322.8 249.0 348.0 241.0 C 373.2 233.0 441.0 235.0 441.0 235.0 C 441 235 426 249 422 253 C 455 242 484 243 510 254 C 532 263 544 276 552 283 C 570 276 580 258 583 245 C 586 237 583 229 574 224 C 563 218 545 217 531 210 C 516 203 506 194 498 183 C 485 166 464 155 443 146 C 411 131 376 120 349 106 C 315 91 292 68 280 51 Z"
        fill="var(--_vf-theme-toggle-dragon-primary, #e0a128)"
        fill-rule="evenodd"/>
      <path class="vf-theme-toggle-dragon-accent"
        d="M 226.0 181.0 C 226.0 181.0 190.0 187.0 177.0 193.0 C 164.0 199.0 136.6 216.6 123.0 229.0 C 109.4 241.4 83.3 271.7 72.0 289.0 C 60.7 306.3 46.2 339.2 41.0 355.0 C 35.8 370.8 31.0 413.0 31.0 413.0 C 31.0 413.0 84.4 326.0 94.0 314.0 C 103.6 302.0 123.4 288.0 137.0 281.0 C 150.6 274.0 189.0 265.0 189.0 265.0 C 189.0 265.0 131.4 362.2 123.0 383.0 C 114.6 403.8 110.0 461.0 110.0 461.0 C 110.0 461.0 109.0 452.0 109.0 452.0 C 109.0 452.0 117.0 511.0 117.0 511.0 C 117.0 511.0 123.1 449.4 130.0 426.0 C 136.9 402.6 152.7 366.3 166.0 345.0 C 179.3 323.7 208.9 288.8 226.0 273.0 C 243.1 257.2 294.0 227.0 294.0 227.0 C 294.0 227.0 229.0 215.0 229.0 215.0 C 229.0 215.0 226.0 181.0 226.0 181.0 Z"
        fill="var(--_vf-theme-toggle-dragon-accent, #fff0cf)"/>
      <path class="vf-theme-toggle-dragon-eye"
      d="M 456 179 C 469 175 488 178 505 195 C 483 195 469 190 456 179 Z"
      fill="var(--_vf-theme-toggle-dragon-eye, #fff2c9)"/>
      <path class="vf-theme-toggle-dragon-eye-slit"
      d="M 484 181 C 490 186 490 193 484 197 C 480 193 480 187 484 181 Z"
      fill="var(--_vf-theme-toggle-dragon-eye-slit, #6e3a12)"/>
      <path class="vf-theme-toggle-dragon-nostril"
      d="M 554 230 C 559 226 565 228 569 233 C 564 233 562 234 560 237 Z"
      fill="var(--_vf-theme-toggle-dragon-detail, #9a5a18)"/>
      <path class="vf-theme-toggle-dragon-mouth"
      d="M 446 230 C 468 234 495 240 515 250 C 533 259 553 257 566 267 C 556 261 538 266 520 256 C 494 244 469 241 446 230 Z"
      fill="var(--_vf-theme-toggle-dragon-detail, #9a5a18)"/>
    </g>
  
    <g data-vf-theme-toggle-orb>
      <circle cx="382" cy="456" r="154"
        fill="var(--_vf-theme-toggle-orb-ring, #fff8e7)"/>
      <circle cx="382" cy="456" r="142"
        fill="url(#${gradientId})"/>
      <ellipse cx="333" cy="402" rx="28" ry="36"
        transform="rotate(28 333 402)"
        fill="#fff"
        opacity=".68"/>
    </g>
  </svg>`;

function readStoredTheme() {
  try {
    const value = localStorage.getItem(themeStorageKey);
    return storedThemeValues.has(value) ? value : null;
  } catch {
    return null;
  }
}

function persistTheme(value) {
  try {
    localStorage.setItem(themeStorageKey, value);
  } catch {
    // Theme persistence is an enhancement; the selected theme still applies to this page.
  }
}

function resolveTheme(value) {
  if (explicitThemes.has(value)) return value;
  if (value === 'system') {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function setTheme(value, { persist = true } = {}) {
  const next = resolveTheme(value);
  document.documentElement.dataset.vfTheme = next;
  if (persist) persistTheme(next);
  return next;
}

function createThemeToggle(fallback) {
  const container = fallback.closest('.vf-docs-theme-control');
  if (!container) return null;

  const root = document.createElement('label');
  root.setAttribute('data-vf-theme-toggle', '');

  const control = document.createElement('input');
  control.type = 'checkbox';
  control.setAttribute('role', 'switch');
  control.setAttribute('data-vf-theme-toggle-control', '');
  control.setAttribute('data-vf-docs-theme', '');
  control.setAttribute('aria-label', 'Dark theme');

  const track = document.createElement('span');
  track.setAttribute('data-vf-theme-toggle-track', '');
  track.setAttribute('aria-hidden', 'true');

  const breath = document.createElement('span');
  breath.setAttribute('data-vf-theme-toggle-breath', '');

  const dragon = document.createElement('span');
  dragon.setAttribute('data-vf-theme-toggle-dragon', '');
  dragon.setAttribute('data-vf-theme-toggle-dragon-artwork', '');
  let gradientId = 'vf-docs-theme-orb-gradient';
  while (document.getElementById(gradientId)) gradientId += '-orb';
  dragon.innerHTML = themeToggleDragonArtwork(gradientId);

  const thumb = document.createElement('span');
  thumb.setAttribute('data-vf-theme-toggle-thumb', '');

  const ember = document.createElement('span');
  ember.setAttribute('data-vf-theme-toggle-ember', '');

  thumb.append(ember);
  track.append(breath, dragon, thumb);
  root.append(control, track);
  container.replaceChildren(root);
  return control;
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Fall through to the native selection/copy fallback.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

function initializeTheme() {
  const fallback = document.querySelector('select[data-vf-docs-theme]');
  const stored = readStoredTheme();
  const configured = stored ?? document.documentElement.dataset.vfTheme ?? 'light';
  const active = setTheme(configured, { persist: stored === 'system' });
  const control = fallback ? createThemeToggle(fallback) : document.querySelector('[data-vf-docs-theme]');
  if (!control) return;

  control.checked = active === 'dark';
  control.addEventListener('change', () => {
    setTheme(control.checked ? 'dark' : 'light');
  });
}

function initializeNavigation() {
  const shell = document.querySelector('[data-vf-docs-shell]');
  const toggle = document.querySelector('[data-vf-docs-nav-toggle]');
  if (!shell || !toggle) return;

  const mobile = window.matchMedia('(max-width: 48rem)');
  const setCollapsed = (collapsed) => {
    shell.dataset.vfDocsNavCollapsed = collapsed ? 'true' : 'false';
    toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  };
  const syncViewport = () => setCollapsed(mobile.matches);

  syncViewport();
  toggle.addEventListener('click', () => {
    if (!mobile.matches) return;
    setCollapsed(shell.dataset.vfDocsNavCollapsed !== 'true');
  });
  mobile.addEventListener('change', syncViewport);
}

function initializeSearch() {
  const container = document.querySelector('[data-vf-docs-search-container]');
  const input = document.querySelector('[data-vf-docs-search]');
  const panel = document.querySelector('[data-vf-docs-search-results]');
  const empty = document.querySelector('[data-vf-docs-search-empty]');
  const items = [...document.querySelectorAll('[data-vf-docs-search-item]')];
  if (!container || !input || !panel || !empty) return;

  const close = () => {
    panel.hidden = true;
    for (const item of items) item.hidden = true;
    empty.hidden = true;
  };

  const update = () => {
    const query = input.value.trim().toLocaleLowerCase();
    if (!query) {
      close();
      return;
    }

    let visible = 0;
    for (const item of items) {
      const matches = item.dataset.vfDocsSearchText?.includes(query) && visible < 8;
      item.hidden = !matches;
      if (matches) visible += 1;
    }
    empty.hidden = visible !== 0;
    panel.hidden = false;
  };

  input.addEventListener('input', update);
  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    close();
    input.focus();
  });
  document.addEventListener('pointerdown', (event) => {
    if (!container.contains(event.target)) close();
  });
}

function initializeCopyButtons() {
  for (const button of document.querySelectorAll('[data-vf-docs-copy]')) {
    button.addEventListener('click', async () => {
      const example = button.closest('[data-vf-docs-example]');
      const code = example?.querySelector('[data-vf-docs-source]');
      const status = example?.querySelector('[data-vf-docs-copy-status]');
      if (!code) return;

      await copyText(code.textContent ?? '');
      const previous = button.textContent;
      button.textContent = 'Copied';
      if (status) status.textContent = 'HTML copied to clipboard.';
      window.setTimeout(() => {
        button.textContent = previous;
        if (status) status.textContent = '';
      }, 1600);
    });
  }
}

function initializeExampleForms() {
  // Documentation-owned behavior, scoped to the single Button form demonstration.
  // Never intercept forms belonging to other product examples.
  const preview = document.querySelector('[data-vf-docs-example="button/forms"] [data-vf-docs-preview]');
  const form = preview?.querySelector('form');
  if (!form) return;

  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.setAttribute('data-vf-docs-form-feedback', '');
  form.insertAdjacentElement('afterend', status);

  const field = form.querySelector('input[name="example"]');
  const inspect = form.querySelector('button[type="button"]');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.textContent = 'Demo form submitted locally. No data was sent.';
  });
  form.addEventListener('reset', () => {
    status.textContent = 'Demo form reset.';
  });
  inspect?.addEventListener('click', () => {
    status.textContent = `Current demo value: ${field?.value ?? ''}.`;
  });
}

initializeTheme();
initializeNavigation();
initializeSearch();
initializeCopyButtons();
initializeExampleForms();
