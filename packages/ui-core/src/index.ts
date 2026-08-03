import "./styles/index.css";

export const vyrnForgeUiCoreVersion = "0.2.0-beta.1";

export {
  createVyrnForgeTheme,
  mergeVyrnForgeTheme,
  toVyrnForgeThemeStyle,
} from "./theme/createTheme";
export {
  vyrnForgeDarkTheme,
  vyrnForgeEnterpriseTheme,
  vyrnForgeLightTheme,
} from "./theme/themePresets";
export {
  getVyrnForgeThemePreset,
  normalizeVyrnForgeDensity,
} from "./theme/themeUtils";
export {
  vyrnForgeCanonicalDensities,
  vyrnForgeDensityAliases,
  vyrnForgeLayerOrder,
  vyrnForgeSemanticTokenGroups,
  vyrnForgeThemeColorTokens,
} from "./theme/tokenContract";
export type {
  VyrnForgeCanonicalDensity,
  VyrnForgeLayerToken,
  VyrnForgeSemanticToken,
  VyrnForgeSemanticTokenGroup,
} from "./theme/tokenContract";
export type {
  VyrnForgeCssVar,
  VyrnForgeDensity,
  VyrnForgeLegacyDensity,
  VyrnForgeTheme,
  VyrnForgeThemeName,
  VyrnForgeThemeVars,
  VyrnForgeVariant,
} from "./theme/theme.types";
