import { PageHeader } from "@vyrnforge/ui-components";
import type { ReferenceRecordSelection } from "./App";
import type { DocsFrameworkId } from "./docsContext";
import { ComponentReferencePage } from "./ComponentReferencePage";
import { DiscoveryReferencePage } from "./DiscoveryReferencePage";
import { ExecutableExamplesPage } from "./examples/ExecutableExamplesPage";
import { MigratedExamplePage } from "./examples/MigratedExamplePage";
import { MarkdownView } from "./MarkdownView";
import { OverviewPage } from "./OverviewPage";
import { PackageReferencePage } from "./PackageReferencePage";
import type { DocsRoute } from "./referenceRoutes";

type DocsPageProps = {
  route: DocsRoute;
  frameworkId: DocsFrameworkId;
  onFrameworkChange: (frameworkId: DocsFrameworkId) => void;
  onRouteChange: (routeId: string) => void;
  referenceRecord: ReferenceRecordSelection | null;
};

export function DocsPage({
  route,
  frameworkId,
  onFrameworkChange,
  onRouteChange,
  referenceRecord,
}: DocsPageProps) {
  if (route.unavailableStatus) {
    const alternatives = route.unavailableAlternatives ?? [];
    return (
      <main className="vf-docs-page">
        <div className="vf-docs-page__intro">
          <PageHeader
            description={`This document is ${route.unavailableStatus} for the selected framework and documentation version.`}
            title={route.title}
          />
        </div>
        <section aria-labelledby="vf-docs-unavailable-heading">
          <h2 id="vf-docs-unavailable-heading">Documentation unavailable</h2>
          <p>
            VyrnForge will not substitute content from another framework or
            version. Choose a compatible framework/version combination to view
            this document.
          </p>
          {alternatives.length > 0 ? (
            <>
              <h3>Available alternatives</h3>
              <ul>
                {alternatives.map((alternative) => (
                  <li
                    key={`${alternative.framework}:${alternative.releaseLine}:${alternative.version}`}
                  >
                    {alternative.framework} · {alternative.releaseLine} ·{" "}
                    {alternative.version} ({alternative.status})
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      </main>
    );
  }

  if (route.kind === "overview") {
    return (
      <main className="vf-docs-page vf-docs-page--overview">
        <OverviewPage
          frameworkId={frameworkId}
          onFrameworkChange={onFrameworkChange}
          onRouteChange={onRouteChange}
        />
      </main>
    );
  }

  const componentId =
    referenceRecord?.domain === "components" ? referenceRecord.id : null;

  return (
    <main className="vf-docs-page">
      <div className="vf-docs-page__intro">
        <PageHeader description={route.description} title={route.title} />
      </div>

      {route.kind === "example" && route.exampleId ? (
        <MigratedExamplePage
          exampleId={route.exampleId}
          sourcePath={route.sourcePath}
        />
      ) : route.kind === "executable-examples" ? (
        <ExecutableExamplesPage frameworkId={frameworkId} />
      ) : route.kind === "discovery-reference" &&
        (route.id === "token-reference" || route.id === "pattern-reference") ? (
        <DiscoveryReferencePage
          referenceRecord={referenceRecord}
          routeId={route.id}
        />
      ) : route.kind === "component-reference" ? (
        <ComponentReferencePage
          componentId={componentId}
          frameworkId={frameworkId}
          onFrameworkChange={onFrameworkChange}
        />
      ) : route.kind === "package-reference" ? (
        <PackageReferencePage
          packageId={
            referenceRecord?.domain === "packages" ? referenceRecord.id : null
          }
        />
      ) : (
        <MarkdownView markdown={route.content ?? ""} />
      )}
    </main>
  );
}
