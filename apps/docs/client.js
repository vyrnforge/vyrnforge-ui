const storedThemeValues = new Set(['light', 'dark', 'system']);
const explicitThemes = new Set(['light', 'dark']);
const themeStorageKey = 'vf-docs-theme';
const themeToggleDragonArtwork = `
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
  dragon.innerHTML = themeToggleDragonArtwork;

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

initializeTheme();
initializeNavigation();
initializeSearch();
initializeCopyButtons();
