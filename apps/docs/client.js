const storedThemeValues = new Set(['light', 'dark', 'system']);
const explicitThemes = new Set(['light', 'dark']);
const themeStorageKey = 'vf-docs-theme';
const themeToggleDragonArtwork = `
  <svg class="vf-theme-toggle-dragon-art" viewBox="0 0 70 40" preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true" focusable="false">
    <path d="M68 36C63 30 58 27 54 25C50 23 47 22 44 22C50 19 54 16 57 13L66 9L57 9L63 2L52 8L48 0L45 10C39 9 34 10 30 13L24 18L12 18L4 22L0 25L5 29L17 29C22 29 27 31 31 34L36 36L45 33L52 29C57 29 63 32 68 36Z" fill="var(--_vf-theme-toggle-dragon-mid)" stroke="var(--_vf-theme-toggle-dragon-highlight)" stroke-width="1.35" stroke-linejoin="round"/>
    <path d="M30 13L38 11L46 12L51 16L43 17L35 18Z" fill="var(--_vf-theme-toggle-dragon-highlight)" opacity="0.95"/>
    <path d="M5 29C12 31 19 31 25 29C31 27 36 23 41 22C45 21 48 22 51 24C47 27 43 29 38 31C31 35 23 36 16 34L8 32Z" fill="var(--_vf-theme-toggle-night-start)"/>
    <path d="M8 32L16 35L25 36L34 34L43 30L38 35L29 39L18 38L10 35Z" fill="var(--_vf-theme-toggle-dragon-shadow)" stroke="var(--_vf-theme-toggle-dragon-highlight)" stroke-width="1.15" stroke-linejoin="round"/>
    <path d="M45 21L53 20L59 24L55 28L48 26L40 23Z" fill="var(--_vf-theme-toggle-dragon-highlight)" opacity="0.58"/>
    <path d="M45 10L48 0L52 9ZM52 8L63 2L57 13ZM57 13L66 9L61 18Z" fill="var(--_vf-theme-toggle-dragon-horn)" stroke="var(--_vf-theme-toggle-dragon-horn-edge)" stroke-width="0.78" stroke-linejoin="round"/>
    <path d="M13 28L17 29L14.5 34ZM21 29L25 29L22.5 34ZM29 27L33 26L31 32Z" fill="var(--_vf-theme-toggle-dragon-fang)"/>
    <path class="vf-theme-toggle-dragon-eye" d="M27 17L36 14.5L33 20Z" fill="var(--_vf-theme-toggle-dragon-eye)"/>
    <path d="M30.5 17L33.3 16.2L32 18.1Z" fill="white" opacity="0.94"/>
    <path d="M53 29L59 27L63 31L59 34ZM60 33L66 31L70 35L66 38Z" fill="var(--_vf-theme-toggle-dragon-shadow)" stroke="var(--_vf-theme-toggle-dragon-highlight)" stroke-width="0.65" stroke-linejoin="round"/>
    <ellipse class="vf-theme-toggle-dragon-nostril" cx="4.5" cy="24.5" rx="2.2" ry="1.25" fill="var(--_vf-theme-toggle-ember-edge)"/>
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
