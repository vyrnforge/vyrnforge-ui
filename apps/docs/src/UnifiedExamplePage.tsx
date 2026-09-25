import { Badge, Text } from "@vyrnforge/ui-components";
import { DocumentationPage } from "./DocumentationPage";
import { ThemeModesPage } from "./examples/foundations/ThemeModesExample";
import { DensityPage } from "./examples/foundations/DensityExample";
import { CssOverridePage } from "./examples/foundations/CssOverrideExample";
import { BasicGridPage } from "./examples/data-grid/BasicGridPage";
import { ColumnsPage } from "./examples/data-grid/ColumnsPage";
import { FilteringPage } from "./examples/data-grid/FilteringPage";
import { GroupingPage } from "./examples/data-grid/GroupingPage";
import { ResizingPage } from "./examples/data-grid/ResizingPage";
import { SelectionPage } from "./examples/data-grid/SelectionPage";
import { GridStatesPage } from "./examples/data-grid/GridStatesPage";
import { ThemesGridPage } from "./examples/data-grid/ThemesGridPage";

const examples = {
  "theme-modes": {
    title: "Theme Modes",
    description:
      "Compare shared VyrnForge primitives across scoped light, dark, enterprise, and system themes.",
    sectionTitle: "Interactive theme comparison",
    content: <ThemeModesPage />,
  },
  density: {
    title: "Density",
    description:
      "Compare compact, standard, and comfortable sizing using the same component contracts.",
    sectionTitle: "Interactive density comparison",
    content: <DensityPage />,
  },
  "css-overrides": {
    title: "CSS Overrides",
    description:
      "Use VyrnForge tokens and scoped CSS custom properties without introducing framework-specific styling systems.",
    sectionTitle: "Scoped override examples",
    content: <CssOverridePage />,
  },
  "grid-basic": {
    title: "Basic Grid",
    description:
      "Use UniversalDataGrid for structured data while the consuming application owns business state and workflows.",
    sectionTitle: "Basic grid example",
    content: <BasicGridPage />,
  },
  "grid-columns": {
    title: "Grid Columns",
    description:
      "Configure reusable column definitions, formatting, and data semantics.",
    sectionTitle: "Column configuration",
    content: <ColumnsPage />,
  },
  "grid-filtering": {
    title: "Grid Filtering",
    description:
      "Explore local filtering and search behavior without coupling the grid package to application state.",
    sectionTitle: "Filtering example",
    content: <FilteringPage />,
  },
  "grid-grouping": {
    title: "Grid Grouping",
    description:
      "Group structured data while keeping row ownership in the application.",
    sectionTitle: "Grouping example",
    content: <GroupingPage />,
  },
  "grid-resizing": {
    title: "Grid Resizing",
    description: "Resize columns within the grid's public sizing contract.",
    sectionTitle: "Resizing example",
    content: <ResizingPage />,
  },
  "grid-selection": {
    title: "Grid Selection",
    description:
      "Select rows and surface bulk actions without moving domain mutations into VyrnForge.",
    sectionTitle: "Selection example",
    content: <SelectionPage />,
  },
  "grid-states": {
    title: "Grid States",
    description:
      "Present empty, loading, and error states consistently around data-management workflows.",
    sectionTitle: "State examples",
    content: <GridStatesPage />,
  },
  "grid-themes": {
    title: "Grid Themes",
    description:
      "Apply shared theme and density tokens to the specialized data-grid module.",
    sectionTitle: "Theme examples",
    content: <ThemesGridPage />,
  },
} as const;

export type UnifiedExampleId = keyof typeof examples;

export function UnifiedExamplePage({
  exampleId,
}: {
  exampleId: UnifiedExampleId;
}) {
  const example = examples[exampleId];
  return (
    <DocumentationPage
      description={example.description}
      eyebrow={exampleId.startsWith("grid-") ? "Data & Grid" : "Foundations"}
      status={
        <Badge tone="subtle" variant="success">
          Live example
        </Badge>
      }
      title={example.title}
      sections={[
        {
          id: "example",
          title: example.sectionTitle,
          content: example.content,
        },
        {
          id: "guidance",
          title: "Guidance",
          content: (
            <Text tone="muted">
              This example is rendered directly inside the Docs application and
              uses the same VyrnForge packages, tokens, and public contracts as
              a consuming application.
            </Text>
          ),
        },
      ]}
    />
  );
}
