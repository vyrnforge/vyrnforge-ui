import {
  vyrnForgeDarkTheme,
  vyrnForgeEnterpriseTheme,
  vyrnForgeLightTheme,
  type VyrnForgeCssVar,
  type VyrnForgeThemeVars,
} from "@vyrnforge/ui-core";
import type {
  DataGridCssVar,
  DataGridThemePreset,
  DataGridThemeVars,
} from "./dataGridTheme.types";

const semanticGridTokenMap = {
  "--udg-bg": "--vf-surface-page",
  "--udg-surface": "--vf-surface-default",
  "--udg-surface-raised": "--vf-surface-overlay",
  "--udg-surface-ra-sm": "--vf-surface-overlay",
  "--udg-surface-subtle": "--vf-surface-muted",
  "--udg-surface-muted": "--vf-surface-canvas",
  "--udg-popover-bg": "--vf-surface-overlay",
  "--udg-toolbar-bg": "--vf-surface-default",
  "--udg-text": "--vf-text-primary",
  "--udg-text-muted": "--vf-text-secondary",
  "--udg-text-strong": "--vf-text-primary",
  "--udg-border": "--vf-border-default",
  "--udg-border-strong": "--vf-border-emphasis",
  "--udg-primary": "--vf-interactive-primary",
  "--udg-primary-hover": "--vf-interactive-primary-hover",
  "--udg-primary-soft": "--vf-interactive-selected-background",
  "--udg-primary-text": "--vf-interactive-primary-text",
  "--udg-danger": "--vf-status-error-text",
  "--udg-danger-soft": "--vf-status-error-background",
  "--udg-warning": "--vf-status-warning-text",
  "--udg-warning-soft": "--vf-status-warning-background",
  "--udg-success": "--vf-status-success-text",
  "--udg-success-soft": "--vf-status-success-background",
  "--udg-info": "--vf-status-info-text",
  "--udg-info-soft": "--vf-status-info-background",
  "--udg-focus-ring": "--vf-focus-color",
  "--udg-control-bg": "--vf-control-background",
  "--udg-control-border": "--vf-control-border",
  "--udg-control-hover-border": "--vf-control-border-hover",
  "--udg-control-disabled-bg": "--vf-control-disabled-background",
  "--udg-control-disabled-text": "--vf-control-disabled-text",
  "--udg-control-focus": "--vf-focus-color",
  "--udg-control-focus-border": "--vf-interactive-selected-border",
  "--udg-header-bg": "--vf-surface-muted",
  "--udg-header-text": "--vf-text-primary",
  "--udg-row-bg": "--vf-surface-default",
  "--udg-row-hover-bg": "--vf-interactive-neutral-hover",
  "--udg-row-selected-bg": "--vf-interactive-selected-background",
  "--udg-row-border": "--vf-divider",
  "--udg-skeleton-base": "--vf-border-subtle",
  "--udg-skeleton-highlight": "--vf-surface-canvas",
  "--udg-shadow-md": "--vf-shadow-md",
} satisfies Partial<Record<DataGridCssVar, VyrnForgeCssVar>>;

const variableReferencePattern = /^var\((--vf-[a-z0-9-]+)\)$/u;

function resolveThemeValue(
  theme: VyrnForgeThemeVars,
  token: VyrnForgeCssVar,
  resolving = new Set<VyrnForgeCssVar>(),
): string {
  if (resolving.has(token)) {
    throw new Error(`Circular VyrnForge theme variable reference: ${token}`);
  }

  const value = theme[token];
  if (value === undefined) {
    return `var(${token})`;
  }

  const normalizedValue = String(value);
  const reference = variableReferencePattern.exec(normalizedValue)?.[1] as
    VyrnForgeCssVar | undefined;

  if (!reference) {
    return normalizedValue;
  }

  const nextResolving = new Set(resolving);
  nextResolving.add(token);
  return resolveThemeValue(theme, reference, nextResolving);
}

export function createDataGridThemeFromVyrnForgeTheme(
  name: string,
  theme: VyrnForgeThemeVars,
): DataGridThemePreset {
  const vars = Object.fromEntries(
    Object.entries(semanticGridTokenMap).map(([gridToken, sharedToken]) => [
      gridToken,
      resolveThemeValue(theme, sharedToken),
    ]),
  ) as DataGridThemeVars;

  return { name, vars };
}

export const dataGridLightTheme = createDataGridThemeFromVyrnForgeTheme(
  "light",
  vyrnForgeLightTheme,
);

export const dataGridEnterpriseTheme = createDataGridThemeFromVyrnForgeTheme(
  "enterprise",
  vyrnForgeEnterpriseTheme,
);

export const dataGridDarkTheme = createDataGridThemeFromVyrnForgeTheme(
  "dark",
  vyrnForgeDarkTheme,
);
