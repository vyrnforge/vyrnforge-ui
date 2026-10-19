export {
  findOverlayCompositionRegion,
  overlayCompositionContracts,
  type OverlayCompositionContract,
  type OverlayCompositionKind,
  type OverlayCompositionRegion,
} from "@vyrnforge/ui-behaviors";

export type VyrnForgeHostValue = boolean | number | string;

export interface VyrnForgeHostModifier {
  readonly property: string;
  readonly prefix?: string;
  readonly omitValue?: VyrnForgeHostValue;
  readonly truthyClass?: string;
}

export interface VyrnForgeNamedRegionContract {
  readonly name: string;
  readonly className: string;
  readonly semanticTag?: string;
  readonly multiplicity?: "single" | "multiple";
}

export interface VyrnForgeHostAdoptionContract {
  readonly id: string;
  readonly baseClass: string;
  readonly defaultTag: string;
  readonly allowedTags: readonly string[];
  readonly defaults?: Readonly<Record<string, VyrnForgeHostValue>>;
  readonly modifiers?: readonly VyrnForgeHostModifier[];
  readonly regions?: readonly VyrnForgeNamedRegionContract[];
}

export type VyrnForgeItemCompositionCapability =
  | "filter"
  | "hierarchy"
  | "multiple-selection"
  | "repeated-form-value"
  | "roving-focus"
  | "selection";

export interface VyrnForgeItemRegionContract {
  readonly name: string;
  readonly className: string;
  readonly required?: boolean;
  readonly multiplicity?: "single" | "multiple";
}

export interface VyrnForgeItemCompositionContract {
  readonly id: string;
  readonly identityProperty: string;
  readonly valueProperty?: string;
  readonly disabledProperty?: string;
  readonly capabilities: readonly VyrnForgeItemCompositionCapability[];
  readonly regions: readonly VyrnForgeItemRegionContract[];
}

function itemCompositionContract(
  value: VyrnForgeItemCompositionContract,
): VyrnForgeItemCompositionContract {
  return Object.freeze({
    ...value,
    capabilities: Object.freeze([...value.capabilities]),
    regions: Object.freeze(
      value.regions.map((region) => Object.freeze({ ...region })),
    ),
  });
}

export const vyrnForgeItemCompositionContracts = Object.freeze({
  tabs: itemCompositionContract({
    id: "tabs",
    identityProperty: "id",
    disabledProperty: "disabled",
    capabilities: ["roving-focus", "selection"],
    regions: [
      { name: "label", className: "vf-tabs__label", required: true },
      { name: "badge", className: "vf-tabs__badge" },
      { name: "content", className: "vf-tabs__panel" },
    ],
  }),
  breadcrumbs: itemCompositionContract({
    id: "breadcrumbs",
    identityProperty: "id",
    capabilities: [],
    regions: [
      { name: "label", className: "vf-breadcrumbs__label", required: true },
      { name: "separator", className: "vf-breadcrumbs__separator" },
    ],
  }),
  "side-nav": itemCompositionContract({
    id: "side-nav",
    identityProperty: "id",
    disabledProperty: "disabled",
    capabilities: ["hierarchy", "roving-focus", "selection"],
    regions: [
      { name: "icon", className: "vf-side-nav__icon" },
      { name: "label", className: "vf-side-nav__label", required: true },
      { name: "badge", className: "vf-side-nav__badge" },
      {
        name: "children",
        className: "vf-side-nav__children",
        multiplicity: "multiple",
      },
    ],
  }),
  "segmented-control": itemCompositionContract({
    id: "segmented-control",
    identityProperty: "value",
    valueProperty: "value",
    disabledProperty: "disabled",
    capabilities: ["roving-focus", "selection"],
    regions: [
      { name: "icon", className: "vf-segmented-control__icon" },
      {
        name: "label",
        className: "vf-segmented-control__label",
        required: true,
      },
    ],
  }),
  menu: itemCompositionContract({
    id: "menu",
    identityProperty: "id",
    disabledProperty: "disabled",
    capabilities: ["roving-focus", "selection"],
    regions: [
      { name: "label", className: "vf-menu-item__label", required: true },
      { name: "description", className: "vf-menu-item__description" },
      { name: "shortcut", className: "vf-menu-item__shortcut" },
    ],
  }),
  "multi-select": itemCompositionContract({
    id: "multi-select",
    identityProperty: "value",
    valueProperty: "value",
    disabledProperty: "disabled",
    capabilities: [
      "filter",
      "multiple-selection",
      "repeated-form-value",
      "roving-focus",
    ],
    regions: [
      {
        name: "label",
        className: "vf-multi-select__option-label",
        required: true,
      },
      {
        name: "description",
        className: "vf-multi-select__option-description",
      },
    ],
  }),
  "transfer-list": itemCompositionContract({
    id: "transfer-list",
    identityProperty: "value",
    valueProperty: "value",
    disabledProperty: "disabled",
    capabilities: [
      "filter",
      "multiple-selection",
      "repeated-form-value",
      "roving-focus",
    ],
    regions: [
      {
        name: "label",
        className: "vf-transfer-list__option-label",
        required: true,
      },
      {
        name: "description",
        className: "vf-transfer-list__option-description",
      },
      { name: "option", className: "vf-transfer-list__option-content" },
    ],
  }),
});

export type VyrnForgeItemCompositionId =
  keyof typeof vyrnForgeItemCompositionContracts;

export function findVyrnForgeItemRegion(
  composition: VyrnForgeItemCompositionContract,
  name: string,
): VyrnForgeItemRegionContract | undefined {
  return composition.regions.find((region) => region.name === name);
}

export interface VyrnForgeResolvedHostAdoption {
  readonly tagName: string;
  readonly classNames: readonly string[];
  readonly regions: readonly VyrnForgeNamedRegionContract[];
}

function freezeRegions(
  regions: readonly VyrnForgeNamedRegionContract[] | undefined,
): readonly VyrnForgeNamedRegionContract[] {
  return Object.freeze(
    [...(regions ?? [])].map((region) => Object.freeze(region)),
  );
}

function contract(
  value: VyrnForgeHostAdoptionContract,
): VyrnForgeHostAdoptionContract {
  return Object.freeze({
    ...value,
    allowedTags: Object.freeze([...value.allowedTags]),
    defaults: value.defaults ? Object.freeze({ ...value.defaults }) : undefined,
    modifiers: value.modifiers
      ? Object.freeze(
          value.modifiers.map((modifier) => Object.freeze(modifier)),
        )
      : undefined,
    regions: freezeRegions(value.regions),
  });
}

const contracts = {
  text: contract({
    id: "text",
    baseClass: "vf-text",
    defaultTag: "p",
    allowedTags: ["p", "span", "div"],
    defaults: { size: "md", tone: "default" },
    modifiers: [
      { property: "size", prefix: "vf-text--" },
      { property: "tone", prefix: "vf-text--", omitValue: "default" },
    ],
  }),
  heading: contract({
    id: "heading",
    baseClass: "vf-heading",
    defaultTag: "h2",
    allowedTags: ["h1", "h2", "h3", "h4", "h5", "h6"],
    defaults: { size: "md", tone: "strong" },
    modifiers: [
      { property: "size", prefix: "vf-heading--" },
      { property: "tone", prefix: "vf-text--", omitValue: "default" },
    ],
  }),
  label: contract({
    id: "label",
    baseClass: "vf-label",
    defaultTag: "label",
    allowedTags: ["label"],
    defaults: { size: "md", tone: "strong" },
    modifiers: [
      { property: "size", prefix: "vf-label--" },
      { property: "tone", prefix: "vf-text--", omitValue: "default" },
    ],
  }),
  caption: contract({
    id: "caption",
    baseClass: "vf-caption",
    defaultTag: "small",
    allowedTags: ["small", "span", "p"],
    defaults: { tone: "muted" },
    modifiers: [
      { property: "tone", prefix: "vf-text--", omitValue: "default" },
    ],
  }),
  "code-text": contract({
    id: "code-text",
    baseClass: "vf-code-text",
    defaultTag: "code",
    allowedTags: ["code", "span"],
    defaults: { tone: "default" },
    modifiers: [
      { property: "tone", prefix: "vf-text--", omitValue: "default" },
    ],
  }),
  card: contract({
    id: "card",
    baseClass: "vf-card",
    defaultTag: "div",
    allowedTags: ["div"],
    defaults: { padding: "md", variant: "bordered" },
    modifiers: [
      { property: "variant", prefix: "vf-card--" },
      { property: "padding", prefix: "vf-card--padding-" },
    ],
  }),
  stack: contract({
    id: "stack",
    baseClass: "vf-stack",
    defaultTag: "div",
    allowedTags: ["div"],
    defaults: { align: "stretch", gap: "md", justify: "start" },
    modifiers: [
      { property: "gap", prefix: "vf-stack--gap-" },
      { property: "align", prefix: "vf-stack--align-" },
      { property: "justify", prefix: "vf-stack--justify-" },
    ],
  }),
  inline: contract({
    id: "inline",
    baseClass: "vf-inline",
    defaultTag: "div",
    allowedTags: ["div"],
    defaults: { align: "center", gap: "sm", justify: "start", wrap: true },
    modifiers: [
      { property: "gap", prefix: "vf-inline--gap-" },
      { property: "align", prefix: "vf-inline--align-" },
      { property: "justify", prefix: "vf-inline--justify-" },
      { property: "wrap", truthyClass: "vf-inline--wrap" },
    ],
  }),
  panel: contract({
    id: "panel",
    baseClass: "vf-panel",
    defaultTag: "section",
    allowedTags: ["section"],
    regions: [
      { name: "header", className: "vf-panel__header", semanticTag: "div" },
      { name: "heading", className: "vf-panel__heading", semanticTag: "div" },
      { name: "title", className: "vf-panel__title", semanticTag: "h2" },
      {
        name: "description",
        className: "vf-panel__description",
        semanticTag: "p",
      },
      { name: "actions", className: "vf-panel__actions", semanticTag: "div" },
      { name: "body", className: "vf-panel__body", semanticTag: "div" },
    ],
  }),
  section: contract({
    id: "section",
    baseClass: "vf-section",
    defaultTag: "section",
    allowedTags: ["section"],
    regions: [
      { name: "header", className: "vf-section__header", semanticTag: "div" },
      { name: "title", className: "vf-section__title", semanticTag: "h2" },
      {
        name: "description",
        className: "vf-section__description",
        semanticTag: "p",
      },
      { name: "actions", className: "vf-section__actions", semanticTag: "div" },
      { name: "body", className: "vf-section__body", semanticTag: "div" },
    ],
  }),
  "app-shell": contract({
    id: "app-shell",
    baseClass: "vf-app-shell",
    defaultTag: "div",
    allowedTags: ["div"],
    defaults: {
      fullHeight: true,
      headerPosition: "sticky",
      scrollMode: "content",
      sidebarCollapsed: false,
      sidebarPosition: "sticky",
    },
    modifiers: [
      { property: "hasSidebar", truthyClass: "vf-app-shell--with-sidebar" },
      { property: "hasHeader", truthyClass: "vf-app-shell--with-header" },
      { property: "hasFooter", truthyClass: "vf-app-shell--with-footer" },
      { property: "fullHeight", truthyClass: "vf-app-shell--full-height" },
      { property: "scrollMode", prefix: "vf-app-shell--scroll-" },
      { property: "headerPosition", prefix: "vf-app-shell--header-" },
      { property: "sidebarPosition", prefix: "vf-app-shell--sidebar-" },
      {
        property: "sidebarCollapsed",
        truthyClass: "vf-app-shell--sidebar-collapsed",
      },
    ],
    regions: [
      {
        name: "header",
        className: "vf-app-shell__header",
        semanticTag: "header",
      },
      { name: "body", className: "vf-app-shell__body", semanticTag: "div" },
      {
        name: "sidebar",
        className: "vf-app-shell__sidebar",
        semanticTag: "aside",
      },
      {
        name: "sidebar-scroll",
        className: "vf-app-shell__sidebar-scroll",
        semanticTag: "div",
      },
      { name: "main", className: "vf-app-shell__main", semanticTag: "div" },
      {
        name: "content",
        className: "vf-app-shell__content",
        semanticTag: "div",
      },
      {
        name: "footer",
        className: "vf-app-shell__footer",
        semanticTag: "footer",
      },
    ],
  }),
  page: contract({
    id: "page",
    baseClass: "vf-page",
    defaultTag: "main",
    allowedTags: ["main"],
    defaults: { density: "standard", maxWidth: "lg" },
    modifiers: [
      { property: "maxWidth", prefix: "vf-page--max-" },
      { property: "density", prefix: "vf-page--" },
    ],
    regions: [
      { name: "toolbar", className: "vf-page__toolbar", semanticTag: "div" },
      { name: "body", className: "vf-page__body", semanticTag: "div" },
    ],
  }),
  "page-header": contract({
    id: "page-header",
    baseClass: "vf-page-header",
    defaultTag: "header",
    allowedTags: ["header"],
    regions: [
      {
        name: "breadcrumbs",
        className: "vf-page-header__breadcrumbs",
        semanticTag: "div",
      },
      { name: "row", className: "vf-page-header__row", semanticTag: "div" },
      { name: "main", className: "vf-page-header__main", semanticTag: "div" },
      {
        name: "eyebrow",
        className: "vf-page-header__eyebrow",
        semanticTag: "div",
      },
      {
        name: "title-row",
        className: "vf-page-header__title-row",
        semanticTag: "div",
      },
      { name: "title", className: "vf-page-header__title", semanticTag: "h1" },
      {
        name: "status",
        className: "vf-page-header__status",
        semanticTag: "div",
      },
      {
        name: "description",
        className: "vf-page-header__description",
        semanticTag: "div",
      },
      {
        name: "metadata",
        className: "vf-page-header__metadata",
        semanticTag: "div",
      },
      {
        name: "actions",
        className: "vf-page-header__actions",
        semanticTag: "div",
      },
    ],
  }),
  "page-toolbar": contract({
    id: "page-toolbar",
    baseClass: "vf-page-toolbar",
    defaultTag: "div",
    allowedTags: ["div"],
    defaults: { density: "standard", sticky: false },
    modifiers: [
      { property: "density", prefix: "vf-page-toolbar--" },
      { property: "sticky", truthyClass: "vf-page-toolbar--sticky" },
    ],
    regions: [
      { name: "left", className: "vf-page-toolbar__left", semanticTag: "div" },
      {
        name: "right",
        className: "vf-page-toolbar__right",
        semanticTag: "div",
      },
    ],
  }),
} as const;

export type VyrnForgeHostAdoptionId = keyof typeof contracts;

export const vyrnForgeHostAdoptionContracts = Object.freeze(contracts);

export function resolveVyrnForgeHostTag(
  adoption: VyrnForgeHostAdoptionContract,
  requestedTag?: string,
): string {
  const tag = requestedTag ?? adoption.defaultTag;
  return adoption.allowedTags.includes(tag) ? tag : adoption.defaultTag;
}

export function resolveVyrnForgeHostClasses(
  adoption: VyrnForgeHostAdoptionContract,
  values: Readonly<Record<string, unknown>> = {},
): readonly string[] {
  const classes: string[] = [adoption.baseClass];
  for (const modifier of adoption.modifiers ?? []) {
    const value =
      values[modifier.property] ?? adoption.defaults?.[modifier.property];
    if (modifier.truthyClass) {
      if (value) classes.push(modifier.truthyClass);
      continue;
    }
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== modifier.omitValue
    ) {
      classes.push(`${modifier.prefix ?? ""}${String(value)}`);
    }
  }
  return Object.freeze(classes);
}

export function resolveVyrnForgeHostAdoption(
  adoption: VyrnForgeHostAdoptionContract,
  values: Readonly<Record<string, unknown>> = {},
  requestedTag?: string,
): VyrnForgeResolvedHostAdoption {
  return Object.freeze({
    tagName: resolveVyrnForgeHostTag(adoption, requestedTag),
    classNames: resolveVyrnForgeHostClasses(adoption, values),
    regions: adoption.regions ?? Object.freeze([]),
  });
}

export function findVyrnForgeNamedRegion(
  adoption: VyrnForgeHostAdoptionContract,
  name: string,
): VyrnForgeNamedRegionContract | undefined {
  return adoption.regions?.find((region) => region.name === name);
}
