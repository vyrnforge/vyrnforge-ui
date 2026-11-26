import { componentThemeTokens, darkThemeOverrides, runtimeTokenDefaults } from './source.mjs';

function declarations(tokens, indent = '    ') {
  return Object.entries(tokens).map(([name, value]) => `${indent}${name}: ${value};`).join('\n');
}

export function renderRuntimeTokens() {
  const defaults = declarations(runtimeTokenDefaults);
  const dark = declarations(darkThemeOverrides);
  // A system scope may be nested in a dark/brand scope: do not inherit its
  // appearance when the operating system currently prefers light colors.
  const systemLight = declarations(Object.fromEntries(
    Object.keys(darkThemeOverrides).map((name) => [name, runtimeTokenDefaults[name]])
  ));
  const nestedDark = declarations(darkThemeOverrides, '      ');
  return `/* Generated from tooling/tokens/source.mjs. Do not edit directly. */\n@layer vyrnforge.tokens {\n  :root,\n  [data-vf-theme="light"] {\n    color-scheme: light;\n${defaults}\n  }\n}\n\n@layer vyrnforge.themes {\n  [data-vf-theme="dark"] {\n    color-scheme: dark;\n${dark}\n  }\n\n  [data-vf-theme="system"] {\n    color-scheme: light;\n${systemLight}\n  }\n\n  @media (prefers-color-scheme: dark) {\n    [data-vf-theme="system"] {\n      color-scheme: dark;\n${nestedDark}\n    }\n  }\n}\n`;
}

/** Generated public theme-authoring defaults, not an additional runtime token layer. */
export function renderThemeAuthoringData() {
  const roles = Object.keys(darkThemeOverrides);
  const light = Object.fromEntries(roles.map((name) => [name, runtimeTokenDefaults[name]]));
  const names = roles.map((name) => name.slice('--vf-color-'.length));
  return `/* Generated from tooling/tokens/source.mjs. Do not edit directly. */
export const themeDefaults = ${JSON.stringify({ light, dark: darkThemeOverrides }, null, 2)} as const;

export const themeableColorRoles = ${JSON.stringify(names, null, 2)} as const;

export const publicRuntimeTokens = ${JSON.stringify([...Object.keys(runtimeTokenDefaults), ...componentThemeTokens], null, 2)} as const;
`;
}
