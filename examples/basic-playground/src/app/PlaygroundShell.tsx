import type { ReactNode } from "react";
import {
  AppShell,
  Badge,
  Page,
  SegmentedControl,
  Select,
  TopNav,
} from "@vyrnforge/ui-components";
import type { PlaygroundRoute } from "./routes";
import { playgroundLinks } from "./deploymentLinks";
import {
  playgroundFrameworks,
  playgroundVersions,
  type PlaygroundFrameworkId,
} from "./playgroundContext";
import { PlaygroundNav } from "./PlaygroundNav";

export type PlaygroundShellProps = {
  activeRoute: PlaygroundRoute;
  activeRouteId: string;
  density: string;
  frameworkId: PlaygroundFrameworkId;
  routes: PlaygroundRoute[];
  versionId: string;
  onRouteChange: (routeId: string) => void;
  onDensityChange: (density: string) => void;
  onFrameworkChange: (frameworkId: PlaygroundFrameworkId) => void;
  onThemeChange: (theme: string) => void;
  onVersionChange: (versionId: string) => void;
  theme: string;
  children: ReactNode;
};

export function PlaygroundShell({
  activeRoute,
  activeRouteId,
  children,
  density,
  frameworkId,
  theme,
  versionId,
  onDensityChange,
  onFrameworkChange,
  onRouteChange,
  onThemeChange,
  onVersionChange,
  routes,
}: PlaygroundShellProps) {
  const selectedFramework = playgroundFrameworks.find(
    (framework) => framework.id === frameworkId,
  );
  const selectedVersion = playgroundVersions.find(
    (version) => version.id === versionId,
  );

  return (
    <AppShell
      fullHeight
      header={
        <TopNav
          brand={
            <div className="vf-playground-top-brand">
              <span className="vf-playground-brand__mark" aria-hidden="true">
                V
              </span>
              <span className="vf-playground-brand__copy">
                <strong>VyrnForge</strong>
                <span>UI Reference</span>
              </span>
            </div>
          }
          actions={
            <div className="vf-playground-top-controls">
              <Select
                aria-label="VyrnForge release line"
                onChange={(event) => onVersionChange(event.currentTarget.value)}
                options={playgroundVersions.map((version) => ({
                  label: version.label,
                  value: version.id,
                }))}
                size="sm"
                value={versionId}
              />
              <Select
                aria-label="Framework"
                onChange={(event) =>
                  onFrameworkChange(
                    event.currentTarget.value as PlaygroundFrameworkId,
                  )
                }
                options={playgroundFrameworks.map((framework) => ({
                  label: framework.label,
                  value: framework.id,
                }))}
                size="sm"
                value={frameworkId}
              />
              <div className="vf-playground-top-links">
                <a
                  className="vf-playground-top-link"
                  href={playgroundLinks.repository}
                >
                  GitHub
                </a>
              </div>
              <Select
                aria-label="Reference theme"
                onChange={(event) => onThemeChange(event.currentTarget.value)}
                options={[
                  { label: "Light", value: "light" },
                  { label: "Dark", value: "dark" },
                  { label: "Enterprise", value: "enterprise" },
                  { label: "System", value: "system" },
                ]}
                size="sm"
                value={theme}
              />
              <SegmentedControl
                aria-label="Reference density"
                onChange={onDensityChange}
                options={[
                  { label: "Compact", value: "compact" },
                  { label: "Standard", value: "standard" },
                  { label: "Comfortable", value: "comfortable" },
                ]}
                size="sm"
                value={density}
              />
            </div>
          }
          userArea={
            <Badge tone="subtle">
              {selectedFramework?.label ?? frameworkId} ·{" "}
              {selectedVersion?.channel ?? "current"}
            </Badge>
          }
        />
      }
      data-density={density}
      data-theme={theme}
      headerPosition="sticky"
      scrollMode="content"
      sidebar={
        <PlaygroundNav
          activeRouteId={activeRouteId}
          routes={routes}
          onRouteChange={onRouteChange}
        />
      }
      sidebarPosition="sticky"
      sidebarWidth={284}
    >
      <Page
        actions={
          <div className="vf-playground-page-context">
            <Badge tone="subtle">
              {selectedFramework?.label ?? frameworkId}
            </Badge>
            <Badge tone="subtle">{selectedVersion?.version ?? versionId}</Badge>
          </div>
        }
        description={activeRoute.gallery ? undefined : activeRoute.description}
        eyebrow={activeRoute.group}
        maxWidth="xl"
        title={activeRoute.gallery ? undefined : activeRoute.title}
      >
        {children}
      </Page>
    </AppShell>
  );
}
