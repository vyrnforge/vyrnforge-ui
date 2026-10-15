import type { VyrnForgeCssVar } from "./theme.types";

export const vyrnForgeSemanticTokenGroups = {
  surface: [
    "--vf-surface-page",
    "--vf-surface-canvas",
    "--vf-surface-default",
    "--vf-surface-muted",
    "--vf-surface-overlay",
    "--vf-surface-sunken",
    "--vf-surface-scrim",
  ] as const,
  text: [
    "--vf-text-primary",
    "--vf-text-secondary",
    "--vf-text-tertiary",
    "--vf-text-inverse",
    "--vf-text-disabled",
    "--vf-text-link",
    "--vf-text-link-hover",
  ] as const,
  border: [
    "--vf-border-subtle",
    "--vf-border-default",
    "--vf-border-emphasis",
    "--vf-divider",
  ] as const,
  interactive: [
    "--vf-interactive-primary",
    "--vf-interactive-primary-hover",
    "--vf-interactive-primary-active",
    "--vf-interactive-primary-text",
    "--vf-interactive-selected-background",
    "--vf-interactive-selected-border",
    "--vf-interactive-selected-text",
    "--vf-interactive-neutral-hover",
    "--vf-interactive-neutral-active",
    "--vf-control-background",
    "--vf-control-background-hover",
    "--vf-control-background-active",
    "--vf-control-border",
    "--vf-control-border-hover",
    "--vf-control-disabled-background",
    "--vf-control-disabled-border",
    "--vf-control-disabled-text",
    "--vf-focus-color",
    "--vf-focus-width",
    "--vf-focus-offset",
    "--vf-focus-shadow",
  ] as const,
  status: [
    "--vf-status-success-text",
    "--vf-status-success-background",
    "--vf-status-success-border",
    "--vf-status-success-indicator",
    "--vf-status-warning-text",
    "--vf-status-warning-background",
    "--vf-status-warning-border",
    "--vf-status-warning-indicator",
    "--vf-status-error-text",
    "--vf-status-error-background",
    "--vf-status-error-border",
    "--vf-status-error-indicator",
    "--vf-status-info-text",
    "--vf-status-info-background",
    "--vf-status-info-border",
    "--vf-status-info-indicator",
    "--vf-status-pending-text",
    "--vf-status-pending-background",
    "--vf-status-pending-border",
    "--vf-status-pending-indicator",
    "--vf-status-neutral-text",
    "--vf-status-neutral-background",
    "--vf-status-neutral-border",
    "--vf-status-neutral-indicator",
  ] as const,
  density: [
    "--vf-hit-target-min",
    "--vf-control-height-sm",
    "--vf-control-height-md",
    "--vf-control-height-lg",
    "--vf-control-padding-x-sm",
    "--vf-control-padding-x-md",
    "--vf-control-padding-x-lg",
    "--vf-control-padding-y-sm",
    "--vf-control-padding-y-md",
    "--vf-control-padding-y-lg",
    "--vf-icon-size-sm",
    "--vf-icon-size-md",
    "--vf-icon-size-lg",
    "--vf-row-height-sm",
    "--vf-row-height-md",
    "--vf-row-height-lg",
    "--vf-control-height",
    "--vf-control-padding-x",
    "--vf-control-padding-y",
    "--vf-icon-size",
    "--vf-row-height",
    "--vf-component-gap",
  ] as const,
  typography: [
    "--vf-type-display-font-family",
    "--vf-type-display-font-size",
    "--vf-type-display-font-weight",
    "--vf-type-display-line-height",
    "--vf-type-display-letter-spacing",
    "--vf-type-page-title-font-family",
    "--vf-type-page-title-font-size",
    "--vf-type-page-title-font-weight",
    "--vf-type-page-title-line-height",
    "--vf-type-page-title-letter-spacing",
    "--vf-type-section-title-font-family",
    "--vf-type-section-title-font-size",
    "--vf-type-section-title-font-weight",
    "--vf-type-section-title-line-height",
    "--vf-type-section-title-letter-spacing",
    "--vf-type-label-font-family",
    "--vf-type-label-font-size",
    "--vf-type-label-font-weight",
    "--vf-type-label-line-height",
    "--vf-type-label-letter-spacing",
    "--vf-type-body-font-family",
    "--vf-type-body-font-size",
    "--vf-type-body-font-weight",
    "--vf-type-body-line-height",
    "--vf-type-body-letter-spacing",
    "--vf-type-caption-font-family",
    "--vf-type-caption-font-size",
    "--vf-type-caption-font-weight",
    "--vf-type-caption-line-height",
    "--vf-type-caption-letter-spacing",
    "--vf-type-code-font-family",
    "--vf-type-code-font-size",
    "--vf-type-code-font-weight",
    "--vf-type-code-line-height",
    "--vf-type-code-letter-spacing",
    "--vf-type-numeric-font-family",
    "--vf-type-numeric-font-size",
    "--vf-type-numeric-font-weight",
    "--vf-type-numeric-line-height",
    "--vf-type-numeric-letter-spacing",
  ] as const,
  motion: [
    "--vf-motion-duration-instant",
    "--vf-motion-duration-fast",
    "--vf-motion-duration-standard",
    "--vf-motion-duration-slow",
    "--vf-motion-duration-deliberate",
    "--vf-motion-easing-standard",
    "--vf-motion-easing-enter",
    "--vf-motion-easing-exit",
    "--vf-motion-easing-emphasized",
    "--vf-motion-transition-color",
    "--vf-motion-transition-opacity",
    "--vf-motion-transition-transform",
  ] as const,
  layer: [
    "--vf-layer-base",
    "--vf-layer-raised",
    "--vf-layer-sticky",
    "--vf-layer-dropdown",
    "--vf-layer-popover",
    "--vf-layer-tooltip",
    "--vf-layer-scrim",
    "--vf-layer-modal",
    "--vf-layer-toast",
    "--vf-layer-debug",
  ] as const,
} as const satisfies Record<string, readonly VyrnForgeCssVar[]>;

export const vyrnForgeCanonicalDensities = [
  "compact",
  "balanced",
  "spacious",
] as const;

export const vyrnForgeDensityAliases = {
  standard: "balanced",
  comfortable: "spacious",
} as const;

export const vyrnForgeLayerOrder = [
  { name: "--vf-layer-base", level: 0 },
  { name: "--vf-layer-raised", level: 10 },
  { name: "--vf-layer-sticky", level: 20 },
  { name: "--vf-layer-dropdown", level: 40 },
  { name: "--vf-layer-popover", level: 50 },
  { name: "--vf-layer-tooltip", level: 60 },
  { name: "--vf-layer-scrim", level: 70 },
  { name: "--vf-layer-modal", level: 80 },
  { name: "--vf-layer-toast", level: 90 },
  { name: "--vf-layer-debug", level: 9999 },
] as const;

export const vyrnForgeThemeColorTokens = [
  "--vf-surface-page",
  "--vf-surface-canvas",
  "--vf-surface-default",
  "--vf-surface-muted",
  "--vf-surface-overlay",
  "--vf-surface-sunken",
  "--vf-surface-scrim",
  "--vf-text-primary",
  "--vf-text-secondary",
  "--vf-text-tertiary",
  "--vf-text-inverse",
  "--vf-text-disabled",
  "--vf-text-link",
  "--vf-text-link-hover",
  "--vf-border-subtle",
  "--vf-border-default",
  "--vf-border-emphasis",
  "--vf-divider",
  "--vf-interactive-primary",
  "--vf-interactive-primary-hover",
  "--vf-interactive-primary-active",
  "--vf-interactive-primary-text",
  "--vf-interactive-selected-background",
  "--vf-interactive-selected-border",
  "--vf-interactive-selected-text",
  "--vf-interactive-neutral-hover",
  "--vf-interactive-neutral-active",
  "--vf-control-background",
  "--vf-control-background-hover",
  "--vf-control-background-active",
  "--vf-control-border",
  "--vf-control-border-hover",
  "--vf-control-disabled-background",
  "--vf-control-disabled-border",
  "--vf-control-disabled-text",
  "--vf-focus-color",
  "--vf-status-success-text",
  "--vf-status-success-background",
  "--vf-status-success-border",
  "--vf-status-success-indicator",
  "--vf-status-warning-text",
  "--vf-status-warning-background",
  "--vf-status-warning-border",
  "--vf-status-warning-indicator",
  "--vf-status-error-text",
  "--vf-status-error-background",
  "--vf-status-error-border",
  "--vf-status-error-indicator",
  "--vf-status-info-text",
  "--vf-status-info-background",
  "--vf-status-info-border",
  "--vf-status-info-indicator",
  "--vf-status-pending-text",
  "--vf-status-pending-background",
  "--vf-status-pending-border",
  "--vf-status-pending-indicator",
  "--vf-status-neutral-text",
  "--vf-status-neutral-background",
  "--vf-status-neutral-border",
  "--vf-status-neutral-indicator",
] as const satisfies readonly VyrnForgeCssVar[];

export type VyrnForgeSemanticTokenGroup =
  keyof typeof vyrnForgeSemanticTokenGroups;

export type VyrnForgeSemanticToken =
  (typeof vyrnForgeSemanticTokenGroups)[VyrnForgeSemanticTokenGroup][number];

export type VyrnForgeCanonicalDensity =
  (typeof vyrnForgeCanonicalDensities)[number];

export type VyrnForgeLayerToken = (typeof vyrnForgeLayerOrder)[number]["name"];

/**
 * Primitive values are implementation ingredients. Application UI should prefer
 * the semantic roles above so themes and framework adapters remain portable.
 */
export const vyrnForgePrimitiveTokenGroups = {
  color: [
    "--vf-color-white",
    "--vf-color-black",
    "--vf-color-slate-50",
    "--vf-color-slate-100",
    "--vf-color-slate-200",
    "--vf-color-slate-300",
    "--vf-color-slate-400",
    "--vf-color-slate-500",
    "--vf-color-slate-600",
    "--vf-color-slate-700",
    "--vf-color-slate-800",
    "--vf-color-slate-900",
    "--vf-color-slate-950",
    "--vf-color-blue-50",
    "--vf-color-blue-100",
    "--vf-color-blue-200",
    "--vf-color-blue-500",
    "--vf-color-blue-600",
    "--vf-color-blue-700",
    "--vf-color-blue-800",
    "--vf-color-red-50",
    "--vf-color-red-100",
    "--vf-color-red-200",
    "--vf-color-red-600",
    "--vf-color-red-700",
    "--vf-color-red-800",
    "--vf-color-amber-50",
    "--vf-color-amber-100",
    "--vf-color-amber-200",
    "--vf-color-amber-600",
    "--vf-color-amber-700",
    "--vf-color-amber-800",
    "--vf-color-green-50",
    "--vf-color-green-100",
    "--vf-color-green-200",
    "--vf-color-green-600",
    "--vf-color-green-700",
    "--vf-color-green-800",
    "--vf-color-sky-50",
    "--vf-color-sky-100",
    "--vf-color-sky-200",
    "--vf-color-sky-600",
    "--vf-color-sky-700",
    "--vf-color-sky-800",
    "--vf-color-violet-50",
    "--vf-color-violet-100",
    "--vf-color-violet-200",
    "--vf-color-violet-600",
    "--vf-color-violet-700",
    "--vf-color-violet-800",
  ] as const,
  typography: [
    "--vf-font-family",
    "--vf-font-family-mono",
    "--vf-font-size-2xs",
    "--vf-font-size-xs",
    "--vf-font-size-sm",
    "--vf-font-size-md",
    "--vf-font-size-lg",
    "--vf-font-size-xl",
    "--vf-font-size-2xl",
    "--vf-font-size-3xl",
    "--vf-line-height-none",
    "--vf-line-height-tight",
    "--vf-line-height-snug",
    "--vf-line-height-md",
    "--vf-line-height-relaxed",
    "--vf-font-weight-regular",
    "--vf-font-weight-medium",
    "--vf-font-weight-semibold",
    "--vf-font-weight-bold",
    "--vf-letter-spacing-tight",
    "--vf-letter-spacing-normal",
    "--vf-letter-spacing-wide",
  ] as const,
  spacing: [
    "--vf-space-0",
    "--vf-space-1",
    "--vf-space-2",
    "--vf-space-3",
    "--vf-space-4",
    "--vf-space-5",
    "--vf-space-6",
    "--vf-space-7",
    "--vf-space-8",
    "--vf-space-10",
    "--vf-space-12",
  ] as const,
  radius: [
    "--vf-radius-none",
    "--vf-radius-sm",
    "--vf-radius-md",
    "--vf-radius-lg",
    "--vf-radius-xl",
    "--vf-radius-full",
  ] as const,
  shadow: ["--vf-shadow-sm", "--vf-shadow-md", "--vf-shadow-lg"] as const,
} as const satisfies Record<string, readonly VyrnForgeCssVar[]>;

/** Existing source variables retained only so older overrides continue to feed semantics. */
export const vyrnForgeCompatibilitySourceTokens = [
  "--vf-bg",
  "--vf-surface",
  "--vf-surface-subtle",
  "--vf-surface-raised",
  "--vf-text",
  "--vf-text-muted",
  "--vf-text-strong",
  "--vf-border",
  "--vf-border-strong",
  "--vf-primary",
  "--vf-primary-hover",
  "--vf-primary-soft",
  "--vf-danger",
  "--vf-danger-soft",
  "--vf-warning",
  "--vf-warning-soft",
  "--vf-success",
  "--vf-success-soft",
  "--vf-info",
  "--vf-info-soft",
  "--vf-focus-ring",
] as const satisfies readonly VyrnForgeCssVar[];

export const vyrnForgeCompatibilityBridges = [
  { legacy: "--vf-bg", canonical: "--vf-surface-page" },
  { legacy: "--vf-surface", canonical: "--vf-surface-default" },
  { legacy: "--vf-surface-subtle", canonical: "--vf-surface-canvas" },
  { legacy: "--vf-surface-raised", canonical: "--vf-surface-overlay" },
  { legacy: "--vf-text", canonical: "--vf-text-primary" },
  { legacy: "--vf-text-muted", canonical: "--vf-text-secondary" },
  { legacy: "--vf-border", canonical: "--vf-border-default" },
  { legacy: "--vf-border-strong", canonical: "--vf-border-emphasis" },
  { legacy: "--vf-primary", canonical: "--vf-interactive-primary" },
  {
    legacy: "--vf-primary-hover",
    canonical: "--vf-interactive-primary-hover",
  },
  {
    legacy: "--vf-primary-soft",
    canonical: "--vf-interactive-selected-background",
  },
  { legacy: "--vf-focus-ring", canonical: "--vf-focus-color" },
  { legacy: "--vf-success", canonical: "--vf-status-success-indicator" },
  {
    legacy: "--vf-success-soft",
    canonical: "--vf-status-success-background",
  },
  { legacy: "--vf-warning", canonical: "--vf-status-warning-indicator" },
  {
    legacy: "--vf-warning-soft",
    canonical: "--vf-status-warning-background",
  },
  { legacy: "--vf-danger", canonical: "--vf-status-error-indicator" },
  {
    legacy: "--vf-danger-soft",
    canonical: "--vf-status-error-background",
  },
  { legacy: "--vf-info", canonical: "--vf-status-info-indicator" },
  { legacy: "--vf-info-soft", canonical: "--vf-status-info-background" },
] as const;

export const vyrnForgeCompatibilityAliases = [
  { name: "--vf-z-base", target: "--vf-layer-base" },
  { name: "--vf-z-sticky", target: "--vf-layer-sticky" },
  { name: "--vf-z-dropdown", target: "--vf-layer-dropdown" },
  { name: "--vf-z-popover", target: "--vf-layer-popover" },
  { name: "--vf-z-tooltip", target: "--vf-layer-tooltip" },
  { name: "--vf-z-overlay", target: "--vf-layer-scrim" },
  { name: "--vf-z-dialog", target: "--vf-layer-modal" },
  { name: "--vf-z-toast", target: "--vf-layer-toast" },
  { name: "--vf-transition-fast", target: "--vf-motion-duration-fast" },
] as const;

export const vyrnForgeThemeContract = {
  required: ["light", "dark", "enterprise", "system"],
  systemBehavior:
    "System uses light defaults and the complete dark role set when prefers-color-scheme is dark.",
} as const;

export const vyrnForgeMotionContract = {
  explicitReducedSelectors: ['[data-motion="reduced"]', ".vf-motion-reduced"],
  automaticMediaQuery: "(prefers-reduced-motion: reduce)",
  policy: "No essential state change may depend on animation.",
} as const;

const semanticCategoryDefinitions = [
  {
    id: "surface",
    task: "VF-3002",
    purpose: "Page, canvas, component, overlay, sunken, and scrim surfaces.",
  },
  {
    id: "text",
    task: "VF-3002",
    purpose: "Primary, secondary, tertiary, inverse, disabled, and link text.",
  },
  {
    id: "border",
    task: "VF-3002",
    purpose: "Subtle, default, emphasis, and divider boundaries.",
  },
  {
    id: "interactive",
    task: "VF-3003",
    purpose: "Hover, active, selected, disabled, control, and focus behavior.",
  },
  {
    id: "status",
    task: "VF-3004",
    purpose:
      "Success, warning, error, info, pending, and neutral feedback roles.",
  },
  {
    id: "density",
    task: "VF-3005",
    purpose:
      "Control sizes, padding, icons, row heights, hit targets, and active density values.",
  },
  {
    id: "typography",
    task: "VF-3006",
    purpose:
      "Display, title, label, body, caption, code, and numeric hierarchy.",
  },
  {
    id: "motion",
    task: "VF-3007",
    purpose: "Durations, easing, transitions, and reduced-motion behavior.",
  },
  {
    id: "layer",
    task: "VF-3008",
    purpose:
      "Deterministic base, raised, sticky, overlay, modal, toast, and debug layers.",
  },
] as const satisfies readonly {
  id: VyrnForgeSemanticTokenGroup;
  task: `VF-${number}`;
  purpose: string;
}[];

const themeScopedTokenNames = new Set<string>(vyrnForgeThemeColorTokens);

function tokenPurpose(name: string) {
  const words = name.replace(/^--vf-/u, "").replace(/-/gu, " ");
  return `${words.charAt(0).toUpperCase()}${words.slice(1)}.`;
}

export const vyrnForgeDesignTokenSource = {
  canonical: true,
  owner: "@vyrnforge/ui-core",
  contractVersion: "0.5-alpha",
  implementation: "packages/ui-core/src/styles/tokens.css",
  typedExport: "packages/ui-core/src/theme/tokenContract.ts",
} as const;

export type VyrnForgeDesignTokenRecord = {
  name: VyrnForgeSemanticToken;
  purpose: string;
  themeScoped: boolean;
};

export type VyrnForgeDesignTokenCategory = {
  id: VyrnForgeSemanticTokenGroup;
  task: `VF-${number}`;
  sourceFile: typeof vyrnForgeDesignTokenSource.implementation;
  purpose: string;
  tokens: readonly VyrnForgeDesignTokenRecord[];
};

/** Canonical reader-facing semantic-token registry consumed by docs and tooling. */
export const vyrnForgeDesignTokenCategories: readonly VyrnForgeDesignTokenCategory[] =
  semanticCategoryDefinitions.map((category) => ({
    ...category,
    sourceFile: vyrnForgeDesignTokenSource.implementation,
    tokens: vyrnForgeSemanticTokenGroups[category.id].map((name) => ({
      name,
      purpose: tokenPurpose(name),
      themeScoped: themeScopedTokenNames.has(name),
    })),
  }));

export type VyrnForgePrimitiveTokenGroup =
  keyof typeof vyrnForgePrimitiveTokenGroups;

export type VyrnForgePrimitiveToken =
  (typeof vyrnForgePrimitiveTokenGroups)[VyrnForgePrimitiveTokenGroup][number];
