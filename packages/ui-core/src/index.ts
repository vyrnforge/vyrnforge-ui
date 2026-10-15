import "./styles/index.css";

export const vyrnForgeUiCoreVersion = "0.2.0-beta.2";

export {
  getVyrnForgeIconDefinition,
  getVyrnForgeIconMarkup,
  getVyrnForgeIconSvg,
  resolveVyrnForgeIconSize,
  vyrnForgeIconDefinitions,
  vyrnForgeIconNames,
  vyrnForgeIconSizePixels,
} from "./icons";
export type {
  VyrnForgeIconAttributeValue,
  VyrnForgeIconDefinition,
  VyrnForgeIconElementName,
  VyrnForgeIconName,
  VyrnForgeIconNode,
  VyrnForgeIconSize,
  VyrnForgeIconSizeName,
} from "./icons";
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
