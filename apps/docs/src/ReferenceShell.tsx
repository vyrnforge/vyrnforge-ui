import { useState, type ReactNode } from "react";
import { Button, Drawer, Select } from "@vyrnforge/ui-components";
import type { ReferenceRecordSelection } from "./App";
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
  ReferenceNavigation,
  ReferencePrimaryNavigation,
} from "./ReferenceNavigation";
import type { DocsRoute, DocsRouteResolution } from "./referenceRoutes";

export type ReferenceLayoutMode =
  "reading" | "reference" | "catalog" | "example" | "wide";

type ReferenceShellProps = {
  activeRoute: DocsRoute;
  docsVersion: DocsVersion;
  docsVersions: DocsVersion[];
  framework: DocsFramework;
  headerAction?: ReactNode;
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

export function ReferenceShell({
  activeRoute,
  docsVersion,
  docsVersions,
  framework,
  headerAction,
  onFrameworkChange,
  onRouteChange,
  referenceRecord,
  routeResolution,
  routeMember,
  routePath,
}: ReferenceShellProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
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
    setMobileNavigationOpen(false);
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
    window.location.assign(
      getVersionHref(version, framework.id, routePath, routeMember),
    );
  };

  const navigation = (
    <ReferenceNavigation
      activeRouteId={activeRoute.id}
      frameworkId={framework.id}
      onRouteChange={navigate}
      version={docsVersion.version}
    />
  );

  return (
    <div className="vf-reference-shell" data-layout-mode={layoutMode}>
      <a className="vf-reference-shell__skip" href="#vf-reference-main">
        Skip to content
      </a>

      <header className="vf-reference-shell__header">
        <div className="vf-reference-shell__header-inner">
          <button
            className="vf-reference-shell__brand"
            onClick={() => navigate("overview")}
            type="button"
          >
            <span aria-hidden="true" className="vf-reference-shell__mark">
              V
            </span>
            <span className="vf-reference-shell__identity">
              <strong>VyrnForge</strong>
              <small>Reference</small>
            </span>
          </button>

          <ReferencePrimaryNavigation
            activeRouteId={activeRoute.id}
            frameworkId={framework.id}
            onRouteChange={navigate}
            version={docsVersion.version}
          />

          <div className="vf-reference-shell__controls">
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
              onChange={(event) =>
                handleVersionChange(event.currentTarget.value)
              }
              options={versionOptions.map((version) => ({
                label: version.label,
                value: version.id,
              }))}
              size="sm"
              value={docsVersion.id}
            />
            <a className="vf-reference-shell__link" href={docsLinks.repository}>
              GitHub
            </a>
            {headerAction}
            <Button
              className="vf-reference-shell__menu-button"
              onClick={() => setMobileNavigationOpen(true)}
              size="sm"
              variant="subtle"
            >
              Browse
            </Button>
          </div>
        </div>
      </header>

      <div className="vf-reference-shell__body">
        <aside
          aria-label="Reference navigation"
          className="vf-reference-shell__sidebar"
        >
          {navigation}
        </aside>

        <main
          className="vf-reference-shell__main"
          data-reference-layout={layoutMode}
          id="vf-reference-main"
          tabIndex={-1}
        >
          <DocsPage
            frameworkId={framework.id}
            onFrameworkChange={onFrameworkChange}
            onRouteChange={navigate}
            referenceRecord={referenceRecord}
            route={activeRoute}
            routeResolution={routeResolution}
            version={docsVersion.version}
          />
        </main>
      </div>

      <Drawer
        description="Navigate generated VyrnForge documentation and API records."
        onOpenChange={setMobileNavigationOpen}
        open={mobileNavigationOpen}
        side="left"
        size="md"
        title="VyrnForge Reference"
      >
        {navigation}
      </Drawer>
    </div>
  );
}
