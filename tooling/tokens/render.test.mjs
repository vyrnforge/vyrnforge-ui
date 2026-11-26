import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderRuntimeTokens, renderThemeAuthoringData } from './render.mjs';
import { darkThemeOverrides, runtimeTokenCompilation, runtimeTokenDefaults } from './source.mjs';

test('preserves current light, dark, and system runtime output semantics', () => {
  const css = renderRuntimeTokens();

  assert.match(css, /:root,\n  \[data-vf-theme="light"\]/);
  assert.match(css, /--vf-color-accent-background: #245edb;/);
  assert.match(css, /--vf-color-border-required: #71717a;/);
  assert.match(css, /--vf-font-family-display: var\(--vf-font-family-sans\);/);
  assert.match(css, /\[data-vf-theme="dark"\][\s\S]*--vf-color-accent-background: #8db4ff;/);
  assert.match(css, /\[data-vf-theme="dark"\][\s\S]*--vf-color-border-required: #a1a1aa;/);
  assert.match(css, /\[data-vf-theme="system"\]/);
  const systemLight = css.match(/\[data-vf-theme="system"\] \{\n    color-scheme: light;\n([\s\S]*?)\n  \}/)?.[1];
  assert.ok(systemLight, 'system scope must emit a light fallback mapping');
  for (const name of Object.keys(darkThemeOverrides)) {
    assert.ok(Object.hasOwn(runtimeTokenDefaults, name), 'missing light value for ' + name);
    assert.ok(systemLight.includes(name + ': ' + runtimeTokenDefaults[name] + ';'),
      'system light scope must reset ' + name + ' inside dark ancestors');
  }
  assert.doesNotMatch(systemLight, /--vf-font-size-/, 'system must not reset non-theme scales');
  assert.match(css, /@media \(prefers-color-scheme: dark\)/);
});

test('runtime CSS aliases preserve a validated authoring relationship', () => {
  assert.equal(runtimeTokenCompilation.values['--vf-font-family-display'], runtimeTokenCompilation.values['--vf-font-family-sans']);
  assert.equal(runtimeTokenCompilation.cssValues['--vf-font-family-display'], 'var(--vf-font-family-sans)');
  assert.equal(runtimeTokenCompilation.values['--vf-control-font-weight'], runtimeTokenCompilation.values['--vf-font-weight-semibold']);
  assert.equal(runtimeTokenCompilation.cssValues['--vf-control-font-weight'], 'var(--vf-font-weight-semibold)');
});

test('generated theme authoring defaults match the canonical token source', () => {
  const generated = readFileSync(new URL('../../packages/web/src/theme/defaults.generated.ts', import.meta.url), 'utf8');
  assert.equal(generated, renderThemeAuthoringData(), 'theme authoring defaults must not drift');
  for (const token of Object.keys(darkThemeOverrides)) {
    assert.ok(generated.includes(token));
    assert.ok(generated.includes(runtimeTokenDefaults[token]));
    assert.ok(generated.includes(darkThemeOverrides[token]));
  }
});

test('feedback colors have accessible default text and border contrast in both appearances', () => {
  function luminance(hex) {
    const channels = hex.slice(1).match(/../g).map((channel) => parseInt(channel, 16) / 255)
      .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }
  function contrast(a, b) {
    const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (values[0] + 0.05) / (values[1] + 0.05);
  }
  for (const theme of [runtimeTokenDefaults, { ...runtimeTokenDefaults, ...darkThemeOverrides }]) {
    for (const tone of ['danger', 'success', 'warning', 'info']) {
      const prefix = '--vf-color-' + tone;
      const foreground = theme[prefix + '-foreground'];
      const background = theme[prefix + '-background'];
      const border = theme[prefix + '-border'];
      for (const surface of [background, theme['--vf-color-surface']]) {
        assert.ok(contrast(foreground, surface) >= 4.5, tone + ' text contrast');
        assert.ok(contrast(border, surface) >= 3, tone + ' boundary contrast');
      }
    }
  }
});
