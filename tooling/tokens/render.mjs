import { darkThemeOverrides, runtimeTokenDefaults } from './source.mjs';

function declarations(tokens, indent = '    ') {
  return Object.entries(tokens).map(([name, value]) => `${indent}${name}: ${value};`).join('\n');
}

export function renderRuntimeTokens() {
  const defaults = declarations(runtimeTokenDefaults);
  const dark = declarations(darkThemeOverrides);
  const nestedDark = declarations(darkThemeOverrides, '      ');
  return `/* Generated from tooling/tokens/source.mjs. Do not edit directly. */\n@layer vyrnforge.tokens {\n  :root,\n  [data-vf-theme="light"] {\n    color-scheme: light;\n${defaults}\n  }\n}\n\n@layer vyrnforge.themes {\n  [data-vf-theme="dark"] {\n    color-scheme: dark;\n${dark}\n  }\n\n  [data-vf-theme="system"] {\n    color-scheme: light;\n  }\n\n  @media (prefers-color-scheme: dark) {\n    [data-vf-theme="system"] {\n      color-scheme: dark;\n${nestedDark}\n    }\n  }\n}\n`;
}
