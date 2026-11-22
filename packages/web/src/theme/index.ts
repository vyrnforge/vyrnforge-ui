import { themeDefaults, themeableColorRoles } from './defaults.generated.js';

export { themeableColorRoles } from './defaults.generated.js';

export type ThemeAppearance = 'light' | 'dark';
export type ThemeColorRole = (typeof themeableColorRoles)[number];
export type ThemePalette = Readonly<Record<string, Readonly<Record<string, string>>>>;
export type ThemeColorOverrides = Partial<Record<ThemeColorRole, string>>;

/** Opt-in pure theme authoring. {family.shade} resolves palette entries. */
export interface CreateThemeOptions {
  /** Selector name for data-vf-theme. */
  name: string;
  /** Complete appearance baseline; defaults to light unless a base is supplied. */
  appearance?: ThemeAppearance;
  /** Extend a previously defined theme with the same appearance. */
  base?: ThemeDefinition;
  /** Raw authoring shades: never emitted as public numbered palette tokens. */
  palette?: ThemePalette;
  /** Semantic role names map to existing --vf-color-* tokens. */
  colors?: ThemeColorOverrides;
  /** Optional public --vf-* token overrides, including spacing and typography. */
  tokens?: Partial<Record<string, string>>;
}

export interface ThemeDefinition {
  readonly name: string;
  readonly appearance: ThemeAppearance;
  readonly palette: ThemePalette;
  readonly variables: Readonly<Record<string, string>>;
}

const colorRoleSet = new Set<string>(themeableColorRoles);
const reservedNames = new Set(['light', 'dark', 'system']);
const slugPattern = /^[a-z][a-z0-9-]*$/;
const publicVariablePattern = /^--vf-[a-z0-9-]+$/;
const paletteReference = /^\{([a-z][a-z0-9-]*)\.([a-z0-9-]+)\}$/;

/** Reject declarations that could escape the generated CSS selector. */
function safeValue(value: string, label: string): string {
  if (typeof value !== 'string' || !value.trim() ||
    /[;{}\r\n<>]/.test(value) || value.includes('/*') || value.includes('*/')) {
    throw new TypeError(label + ' must be a single safe CSS value');
  }
  return value.trim();
}

function validateName(name: string): void {
  if (typeof name !== 'string' || !slugPattern.test(name) || reservedNames.has(name)) {
    throw new TypeError('Theme name must be a distinct lowercase slug other than light, dark or system');
  }
}

function collectPalette(base: ThemePalette | undefined, incoming: ThemePalette | undefined): ThemePalette {
  const result: Record<string, Readonly<Record<string, string>>> = {};
  for (const source of [base, incoming]) {
    for (const [family, shades] of Object.entries(source ?? {})) {
      if (!slugPattern.test(family) || !shades || typeof shades !== 'object' || Array.isArray(shades)) {
        throw new TypeError('Palette families must be named shade maps');
      }
      const merged: Record<string, string> = { ...(result[family] ?? {}) };
      for (const [shade, value] of Object.entries(shades)) {
        if (!/^[a-z0-9-]+$/.test(shade)) throw new TypeError('Invalid palette shade: ' + shade);
        merged[shade] = safeValue(value, family + '.' + shade);
      }
      result[family] = Object.freeze(merged);
    }
  }
  return Object.freeze(result);
}

function resolveColor(value: string, palette: ThemePalette, label: string): string {
  const found = paletteReference.exec(value.trim());
  if (found) {
    const family = found[1];
    const shade = found[2];
    const resolved = family && shade ? palette[family]?.[shade] : undefined;
    if (!resolved) throw new TypeError('Unknown palette reference ' + value + ' for ' + label);
    return safeValue(resolved, label);
  }
  return safeValue(value, label);
}

/** Produces complete, serializable theme data; never touches DOM or injects CSS. */
export function createTheme(options: CreateThemeOptions): ThemeDefinition {
  validateName(options.name);
  const appearance = options.appearance ?? options.base?.appearance ?? 'light';
  if (appearance !== 'light' && appearance !== 'dark') {
    throw new TypeError('appearance must be light or dark');
  }
  if (options.base && options.base.appearance !== appearance) {
    throw new TypeError('The base theme must have the same appearance');
  }
  const palette = collectPalette(options.base?.palette, options.palette);
  const variables: Record<string, string> = {
    ...themeDefaults[appearance],
    ...(options.base?.variables ?? {}),
  };

  for (const [role, value] of Object.entries(options.colors ?? {})) {
    if (!colorRoleSet.has(role)) throw new TypeError('Unknown semantic color role: ' + role);
    if (value !== undefined) variables['--vf-color-' + role] = resolveColor(value, palette, role);
  }
  for (const [name, value] of Object.entries(options.tokens ?? {})) {
    if (!publicVariablePattern.test(name)) throw new TypeError('Not a public CSS token: ' + name);
    if (value !== undefined) variables[name] = resolveColor(value, palette, name);
  }

  return Object.freeze({
    name: options.name,
    appearance,
    palette,
    variables: Object.freeze(variables),
  });
}

/** Returns CSS for a consumer stylesheet, to load after canonical Web styles. */
export function renderThemeCss(theme: ThemeDefinition): string {
  validateName(theme.name);
  if (theme.appearance !== 'light' && theme.appearance !== 'dark') {
    throw new TypeError('Invalid theme appearance');
  }
  const declarations = Object.entries(theme.variables)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => {
      if (!publicVariablePattern.test(name)) throw new TypeError('Not a public CSS token: ' + name);
      return '    ' + name + ': ' + safeValue(value, name) + ';';
    }).join('\n');
  return '@layer vyrnforge.themes {\n' +
    '  [data-vf-theme="' + theme.name + '"] {\n' +
    '    color-scheme: ' + theme.appearance + ';\n' +
    declarations + '\n' +
    '  }\n}\n';
}
