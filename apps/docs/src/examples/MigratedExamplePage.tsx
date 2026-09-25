import { Card, Heading, Text } from "@vyrnforge/ui-components";
import { CssOverridePage } from "./pages/core/CssOverridePage";
import { DensityPage } from "./pages/core/DensityPage";
import { ThemeModesPage } from "./pages/core/ThemeModesPage";
import { BasicGridPage } from "./pages/data-grid/BasicGridPage";
import { ColumnsPage } from "./pages/data-grid/ColumnsPage";
import { FilteringPage } from "./pages/data-grid/FilteringPage";
import { GridStatesPage } from "./pages/data-grid/GridStatesPage";
import { GroupingPage } from "./pages/data-grid/GroupingPage";
import { ResizingPage } from "./pages/data-grid/ResizingPage";
import { SelectionPage } from "./pages/data-grid/SelectionPage";
import { StressGridPage } from "./pages/data-grid/StressGridPage";
import { ThemesGridPage } from "./pages/data-grid/ThemesGridPage";
import { AdminShellPage } from "./pages/patterns/AdminShellPage";
import {\n  AssignmentPatternsPage,\n} from "./pages/patterns/AssignmentPatternsPage";
import {\n  CustomerPortalShellPage,\n} from "./pages/patterns/CustomerPortalShellPage";
import { DetailPage } from "./pages/patterns/DetailPage";
import { EmptyErrorLoadingPage } from "./pages/patterns/EmptyErrorLoadingPage";
import { FilterFormPage } from "./pages/patterns/FilterFormPage";
import { FormPage } from "./pages/patterns/FormPage";
import { ResourceListPage } from "./pages/patterns/ResourceListPage";
import { SettingsPage } from "./pages/patterns/SettingsPage";

const examples = {
  "theme-modes": ThemeModesPage,
  density: DensityPage,
  "css-overrides": CssOverridePage,
  "grid-basic": BasicGridPage,
  "grid-columns": ColumnsPage,
  "grid-filtering": FilteringPage,
  "grid-selection": SelectionPage,
  "grid-grouping": GroupingPage,
  "grid-resizing": ResizingPage,
  "grid-themes": ThemesGridPage,
  "grid-states": GridStatesPage,
  "grid-stress": StressGridPage,
  "pattern-resource-list": ResourceListPage,
  "pattern-detail": DetailPage,
  "pattern-settings": SettingsPage,
  "pattern-form": FormPage,
  "pattern-filter-form": FilterFormPage,
  "pattern-assignments": AssignmentPatternsPage,
  "pattern-feedback-states": EmptyErrorLoadingPage,
  "pattern-admin-shell": AdminShellPage,
  "pattern-customer-portal": CustomerPortalShellPage,
} as const;

export function MigratedExamplePage({ exampleId }: { exampleId: string }) {
  const Example = examples[exampleId as keyof typeof examples];

  if (!Example) {
    return (
      <Text tone="muted">This documentation example is unavailable.</Text>
    );
  }

  return (
    <div className="vf-docs-reference-layout">
      <div className="vf-docs-reference">
        <Card
          className="vf-docs-reference__section"
          id="interactive-example"
          padding="lg"
        >
          <Heading level={3} size="md">
            Interactive example
          </Heading>
          <Text tone="muted">
            This example runs directly inside the VyrnForge documentation app
            and shares its theme, navigation, and runtime.
          </Text>
          <div className="vf-docs-example-stage">
            <Example />
          </div>
        </Card>
      </div>
      <aside
        className="vf-docs-reference-outline"
        aria-label="On this example page"
      >
        <Text size="sm" tone="muted">
          On this page
        </Text>
        <nav>
          <ul>
            <li>
              <a href="#interactive-example">Interactive example</a>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
}
