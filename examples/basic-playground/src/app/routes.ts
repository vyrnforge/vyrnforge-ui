import type { ComponentType } from "react";
import { OverviewPage } from "../pages/overview/OverviewPage";
import { ThemeTokensPage } from "../pages/core/ThemeTokensPage";
import { ThemeModesPage } from "../pages/core/ThemeModesPage";
import { DensityPage } from "../pages/core/DensityPage";
import { CssOverridePage } from "../pages/core/CssOverridePage";
import {
  AppShellPage,
  BadgePage,
  BasicGridReferencePage,
  ButtonGroupPage,
  ButtonPage,
  IconButtonPage,
  SegmentedControlPage,
  TabsPage,
  ToolbarButtonPage
} from "../pages/reference/PriorityComponentPages";
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
  ValidationMessagePage
} from "../pages/reference/FormComponentPages";
import {
  RatingPage,
  SliderPage,
  ToggleButtonGroupPage,
  ToggleButtonPage
} from "../pages/reference/S3B1ComponentPages";
import {
  ConfirmDialogPage,
  DialogPage,
  DrawerPage,
  DropdownPage,
  MenuPage,
  PopoverPage,
  TooltipPage
} from "../pages/reference/OverlayComponentPages";
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
import { AdminShellPage } from "../pages/patterns/AdminShellPage";
import { CustomerPortalShellPage } from "../pages/patterns/CustomerPortalShellPage";
import { FilterFormPage } from "../pages/patterns/FilterFormPage";
import { OverlayStressPage } from "../pages/patterns/OverlayStressPage";

export type PlaygroundRoute = {
  id: string;
  label: string;
  title: string;
  description: string;
  group: "Overview" | "Foundations" | "Components" | "Data Grid" | "Patterns";
  subgroup?: "Actions" | "Forms" | "Feedback" | "Layout" | "Navigation" | "Overlays";
  gallery?: boolean;
  path?: string;
  packageName?: "@dravyn/ui-components" | "@dravyn/ui-data-grid";
  status?: "stable" | "experimental" | "planned";
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
    group: "Foundations",
    Component: ThemeTokensPage
  },
  {
    id: "modes",
    label: "Theme Modes",
    title: "Theme Modes",
    description: "Light, dark, enterprise, and system theme behavior.",
    group: "Foundations",
    Component: ThemeModesPage
  },
  {
    id: "density",
    label: "Density",
    title: "Density",
    description: "Compact, standard, and comfortable sizing across controls.",
    group: "Foundations",
    Component: DensityPage
  },
  {
    id: "overrides",
    label: "CSS Overrides",
    title: "CSS Overrides",
    description: "Global dv overrides, local scopes, and grid-only udg overrides.",
    group: "Foundations",
    Component: CssOverridePage
  },
  {
    id: "button",
    label: "Button",
    title: "Button",
    description: "Visible business actions and form commands.",
    group: "Components",
    subgroup: "Actions",
    gallery: true,
    path: "/components/actions/button",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: ButtonPage
  },
  {
    id: "icon-button",
    label: "IconButton",
    title: "IconButton",
    description: "Compact icon-only utility actions.",
    group: "Components",
    subgroup: "Actions",
    gallery: true,
    path: "/components/actions/icon-button",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: IconButtonPage
  },
  {
    id: "button-group",
    label: "ButtonGroup",
    title: "ButtonGroup",
    description: "Visually grouped related actions.",
    group: "Components",
    subgroup: "Actions",
    gallery: true,
    path: "/components/actions/button-group",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: ButtonGroupPage
  },
  {
    id: "toolbar-button",
    label: "ToolbarButton",
    title: "ToolbarButton",
    description: "Dense labelled toolbar commands.",
    group: "Components",
    subgroup: "Actions",
    gallery: true,
    path: "/components/actions/toolbar-button",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: ToolbarButtonPage
  },
  {
    id: "segmented-control",
    label: "SegmentedControl",
    title: "SegmentedControl",
    description: "Mutually exclusive view and mode selection.",
    group: "Components",
    subgroup: "Actions",
    gallery: true,
    path: "/components/actions/segmented-control",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: SegmentedControlPage
  },
  {
    id: "toggle-button",
    label: "ToggleButton",
    title: "Toggle Button",
    description: "Pressable tools, formatting controls, and view actions.",
    group: "Components",
    subgroup: "Actions",
    gallery: true,
    path: "/components/actions/toggle-button",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: ToggleButtonPage
  },
  {
    id: "toggle-button-group",
    label: "ToggleButtonGroup",
    title: "Toggle Button Group",
    description: "Joined exclusive and multi-select tool groups.",
    group: "Components",
    subgroup: "Actions",
    gallery: true,
    path: "/components/actions/toggle-button-group",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: ToggleButtonGroupPage
  },
  {
    id: "text-input",
    label: "TextInput",
    title: "TextInput",
    description: "Native short-text input.",
    group: "Components",
    subgroup: "Forms",
    gallery: true,
    path: "/components/forms/text-input",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: TextInputReferencePage
  },
  {
    id: "select",
    label: "Select",
    title: "Select",
    description: "Native select for compact option sets.",
    group: "Components",
    subgroup: "Forms",
    gallery: true,
    path: "/components/forms/select",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: SelectReferencePage
  },
  {
    id: "checkbox",
    label: "Checkbox",
    title: "Checkbox",
    description: "Native independent-choice input.",
    group: "Components",
    subgroup: "Forms",
    gallery: true,
    path: "/components/forms/checkbox",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: CheckboxReferencePage
  },
  {
    id: "field",
    label: "Field",
    title: "Field",
    description: "Labels, descriptions, validation, and control relationships.",
    group: "Components",
    subgroup: "Forms",
    gallery: true,
    path: "/components/forms/field",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: FieldReferencePage
  },
  {
    id: "validation-message",
    label: "ValidationMessage",
    title: "Validation Message",
    description: "Field-level validation and guidance messages.",
    group: "Components",
    subgroup: "Forms",
    gallery: true,
    path: "/components/forms/validation-message",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: ValidationMessagePage
  },
  {
    id: "radio",
    label: "Radio",
    title: "Radio",
    description: "Native individual choice control.",
    group: "Components",
    subgroup: "Forms",
    gallery: true,
    path: "/components/forms/radio",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: RadioPage
  },
  {
    id: "radio-group",
    label: "RadioGroup",
    title: "Radio Group",
    description: "Native fieldset-based single-choice group.",
    group: "Components",
    subgroup: "Forms",
    gallery: true,
    path: "/components/forms/radio-group",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: RadioGroupPage
  },
  {
    id: "switch",
    label: "Switch",
    title: "Switch",
    description: "Native checkbox-based settings control.",
    group: "Components",
    subgroup: "Forms",
    gallery: true,
    path: "/components/forms/switch",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: SwitchPage
  },
  {
    id: "number-input",
    label: "NumberInput",
    title: "Number Input",
    description: "Native integer and decimal input.",
    group: "Components",
    subgroup: "Forms",
    gallery: true,
    path: "/components/forms/number-input",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: NumberInputPage
  },
  {
    id: "date-input",
    label: "DateInput",
    title: "Date Input",
    description: "Native local date input.",
    group: "Components",
    subgroup: "Forms",
    gallery: true,
    path: "/components/forms/date-input",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: DateInputPage
  },
  {
    id: "datetime-input",
    label: "DateTimeInput",
    title: "Date Time Input",
    description: "Native local date and time input.",
    group: "Components",
    subgroup: "Forms",
    gallery: true,
    path: "/components/forms/datetime-input",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: DateTimeInputPage
  },
  {
    id: "textarea",
    label: "Textarea",
    title: "Textarea",
    description: "Native multiline text input.",
    group: "Components",
    subgroup: "Forms",
    gallery: true,
    path: "/components/forms/textarea",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: TextareaPage
  },
  {
    id: "rating",
    label: "Rating",
    title: "Rating",
    description: "Discrete native radio-based score selection.",
    group: "Components",
    subgroup: "Forms",
    gallery: true,
    path: "/components/forms/rating",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: RatingPage
  },
  {
    id: "slider",
    label: "Slider",
    title: "Slider",
    description: "Native bounded numeric range input.",
    group: "Components",
    subgroup: "Forms",
    gallery: true,
    path: "/components/forms/slider",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: SliderPage
  },
  {
    id: "popover",
    label: "Popover",
    title: "Popover",
    description: "Anchored interactive floating content.",
    group: "Components",
    subgroup: "Overlays",
    gallery: true,
    path: "/components/overlays/popover",
    packageName: "@dravyn/ui-components",
    status: "stable",
    Component: PopoverPage
  },
  {
    id: "menu",
    label: "Menu",
    title: "Menu",
    description: "Keyboard-ready floating action menu.",
    group: "Components",
    subgroup: "Overlays",
    gallery: true,
    path: "/components/overlays/menu",
    packageName: "@dravyn/ui-components",
    status: "stable",
    Component: MenuPage
  },
  {
    id: "dropdown",
    label: "Dropdown",
    title: "Dropdown",
    description: "Generic trigger-controlled floating content.",
    group: "Components",
    subgroup: "Overlays",
    gallery: true,
    path: "/components/overlays/dropdown",
    packageName: "@dravyn/ui-components",
    status: "stable",
    Component: DropdownPage
  },
  {
    id: "tooltip",
    label: "Tooltip",
    title: "Tooltip",
    description: "Short contextual description for hover and focus.",
    group: "Components",
    subgroup: "Overlays",
    gallery: true,
    path: "/components/overlays/tooltip",
    packageName: "@dravyn/ui-components",
    status: "stable",
    Component: TooltipPage
  },
  {
    id: "dialog",
    label: "Dialog",
    title: "Dialog",
    description: "Modal focus-contained workflow.",
    group: "Components",
    subgroup: "Overlays",
    gallery: true,
    path: "/components/overlays/dialog",
    packageName: "@dravyn/ui-components",
    status: "stable",
    Component: DialogPage
  },
  {
    id: "drawer",
    label: "Drawer",
    title: "Drawer",
    description: "Modal edge workflow with internal scrolling.",
    group: "Components",
    subgroup: "Overlays",
    gallery: true,
    path: "/components/overlays/drawer",
    packageName: "@dravyn/ui-components",
    status: "stable",
    Component: DrawerPage
  },
  {
    id: "confirm-dialog",
    label: "Confirm Dialog",
    title: "Confirm Dialog",
    description: "Reusable normal and destructive confirmation flow.",
    group: "Components",
    subgroup: "Overlays",
    gallery: true,
    path: "/components/overlays/confirm-dialog",
    packageName: "@dravyn/ui-components",
    status: "stable",
    Component: ConfirmDialogPage
  },
  {
    id: "badge",
    label: "Badge",
    title: "Badge",
    description: "Compact status and metadata label.",
    group: "Components",
    subgroup: "Feedback",
    gallery: true,
    path: "/components/feedback/badge",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: BadgePage
  },
  {
    id: "app-shell",
    label: "AppShell",
    title: "AppShell",
    description: "Persistent application layout and scroll ownership.",
    group: "Components",
    subgroup: "Layout",
    gallery: true,
    path: "/components/layout/app-shell",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: AppShellPage
  },
  {
    id: "tabs",
    label: "Tabs",
    title: "Tabs",
    description: "Related content panels on one route.",
    group: "Components",
    subgroup: "Navigation",
    gallery: true,
    path: "/components/navigation/tabs",
    packageName: "@dravyn/ui-components",
    status: "experimental",
    Component: TabsPage
  },
  {
    id: "grid-basic",
    label: "Basic Grid",
    title: "Basic Grid",
    description: "Rows, columns, search, sort, and pagination.",
    group: "Data Grid",
    gallery: true,
    path: "/data-grid/basic",
    packageName: "@dravyn/ui-data-grid",
    status: "stable",
    Component: BasicGridReferencePage
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
    id: "filter-form",
    label: "Filter Form",
    title: "Filter Form",
    description: "Search, select, native date range, and filter actions.",
    group: "Patterns",
    Component: FilterFormPage
  },
  {
    id: "overlay-stress",
    label: "Overlay Stress Test",
    title: "Overlay Stress Test",
    description: "Nested portal, focus, dismissal, scroll, and z-index exercise.",
    group: "Patterns",
    Component: OverlayStressPage
  },
  {
    id: "empty-error-loading",
    label: "Empty/Error/Loading",
    title: "Empty, Error, and Loading",
    description: "Full-page feedback states for enterprise workflows.",
    group: "Patterns",
    Component: EmptyErrorLoadingPage
  },
  {
    id: "admin-shell",
    label: "Admin Shell",
    title: "Admin Shell",
    description: "A complete admin app frame using AppShell, TopNav, SideNav, PageHeader, and PageToolbar.",
    group: "Patterns",
    Component: AdminShellPage
  },
  {
    id: "customer-portal-shell",
    label: "Customer Portal",
    title: "Customer Portal Shell",
    description: "A customer-facing portal frame with enterprise theme, breadcrumbs, and tabs.",
    group: "Patterns",
    Component: CustomerPortalShellPage
  }
];

export const routeGroups = ["Overview", "Foundations", "Components", "Data Grid", "Patterns"] as const;
