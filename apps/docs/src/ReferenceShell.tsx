import { type ReactNode } from "react";
import { Select } from "@vyrnforge/ui-components";
import type { ReferenceRecordSelection } from "./App";
import { getDedicatedReferencePagePolicy } from "./dedicatedReferencePagePolicy";
import { DocumentationAppShell } from "./DocumentationAppShell";
import {
  docsFrameworks,
  getDocumentationReadiness,
  getDocsVersionsForFramework,
  getVersionHref,
  isDocumentationReady,
  type DocsFramework,
  type DocsFrameworkId,
  type DocsVersion,
} from "./docsContext";
import { DocsPage } from "./DocsPage";
import { docsLinks } from "./deploymentLinks";
import {
  getComponentReferenceRecord,
  isComponentAvailableForFramework,
} from "./referenceData";
import {
  ReferenceNavigation,
  ReferencePrimaryNavigation,
} from "./ReferenceNavigation";
import {
  resolveDocsRoute,
  type DocsRoute,
  type DocsRouteResolution,
} from "./referenceRoutes";

export type ReferenceLayoutMode =
  "reading" | "reference" | "catalog" | "example" | "wide";

type ReferenceShellProps = {
  activeRoute: DocsRoute;
  docsVersion: DocsVersion;
  docsVersions: DocsVersion[];
  framework: DocsFramework;
  headerAction?: ReactNode;
  invalidPath?: string | null;
  onFrameworkChange: (frameworkId: DocsFrameworkId) => void;
  onRouteChange: (routeId: string) => void;
  referenceRecord: ReferenceRecordSelection | null;
  routeResolution: DocsRouteResolution;
  routeMember: string | null;
  routePath: string;
};

function getLayoutMode(
  route: DocsRoute,
  referenceRecord: ReferenceRecordSelection | null,
): ReferenceLayoutMode {
  const dedicatedPage = getDedicatedReferencePagePolicy(route);
  if (dedicatedPage) return dedicatedPage.layoutMode;
  if (route.kind === "example" || route.kind === "executable-examples") {
    return "example";
  }
  if (route.template === "advanced-module") return "wide";
  if (
    route.kind === "discovery-reference" ||
    route.kind === "component-reference" ||
    route.kind === "package-reference"
  ) {
    return referenceRecord ? "reference" : "catalog";
  }
  if (route.template === "package") return "reference";
  return "reading";
}

function recordFallbackRoute(record: ReferenceRecordSelection | null) {
  if (record?.domain === "components") return "component-reference";
  if (record?.domain === "packages") return "package-reference";
  return "overview";
}

export function ReferenceShell({
  activeRoute,
  docsVersion,
  docsVersions,
  framework,
  headerAction,
  invalidPath,
  onFrameworkChange,
  onRouteChange,
  referenceRecord,
  routeResolution,
  routeMember,
  routePath,
}: ReferenceShellProps) {
  const layoutMode = getLayoutMode(activeRoute, referenceRecord);
  const frameworkVersions = getDocsVersionsForFramework(
    framework.id,
    docsVersions,
  );
  const currentReadiness = getDocumentationReadiness(docsVersion, framework.id);
  const versionOptions = isDocumentationReady(currentReadiness)
    ? frameworkVersions
    : [
        {
          ...docsVersion,
          label: `${docsVersion.label} · ${currentReadiness}`,
        },
        ...frameworkVersions.filter(
          (candidate) => candidate.id !== docsVersion.id,
        ),
      ];

  const navigate = (routeId: string) => {
    onRouteChange(routeId);
  };

  const handleVersionChange = (versionId: string) => {
    const version = versionOptions.find(
      (candidate) => candidate.id === versionId,
    );
    if (
      !version ||
      version.id === docsVersion.id ||
      !isDocumentationReady(getDocumentationReadiness(version, framework.id))
    ) {
      return;
    }

    const targetRoute = resolveDocsRoute(
      activeRoute,
      framework.id,
      version.version,
    );
    const component =
      referenceRecord?.domain === "components"
        ? getComponentReferenceRecord(referenceRecord.id)
        : undefined;
    const recordAvailable =
      !component ||
      isComponentAvailableForFramework(
        component,
        framework.id,
        version.version,
      );
    const targetPath =
      targetRoute.available && recordAvailable
        ? routePath
        : `/${recordFallbackRoute(referenceRecord)}`;
    const targetMember =
      targetRoute.available && recordAvailable ? routeMember : null;

    window.location.assign(
      getVersionHref(version, framework.id, targetPath, targetMember),
    );
  };

  const renderNavigation = (closeMobileNavigation: () => void) => (
    <ReferenceNavigation
      activeRecordId={
        referenceRecord?.domain === "components" ? referenceRecord.id : null
      }
      activeRouteId={activeRoute.id}
      frameworkId={framework.id}
      onRouteChange={(routeId) => {
        closeMobileNavigation();
        navigate(routeId);
      }}
      version={docsVersion.version}
    />
  );

  const primaryNavigation = (
    <ReferencePrimaryNavigation
      activeRouteId={activeRoute.id}
      frameworkId={framework.id}
      onRouteChange={navigate}
      version={docsVersion.version}
    />
  );

  const utilityControls = (
    <>
      <Select
        aria-label="Framework"
        onChange={(event) =>
          onFrameworkChange(event.currentTarget.value as DocsFrameworkId)
        }
        options={docsFrameworks.map((candidate) => ({
          label: candidate.label,
          value: candidate.id,
        }))}
        size="sm"
        value={framework.id}
      />
      <Select
        aria-label="Documentation version"
        onChange={(event) => handleVersionChange(event.currentTarget.value)}
        options={versionOptions.map((version) => ({
          label: version.label,
          value: version.id,
        }))}
        size="sm"
        value={docsVersion.id}
      />
      <a className="vf-docs-app-shell__utility-link" href={docsLinks.repository}>
        GitHub
      </a>
      {headerAction}
    </>
  );

  return (
    <DocumentationAppShell
      navigation={renderNavigation}
      onHome={() => navigate("overview")}
      primaryNavigation={primaryNavigation}
      utilityControls={utilityControls}
    >
      <div
        className="vf-reference-page-viewport"
        data-reference-layout={layoutMode}
      >
        <DocsPage
          frameworkId={framework.id}
          invalidPath={invalidPath}
          onFrameworkChange={onFrameworkChange}
          onRouteChange={navigate}
          referenceRecord={referenceRecord}
          route={activeRoute}
          routeResolution={routeResolution}
          version={docsVersion.version}
        />
      </div>
    </DocumentationAppShell>
  );
}
