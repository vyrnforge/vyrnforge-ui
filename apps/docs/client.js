const storedThemeValues = new Set(['light', 'dark', 'system']);
const explicitThemes = new Set(['light', 'dark']);
const themeStorageKey = 'vf-docs-theme';
const themeToggleDragonArtwork = `
  <svg class="vf-theme-toggle-dragon-art" viewBox="0 0 64 56" width="100%" height="100%" aria-hidden="true" focusable="false">
    <path class="vf-theme-toggle-dragon-neck" d="M64 9C57 7 52 9 48 13C45 17 44 22 45 28C46 36 51 44 60 51L64 53Z"/>
    <path class="vf-theme-toggle-dragon-crest" d="M48 14C54 10 59 5 62 0C54 1 46 5 40 11C43 10 46 11 48 14ZM39 13C42 9 44 4 43 0C37 3 31 8 28 14C32 12 36 12 39 13Z"/>
    <path class="vf-theme-toggle-dragon-upper-jaw" d="M61 14C55 11 49 12 44 15L38 18L32 17L27 15L23 18L20 21L14 22L10 24L4 24L1 27L4 30L11 31L17 30L23 28L30 27L36 28L42 31L49 31L55 29L61 32L64 31L64 16Z"/>
    <path class="vf-theme-toggle-dragon-cheek" d="M39 18L49 16L57 19L52 25L43 27L35 24Z"/>
    <path class="vf-theme-toggle-dragon-brow" d="M23 20L31 16L40 17L35 22L27 23Z"/>
    <path class="vf-theme-toggle-dragon-lower-jaw" d="M64 35L58 33L52 34L46 33L40 32L34 31L28 32L23 34L17 34L11 32L6 32L9 37L15 42L23 46L32 49L42 49L51 46L58 43L64 47Z"/>
    <path class="vf-theme-toggle-dragon-fangs" d="M12 31L15 35L18 31ZM21 29L24 34L27 29ZM31 28L34 33L37 28ZM17 35L20 39L23 35ZM27 39L30 43L33 38Z"/>
    <path class="vf-theme-toggle-dragon-eye" d="M27 19L35 18L32 22L26 22Z"/>
    <ellipse class="vf-theme-toggle-dragon-nostril" cx="6.5" cy="27.2" rx="1.6" ry="1"/>
    <ellipse class="vf-theme-toggle-dragon-mouth-glow" cx="44" cy="32" rx="2.4" ry="1.6"/>
    <path class="vf-theme-toggle-dragon-scales" d="M45 20L52 18M47 24L55 22M49 41L56 38"/>
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
