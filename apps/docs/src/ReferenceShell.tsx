import { useState, type ReactNode } from "react";
import { Icon, Select } from "@vyrnforge/ui-components";
import type { ReferenceRecordSelection } from "./App";
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
  const [searchQuery, setSearchQuery] = useState("");
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

  const versionControlLabel = (version: DocsVersion) => {
    const readiness = getDocumentationReadiness(version, framework.id);
    const baseLabel =
      version.id === "next"
        ? `Next · ${version.version}`
        : `${version.releaseLine} · ${version.version}`;

    return isDocumentationReady(readiness)
      ? baseLabel
      : `${baseLabel} · ${readiness}`;
  };

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
      onQueryChange={setSearchQuery}
      onRouteChange={(routeId) => {
        closeMobileNavigation();
        navigate(routeId);
      }}
      query={searchQuery}
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
          label: versionControlLabel(version),
          value: version.id,
        }))}
        size="sm"
        value={docsVersion.id}
      />
      <a
        aria-label="VyrnForge on GitHub"
        className="vf-docs-app-shell__repository-link"
        href={docsLinks.repository}
      >
        <Icon name="GitHub" size="md" />
        <span>GitHub</span>
      </a>
      {headerAction}
    </>
  );

  return (
    <DocumentationAppShell
      navigation={renderNavigation}
      onHome={() => navigate("overview")}
      onSearchQueryChange={setSearchQuery}
      primaryNavigation={primaryNavigation}
      searchQuery={searchQuery}
      utilityControls={utilityControls}
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
    </DocumentationAppShell>
  );
}
