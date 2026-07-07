import {
  dravynDarkTheme,
  dravynEnterpriseTheme,
  dravynLightTheme
} from "./themePresets";
import type { DravynThemeName, DravynThemeVars } from "./theme.types";

export function getDravynThemePreset(
  theme: DravynThemeName
): DravynThemeVars {
  if (theme === "dark") {
    return dravynDarkTheme;
  }

  if (theme === "enterprise") {
    return dravynEnterpriseTheme;
  }

  return dravynLightTheme;
}
