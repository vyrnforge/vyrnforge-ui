import type { ReactNode } from "react";
import { Button, Heading, Select, Text } from "@vyrnforge/ui-components";
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
import type { DocsRoute, DocsRouteResolution } from "./referenceRoutes";

type GuideShellProps = {
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

const guideNavigation = [
  { routeId: "overview", label: "Overview" },
  { routeId: "getting-started", label: "Get started" },
  { routeId: "component-reference", label: "Components" },
  { routeId: "executable-examples", label: "Examples" },
] as const;

export function GuideShell({
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
}: GuideShellProps) {
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

  const handleVersionChange = (versionId: string) => {
    const version = versionOptions.find((candidate) => candidate.id === versionId);
    if (
      !version ||
      version.id === docsVersion.id ||
      !isDocumentationReady(getDocumentationReadiness(version, framework.id))
    ) {
      return;
    }

    window.location.assign(
      getVersionHref(
        version,
        framework.id,
        routePath,
        routeMember,
      ),
    );
  };

  return (
    <div className="vf-docs-guide-shell">
      <header className="vf-docs-guide-shell__header">
        <div className="vf-docs-guide-shell__header-inner">
          <button
            className="vf-docs-guide-shell__brand"
            onClick={() => onRouteChange("overview")}
            type="button"
          >
            <span className="vf-docs-guide-shell__mark" aria-hidden="true">
              V
            </span>
            <span className="vf-docs-guide-shell__brand-copy">
              <Heading level={1} size="sm">
                VyrnForge
              </Heading>
              <Text size="sm" tone="muted">
                Guide
              </Text>
            </span>
          </button>

          <nav
            aria-label="Guide navigation"
            className="vf-docs-guide-shell__primary-nav"
          >
            {guideNavigation.map((item) => {
              const active = activeRoute.id === item.routeId;
              return (
                <Button
                  aria-pressed={active}
                  key={item.routeId}
                  onClick={() => onRouteChange(item.routeId)}
                  size="sm"
                  variant={active ? "subtle" : "ghost"}
                >
                  {item.label}
                </Button>
              );
            })}
          </nav>

          <div className="vf-docs-guide-shell__context">
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
            <a
              className="vf-docs-guide-shell__repository"
              href={docsLinks.repository}
            >
              GitHub
            </a>
            {headerAction ? (
              <div className="vf-docs-guide-shell__theme">{headerAction}</div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="vf-docs-guide-shell__main">
        <DocsPage
          frameworkId={framework.id}
          onFrameworkChange={onFrameworkChange}
          onRouteChange={onRouteChange}
          referenceRecord={referenceRecord}
          route={activeRoute}
          routeResolution={routeResolution}
          version={docsVersion.version}
        />
      </div>
    </div>
  );
}
