import type { PlaygroundRoute } from "./routes";
import { routeGroups } from "./routes";

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
  return (
    <nav aria-label="Playground sections" className="playground-nav">
      <div className="playground-brand">
        <span className="playground-brand__mark">D</span>
        <div>
          <strong>Dravyn UI</strong>
          <span>Playground</span>
        </div>
      </div>
      {routeGroups.map((group) => (
        <div className="playground-nav__group" key={group}>
          <div className="playground-nav__label">{group}</div>
          {routes
            .filter((route) => route.group === group)
            .map((route) => (
              <button
                aria-current={route.id === activeRouteId ? "page" : undefined}
                className={route.id === activeRouteId ? "is-active" : undefined}
                key={route.id}
                type="button"
                onClick={() => onRouteChange(route.id)}
              >
                {route.label}
              </button>
            ))}
        </div>
      ))}
    </nav>
  );
}
