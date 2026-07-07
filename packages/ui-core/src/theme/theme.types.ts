export type DravynDensity = "compact" | "standard" | "comfortable";

export type DravynThemeName = "light" | "dark" | "system" | "enterprise";

export type DravynTheme = DravynThemeName | (string & {});

export type DravynVariant = "plain" | "bordered" | "card";

export type DravynCssVar = `--dv-${string}`;

export type DravynThemeVars = Partial<Record<DravynCssVar, string | number>>;
