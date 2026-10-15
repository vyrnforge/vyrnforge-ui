import { AdvancedModulePage } from "./AdvancedModulePage";
import {
  Button,
  Card,
  EmptyState,
  Heading,
  Inline,
  Text,
  type BreadcrumbItem,
} from "@vyrnforge/ui-components";
import type { ReferenceRecordSelection } from "./App";
import { ComponentReferencePage } from "./ComponentReferencePage";
import {
  getDedicatedReferencePage,
  renderDedicatedReferencePage,
} from "./DedicatedReferencePages";
import { getDocumentationContentLayout } from "./documentationContentLayout";
import { getDocumentationPageFamily } from "./documentationPageFamily";
import {
  docsFrameworks,
  getFramework,
  type DocsFrameworkId,
} from "./docsContext";
import { DocumentationPageTemplate } from "./DocumentationPageTemplate";
import { GuidePage, GuidePageOutline, hasGuideOutline } from "./GuidePage";
import { DiscoveryReferencePage } from "./DiscoveryReferencePage";
import { ExecutableExamplesPage } from "./examples/ExecutableExamplesPage";
import { MigratedExamplePage } from "./examples/MigratedExamplePage";
import { MarkdownView } from "./MarkdownView";
import { PackageReferencePage } from "./PackageReferencePage";
import {
  docsRoutes,
  getDocumentationTemplate,
  publicDocsSections,
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

function getBreadcrumbs(route: DocsRoute): BreadcrumbItem[] {
  const section = publicDocsSections.find(
    (candidate) => candidate.id === route.section,
  );

  return [
    {
      id: `section-${route.section}`,
      label: section?.label ?? route.section,
    },
    {
      id: route.id,
      label: route.title,
      current: true,
    },
  ];
}

function getReadingPageNavigation(
  route: DocsRoute,
  onRouteChange: (routeId: string) => void,
) {
  const index = docsRoutes.findIndex((candidate) => candidate.id === route.id);
  if (index < 0) return null;

  const previous = index > 0 ? docsRoutes[index - 1] : null;
  const next = index < docsRoutes.length - 1 ? docsRoutes[index + 1] : null;
  if (!previous && !next) return null;

  return (
    <Inline gap="sm" justify="between">
      {previous ? (
        <Button onClick={() => onRouteChange(previous.id)} variant="ghost">
          Previous: {previous.title}
        </Button>
      ) : (
        <span />
      )}
      {next ? (
        <Button onClick={() => onRouteChange(next.id)} variant="ghost">
          Next: {next.title}
        </Button>
      ) : null}
    </Inline>
  );
}

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
  const layout = getDocumentationContentLayout(route, referenceRecord);
  const framework = getFramework(frameworkId);
  const breadcrumbs = getBreadcrumbs(route);

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
        breadcrumbs={breadcrumbs}
        description="This document is not available for the selected framework and documentation version."
        family={family}
        layout={layout}
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
        breadcrumbs={breadcrumbs}
        description={route.description}
        family="dedicated"
        layout={layout}
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
      <Card
        className="vf-docs-framework-context"
        padding="md"
        variant="bordered"
      >
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
      </Card>
    ) : null;

  const localNavigation =
    family === "reading" && hasGuideOutline(route) ? (
      <GuidePageOutline route={route} />
    ) : undefined;
  const footer =
    family === "reading"
      ? getReadingPageNavigation(route, onRouteChange)
      : undefined;

  return (
    <DocumentationPageTemplate
      breadcrumbs={breadcrumbs}
      description={route.description}
      family={family}
      footer={footer}
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
      layout={layout}
      localNavigation={localNavigation}
      status={routeResolution.status}
      template={template}
      title={route.title}
    >
      {pageContent}
    </DocumentationPageTemplate>
  );
}
