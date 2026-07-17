export type VyrnForgeDensity = "compact" | "standard" | "comfortable";

export type VyrnForgeThemeName = "light" | "dark" | "system" | "enterprise";

export type VyrnForgeTheme = VyrnForgeThemeName | (string & {});

export type VyrnForgeVariant = "plain" | "bordered" | "card";

export type VyrnForgeCssVar = `--dv-${string}`;

export type VyrnForgeThemeVars = Partial<Record<VyrnForgeCssVar, string | number>>;
