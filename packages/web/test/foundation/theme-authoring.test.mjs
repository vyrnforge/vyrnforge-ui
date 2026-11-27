import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createTheme, renderThemeCss, themeableColorRoles } from '@vyrnforge/web/theme';

test('theme authoring resolves palettes and preserves complete semantic defaults', () => {
  const theme = createTheme({
    name: 'ocean-light',
    appearance: 'light',
    palette: { ocean: { 50: '#ecfeff', 100: '#cffafe', 600: '#0891b2', 700: '#0e7490', 800: '#155e75' } },
    colors: {
      'accent-background': '{ocean.600}',
      'accent-background-hover': '{ocean.700}',
      'accent-background-pressed': '{ocean.800}',
      'accent-foreground': '#ffffff',
      'accent-subtle': '{ocean.50}',
      'accent-subtle-hover': '{ocean.100}',
    },
    tokens: { '--vf-radius-surface': '0.75rem' },
  });
  assert.equal(theme.variables['--vf-color-accent-background'], '#0891b2');
  assert.equal(theme.variables['--vf-color-accent-background-hover'], '#0e7490');
  assert.equal(theme.variables['--vf-radius-surface'], '0.75rem');
  for (const role of themeableColorRoles) {
    assert.ok(theme.variables['--vf-color-' + role], 'missing semantic token: ' + role);
  }
  assert.equal(theme.variables['--vf-color-surface'], '#ffffff');
  assert.ok(Object.isFrozen(theme));
  assert.ok(Object.isFrozen(theme.variables));
  const css = renderThemeCss(theme);
  assert.match(css, /^@layer vyrnforge\.themes \{/);
  assert.match(css, /\[data-vf-theme="ocean-light"\]/);
  assert.match(css, /color-scheme: light;/);
  assert.match(css, /--vf-color-accent-background: #0891b2;/);
  assert.match(css, /--vf-radius-surface: 0\.75rem;/);
  assert.equal(css, renderThemeCss(theme));
});

test('dark defaults are complete and derived themes inherit without mutation', () => {
  const base = createTheme({
    name: 'ocean-dark',
    appearance: 'dark',
    palette: { brand: { 300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4' } },
    colors: {
      'accent-background': '{brand.300}',
      'accent-background-hover': '{brand.400}',
      'accent-foreground': '#102a43',
    },
  });
  const derived = createTheme({
    name: 'ocean-dark-dialog',
    base,
    palette: { brand: { 200: '#a5f3fc' } },
    colors: { 'accent-subtle': '{brand.200}' },
  });
  assert.equal(derived.appearance, 'dark');
  assert.equal(derived.variables['--vf-color-text'], '#fafafa');
  assert.equal(derived.variables['--vf-color-accent-background'], '#67e8f9');
  assert.equal(derived.variables['--vf-color-accent-subtle'], '#a5f3fc');
  assert.equal(base.variables['--vf-color-accent-subtle'], '#0b1f4d');
  assert.equal(derived.palette.brand['500'], '#06b6d4');
  assert.match(renderThemeCss(derived), /color-scheme: dark;/);
});

test('rejects unsafe CSS, invalid names, unsupported colors and missing shades', () => {
  assert.throws(() => createTheme({ name: 'dark' }), /lowercase slug/);
  assert.throws(() => createTheme({ name: 'hi"] { color: red' }), /lowercase slug/);
  assert.throws(() => createTheme({ name: 'brand', colors: { 'accent-background': '{missing.600}' } }),
    /Unknown palette reference/);
  assert.throws(() => createTheme({ name: 'brand', colors: { 'not-a-role': '#123456' } }),
    /Unknown semantic color role/);
  assert.throws(() => createTheme({ name: 'brand', tokens: { '--_vf-private': 'red' } }),
    /Not a public CSS token/);
  assert.throws(() => createTheme({ name: 'brand', tokens: { '--vf-not-defined': 'red' } }),
    /Not a public CSS token/);
  assert.throws(() => createTheme({ name: 'brand', colors: { text: 'red; } html { color: green' } }),
    /safe CSS value/);
  assert.throws(() => createTheme({ name: 'brand', appearance: 'dark',
    base: createTheme({ name: 'light-brand' }) }), /same appearance/);
});

test('theme definition and stylesheet remain pure serializable data', () => {
  const theme = createTheme({ name: 'brand', colors: { 'accent-background': '#2563eb' } });
  assert.deepEqual(Object.keys(theme), ['name', 'appearance', 'palette', 'variables']);
  const css = renderThemeCss(theme);
  assert.doesNotMatch(css, /<style|<script|document\.|window\./);
  assert.match(css, /--vf-color-disabled-border: /);
});

test('feedback colors are themeable without changing action accent', () => {
  const theme = createTheme({ name: 'feedback-brand', appearance: 'dark',
    colors: { 'success-foreground': '#ffffff', 'warning-border': '#ffcc00', 'info-background': '#123456' },
  });
  assert.equal(theme.variables['--vf-color-success-foreground'], '#ffffff');
  assert.equal(theme.variables['--vf-color-warning-border'], '#ffcc00');
  assert.equal(theme.variables['--vf-color-info-background'], '#123456');
  assert.equal(theme.variables['--vf-color-accent-background'], '#8db4ff');
  assert.match(renderThemeCss(theme), /--vf-color-success-foreground: #ffffff;/);
});

test('TextField component tokens use the existing pure theme authoring path', () => {
  const theme = createTheme({ name: 'field-brand', tokens: {
    '--vf-text-field-label-font': '600 1rem/1.5 sans-serif',
    '--vf-text-field-value-letter-spacing': '0.03em',
    '--vf-text-field-radius': '0.75rem',
  } });
  assert.match(renderThemeCss(theme), /--vf-text-field-label-font: 600 1rem\/1.5 sans-serif;/);
  assert.match(renderThemeCss(theme), /--vf-text-field-radius: 0.75rem;/);
  assert.equal(createTheme({ name: 'field-derived', base: theme }).variables['--vf-text-field-radius'], '0.75rem');
  assert.throws(() => createTheme({ name: 'field-invalid', tokens: { '--vf-text-field-not-public': 'red' } }), /Not a public CSS token/);
});


test('editor theme tokens are centralized and component overrides remain optional', () => {
  const theme = createTheme({ name: 'editor-theme', tokens: {
    '--vf-editor-value-font': '400 1rem/1.5 sans-serif',
    '--vf-textarea-placeholder-font': 'italic 400 1rem/1.5 sans-serif',
    '--vf-editor-radius': '0.5rem',
  } });
  assert.equal(theme.variables['--vf-editor-radius'], '0.5rem');
  assert.match(renderThemeCss(theme), /--vf-editor-value-font: 400 1rem/);
  assert.match(renderThemeCss(theme), /--vf-textarea-placeholder-font: italic/);
});

test('Slider component tokens use centralized theme authoring', () => {
  const theme = createTheme({ name: 'slider-brand', tokens: {
    '--vf-slider-track-size': '0.5rem', '--vf-slider-thumb-size': '1.375rem',
    '--vf-slider-fill-color': '#7c3aed', '--vf-slider-value-label-font': '600 0.875rem/1.5 sans-serif',
  } });
  assert.match(renderThemeCss(theme), /--vf-slider-track-size: 0\.5rem;/);
  assert.equal(theme.variables['--vf-slider-fill-color'], '#7c3aed');
});

test('generated scoped themes rebind canonical aliases only when their targets are overridden', () => {
  const theme = createTheme({ name: 'type-scope', tokens: { '--vf-font-family-sans': 'Georgia, serif', '--vf-font-weight-semibold': '500' } });
  assert.equal(theme.variables['--vf-control-font-family'], 'var(--vf-font-family-sans)');
  assert.equal(theme.variables['--vf-font-family-display'], 'var(--vf-font-family-sans)');
  assert.equal(theme.variables['--vf-control-font-weight'], 'var(--vf-font-weight-semibold)');
  assert.match(renderThemeCss(theme), /--vf-control-font-family: var\(--vf-font-family-sans\);/);
  const explicit = createTheme({ name: 'explicit-type', base: theme, tokens: { '--vf-control-font-family': 'monospace' } });
  assert.equal(explicit.variables['--vf-control-font-family'], 'monospace');
  assert.equal(createTheme({ name: 'unrelated' }).variables['--vf-control-font-family'], undefined);
});
