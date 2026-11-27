import { createTheme, renderThemeCss, colors, tokens } from '@vyrnforge/react';
import { runtimeTokenDefinitions, runtimeTokenCompilation, componentThemeTokens } from '../../tooling/tokens/source.mjs';
import { presets, modes, validSlug, validateDraft, parseDraft } from './theme-studio-model.mjs';

export const themeableColorRoles = Object.keys(colors).filter(role => !['primary', 'secondary', 'background'].includes(role));
export const friendly = (role) => role === 'onAccent' ? 'accent foreground' : role.replace(/[A-Z]/g, letter => ' ' + letter.toLowerCase());
export const tokenId = reference => reference.slice(9, -1);
// Adapter only: portable identifiers derive from the canonical shared token
// identity; typed React aliases drive every createTheme call.
export const catalog = Object.fromEntries([
  ...themeableColorRoles.map(role => [tokenId(colors[role]), { color: true, role, description: friendly(role) + ' semantic color (#RRGGBB)' }]),
  ...Object.entries(tokens).filter(([group]) => group !== 'color').flatMap(([group, entries]) =>
    Object.entries(entries).map(([key, ref]) => [tokenId(ref), {
      group, key, valueType: runtimeTokenDefinitions[ref.slice(4, -1)]?.type ?? componentValueType(tokenId(ref)), baseline: runtimeTokenCompilation.values[ref.slice(4, -1)], description: friendly(group) + ' / ' + friendly(key) + ' (public token override; omitted values inherit the baseline)',
    }])),
]);
export const foundationEntries = Object.entries(catalog).filter(([, entry]) => !entry.color);

function componentValueType(id) {
  if (/letter-spacing$/.test(id)) return 'letter-spacing';
  if (/duration$/.test(id)) return 'duration';
  if (/font$/.test(id)) return 'font';
  if (/^shadow-/.test(id)) return 'shadow';
  if (/(?:color|background|foreground|highlight)$/.test(id)) return 'paint';
  return 'dimension';
}
// A source-level parity guard: the authoring UI must not drift from admitted Web tokens.
const admitted = [...Object.keys(runtimeTokenDefinitions), ...componentThemeTokens].map(name => name.slice(5));
if (new Set(admitted).size !== Object.keys(catalog).length || admitted.some(id => !Object.hasOwn(catalog, id))) {
  throw new Error('Theme Studio catalog diverges from canonical public tokens');
}
function overridesFor(draft, mode) {
  const roleEdits = {};
  const groups = {};
  for (const [id, value] of Object.entries(draft.overrides[mode])) {
    const entry = catalog[id];
    if (entry.color) roleEdits[mode + ':' + entry.role] = value;
    else (groups[entry.group] ??= {})[entry.key] = value;
  }
  return { roleEdits, groups };
}

export const themeValue = (theme, role) => theme.variables[colors[role].slice(4, -1)];

function luminance(hex) {
  const rgb = [1, 3, 5].map((at) => {
    const x = parseInt(hex.slice(at, at + 2), 16) / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
export function contrast(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
function readableOn(background) {
  return contrast('#ffffff', background) >= contrast('#0b1220', background)
    ? '#ffffff' : '#0b1220';
}
export function buildTheme({ palette, shades, shade, appearance, roleEdits, radius }) {
  const levels = Object.keys(shades);
  const at = levels.indexOf(shade);
  const direction = appearance === 'light' ? 1 : -1;
  const directionFits = at + 2 * direction >= 0 && at + 2 * direction < levels.length;
  const offset = directionFits ? direction : -direction;
  const hover = levels[at + offset];
  const pressed = levels[at + 2 * offset];
  const base = {
    accent: '{brand.' + shade + '}',
    accentHover: '{brand.' + hover + '}',
    accentPressed: '{brand.' + pressed + '}',
    onAccent: readableOn(shades[shade]),
    accentSubtle: '{brand.' + (appearance === 'light' ? '50' : '900') + '}',
    accentSubtleHover: '{brand.' + (appearance === 'light' ? '100' : '800') + '}',
    focus: '{brand.' + (appearance === 'light' ? '600' : '300') + '}',
  };
  const edits = Object.fromEntries(
    Object.entries(roleEdits).filter(([name]) => name.startsWith(appearance + ':'))
      .map(([name, value]) => [name.slice(appearance.length + 1), value]),
  );
  const options = {
    name: palette + '-' + appearance + '-studio',
    appearance,
    palette: { brand: shades },
    colors: { ...base, ...edits },
    tokens: {
      radius: { surface: radius + 'px', control: Math.max(0, radius - 4) + 'px' },
    },
  };
  return options;
}

export const storageKey = 'vyrnforge.docs.theme-studio.v1';
export function themeDefinitions(draft) {
  const preset = presets.find(p => p.id === draft.preset);
  const shades = { ...preset.shades, ...draft.paletteOverrides };
  const name = validSlug(draft.name) ? draft.name : 'my-brand';
  return Object.fromEntries(modes.map(mode => {
    const { roleEdits, groups } = overridesFor(draft, mode);
    const base = buildTheme({ palette: draft.preset, shades, shade: draft.shades[mode], appearance: mode, roleEdits, radius: draft.radius });
    const options = { ...base, name: name + '-' + mode, tokens: { ...groups, radius: { ...base.tokens.radius, ...groups.radius } } };
    return [mode, { options, theme: createTheme(options) }];
  }));
}
export function previewCss(theme, name) {
  return renderThemeCss({ ...theme, name });
}
export function savedTheme(storage) {
  const raw = storage.getItem(storageKey);
  return raw ? parseDraft(raw, catalog) : null;
}
export function savedThemes(storage) {
  const raw = storage.getItem(storageKey + '.library');
  if (!raw) return [];
  const list = JSON.parse(raw);
  if (!Array.isArray(list)) throw new TypeError('Invalid local theme library');
  return list.slice(0, 50).map(draft => validateDraft(draft, catalog));
}
export function storeTheme(storage, draft) {
  const next = validateDraft(draft, catalog);
  const library = savedThemes(storage).filter(item => item.name !== next.name);
  storage.setItem(storageKey + '.library', JSON.stringify([next, ...library].slice(0, 50)));
  storage.setItem(storageKey, JSON.stringify(next));
}

// Resolve inherited authoring values through canonical runtime aliases.
export function effectiveTokenValue(theme, id, seen = new Set()) {
  if (seen.has(id)) return undefined;
  seen.add(id);
  const name = '--vf-' + id;
  if (Object.hasOwn(theme.variables, name)) {
    const value = theme.variables[name];
    const reference = /^var\(--vf-([a-z0-9-]+)\)$/.exec(value);
    return reference ? effectiveTokenValue(theme, reference[1], seen) : value;
  }
  const definition = runtimeTokenDefinitions[name];
  if (definition?.reference?.startsWith('runtime.') && definition.emit === 'css-var') {
    return effectiveTokenValue(theme, definition.reference.slice('runtime.--vf-'.length), seen);
  }
  return catalog[id]?.baseline;
}
