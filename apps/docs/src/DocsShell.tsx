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
  releaseLineVersions,
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
            <div>
              <div className="vf-docs-header__eyebrow">
                {referenceModel.product.label} · Docs
              </div>
              <Heading level={1} size="lg" className="vf-docs-header__title">
                {referenceModel.product.label}
              </Heading>
              <Text tone="muted" className="vf-docs-header__description">
                Curated guidance and generated reference facts share one
                framework-neutral product context across Docs and Playground.
              </Text>
            </div>
          }
          actions={
            <div className="vf-docs-header__nav">
              <a
                className="vf-docs-top-link"
                href={getPlaygroundHref(framework.id)}
              >
                Playground mode
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
      <section className="vf-docs-context" aria-label="Reference context">
        <div className="vf-docs-context__selectors">
          <div className="vf-docs-context__field">
            <Label htmlFor="vf-docs-version">Reference version</Label>
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
              Selected framework
            </Text>
            <Heading level={2} size="md">
              {framework.label}
            </Heading>
          </div>
          <div className="vf-docs-context__badges">
            <Badge variant="neutral" tone="subtle">
              {framework.language}
            </Badge>
            <Badge variant="neutral" tone="subtle">
              {framework.renderer}
            </Badge>
            <Badge variant="neutral" tone="subtle">
              {framework.supportLevel}
            </Badge>
            <Badge variant="neutral" tone="subtle">
              Version: {docsVersion.releaseLine} · {docsVersion.version}
            </Badge>
            {releaseLineVersions.map((releaseLine) => (
              <Badge key={releaseLine.id} variant="neutral" tone="subtle">
                {releaseLine.id}: {releaseLine.version}
              </Badge>
            ))}
          </div>
          <Text tone="muted">
            Framework selection changes examples and integration guidance while
            shared contracts, accessibility behavior, and design foundations
            remain VyrnForge-owned.
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
