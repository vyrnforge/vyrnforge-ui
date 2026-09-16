import consumerKnowledgeRaw from "../../../../docs/generated/consumer-knowledge.json?raw";
import { getReferenceRecordRoute } from "../../../../docs/reference/referenceRuntime";
import type { ComponentType } from "react";
import { DensityPage } from "../pages/core/DensityPage";
import { CssOverridePage } from "../pages/core/CssOverridePage";
import { ThemeModesPage } from "../pages/core/ThemeModesPage";
import { ThemeTokensPage } from "../pages/core/ThemeTokensPage";
import { ColumnsPage } from "../pages/data-grid/ColumnsPage";
import { FilteringPage } from "../pages/data-grid/FilteringPage";
import { GridStatesPage } from "../pages/data-grid/GridStatesPage";
import { GroupingPage } from "../pages/data-grid/GroupingPage";
import { ResizingPage } from "../pages/data-grid/ResizingPage";
import { SelectionPage } from "../pages/data-grid/SelectionPage";
import { StressGridPage } from "../pages/data-grid/StressGridPage";
import { ThemesGridPage } from "../pages/data-grid/ThemesGridPage";
import { OverviewPage } from "../pages/overview/OverviewPage";
import { AdminShellPage } from "../pages/patterns/AdminShellPage";
import { AssignmentPatternsPage } from "../pages/patterns/AssignmentPatternsPage";
import { CustomerPortalShellPage } from "../pages/patterns/CustomerPortalShellPage";
import { DetailPage } from "../pages/patterns/DetailPage";
import { EmptyErrorLoadingPage } from "../pages/patterns/EmptyErrorLoadingPage";
import { FilterFormPage } from "../pages/patterns/FilterFormPage";
import { FormPage } from "../pages/patterns/FormPage";
import { OverlayStressPage } from "../pages/patterns/OverlayStressPage";
import { ResourceListPage } from "../pages/patterns/ResourceListPage";
import { SettingsPage } from "../pages/patterns/SettingsPage";
import { ComponentMatrixPage } from "../pages/quality/ComponentMatrixPage";
import { AutocompletePage } from "../pages/reference/AutocompletePage";
import {
  RatingPage,
  SliderPage,
  ToggleButtonGroupPage,
  ToggleButtonPage,
} from "../pages/reference/ControlComponentPages";
import {
  CheckboxReferencePage,
  DateInputPage,
  DateTimeInputPage,
  FieldReferencePage,
  NumberInputPage,
  RadioGroupPage,
  RadioPage,
  SelectReferencePage,
  SwitchPage,
  TextareaPage,
  TextInputReferencePage,
  ValidationMessagePage,
} from "../pages/reference/FormComponentPages";
import {
  ConfirmDialogPage,
  DialogPage,
  DrawerPage,
  DropdownPage,
  MenuPage,
  PopoverPage,
  TooltipPage,
} from "../pages/reference/OverlayComponentPages";
import {
  AppShellPage,
  BadgePage,
  BasicGridReferencePage,
  ButtonGroupPage,
  ButtonPage,
  IconButtonPage,
  SegmentedControlPage,
  TabsPage,
  ToolbarButtonPage,
} from "../pages/reference/PriorityComponentPages";
import { ToastPage } from "../pages/reference/ToastPage";
import { TransferListPage } from "../pages/reference/TransferListPage";
import { referenceComponents } from "../data/referenceMetadata";
import { referenceModel } from "./playgroundContext";

export type PlaygroundRoute = {
  id: string;
  label: string;
  title: string;
  description: string;
  group:
    | "Overview"
    | "Foundations"
    | "Components"
    | "Patterns"
    | "Advanced Modules"
    | "Internal";
  subgroup?:
    | "Actions"
    | "Forms"
    | "Data Management"
    | "Feedback"
    | "Layout"
    | "Navigation"
    | "Overlays";
  gallery?: boolean;
  visibility?: "public" | "internal";
  path?: string;
  packageName?: "@vyrnforge/ui-components" | "@vyrnforge/ui-data-grid";
  Component: ComponentType;
};

const consumerKnowledge = JSON.parse(consumerKnowledgeRaw) as {
  patterns: Array<{ id: string; purpose: string }>;
};

function patternDescription(id: string, fallback: string) {
  return (
    consumerKnowledge.patterns.find((pattern) => pattern.id === id)?.purpose ??
    fallback
  );
}

const componentDemoBindings: Array<[string, ComponentType]> = [
  ["button", ButtonPage],
  ["icon-button", IconButtonPage],
  ["button-group", ButtonGroupPage],
  ["toolbar-button", ToolbarButtonPage],
  ["segmented-control", SegmentedControlPage],
  ["toggle-button", ToggleButtonPage],
  ["toggle-button-group", ToggleButtonGroupPage],
  ["text-input", TextInputReferencePage],
  ["autocomplete", AutocompletePage],
  ["transfer-list", TransferListPage],
  ["select", SelectReferencePage],
  ["checkbox", CheckboxReferencePage],
  ["field", FieldReferencePage],
  ["validation-message", ValidationMessagePage],
  ["radio", RadioPage],
  ["radio-group", RadioGroupPage],
  ["switch", SwitchPage],
  ["number-input", NumberInputPage],
  ["date-input", DateInputPage],
  ["datetime-input", DateTimeInputPage],
  ["textarea", TextareaPage],
  ["rating", RatingPage],
  ["slider", SliderPage],
  ["popover", PopoverPage],
  ["menu", MenuPage],
  ["dropdown", DropdownPage],
  ["tooltip", TooltipPage],
  ["dialog", DialogPage],
  ["drawer", DrawerPage],
  ["confirm-dialog", ConfirmDialogPage],
  ["badge", BadgePage],
  ["toast", ToastPage],
  ["app-shell", AppShellPage],
  ["tabs", TabsPage],
];

const subgroupById: Record<string, PlaygroundRoute["subgroup"]> = {
  button: "Actions",
  "icon-button": "Actions",
  "button-group": "Actions",
  "toolbar-button": "Actions",
  "segmented-control": "Actions",
  "toggle-button": "Actions",
  "toggle-button-group": "Actions",
  "text-input": "Forms",
  autocomplete: "Forms",
  select: "Forms",
  checkbox: "Forms",
  field: "Forms",
  "validation-message": "Forms",
  radio: "Forms",
  "radio-group": "Forms",
  switch: "Forms",
  "number-input": "Forms",
  "date-input": "Forms",
  "datetime-input": "Forms",
  textarea: "Forms",
  rating: "Forms",
  slider: "Forms",
  "transfer-list": "Data Management",
  badge: "Feedback",
  toast: "Feedback",
  "app-shell": "Layout",
  tabs: "Navigation",
  popover: "Overlays",
  menu: "Overlays",
  dropdown: "Overlays",
  tooltip: "Overlays",
  dialog: "Overlays",
  drawer: "Overlays",
  "confirm-dialog": "Overlays",
};

const canonicalComponentById = new Map(
  referenceComponents.map((component) => [component.id, component] as const),
);

const componentRoutes: PlaygroundRoute[] = componentDemoBindings.map(
  ([id, Component]) => {
    const component = canonicalComponentById.get(id);
    if (!component) {
      throw new Error(`Playground demo has no canonical component record: ${id}`);
    }
    if (component.package !== "@vyrnforge/ui-components") {
      throw new Error(
        `Playground component demo ${id} must resolve to @vyrnforge/ui-components, got ${component.package}.`,
      );
    }
    return {
      id,
      label: component.displayName,
      title: component.displayName,
      description: component.purpose,
      group: "Components",
      subgroup: subgroupById[id],
      gallery: true,
      path: getReferenceRecordRoute(referenceModel, "components", id),
      packageName: "@vyrnforge/ui-components",
      Component,
    };
  },
);

const authoredRoutes: PlaygroundRoute[] = [
  {
    id: "overview",
    label: "Overview",
    title: "VyrnForge UI Overview",
    description:
      "Workspace purpose, package boundaries, and maturity at a glance.",
    group: "Overview",
    Component: OverviewPage,
  },
  {
    id: "tokens",
    label: "Theme Tokens",
    title: "Theme Tokens",
    description:
      "Shared VyrnForge tokens for color, surfaces, typography, spacing, and status.",
    group: "Foundations",
    Component: ThemeTokensPage,
  },
  {
    id: "modes",
    label: "Theme Modes",
    title: "Theme Modes",
    description: "Light, dark, enterprise, and system theme behavior.",
    group: "Foundations",
    Component: ThemeModesPage,
  },
  {
    id: "density",
    label: "Density",
    title: "Density",
    description: "Compact, standard, and comfortable sizing across controls.",
    group: "Foundations",
    Component: DensityPage,
  },
  {
    id: "overrides",
    label: "CSS Overrides",
    title: "CSS Overrides",
    description:
      "Global VyrnForge overrides, local scopes, and grid-only overrides.",
    group: "Foundations",
    Component: CssOverridePage,
  },
  {
    id: "grid-basic",
    label: "Basic Grid",
    title: "Basic Grid",
    description: "Rows, columns, search, sort, and pagination.",
    group: "Advanced Modules",
    gallery: true,
    path: "/data-grid/basic",
    packageName: "@vyrnforge/ui-data-grid",
    Component: BasicGridReferencePage,
  },
  {
    id: "grid-columns",
    label: "Columns",
    title: "Column Management",
    description: "Visibility, order, density, and reset behavior.",
    group: "Advanced Modules",
    Component: ColumnsPage,
  },
  {
    id: "grid-filtering",
    label: "Filtering",
    title: "Filtering",
    description:
      "Search and filter state examples without adding new grid features.",
    group: "Advanced Modules",
    Component: FilteringPage,
  },
  {
    id: "grid-selection",
    label: "Selection",
    title: "Selection",
    description: "Selectable rows, disabled rows, and bulk actions.",
    group: "Advanced Modules",
    Component: SelectionPage,
  },
  {
    id: "grid-grouping",
    label: "Grouping",
    title: "Grouping",
    description: "Client-side grouping examples.",
    group: "Advanced Modules",
    Component: GroupingPage,
  },
  {
    id: "grid-resizing",
    label: "Resizing",
    title: "Column Resizing",
    description: "Resizable columns, long text, and horizontal overflow.",
    group: "Advanced Modules",
    Component: ResizingPage,
  },
  {
    id: "grid-themes",
    label: "Grid Themes",
    title: "Grid Themes",
    description: "Light, dark, enterprise, and shared token alignment.",
    group: "Advanced Modules",
    Component: ThemesGridPage,
  },
  {
    id: "grid-states",
    label: "Grid States",
    title: "Grid States",
    description:
      "Empty, error, and loading states rendered through the grid package.",
    group: "Advanced Modules",
    Component: GridStatesPage,
  },
  {
    id: "grid-stress",
    label: "Stress Grid",
    title: "Stress Grid",
    description: "Many rows and columns without introducing virtualization.",
    group: "Advanced Modules",
    Component: StressGridPage,
  },
  {
    id: "resource-list",
    label: "Resource List",
    title: "Resource List",
    description: patternDescription(
      "resource-list",
      "Compact resource lists with metadata and actions.",
    ),
    group: "Patterns",
    Component: ResourceListPage,
  },
  {
    id: "detail",
    label: "Detail Page",
    title: "Detail Page",
    description: patternDescription("detail", "Entity detail composition."),
    group: "Patterns",
    Component: DetailPage,
  },
  {
    id: "settings",
    label: "Settings",
    title: "Settings",
    description: patternDescription(
      "settings",
      "Sectioned settings composition.",
    ),
    group: "Patterns",
    Component: SettingsPage,
  },
  {
    id: "form",
    label: "Form",
    title: "Form",
    description: patternDescription(
      "form",
      "General application form composition.",
    ),
    group: "Patterns",
    Component: FormPage,
  },
  {
    id: "filter-form",
    label: "Filter Form",
    title: "Filter Form",
    description: patternDescription(
      "filter-form",
      "Operational filter composition.",
    ),
    group: "Patterns",
    Component: FilterFormPage,
  },
  {
    id: "assignment-patterns",
    label: "Assignments",
    title: "Assignment Patterns",
    description: patternDescription(
      "assignment-patterns",
      "Bounded assignment flows.",
    ),
    group: "Patterns",
    Component: AssignmentPatternsPage,
  },
  {
    id: "empty-error-loading",
    label: "Empty/Error/Loading",
    title: "Empty, Error, and Loading",
    description: patternDescription(
      "empty-error-loading",
      "Route-level feedback states.",
    ),
    group: "Patterns",
    Component: EmptyErrorLoadingPage,
  },
  {
    id: "admin-shell",
    label: "Admin Shell",
    title: "Admin Shell",
    description: patternDescription(
      "admin-shell",
      "Admin workspace composition.",
    ),
    group: "Patterns",
    Component: AdminShellPage,
  },
  {
    id: "customer-portal-shell",
    label: "Customer Portal",
    title: "Customer Portal Shell",
    description: patternDescription(
      "customer-portal-shell",
      "Customer portal composition.",
    ),
    group: "Patterns",
    Component: CustomerPortalShellPage,
  },
  {
    id: "overlay-stress",
    label: "Overlay Stress Test",
    title: "Overlay Stress Test",
    description:
      "Nested portal, focus, dismissal, scroll, and z-index engineering exercise.",
    group: "Internal",
    visibility: "internal",
    Component: OverlayStressPage,
  },
  {
    id: "quality-component-matrix",
    label: "Component Matrix",
    title: "Quality / Component Matrix",
    description:
      "Controlled review surface for component states, themes, densities, overlays, layouts, and grid behavior.",
    group: "Internal",
    visibility: "internal",
    Component: ComponentMatrixPage,
  },
];

export const routes: PlaygroundRoute[] = [
  authoredRoutes[0],
  ...componentRoutes,
  ...authoredRoutes.slice(1),
];

export const routeGroups = [
  "Overview",
  "Foundations",
  "Components",
  "Patterns",
  "Advanced Modules",
  "Internal",
] as const;
