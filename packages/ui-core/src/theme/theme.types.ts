export type VyrnForgeCanonicalDensity = "compact" | "balanced" | "spacious";

export type VyrnForgeLegacyDensity = "standard" | "comfortable";

export type VyrnForgeDensity =
  VyrnForgeCanonicalDensity | VyrnForgeLegacyDensity;

export type VyrnForgeThemeName = "light" | "dark" | "system" | "enterprise";

export type VyrnForgeTheme = VyrnForgeThemeName | (string & {});

export type VyrnForgeVariant = "plain" | "bordered" | "card";

export type VyrnForgeCssVar = `--vf-${string}`;

export type VyrnForgeThemeVars = Partial<
  Record<VyrnForgeCssVar, string | number>
>;
