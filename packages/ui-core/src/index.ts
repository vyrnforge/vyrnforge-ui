import "./styles/index.css";

export const vyrnForgeUiCoreVersion = "0.1.0";

export {
  createVyrnForgeTheme,
  mergeVyrnForgeTheme,
  toVyrnForgeThemeStyle
} from "./theme/createTheme";
export {
  vyrnForgeDarkTheme,
  vyrnForgeEnterpriseTheme,
  vyrnForgeLightTheme
} from "./theme/themePresets";
export { getVyrnForgeThemePreset } from "./theme/themeUtils";
export type {
  VyrnForgeCssVar,
  VyrnForgeDensity,
  VyrnForgeTheme,
  VyrnForgeThemeName,
  VyrnForgeThemeVars,
  VyrnForgeVariant
} from "./theme/theme.types";
