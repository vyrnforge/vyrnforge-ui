import { Button, EmptyState, ErrorState } from "@vyrnforge/ui-components";
import type { ReferenceRecordSelection } from "./App";
import { ComponentReferencePage } from "./ComponentReferencePage";
import type { DocsFrameworkId } from "./docsContext";
import { DocumentationPageTemplate } from "./DocumentationPageTemplate";
import { GuidePage } from "./GuidePage";
import { DiscoveryReferencePage } from "./DiscoveryReferencePage";
import { ExecutableExamplesPage } from "./examples/ExecutableExamplesPage";
import { MigratedExamplePage } from "./examples/MigratedExamplePage";
import { MarkdownView } from "./MarkdownView";
import { PackageReferencePage } from "./PackageReferencePage";
import {
  getDocumentationTemplate,
  type DocsRoute,
  type DocsRouteResolution,
} from "./referenceRoutes";

type DocsPageProps = {
  route: DocsRoute;
  frameworkId: DocsFrameworkId;
  invalidRouteId?: string | null;
  onFrameworkChange: (frameworkId: DocsFrameworkId) => void;
  onRouteChange: (routeId: string) => void;
  referenceRecord: ReferenceRecordSelection | null;
  routeResolution: DocsRouteResolution;
  version: string;
};

export function DocsPage({
  route,
  frameworkId,
  invalidRouteId = null,
  onFrameworkChange,
  onRouteChange,
  referenceRecord,
  routeResolution,
  version,
}: DocsPageProps) {
  const template = getDocumentationTemplate(route.template);

  if (invalidRouteId) {
    return (
      <div className="vf-docs-state">
        <ErrorState
          actions={
            <Button onClick={() => onRouteChange("overview")} size="sm">
              Go to Reference overview
            </Button>
          }
          description={`No public Reference route exists for “${invalidRouteId}”.`}
          title="Reference page not found"
        />
      </div>
    );
  }

  if (!routeResolution.available) {
    const alternatives = routeResolution.alternatives
      .map(
        (alternative) =>
          `${alternative.frameworkId} ${alternative.version} (${alternative.status})`,
      )
      .join(", ");

    return (
      <DocumentationPageTemplate
        description="This document is not available for the selected framework and documentation version."
        status={routeResolution.status}
        template={template}
        title={route.title}
      >
        <div className="vf-docs-state">
          <EmptyState
            description={
              alternatives
                ? `Available alternatives: ${alternatives}.`
                : "No published documentation alternative is currently available."
            }
            title="Unavailable in this framework/version"
          />
        </div>
      </DocumentationPageTemplate>
    );
  }

  if (route.template === "guide") {
    return (
      <GuidePage
        frameworkId={frameworkId}
        onFrameworkChange={onFrameworkChange}
        onRouteChange={onRouteChange}
        route={route}
        status={routeResolution.status}
      />
    );
  }

  const componentId =
    referenceRecord?.domain === "components" ? referenceRecord.id : null;

  const pageContent =
    route.kind === "example" && route.exampleId ? (
      <MigratedExamplePage
        exampleId={route.exampleId}
        frameworkId={frameworkId}
        version={routeResolution.context.version}
      />
    ) : route.kind === "executable-examples" ? (
      <ExecutableExamplesPage
        frameworkId={frameworkId}
        version={routeResolution.context.version}
      />
    ) : route.kind === "discovery-reference" &&
      (route.recordDomain === "tokens" || route.recordDomain === "patterns") ? (
      <DiscoveryReferencePage
        recordDomain={route.recordDomain}
        referenceRecord={referenceRecord}
      />
    ) : route.kind === "component-reference" ? (
      <ComponentReferencePage
        componentId={componentId}
        frameworkId={frameworkId}
        member={referenceRecord?.member ?? null}
        version={version}
      />
    ) : route.kind === "package-reference" ? (
      <PackageReferencePage
        packageId={
          referenceRecord?.domain === "packages" ? referenceRecord.id : null
        }
      />
    ) : (
      <MarkdownView markdown={route.content ?? ""} />
    );

  return (
    <DocumentationPageTemplate
      description={route.description}
      status={routeResolution.status}
      template={template}
      title={route.title}
    >
      {pageContent}
    </DocumentationPageTemplate>
  );
}
