import type { ReactNode } from "react";
import {
  AppShell,
  Badge,
  Heading,
  Label,
  Select,
  Text,
  TopNav,
} from "@vyrnforge/ui-components";
import type { ReferenceRecordSelection } from "./App";
import {
  docsFrameworks,
  getVersionHref,
  referenceModel,
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
              <Heading level={1} size="lg" className="vf-docs-header__title">
                {referenceModel.product.label}
              </Heading>
              <Text tone="muted" className="vf-docs-header__description">
                Components, theming, accessibility, examples, and API guidance
                for Native HTML, React, Angular, and Vue.
              </Text>
            </div>
          }
          actions={
            <div className="vf-docs-header__nav">
              <a
                className="vf-docs-top-link"
                href={getPlaygroundHref(framework.id)}
              >
                All examples
              </a>
              <a className="vf-docs-top-link" href={docsLinks.repository}>
                GitHub
              </a>
              <Badge variant="info" tone="subtle">
                {docsVersion.channel}
              </Badge>
            </div>
          }
          userArea={headerAction}
        />
      }
      headerPosition="sticky"
      scrollMode="content"
      sidebar={
        <DocsNav activeRouteId={activeRoute.id} onRouteChange={onRouteChange} />
      }
      sidebarPosition="sticky"
      sidebarWidth={284}
    >
      <section className="vf-docs-context" aria-label="Documentation context">
        <div className="vf-docs-context__selectors">
          <div className="vf-docs-context__field">
            <Label htmlFor="vf-docs-version">Version</Label>
            <Select
              id="vf-docs-version"
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
          </div>
          <div className="vf-docs-context__field">
            <Label htmlFor="vf-docs-framework">Framework</Label>
            <Select
              id="vf-docs-framework"
              onChange={(event) =>
                onFrameworkChange(event.currentTarget.value as DocsFrameworkId)
              }
              options={docsFrameworks.map((candidate) => ({
                label: `${candidate.label} · ${candidate.language}`,
                value: candidate.id,
              }))}
              size="sm"
              value={framework.id}
            />
          </div>
        </div>
        <div className="vf-docs-context__meta" aria-label="Selected context">
          <Badge variant="neutral" tone="subtle">
            {framework.language}
          </Badge>
          <Badge variant="neutral" tone="subtle">
            {framework.renderer}
          </Badge>
          <Text size="sm" tone="muted">
            {docsVersion.releaseLine} · {docsVersion.version}
          </Text>
        </div>
      </section>
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
