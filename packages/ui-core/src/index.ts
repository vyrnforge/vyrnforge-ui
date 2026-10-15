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
  vyrnForgeCompatibilityAliases,
  vyrnForgeCompatibilityBridges,
  vyrnForgeCompatibilitySourceTokens,
  vyrnForgeDensityAliases,
  vyrnForgeDesignTokenCategories,
  vyrnForgeDesignTokenSource,
  vyrnForgeLayerOrder,
  vyrnForgeMotionContract,
  vyrnForgePrimitiveTokenGroups,
  vyrnForgeSemanticTokenGroups,
  vyrnForgeThemeColorTokens,
  vyrnForgeThemeContract,
} from "./theme/tokenContract";
export type {
  VyrnForgeCanonicalDensity,
  VyrnForgeDesignTokenCategory,
  VyrnForgeDesignTokenRecord,
  VyrnForgeLayerToken,
  VyrnForgePrimitiveToken,
  VyrnForgePrimitiveTokenGroup,
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
