import componentCatalog from "../../../docs/metadata/components.json";

export const fixtureTestModes = [
  "dom",
  "accessibility",
  "browser",
  "visual",
  "consumer",
] as const;

export const fixtureThemes = ["light", "dark"] as const;
export const fixtureDensities = ["compact", "standard", "comfortable"] as const;

export type FixtureTestMode = (typeof fixtureTestModes)[number];
export type FixtureTheme = (typeof fixtureThemes)[number];
export type FixtureDensity = (typeof fixtureDensities)[number];

export type FixtureCase = {
  id: string;
  title: string;
  componentMetadataId: string;
  category:
    "basic-control" | "form-control" | "navigation" | "overlay" | "data-grid";
  route: string;
  renderKey: string;
  purpose: string;
  supportedTestModes: readonly FixtureTestMode[];
  themes: readonly FixtureTheme[];
  densities: readonly FixtureDensity[];
  notes?: string;
};

const allTestModes = fixtureTestModes;
const allThemes = fixtureThemes;
const allDensities = fixtureDensities;

export const fixtureRegistry: readonly FixtureCase[] = [
  {
    id: "button-basic",
    title: "Button basic",
    componentMetadataId: "button",
    category: "basic-control",
    route: "/fixtures/button/basic",
    renderKey: "button-basic",
    purpose:
      "Renders the primary text action path with a stable accessible name.",
    supportedTestModes: allTestModes,
    themes: allThemes,
    densities: allDensities,
  },
  {
    id: "button-disabled",
    title: "Button disabled",
    componentMetadataId: "button",
    category: "basic-control",
    route: "/fixtures/button/disabled",
    renderKey: "button-disabled",
    purpose:
      "Covers the disabled action state without an application workflow.",
    supportedTestModes: allTestModes,
    themes: allThemes,
    densities: allDensities,
  },
  {
    id: "text-input-validation",
    title: "Text input validation",
    componentMetadataId: "text-input",
    category: "form-control",
    route: "/fixtures/text-input/validation",
    renderKey: "text-input-validation",
    purpose: "Covers a labelled invalid TextInput and its error message.",
    supportedTestModes: allTestModes,
    themes: allThemes,
    densities: allDensities,
  },
  {
    id: "tabs-controlled-uncontrolled",
    title: "Tabs controlled and uncontrolled",
    componentMetadataId: "tabs",
    category: "navigation",
    route: "/fixtures/tabs/controlled-uncontrolled",
    renderKey: "tabs-controlled-uncontrolled",
    purpose:
      "Keeps controlled and default tab-state behavior available from one route.",
    supportedTestModes: allTestModes,
    themes: allThemes,
    densities: allDensities,
  },
  {
    id: "dialog-focus",
    title: "Dialog focus",
    componentMetadataId: "dialog",
    category: "overlay",
    route: "/fixtures/dialog/focus",
    renderKey: "dialog-focus",
    purpose:
      "Opens a modal dialog from a stable trigger for focus, dismissal, and restoration checks.",
    supportedTestModes: allTestModes,
    themes: allThemes,
    densities: allDensities,
  },
  {
    id: "drawer-focus",
    title: "Drawer focus",
    componentMetadataId: "drawer",
    category: "overlay",
    route: "/fixtures/drawer/focus",
    renderKey: "drawer-focus",
    purpose:
      "Opens a modal drawer from a stable trigger for focus, dismissal, and restoration checks.",
    supportedTestModes: allTestModes,
    themes: allThemes,
    densities: allDensities,
  },
  {
    id: "menu-keyboard",
    title: "Menu keyboard",
    componentMetadataId: "menu",
    category: "overlay",
    route: "/fixtures/menu/keyboard",
    renderKey: "menu-keyboard",
    purpose:
      "Provides enabled, disabled, selected, and destructive menu items for keyboard navigation checks.",
    supportedTestModes: allTestModes,
    themes: allThemes,
    densities: allDensities,
  },
  {
    id: "popover-position",
    title: "Popover position",
    componentMetadataId: "popover",
    category: "overlay",
    route: "/fixtures/popover/position",
    renderKey: "popover-position",
    purpose:
      "Places an anchored popover near a fixture boundary for viewport positioning and dismissal checks.",
    supportedTestModes: allTestModes,
    themes: allThemes,
    densities: allDensities,
  },
  {
    id: "tooltip-focus-hover",
    title: "Tooltip focus and hover",
    componentMetadataId: "tooltip",
    category: "overlay",
    route: "/fixtures/tooltip/focus-hover",
    renderKey: "tooltip-focus-hover",
    purpose:
      "Provides a zero-delay tooltip for deterministic focus, hover, Escape, and positioning checks.",
    supportedTestModes: allTestModes,
    themes: allThemes,
    densities: allDensities,
  },
  {
    id: "autocomplete-controlled",
    title: "Autocomplete controlled selection",
    componentMetadataId: "autocomplete",
    category: "form-control",
    route: "/fixtures/autocomplete/controlled",
    renderKey: "autocomplete-controlled",
    purpose:
      "Provides filtering, disabled-option skipping, controlled selection, and clear behavior.",
    supportedTestModes: allTestModes,
    themes: allThemes,
    densities: allDensities,
  },
  {
    id: "multi-select-keyboard",
    title: "MultiSelect keyboard selection",
    componentMetadataId: "multi-select",
    category: "form-control",
    route: "/fixtures/multi-select/keyboard",
    renderKey: "multi-select-keyboard",
    purpose:
      "Provides searchable multi-selection, disabled options, roving focus, and clear behavior.",
    supportedTestModes: allTestModes,
    themes: allThemes,
    densities: allDensities,
  },
  {
    id: "transfer-list-assignment",
    title: "Transfer List assignment",
    componentMetadataId: "transfer-list",
    category: "form-control",
    route: "/fixtures/transfer-list/assignment",
    renderKey: "transfer-list-assignment",
    purpose:
      "Provides deterministic available and assigned application movement with disabled items.",
    supportedTestModes: allTestModes,
    themes: allThemes,
    densities: allDensities,
  },
  {
    id: "slider-rating-keyboard",
    title: "Slider and Rating keyboard",
    componentMetadataId: "slider",
    category: "form-control",
    route: "/fixtures/forms/slider-rating-keyboard",
    renderKey: "slider-rating-keyboard",
    purpose:
      "Provides native range and radio keyboard behavior with controlled value reporting.",
    supportedTestModes: allTestModes,
    themes: allThemes,
    densities: allDensities,
    notes: "The route also exercises Rating through its public export.",
  },
  {
    id: "tabs-toggle-keyboard",
    title: "Tabs and Toggle Button keyboard",
    componentMetadataId: "tabs",
    category: "navigation",
    route: "/fixtures/navigation/tabs-toggle-keyboard",
    renderKey: "tabs-toggle-keyboard",
    purpose:
      "Provides automatic tab activation, disabled-tab skipping, and controlled/uncontrolled toggle behavior.",
    supportedTestModes: allTestModes,
    themes: allThemes,
    densities: allDensities,
    notes: "The route also exercises ToggleButton through its public export.",
  },
  {
    id: "toast-lifecycle",
    title: "Toast lifecycle",
    componentMetadataId: "toast",
    category: "overlay",
    route: "/fixtures/toast/lifecycle",
    renderKey: "toast-lifecycle",
    purpose:
      "Provides polite, assertive, persistent, timed, hover-paused, focus-paused, and manual dismissal behavior.",
    supportedTestModes: allTestModes,
    themes: allThemes,
    densities: allDensities,
  },
  {
    id: "data-grid-keyboard",
    title: "Data grid keyboard",
    componentMetadataId: "universal-data-grid",
    category: "data-grid",
    route: "/fixtures/data-grid/keyboard",
    renderKey: "data-grid-keyboard",
    purpose:
      "Provides roving cell focus, row activation, selection, sorting, resizing, and keyboard column reordering.",
    supportedTestModes: allTestModes,
    themes: allThemes,
    densities: allDensities,
  },
  {
    id: "data-grid-interactions",
    title: "Data grid pointer and scrolling",
    componentMetadataId: "universal-data-grid",
    category: "data-grid",
    route: "/fixtures/data-grid/interactions",
    renderKey: "data-grid-interactions",
    purpose:
      "Provides deterministic pointer resize, drag reorder, sticky header and selection, and two-axis scrolling behavior.",
    supportedTestModes: allTestModes,
    themes: allThemes,
    densities: allDensities,
  },
  {
    id: "data-grid-selection",
    title: "Data grid selection",
    componentMetadataId: "universal-data-grid",
    category: "data-grid",
    route: "/fixtures/data-grid/selection",
    renderKey: "data-grid-selection",
    purpose:
      "Renders a three-row controlled selection grid with fixed row identifiers.",
    supportedTestModes: allTestModes,
    themes: allThemes,
    densities: allDensities,
  },
  {
    id: "data-grid-empty",
    title: "Data grid empty",
    componentMetadataId: "universal-data-grid",
    category: "data-grid",
    route: "/fixtures/data-grid/empty",
    renderKey: "data-grid-empty",
    purpose: "Renders the deterministic empty grid state.",
    supportedTestModes: allTestModes,
    themes: allThemes,
    densities: allDensities,
  },
  {
    id: "data-grid-loading",
    title: "Data grid loading",
    componentMetadataId: "universal-data-grid",
    category: "data-grid",
    route: "/fixtures/data-grid/loading",
    renderKey: "data-grid-loading",
    purpose:
      "Renders the deterministic loading grid state without a network request.",
    supportedTestModes: allTestModes,
    themes: allThemes,
    densities: allDensities,
  },
];

export const fixtureById = new Map(
  fixtureRegistry.map((fixture) => [fixture.id, fixture]),
);

export const componentMetadataById = new Map(
  componentCatalog.components.map((component) => [component.id, component]),
);

export function resolveFixtureRoute(pathname: string) {
  const normalizedPathname =
    pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  return fixtureRegistry.find(
    (fixture) => fixture.route === normalizedPathname,
  );
}
