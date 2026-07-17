import type { ReactNode } from "react";
import { AppShell, Badge, Page, SegmentedControl, Select, TopNav } from "@vyrnforge/ui-components";
import type { PlaygroundRoute } from "./routes";
import { PlaygroundNav } from "./PlaygroundNav";

export type PlaygroundShellProps = {
  activeRoute: PlaygroundRoute;
  activeRouteId: string;
  density: string;
  routes: PlaygroundRoute[];
  onRouteChange: (routeId: string) => void;
  onDensityChange: (density: string) => void;
  onThemeChange: (theme: string) => void;
  theme: string;
  children: ReactNode;
};

export function PlaygroundShell({
  activeRoute,
  activeRouteId,
  children,
  density,
  theme,
  onDensityChange,
  onRouteChange,
  onThemeChange,
  routes
}: PlaygroundShellProps) {
  return (
    <AppShell
      fullHeight
      header={
        <TopNav
          brand={
            <div className="vf-playground-top-brand">
              <span className="vf-playground-brand__mark">D</span>
              <span>VyrnForge UI Playground</span>
            </div>
          }
          actions={
            <div className="vf-playground-top-controls">
              <Select
                aria-label="Playground theme"
                onChange={(event) => onThemeChange(event.currentTarget.value)}
                options={[
                  { label: "Light", value: "light" },
                  { label: "Dark", value: "dark" },
                  { label: "Enterprise", value: "enterprise" },
                  { label: "System", value: "system" }
                ]}
                size="sm"
                value={theme}
              />
              <SegmentedControl
                aria-label="Playground density"
                onChange={onDensityChange}
                options={[
                  { label: "Compact", value: "compact" },
                  { label: "Standard", value: "standard" },
                  { label: "Comfortable", value: "comfortable" }
                ]}
                size="sm"
                value={density}
              />
            </div>
          }
          userArea={<Badge tone="subtle">native-first</Badge>}
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
      sidebarWidth={300}
    >
      <Page
        actions={<Badge variant="success">usage lab</Badge>}
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
