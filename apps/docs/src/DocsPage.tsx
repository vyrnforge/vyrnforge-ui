import { AdvancedModulePage } from "./AdvancedModulePage";
import { Button, EmptyState } from "@vyrnforge/ui-components";
import type { ReferenceRecordSelection } from "./App";
import { ComponentReferencePage } from "./ComponentReferencePage";
import type { DocsFrameworkId } from "./docsContext";
import { DocumentationPageTemplate } from "./DocumentationPageTemplate";
import { GuidePage } from "./GuidePage";
import { IconReferencePage } from "./IconReferencePage";
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
  invalidPath?: string | null;
  onFrameworkChange: (frameworkId: DocsFrameworkId) => void;
  onRouteChange: (routeId: string) => void;
  referenceRecord: ReferenceRecordSelection | null;
  routeResolution: DocsRouteResolution;
  version: string;
};

export function DocsPage({
  route,
  frameworkId,
  invalidPath,
  onFrameworkChange,
  onRouteChange,
  referenceRecord,
  routeResolution,
  version,
}: DocsPageProps) {
  const template = getDocumentationTemplate(route.template);

  if (invalidPath) {
    return (
      <EmptyState
        className="vf-docs-state"
        title="Page not found"
        description={`No VyrnForge Reference document matches ${invalidPath}.`}
        action={
          <Button onClick={() => onRouteChange("overview")} variant="subtle">
            Reference overview
          </Button>
        }
      />
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
        <EmptyState
          className="vf-docs-state"
          title="Unavailable in this context"
          description={
            alternatives
              ? `Available alternatives: ${alternatives}.`
              : "No published documentation alternative is currently available."
          }
          action={
            <Button onClick={() => onRouteChange("overview")} variant="subtle">
              Reference overview
            </Button>
          }
        />
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
        frameworkId={frameworkId}
        recordDomain={route.recordDomain}
        referenceRecord={referenceRecord}
        version={routeResolution.context.version}
      />
    ) : route.kind === "icon-reference" ? (
      <IconReferencePage frameworkId={frameworkId} />
    ) : route.kind === "component-reference" ? (
      <ComponentReferencePage
        componentId={componentId}
        frameworkId={frameworkId}
        version={version}
      />
    ) : route.kind === "package-reference" ? (
      <PackageReferencePage
        packageId={
          referenceRecord?.domain === "packages" ? referenceRecord.id : null
        }
      />
    ) : route.template === "advanced-module" ? (
      <AdvancedModulePage
        frameworkId={frameworkId}
        onRouteChange={onRouteChange}
        route={route}
        status={routeResolution.status}
        version={routeResolution.context.version}
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
