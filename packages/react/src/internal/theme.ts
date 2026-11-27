import { createElement, forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes, ReactElement } from 'react';
import { createTheme as createWebTheme, renderThemeCss as renderWebThemeCss } from '@vyrnforge/web/theme';
import type { CreateThemeOptions as WebCreateThemeOptions, PublicRuntimeTokenName, ThemeDefinition } from '@vyrnforge/web/theme';
export type { ThemeDefinition } from '@vyrnforge/web/theme';

/**
 * React-friendly names for the existing public Web semantic color variables.
 * This is an alias table, NOT a React color palette or a second theme source.
 *
 * "primary" is the action/accent role, and "secondary" is muted text.
 * Use "accent" and "muted" when that meaning is clearer.
 */
const semanticColorVariables = {
  primary: '--vf-color-accent-background',
  secondary: '--vf-color-text-muted',
  accent: '--vf-color-accent-background',
  accentHover: '--vf-color-accent-background-hover',
  accentPressed: '--vf-color-accent-background-pressed',
  onAccent: '--vf-color-accent-foreground',
  accentSubtle: '--vf-color-accent-subtle',
  accentSubtleHover: '--vf-color-accent-subtle-hover',
  danger: '--vf-color-danger-border',
  dangerBackground: '--vf-color-danger-background',
  dangerForeground: '--vf-color-danger-foreground',
  successForeground: '--vf-color-success-foreground',
  successBackground: '--vf-color-success-background',
  successBorder: '--vf-color-success-border',
  warningForeground: '--vf-color-warning-foreground',
  warningBackground: '--vf-color-warning-background',
  warningBorder: '--vf-color-warning-border',
  infoForeground: '--vf-color-info-foreground',
  infoBackground: '--vf-color-info-background',
  infoBorder: '--vf-color-info-border',
  text: '--vf-color-text',
  muted: '--vf-color-text-muted',
  subtle: '--vf-color-text-subtle',
  background: '--vf-color-surface',
  surface: '--vf-color-surface',
  surfaceSubtle: '--vf-color-surface-subtle',
  surfaceHover: '--vf-color-surface-hover',
  surfacePressed: '--vf-color-surface-pressed',
  border: '--vf-color-border',
  borderStrong: '--vf-color-border-strong',
  borderRequired: '--vf-color-border-required',
  focus: '--vf-color-focus-ring',
  disabledText: '--vf-color-disabled-foreground',
  disabledBackground: '--vf-color-disabled-background',
  disabledBorder: '--vf-color-disabled-border',
} as const;

export type ColorRole = keyof typeof semanticColorVariables;
export type TextTone = 'primary' | 'secondary' | 'accent' | 'danger' | 'text' | 'muted' | 'subtle' | 'onAccent';

type CssReference = `var(--vf-${string})`;

/** Always resolves via CSS inheritance, including nested light/dark/brand scopes. */
function reference(variable: `--vf-${string}`): CssReference {
  return `var(${variable})`;
}

export const colors: Readonly<Record<ColorRole, CssReference>> = Object.freeze(
  Object.fromEntries(
    Object.entries(semanticColorVariables).map(([name, variable]) =>
      [name, reference(variable as `--vf-${string}`)])
  ) as Record<ColorRole, CssReference>
);

export const tokens = Object.freeze({
  color: colors,
  space: Object.freeze({
    none: reference('--vf-space-none'),
    '2xs': reference('--vf-space-2xs'),
    xs: reference('--vf-space-xs'),
    sm: reference('--vf-space-sm'),
    md: reference('--vf-space-md'),
    lg: reference('--vf-space-lg'),
    xl: reference('--vf-space-xl'),
    '2xl': reference('--vf-space-2xl'),
    '3xl': reference('--vf-space-3xl'),
  }),
  fontFamily: Object.freeze({
    sans: reference('--vf-font-family-sans'),
    serif: reference('--vf-font-family-serif'),
    mono: reference('--vf-font-family-mono'),
    display: reference('--vf-font-family-display'),
  }),
  fontSize: Object.freeze({
    xs: reference('--vf-font-size-xs'),
    sm: reference('--vf-font-size-sm'),
    md: reference('--vf-font-size-md'),
    lg: reference('--vf-font-size-lg'),
    xl: reference('--vf-font-size-xl'),
    '2xl': reference('--vf-font-size-2xl'),
    '3xl': reference('--vf-font-size-3xl'),
    '4xl': reference('--vf-font-size-4xl'),
    '5xl': reference('--vf-font-size-5xl'),
    '6xl': reference('--vf-font-size-6xl'),
  }),
  fontWeight: Object.freeze({
    regular: reference('--vf-font-weight-regular'),
    medium: reference('--vf-font-weight-medium'),
    semibold: reference('--vf-font-weight-semibold'),
    bold: reference('--vf-font-weight-bold'),
  }),
  lineHeight: Object.freeze({
    none: reference('--vf-line-height-none'),
    tight: reference('--vf-line-height-tight'),
    compact: reference('--vf-line-height-compact'),
    normal: reference('--vf-line-height-normal'),
    relaxed: reference('--vf-line-height-relaxed'),
  }),
  letterSpacing: Object.freeze({
    tighter: reference('--vf-letter-spacing-tighter'),
    tight: reference('--vf-letter-spacing-tight'),
    normal: reference('--vf-letter-spacing-normal'),
    wide: reference('--vf-letter-spacing-wide'),
    wider: reference('--vf-letter-spacing-wider'),
  }),
  radius: Object.freeze({
    surface: reference('--vf-radius-surface'),
    control: reference('--vf-control-radius'),
  }),
  shadow: Object.freeze({
    sm: reference('--vf-shadow-sm'),
    md: reference('--vf-shadow-md'),
    lg: reference('--vf-shadow-lg'),
  }),
  control: Object.freeze({
    heightSm: reference('--vf-control-height-sm'),
    heightMd: reference('--vf-control-height-md'),
    heightLg: reference('--vf-control-height-lg'),
    fontFamily: reference('--vf-control-font-family'),
    fontSize: reference('--vf-control-font-size'),
    fontWeight: reference('--vf-control-font-weight'),
  }),
  motion: Object.freeze({
    controlDuration: reference('--vf-control-motion-duration'),
    entranceDuration: reference('--vf-motion-duration-enter'),
    loadingSpinDuration: reference('--vf-motion-duration-loading-spin'),
    loadingShimmerDuration: reference('--vf-motion-duration-loading-shimmer'),
    loadingEasing: reference('--vf-motion-easing-loading'),
    standardEasing: reference('--vf-motion-easing-standard'),
  }),
  editor: Object.freeze({
    valueFont: reference('--vf-editor-value-font'),
    valueLetterSpacing: reference('--vf-editor-value-letter-spacing'),
    placeholderFont: reference('--vf-editor-placeholder-font'),
    placeholderLetterSpacing: reference('--vf-editor-placeholder-letter-spacing'),
    radius: reference('--vf-editor-radius'),
    background: reference('--vf-editor-background'),
    borderColor: reference('--vf-editor-border-color'),
  }),
  input: Object.freeze({
    valueFont: reference('--vf-input-value-font'),
    placeholderFont: reference('--vf-input-placeholder-font'),
  }),
  textarea: Object.freeze({
    valueFont: reference('--vf-textarea-value-font'),
    placeholderFont: reference('--vf-textarea-placeholder-font'),
  }),
  textField: Object.freeze({
    valueFont: reference('--vf-text-field-value-font'),
    valueLetterSpacing: reference('--vf-text-field-value-letter-spacing'),
    placeholderFont: reference('--vf-text-field-placeholder-font'),
    placeholderLetterSpacing: reference('--vf-text-field-placeholder-letter-spacing'),
    labelFont: reference('--vf-text-field-label-font'),
    labelLetterSpacing: reference('--vf-text-field-label-letter-spacing'),
    messageFont: reference('--vf-text-field-message-font'),
    messageLetterSpacing: reference('--vf-text-field-message-letter-spacing'),
    affixFont: reference('--vf-text-field-affix-font'),
    affixLetterSpacing: reference('--vf-text-field-affix-letter-spacing'),
    radius: reference('--vf-text-field-radius'),
    background: reference('--vf-text-field-background'),
    borderColor: reference('--vf-text-field-border-color'),
  }),
  skeleton: Object.freeze({
    color: reference('--vf-skeleton-color'),
    highlight: reference('--vf-skeleton-highlight'),
    radius: reference('--vf-skeleton-radius'),
    duration: reference('--vf-skeleton-duration'),
  }),
  progress: Object.freeze({
    color: reference('--vf-progress-color'),
    trackColor: reference('--vf-progress-track-color'),
    size: reference('--vf-progress-size'),
    radius: reference('--vf-progress-radius'),
  }),
  backdrop: Object.freeze({
    color: reference('--vf-backdrop-color'),
  }),
  loading: Object.freeze({
    color: reference('--vf-loading-color'),
    trackColor: reference('--vf-loading-track-color'),
    indicatorSize: reference('--vf-loading-indicator-size'),
    indicatorThickness: reference('--vf-loading-indicator-thickness'),
    indicatorDuration: reference('--vf-loading-indicator-duration'),
    spinnerColor: reference('--vf-loading-spinner-color'),
    spinnerTrackColor: reference('--vf-loading-spinner-track-color'),
    spinnerDuration: reference('--vf-loading-spinner-duration'),
    dotsColor: reference('--vf-loading-dots-color'),
    dotsDuration: reference('--vf-loading-dots-duration'),
    barsColor: reference('--vf-loading-bars-color'),
    barsDuration: reference('--vf-loading-bars-duration'),
    pulseColor: reference('--vf-loading-pulse-color'),
    pulseDuration: reference('--vf-loading-pulse-duration'),
    customColor: reference('--vf-loading-custom-color'),
  }),
});

/** One typed token-backed color declaration; explicit consumer CSS can override it. */
export function toneStyle(tone?: ColorRole, style?: CSSProperties): CSSProperties | undefined {
  return tone === undefined ? style : { color: colors[tone], ...style };
}

/** Optional scoped overrides of public semantic tokens, never reference/private tokens. */
export type ThemeColorOverrides = Partial<Record<ColorRole, string>>;

/** Scoped overrides of the existing public React motion token roles. */
export type ThemeMotionOverrides = Partial<Record<keyof typeof tokens.motion, string>>;

/** Public React token groups, using the same names as tokens. */
export type ThemeTokenOverrides = {
  [Group in Exclude<keyof typeof tokens, 'color'>]?: Partial<Record<keyof (typeof tokens)[Group], string>>;
};

export interface CreateThemeOptions extends Omit<WebCreateThemeOptions, 'colors' | 'tokens'> {
  colors?: ThemeColorOverrides;
  tokens?: ThemeTokenOverrides;
}

function tokenVariables(overrides?: ThemeTokenOverrides): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [group, values] of Object.entries(overrides ?? {})) {
    if (group === 'color' || !Object.hasOwn(tokens, group)) {
      throw new TypeError('Unknown React token group: ' + group);
    }
    const roles = tokens[group as Exclude<keyof typeof tokens, 'color'>] as Readonly<Record<string, CssReference>>;
    for (const [role, value] of Object.entries(values ?? {})) {
      if (!Object.hasOwn(roles, role)) throw new TypeError('Unknown React token: ' + group + '.' + role);
      if (value !== undefined) result[roles[role]!.slice(4, -1)] = value;
    }
  }
  return result;
}

/** Build a shared theme using React-facing typed names, without CSS variable keys. */
export function createTheme({ colors: overrides, tokens: groups, ...options }: CreateThemeOptions): ThemeDefinition {
  const variables = tokenVariables(groups);
  for (const [role, value] of Object.entries(overrides ?? {})) {
    if (!Object.hasOwn(semanticColorVariables, role)) throw new TypeError('Unknown React color role: ' + role);
    if (value !== undefined) variables[semanticColorVariables[role as ColorRole]] = value;
  }
  return createWebTheme({ ...options, tokens: variables as Partial<Record<PublicRuntimeTokenName, string>> });
}

/** Emit the canonical portable stylesheet; never inject styles or require context. */
export function renderThemeCss(theme: ThemeDefinition): string {
  return renderWebThemeCss(theme);
}

/** Scoped token overrides for a native React style prop. */
export function tokenStyle(overrides: ThemeTokenOverrides): CSSProperties {
  return tokenVariables(overrides) as CSSProperties;
}

export type ThemeName = 'light' | 'dark' | 'system' | (string & {});

export type ThemeElement = 'div' | 'span' | 'section' | 'article' | 'main' |
  'aside' | 'header' | 'footer' | 'nav';

export interface ThemeScopeProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Native semantic host; styling remains completely external to this scope. */
  as?: ThemeElement;
  theme?: ThemeName;
  colors?: ThemeColorOverrides;
  motion?: ThemeMotionOverrides;
  /** Named foundation/component token overrides, inherited by descendants. */
  tokens?: ThemeTokenOverrides;
}

const makeElement = createElement as (host: ThemeElement, props: object) => ReactElement;

/**
 * A native DOM theme scope, not a provider or theme runtime.
 * CSS (including custom [data-vf-theme] rules) remains the source of truth.
 */
export const ThemeScope = forwardRef<HTMLElement, ThemeScopeProps>(function ThemeScope(
  { as = 'div', theme, colors: overrides, motion, tokens: groups, style, ...nativeProps },
  ref
) {
  const resolvedStyle: CSSProperties = tokenStyle(groups ?? {});
  for (const [role, value] of Object.entries(overrides ?? {})) {
    if (value !== undefined) {
      (resolvedStyle as Record<string, string>)[semanticColorVariables[role as ColorRole]] = value;
    }
  }
  for (const [role, value] of Object.entries(motion ?? {})) {
    const token = tokens.motion[role as keyof typeof tokens.motion];
    if (value !== undefined && Object.hasOwn(tokens.motion, role)) {
      (resolvedStyle as Record<string, string>)[token.slice(4, -1)] = value;
    }
  }
  return makeElement(as, {
    ...nativeProps,
    ref,
    'data-vf-theme': theme,
    style: { ...resolvedStyle, ...style },
  });
});

