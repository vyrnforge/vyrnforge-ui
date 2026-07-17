import type { VyrnForgeThemeVars } from "./theme.types";

export function createVyrnForgeTheme(vars: VyrnForgeThemeVars): VyrnForgeThemeVars {
  return { ...vars };
}

export function mergeVyrnForgeTheme(
  baseTheme: VyrnForgeThemeVars,
  overrideTheme?: VyrnForgeThemeVars
): VyrnForgeThemeVars {
  return {
    ...baseTheme,
    ...overrideTheme
  };
}

export function toVyrnForgeThemeStyle(
  vars?: VyrnForgeThemeVars
): Record<string, string | number> | undefined {
  if (!vars) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(vars).filter((entry): entry is [string, string | number] => {
      const value = entry[1];
      return value !== undefined;
    })
  );
}
