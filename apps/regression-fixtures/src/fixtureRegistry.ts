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
      "Renders an open modal dialog for deterministic focus and dismissal checks.",
    supportedTestModes: allTestModes,
    themes: allThemes,
    densities: allDensities,
    notes: "Browser tests should cover real focus loops and scroll locking.",
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
