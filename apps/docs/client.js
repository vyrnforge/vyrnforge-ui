const storedThemeValues = new Set(['light', 'dark', 'system']);
const explicitThemes = new Set(['light', 'dark']);
const themeStorageKey = 'vf-docs-theme';
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
  if (persist) persistTheme(value);
  return next;
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
  const control = document.querySelector('select[data-vf-docs-theme]');
  const stored = readStoredTheme();
  const configured = stored ?? document.documentElement.dataset.vfTheme ?? 'light';
  setTheme(configured, { persist: false });
  if (!control) return;

  control.value = configured;
  control.addEventListener('change', () => {
    setTheme(control.value);
  });

  const media = window.matchMedia?.('(prefers-color-scheme: dark)');
  media?.addEventListener('change', () => {
    if (control.value === 'system') setTheme('system', { persist: false });
  });
}

function initializeNavigation() {
  const shell = document.querySelector('[data-vf-docs-shell]');
  const toggle = document.querySelector('[data-vf-docs-nav-toggle]');
  const navigation = document.getElementById('vf-docs-navigation');
  const main = document.getElementById('main');
  if (!shell || !toggle || !navigation || !main || !window.matchMedia) return;

  const mobile = window.matchMedia('(max-width: 48rem)');
  const setCollapsed = (collapsed) => {
    shell.dataset.vfDocsNavCollapsed = collapsed ? 'true' : 'false';
    toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    navigation.hidden = collapsed;
  };

  const focusDestination = () => {
    const links = [...navigation.querySelectorAll('a[href]')].filter(
      (link) => link.getClientRects().length && getComputedStyle(link).visibility === 'visible',
    );
    const destination = links.find((link) => link.getAttribute('aria-current') === 'page') ?? links[0] ?? main;
    destination.focus();
    if (document.activeElement !== destination) main.focus();
  };

  const syncViewport = () => {
    // Visibility is owned here, not by a media-query display rule: move focus
    // while the departing control still exists in the focusable tree.
    const active = document.activeElement;
    if (mobile.matches) {
      toggle.hidden = false;
      if (navigation.contains(active)) toggle.focus();
      setCollapsed(true);
    } else {
      setCollapsed(false);
      if (active === toggle) focusDestination();
      toggle.hidden = true;
    }
  };

  toggle.addEventListener('click', () => {
    if (!mobile.matches) return;
    const collapsed = shell.dataset.vfDocsNavCollapsed !== 'true';
    if (collapsed) toggle.focus();
    setCollapsed(collapsed);
  });
  mobile.addEventListener('change', syncViewport);
  syncViewport();
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
