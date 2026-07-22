import {
  vyrnForgeDarkTheme,
  vyrnForgeEnterpriseTheme,
  vyrnForgeLightTheme,
} from "./themePresets";
import { vyrnForgeDensityAliases } from "./tokenContract";
import type {
  VyrnForgeCanonicalDensity,
  VyrnForgeDensity,
  VyrnForgeThemeName,
  VyrnForgeThemeVars,
} from "./theme.types";

export function getVyrnForgeThemePreset(
  theme: VyrnForgeThemeName,
): VyrnForgeThemeVars {
  if (theme === "dark") {
    return vyrnForgeDarkTheme;
  }

  if (theme === "enterprise") {
    return vyrnForgeEnterpriseTheme;
  }

  return vyrnForgeLightTheme;
}

export function normalizeVyrnForgeDensity(
  density: VyrnForgeDensity,
): VyrnForgeCanonicalDensity {
  if (density === "standard" || density === "comfortable") {
    return vyrnForgeDensityAliases[density];
  }

  return density;
}
