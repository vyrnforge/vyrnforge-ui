const storedThemeValues = new Set(['light', 'dark', 'system']);
const explicitThemes = new Set(['light', 'dark']);
const themeStorageKey = 'vf-docs-theme';
const themeToggleDragonArtwork = `
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
