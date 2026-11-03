const storedThemeValues = new Set(['light', 'dark', 'system']);
const explicitThemes = new Set(['light', 'dark']);
const themeStorageKey = 'vf-docs-theme';
const themeToggleDragonArtwork = `
  <svg class="vf-theme-toggle-dragon-art" viewBox="0 0 512 512" width="100%" height="100%" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
    <g transform="translate(512 0) scale(-1 1)">
      <path class="vf-theme-toggle-dragon-silhouette" fill="var(--_vf-theme-toggle-dragon-highlight)" stroke="var(--_vf-theme-toggle-dragon-horn-edge)" stroke-width="7" stroke-linejoin="round" d="M200.947 18.686c-6.98.087-14.64.774-22.85 1.9 27.57 20.468 51.098 45.25 67.594 70.527 1.66 0 3.312.012 4.958.047 18.066.39 35.487 2.906 53.217 7.2-15.695-28.457-29.935-50.19-47.45-63.22-13.817-10.278-30.063-16.168-52.52-16.454-.967-.013-1.95-.013-2.948 0zm-91.66 22.96c-.73-.002-1.46.006-2.195.022-14.045.31-29.36 3.92-46.86 11.13 56.18 18.807 106.985 50.468 133.907 83.585 18.377-5.13 29.44-14.72 36.454-28.817C195.84 78.18 168.118 56.19 140.65 46.96c-10.168-3.418-20.433-5.306-31.363-5.315zm-.203 52.786c-39.42 6.758-74.73 31.854-87.822 74.19v322.345h212.73C100.352 442.58 61.19 206.49 187.115 230.104c5.838-14.164 9.92-28.027 11.018-41.465l18.627 1.522c-1.684 20.592-8.828 40.49-18.033 59.943-.732 2.035-1.472 4.12-2.186 6.063 32.842 85.24 113.77 160.69 169.495 168.197.915.033 1.905-.002 2.953-.09 17.016 1.035 35.86-4.222 52.21-22.304l7.984-8.83-10.473-5.658c-6.507-3.515-14.29-7.094-18.167-10.925-1.938-1.916-2.793-3.47-3.074-5.194-.282-1.725-.13-4.227 2.23-8.578l10.673-19.656-21.484 6.222c-6.304 1.825-17.305-3.032-23.224-10.71-2.96-3.84-4.408-7.907-4.387-10.843.02-2.938.72-5.125 4.747-8.05l19.453-14.125-23.884-2.72c-9.974-1.137-16.37-6.658-19.17-12.294-2.802-5.634-2.312-10.084 1.375-13.31l12.204-10.677-15.358-5.205c-6.717-2.276-10.296-7.555-10.357-10.633-.028-1.373.238-2.666 1.843-4.476 10.93-2.39 21.258-.45 28.088 6.374 6.154 6.146 8.35 15.128 6.977 24.832 8.55-2.254 16.985-1.616 24.112 2.494 9.34 5.387 14.647 15.692 15.67 27.965 15.212-10.132 32.152-12.725 45.262-5.164 15.467 8.92 21.36 29.513 16.805 51.75 23.992-33.355 34.588-75.717 5.617-120.43-46.726-4.442-81.693-30.676-93.293-67.64-5.026-16.016-21.284-28.67-42-37.904l-.08.217c-29.74-10.823-55.575-17.35-82.604-18.733l.08.155c-2.294-.093-4.56-.16-6.762-.172-9.537 22.874-28.662 39.9-57.436 46.054l-5.906 1.262-3.576-4.864c-14.216-19.33-41.23-40.452-74.002-58.074zm156.215 65.26c27.927-.073 44.874 11.617 42.09 44.45-35.844 3.39-51.933-16.683-63.074-42.632 7.507-1.155 14.538-1.8 20.983-1.817zm48.407 66.363c3.708.07 7.14.994 10.014 2.812-1.51 1.102-2.898 2.28-4.16 3.543-5.246 5.24-8.087 12.122-7.956 18.742.183 9.322 5.27 17.184 12.68 22.56-3.14 8.103-2.452 17.455 1.407 25.22 3.813 7.668 10.54 14.273 19.302 18.398-1.445 3.366-2.375 6.862-2.4 10.33-.062 8.407 3.38 16.042 8.273 22.39 6.792 8.81 16.862 15.936 28.026 17.91-.183 2.18-.204 4.333.133 6.407 1.05 6.444 4.515 11.66 8.38 15.48 3.41 3.37 7.19 5.892 10.798 7.993-6.345 4.792-12.414 7.056-18.618 7.79-6.515-7.937-9.71-19.084-9.41-31.454-11.767 6.177-24.21 7.156-34.12 1.44-14.668-8.46-19.393-29.036-13.187-50.33-11.336 2.77-22.13.92-29.187-6.132-8.875-8.865-9.535-23.626-3.094-37.95-3.676-.615-6.963-2.166-9.525-4.725-8.808-8.798-5.773-26.09 6.776-38.626 7.843-7.835 17.546-11.957 25.87-11.8z"/>
      <circle class="vf-theme-toggle-dragon-eye" cx="268" cy="184" r="11" fill="var(--_vf-theme-toggle-dragon-eye)"/>
      <ellipse class="vf-theme-toggle-dragon-mouth-glow" cx="407" cy="302" rx="20" ry="10" fill="var(--_vf-theme-toggle-ember-edge)" opacity="0.72"/>
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
