import {
  vyrnForgeDarkTheme,
  vyrnForgeEnterpriseTheme,
  vyrnForgeLightTheme
} from "./themePresets";
import type { VyrnForgeThemeName, VyrnForgeThemeVars } from "./theme.types";

export function getVyrnForgeThemePreset(
  theme: VyrnForgeThemeName
): VyrnForgeThemeVars {
  if (theme === "dark") {
    return vyrnForgeDarkTheme;
  }

  if (theme === "enterprise") {
    return vyrnForgeEnterpriseTheme;
  }

  return vyrnForgeLightTheme;
}
