import type { DravynThemeVars } from "./theme.types";

export function createDravynTheme(vars: DravynThemeVars): DravynThemeVars {
  return { ...vars };
}

export function mergeDravynTheme(
  baseTheme: DravynThemeVars,
  overrideTheme?: DravynThemeVars
): DravynThemeVars {
  return {
    ...baseTheme,
    ...overrideTheme
  };
}

export function toDravynThemeStyle(
  vars?: DravynThemeVars
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
