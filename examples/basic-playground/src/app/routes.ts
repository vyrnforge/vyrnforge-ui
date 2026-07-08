import type { ComponentType } from "react";
import { OverviewPage } from "../pages/overview/OverviewPage";
import { ThemeTokensPage } from "../pages/core/ThemeTokensPage";
import { ThemeModesPage } from "../pages/core/ThemeModesPage";
import { DensityPage } from "../pages/core/DensityPage";
import { CssOverridePage } from "../pages/core/CssOverridePage";
import { ButtonsPage } from "../pages/components/ButtonsPage";
import { ActionsPage } from "../pages/components/ActionsPage";
import { TypographyPage } from "../pages/components/TypographyPage";
import { BadgesPage } from "../pages/components/BadgesPage";
import { InputsPage } from "../pages/components/InputsPage";
import { StatesPage } from "../pages/components/StatesPage";
import { LayoutPage } from "../pages/components/LayoutPage";
import { OverlaysPage } from "../pages/components/OverlaysPage";
import { BasicGridPage } from "../pages/data-grid/BasicGridPage";
import { ColumnsPage } from "../pages/data-grid/ColumnsPage";
import { FilteringPage } from "../pages/data-grid/FilteringPage";
import { SelectionPage } from "../pages/data-grid/SelectionPage";
import { GroupingPage } from "../pages/data-grid/GroupingPage";
import { ResizingPage } from "../pages/data-grid/ResizingPage";
import { ThemesGridPage } from "../pages/data-grid/ThemesGridPage";
import { GridStatesPage } from "../pages/data-grid/GridStatesPage";
import { StressGridPage } from "../pages/data-grid/StressGridPage";
import { ResourceListPage } from "../pages/patterns/ResourceListPage";
import { DetailPage } from "../pages/patterns/DetailPage";
import { SettingsPage } from "../pages/patterns/SettingsPage";
import { FormPage } from "../pages/patterns/FormPage";
import { EmptyErrorLoadingPage } from "../pages/patterns/EmptyErrorLoadingPage";

export type PlaygroundRoute = {
  id: string;
  label: string;
  title: string;
  description: string;
  group: "Overview" | "Core" | "Components" | "Data Grid" | "Patterns";
  Component: ComponentType;
};

export const routes: PlaygroundRoute[] = [
  {
    id: "overview",
    label: "Overview",
    title: "Dravyn UI Overview",
    description: "Workspace purpose, package boundaries, and maturity at a glance.",
    group: "Overview",
    Component: OverviewPage
  },
  {
    id: "tokens",
    label: "Theme Tokens",
    title: "Theme Tokens",
    description: "Shared dv tokens for color, surfaces, typography, spacing, and status.",
    group: "Core",
    Component: ThemeTokensPage
  },
  {
    id: "modes",
    label: "Theme Modes",
    title: "Theme Modes",
    description: "Light, dark, enterprise, and system theme behavior.",
    group: "Core",
    Component: ThemeModesPage
  },
  {
    id: "density",
    label: "Density",
    title: "Density",
    description: "Compact, standard, and comfortable sizing across controls.",
    group: "Core",
    Component: DensityPage
  },
  {
    id: "overrides",
    label: "CSS Overrides",
    title: "CSS Overrides",
    description: "Global dv overrides, local scopes, and grid-only udg overrides.",
    group: "Core",
    Component: CssOverridePage
  },
  {
    id: "buttons",
    label: "Buttons",
    title: "Buttons",
    description: "Button and icon button variants, sizing, disabled, and loading states.",
    group: "Components",
    Component: ButtonsPage
  },
  {
    id: "actions",
    label: "Actions",
    title: "Action Controls",
    description: "First-party icons, icon buttons, toolbar buttons, groups, and segmented controls.",
    group: "Components",
    Component: ActionsPage
  },
  {
    id: "typography",
    label: "Typography",
    title: "Typography",
    description: "Headings, body text, muted text, and strong emphasis.",
    group: "Components",
    Component: TypographyPage
  },
  {
    id: "badges",
    label: "Badges",
    title: "Badges",
    description: "Neutral, status, and informational badge treatments.",
    group: "Components",
    Component: BadgesPage
  },
  {
    id: "inputs",
    label: "Inputs",
    title: "Inputs",
    description: "Fields, text input, search input, select, checkbox, and validation states.",
    group: "Components",
    Component: InputsPage
  },
  {
    id: "states",
    label: "States",
    title: "States",
    description: "Reusable empty, error, loading, and skeleton states.",
    group: "Components",
    Component: StatesPage
  },
  {
    id: "layout",
    label: "Layout",
    title: "Layout",
    description: "Simple Card, Panel, Stack, Inline, and Section primitives.",
    group: "Components",
    Component: LayoutPage
  },
  {
    id: "overlays",
    label: "Overlays",
    title: "Overlays",
    description: "Popover, menu, dropdown, tooltip, dialog, drawer, and confirmations.",
    group: "Components",
    Component: OverlaysPage
  },
  {
    id: "grid-basic",
    label: "Basic Grid",
    title: "Basic Grid",
    description: "Rows, columns, search, sort, and pagination.",
    group: "Data Grid",
    Component: BasicGridPage
  },
  {
    id: "grid-columns",
    label: "Columns",
    title: "Column Management",
    description: "Visibility, order, density, and reset behavior.",
    group: "Data Grid",
    Component: ColumnsPage
  },
  {
    id: "grid-filtering",
    label: "Filtering",
    title: "Filtering",
    description: "Search and filter state examples without adding new grid features.",
    group: "Data Grid",
    Component: FilteringPage
  },
  {
    id: "grid-selection",
    label: "Selection",
    title: "Selection",
    description: "Selectable rows, disabled rows, and bulk actions.",
    group: "Data Grid",
    Component: SelectionPage
  },
  {
    id: "grid-grouping",
    label: "Grouping",
    title: "Grouping",
    description: "Client-side grouping examples.",
    group: "Data Grid",
    Component: GroupingPage
  },
  {
    id: "grid-resizing",
    label: "Resizing",
    title: "Column Resizing",
    description: "Resizable columns, long text, and horizontal overflow.",
    group: "Data Grid",
    Component: ResizingPage
  },
  {
    id: "grid-themes",
    label: "Grid Themes",
    title: "Grid Themes",
    description: "Light, dark, enterprise, and shared token alignment.",
    group: "Data Grid",
    Component: ThemesGridPage
  },
  {
    id: "grid-states",
    label: "Grid States",
    title: "Grid States",
    description: "Empty, error, and loading states rendered through the grid package.",
    group: "Data Grid",
    Component: GridStatesPage
  },
  {
    id: "grid-stress",
    label: "Stress Grid",
    title: "Stress Grid",
    description: "Many rows and columns without introducing virtualization.",
    group: "Data Grid",
    Component: StressGridPage
  },
  {
    id: "resource-list",
    label: "Resource List",
    title: "Resource List",
    description: "Compact enterprise lists with metadata, actions, and badges.",
    group: "Patterns",
    Component: ResourceListPage
  },
  {
    id: "detail",
    label: "Detail Page",
    title: "Detail Page",
    description: "Header, metadata, status, key-value sections, and actions.",
    group: "Patterns",
    Component: DetailPage
  },
  {
    id: "settings",
    label: "Settings",
    title: "Settings",
    description: "Sectioned settings with checkboxes and explanatory text.",
    group: "Patterns",
    Component: SettingsPage
  },
  {
    id: "form",
    label: "Form",
    title: "Form",
    description: "Fields, validation, disabled controls, and submission actions.",
    group: "Patterns",
    Component: FormPage
  },
  {
    id: "empty-error-loading",
    label: "Empty/Error/Loading",
    title: "Empty, Error, and Loading",
    description: "Full-page feedback states for enterprise workflows.",
    group: "Patterns",
    Component: EmptyErrorLoadingPage
  }
];

export const routeGroups = ["Overview", "Core", "Components", "Data Grid", "Patterns"] as const;
