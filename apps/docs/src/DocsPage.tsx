import { PageHeader } from "@vyrnforge/ui-components";
import type { ReferenceRecordSelection } from "./App";
import type { DocsFrameworkId } from "./docsContext";
import { ComponentReferencePage } from "./ComponentReferencePage";
import { DiscoveryReferencePage } from "./DiscoveryReferencePage";
import { MarkdownView } from "./MarkdownView";
import { OverviewPage } from "./OverviewPage";
import { PackageReferencePage } from "./PackageReferencePage";
import { ReferencePreview } from "./ReferencePreview";
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
  if (route.id === "overview") {
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

      {route.kind === "component-reference" && componentId ? (
        <ReferencePreview componentId={componentId} frameworkId={frameworkId} />
      ) : null}

      {route.id === "token-reference" ||
      route.id === "pattern-reference" ||
      route.id === "accessibility-reference" ? (
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
