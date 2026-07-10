import { SideNav, type SideNavItem } from "@dravyn/ui-components";
import type { PlaygroundRoute } from "./routes";

export type PlaygroundNavProps = {
  activeRouteId: string;
  routes: PlaygroundRoute[];
  onRouteChange: (routeId: string) => void;
};

export function PlaygroundNav({
  activeRouteId,
  routes,
  onRouteChange
}: PlaygroundNavProps) {
  const items: SideNavItem[] = routes.map((route) => ({
    id: route.id,
    label: route.label,
    active: route.id === activeRouteId,
    badge: route.group === "Data Grid" ? "Grid" : undefined,
    onSelect: () => onRouteChange(route.id)
  }));

  return (
    <SideNav
      aria-label="Playground sections"
      className="playground-nav"
      header={
        <div className="playground-brand">
          <span className="playground-brand__mark">D</span>
          <div>
            <strong>Dravyn UI</strong>
            <span>Playground</span>
          </div>
        </div>
      }
      items={items}
    />
  );
}
