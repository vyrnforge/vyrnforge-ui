import { AdvancedModulePage } from "./AdvancedModulePage";
import {
  Button,
  EmptyState,
  Heading,
  Inline,
  Text,
} from "@vyrnforge/ui-components";
import type { ReferenceRecordSelection } from "./App";
import { ComponentReferencePage } from "./ComponentReferencePage";
import {
  getDedicatedReferencePage,
  renderDedicatedReferencePage,
} from "./DedicatedReferencePages";
import { getDocumentationPageFamily } from "./documentationPageFamily";
import {
  docsFrameworks,
  getFramework,
  type DocsFrameworkId,
} from "./docsContext";
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
  const family = getDocumentationPageFamily(route, referenceRecord);
  const framework = getFramework(frameworkId);

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
        family={family}
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

  const dedicatedPage = getDedicatedReferencePage(route);
  if (dedicatedPage) {
    const dedicatedContent = renderDedicatedReferencePage(dedicatedPage, {
      frameworkId,
      route,
      version: routeResolution.context.version,
    });

    if (dedicatedPage.policy.frame === "standalone") return dedicatedContent;

    return (
      <DocumentationPageTemplate
        description={route.description}
        family="dedicated"
        status={routeResolution.status}
        template={template}
        title={route.title}
      >
        {dedicatedContent}
      </DocumentationPageTemplate>
    );
  }

  const componentId =
    referenceRecord?.domain === "components" ? referenceRecord.id : null;
  const usesStandardReadingPage =
    route.kind === "overview" ||
    (route.kind === "markdown" && route.template !== "advanced-module");

  const pageContent = usesStandardReadingPage ? (
    <GuidePage onRouteChange={onRouteChange} route={route} />
  ) : route.kind === "example" && route.exampleId ? (
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

  const heroActions =
    family === "landing" ? (
      <Inline gap="sm">
        <Button onClick={() => onRouteChange("getting-started")}>
          Start building
        </Button>
        <Button
          onClick={() => onRouteChange("component-reference")}
          variant="subtle"
        >
          Browse components
        </Button>
      </Inline>
    ) : null;

  const heroAside =
    family === "landing" || family === "reading" ? (
      <div className="vf-docs-framework-context">
        <Text className="vf-docs-content-kicker" size="sm">
          {family === "landing" ? "Selected surface" : "Reading for"}
        </Text>
        <Heading level={3} size="md">
          {framework.label}
        </Heading>
        <Text tone="muted">
          {framework.language} · {framework.renderer}
        </Text>
        <Text size="sm" tone="muted">
          {framework.supportLevel}
        </Text>
        <Inline className="vf-docs-framework-context__switcher" gap="sm">
          {docsFrameworks.map((candidate) => (
            <Button
              aria-pressed={candidate.id === frameworkId}
              key={candidate.id}
              onClick={() => onFrameworkChange(candidate.id)}
              size="sm"
              variant={candidate.id === frameworkId ? "primary" : "ghost"}
            >
              {candidate.label}
            </Button>
          ))}
        </Inline>
      </div>
    ) : null;

  return (
    <DocumentationPageTemplate
      description={route.description}
      family={family}
      heroActions={heroActions}
      heroAside={heroAside}
      heroDescription={
        family === "landing"
          ? "One VyrnForge system for components, tokens, behavior, accessibility, and developer concepts — delivered through first-class Native HTML, React, Angular, and Vue surfaces."
          : undefined
      }
      heroTitle={
        family === "landing"
          ? "Build once. Stay native to every framework."
          : undefined
      }
      status={routeResolution.status}
      template={template}
      title={route.title}
    >
      {pageContent}
    </DocumentationPageTemplate>
  );
}
