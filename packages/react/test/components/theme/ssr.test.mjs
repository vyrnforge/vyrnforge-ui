import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ThemeScope, Text, SvgIcon, colors, tokens, toneStyle, createTheme, renderThemeCss, tokenStyle } from '@vyrnforge/react';

test('React theme references are canonical Web tokens, not hardcoded light/dark colors', () => {
  const css = readFileSync(new URL('../../../../web/src/styles/tokens.css', import.meta.url), 'utf8');
  for (const token of Object.values(colors)) {
    assert.match(token, /^var\(--vf-color-[a-z-]+\)$/);
    assert.ok(css.includes(token.slice(4, -1) + ':'), 'public token must exist: ' + token);
  }
  assert.equal(colors.primary, colors.accent);
  assert.equal(colors.secondary, colors.muted);
  assert.equal(tokens.color.danger, colors.danger);
  assert.equal(tokens.space.md, 'var(--vf-space-md)');
  assert.equal(tokens.radius.control, 'var(--vf-control-radius)');
  assert.equal(tokens.space['2xs'], 'var(--vf-space-2xs)');
  assert.equal(tokens.fontSize['6xl'], 'var(--vf-font-size-6xl)');
  assert.equal(tokens.fontFamily.display, 'var(--vf-font-family-display)');
  assert.equal(colors.surfacePressed, 'var(--vf-color-surface-pressed)');
  assert.equal(colors.disabledBorder, 'var(--vf-color-disabled-border)');

  // Every exposed React alias must resolve to an existing canonical Web runtime token.
  const publicVariables = new Set([...css.matchAll(/^\s+(--vf-[a-z0-9-]+):/gm)]
    .map((match) => match[1]));
  for (const [category, roles] of Object.entries(tokens)) {
    for (const [role, value] of Object.entries(roles)) {
      assert.match(value, /^var\(--vf-[a-z0-9-]+\)$/);
      if (category === 'color' || publicVariables.has(value.slice(4, -1))) continue;
      const theme = createTheme({ name: 'alias-audit', tokens: { [category]: { [role]: 'initial' } } });
      assert.equal(theme.variables[value.slice(4, -1)], 'initial');
    }
  }
  assert.deepEqual(toneStyle('danger', { fontWeight: 700 }),
    { color: 'var(--vf-color-danger-border)', fontWeight: 700 });
  assert.deepEqual(toneStyle('primary', { color: 'rebeccapurple' }), { color: 'rebeccapurple' });
  assert.equal(toneStyle(undefined), undefined);
});

test('ThemeScope is a native SSR-safe theme boundary with local semantic token overrides', () => {
  const scope = renderToStaticMarkup(createElement(ThemeScope, {
    as: 'section',
    theme: 'dark',
    id: 'preview',
    colors: { primary: 'rebeccapurple', danger: '#d10', onAccent: '#fff' },
    style: { padding: tokens.space.md },
  }, createElement(Text, { as: 'p', tone: 'secondary' }, 'Theme-aware')));
  assert.match(scope, /^<section/);
  assert.match(scope, /data-vf-theme="dark"/);
  assert.match(scope, /id="preview"/);
  assert.match(scope, /--vf-color-accent-background:rebeccapurple/);
  assert.match(scope, /--vf-color-danger-border:#d10/);
  assert.match(scope, /--vf-color-accent-foreground:#fff/);
  assert.match(scope, /padding:var\(--vf-space-md\)/);
  assert.match(scope, /color:var\(--vf-color-text-muted\)/);
  assert.match(scope, /<p/);
  assert.doesNotMatch(scope, /ThemeProvider|<style|<script/);

  const brand = renderToStaticMarkup(createElement(ThemeScope, { theme: 'acme' }, 'Brand'));
  assert.match(brand, /data-vf-theme="acme"/);
  const inherited = renderToStaticMarkup(createElement(ThemeScope, null, 'Inherit'));
  assert.doesNotMatch(inherited, /data-vf-theme=/);
});

test('Semantic tones preserve native Text and Icon behavior including explicit style overrides', () => {
  const styled = renderToStaticMarkup(createElement(Text,
    { as: 'strong', tone: 'accent', style: { fontWeight: 600 } }, 'Highlight'));
  assert.match(styled, /^<strong/);
  assert.match(styled, /color:var\(--vf-color-accent-background\)/);
  assert.match(styled, /font-weight:600/);
  const svg = renderToStaticMarkup(createElement(SvgIcon, { label: 'Alert', tone: 'danger' },
    createElement('path', { d: 'M12 2L22 22H2Z', stroke: 'currentColor' })));
  assert.match(svg, /aria-label="Alert"/);
  assert.match(svg, /color:var\(--vf-color-danger-border\)/);
  assert.match(svg, /<path/);
});

test('ThemeScope maps React motion roles to canonical Web CSS without a new token catalog', () => {
  const motion = {
    controlDuration: '80ms', entranceDuration: '480ms', standardEasing: 'linear',
    loadingSpinDuration: '900ms', loadingShimmerDuration: '1800ms', loadingEasing: 'ease',
  };
  const html = renderToStaticMarkup(createElement(ThemeScope, { motion }, 'Motion'));
  for (const [role, value] of Object.entries(motion)) {
    assert.ok(html.includes(tokens.motion[role].slice(4, -1) + ':' + value));
  }
  assert.doesNotMatch(html, / motion=|<style|<script/);
  const empty = renderToStaticMarkup(createElement(ThemeScope, { motion: { unsupported: 'x' } }, 'Ignore'));
  assert.doesNotMatch(empty, /unsupported|undefined|--vf-/);
});

test('feedback aliases map to shared Web tokens and permit a local SSR override', () => {
  assert.equal(colors.successForeground, 'var(--vf-color-success-foreground)');
  assert.equal(colors.warningBorder, 'var(--vf-color-warning-border)');
  assert.equal(colors.infoBackground, 'var(--vf-color-info-background)');
  const html = renderToStaticMarkup(createElement(ThemeScope, {
    colors: { successForeground: '#166534', warningBorder: '#b45309', infoBackground: '#f0f9ff' },
  }, 'Feedback'));
  assert.match(html, /--vf-color-success-foreground:#166534/);
  assert.match(html, /--vf-color-warning-border:#b45309/);
  assert.match(html, /--vf-color-info-background:#f0f9ff/);
});

test('React theme authoring maps named token groups to shared CSS and validates unknown roles', () => {
  const theme = createTheme({ name: 'brand', appearance: 'dark', palette: { brand: { 600: '#123456' } },
    colors: { accent: '{brand.600}' }, tokens: { radius: { control: '12px' }, skeleton: { duration: '2s', color: '#555' }, progress: { size: '8px' }, textField: { labelFont: '600 1rem/1.5 sans-serif' }, loading: { spinnerColor: '#aaa' } } });
  const css = renderThemeCss(theme);
  for (const [variable, value] of [['--vf-color-accent-background', '#123456'], ['--vf-control-radius', '12px'], ['--vf-skeleton-duration', '2s'], ['--vf-progress-size', '8px'], ['--vf-text-field-label-font', '600 1rem/1.5 sans-serif'], ['--vf-loading-spinner-color', '#aaa']]) {
    assert.ok(css.includes(variable + ': ' + value + ';'));
  }
  const derived = createTheme({ name: 'brand-derived', base: theme, tokens: { radius: { surface: '1rem' } } });
  assert.equal(derived.variables['--vf-skeleton-duration'], '2s');
  assert.throws(() => createTheme({ name: 'bad', tokens: { skeleton: { secret: 'red' } } }), /Unknown React token/);
  assert.throws(() => createTheme({ name: 'bad', colors: { secret: 'red' } }), /Unknown React color/);
  assert.throws(() => createTheme({ name: 'bad', tokens: { skeleton: { color: 'red; color: blue' } } }), /safe CSS value/);
  const scoped = renderToStaticMarkup(createElement(ThemeScope, { tokens: { skeleton: { duration: '2s' }, space: { md: '12px' } } }, 'Scope'));
  assert.match(scoped, /--vf-skeleton-duration:2s/);
  assert.match(scoped, /--vf-space-md:12px/);
  assert.deepEqual(tokenStyle({ progress: { size: '8px' } }), { '--vf-progress-size': '8px' });
});
