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
import {
  docsFrameworks,
  docsVersions,
  getVersionHref,
  type DocsFramework,
  type DocsFrameworkId,
  type DocsVersion,
} from "./docsContext";
import type { DocsRoute } from "./docsRegistry";
import { DocsNav } from "./DocsNav";
import { DocsPage } from "./DocsPage";
import { docsLinks } from "./deploymentLinks";

type DocsShellProps = {
  activeRoute: DocsRoute;
  docsVersion: DocsVersion;
  framework: DocsFramework;
  headerAction?: ReactNode;
  onFrameworkChange: (frameworkId: DocsFrameworkId) => void;
  onRouteChange: (routeId: string) => void;
};

export function DocsShell({
  activeRoute,
  docsVersion,
  framework,
  headerAction,
  onFrameworkChange,
  onRouteChange,
}: DocsShellProps) {
  return (
    <AppShell
      className="vf-docs-shell"
      fullHeight
      header={
        <TopNav
          brand={
            <div>
              <div className="vf-docs-header__eyebrow">VyrnForge UI Docs</div>
              <Heading level={1} size="lg" className="vf-docs-header__title">
                Multi-framework source-of-truth reference
              </Heading>
              <Text tone="muted" className="vf-docs-header__description">
                Shared contracts stay canonical while examples, package
                guidance, and integration notes follow the selected framework
                surface.
              </Text>
            </div>
          }
          actions={
            <div className="vf-docs-header__nav">
              <a className="vf-docs-top-link" href={docsLinks.playground}>
                Playground
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
      sidebarWidth={260}
    >
      <section className="vf-docs-context" aria-label="Documentation context">
        <div className="vf-docs-context__selectors">
          <div className="vf-docs-context__field">
            <Label htmlFor="vf-docs-version">Library version</Label>
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
            <Label htmlFor="vf-docs-framework">Framework / language</Label>
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
        <div className="vf-docs-context__summary">
          <div>
            <Text size="sm" tone="muted">
              Selected surface
            </Text>
            <Heading level={2} size="md">
              {framework.label}
            </Heading>
          </div>
          <div className="vf-docs-context__badges">
            <Badge variant="neutral" tone="subtle">
              {framework.renderer}
            </Badge>
            <Badge variant="neutral" tone="subtle">
              {framework.supportLevel}
            </Badge>
            <Badge variant="neutral" tone="subtle">
              {docsVersion.releaseLine} · {docsVersion.version}
            </Badge>
          </div>
          <Text tone="muted">{framework.guidance}</Text>
        </div>
      </section>
      <DocsPage route={activeRoute} />
    </AppShell>
  );
}
