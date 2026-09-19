import type { ReactNode } from "react";
import {
  AppShell,
  Heading,
  Select,
  Text,
  TopNav,
} from "@vyrnforge/ui-components";
import type { ReferenceRecordSelection } from "./App";
import {
  docsFrameworks,
  getVersionHref,
  type DocsFramework,
  type DocsFrameworkId,
  type DocsVersion,
} from "./docsContext";
import { DocsNav } from "./DocsNav";
import { DocsPage } from "./DocsPage";
import { docsLinks, getPlaygroundHref } from "./deploymentLinks";
import type { DocsRoute } from "./referenceRoutes";

type DocsShellProps = {
  activeRoute: DocsRoute;
  docsVersion: DocsVersion;
  docsVersions: DocsVersion[];
  framework: DocsFramework;
  headerAction?: ReactNode;
  onFrameworkChange: (frameworkId: DocsFrameworkId) => void;
  onRouteChange: (routeId: string) => void;
  referenceRecord: ReferenceRecordSelection | null;
};

export function DocsShell({
  activeRoute,
  docsVersion,
  docsVersions,
  framework,
  headerAction,
  onFrameworkChange,
  onRouteChange,
  referenceRecord,
}: DocsShellProps) {
  return (
    <AppShell
      className="vf-docs-shell"
      fullHeight
      header={
        <TopNav
          brand={
            <div className="vf-docs-header__brand">
              <Heading level={1} size="md">
                VyrnForge
              </Heading>
              <Text size="sm" tone="muted">
                Documentation
              </Text>
            </div>
          }
          actions={
            <div className="vf-docs-header__nav">
              <Select
                aria-label="Documentation version"
                onChange={(event) => {
                  const version = docsVersions.find(
                    (candidate) => candidate.id === event.currentTarget.value,
                  );
                  if (version && version.id !== docsVersion.id) {
                    window.location.assign(getVersionHref(version, framework.id));
                  }
                }}
                options={docsVersions.map((version) => ({
                  label: version.label,
                  value: version.id,
                }))}
                size="sm"
                value={docsVersion.id}
              />
              <Select
                aria-label="Framework"
                onChange={(event) =>
                  onFrameworkChange(
                    event.currentTarget.value as DocsFrameworkId,
                  )
                }
                options={docsFrameworks.map((candidate) => ({
                  label: candidate.label,
                  value: candidate.id,
                }))}
                size="sm"
                value={framework.id}
              />
              <a
                className="vf-docs-top-link"
                href={getPlaygroundHref(framework.id)}
              >
                Examples
              </a>
              <a className="vf-docs-top-link" href={docsLinks.repository}>
                GitHub
              </a>
            </div>
          }
          userArea={headerAction}
        />
      }
      headerPosition="sticky"
      scrollMode="content"
      sidebar={
        <DocsNav
          activeRouteId={activeRoute.id}
          onRouteChange={onRouteChange}
        />
      }
      sidebarPosition="sticky"
      sidebarWidth={248}
    >
      <DocsPage
        frameworkId={framework.id}
        onFrameworkChange={onFrameworkChange}
        onRouteChange={onRouteChange}
        referenceRecord={referenceRecord}
        route={activeRoute}
      />
    </AppShell>
  );
}
