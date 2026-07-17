import { Button, Caption } from "@vyrnforge/ui-components";
import { docsGroups, docsRoutes } from "./docsRegistry";

type DocsNavProps = {
  activeRouteId: string;
  onRouteChange: (routeId: string) => void;
};

export function DocsNav({ activeRouteId, onRouteChange }: DocsNavProps) {
  return (
    <nav className="vf-docs-nav" aria-label="Documentation">
      {docsGroups.map((group) => {
        const routes = docsRoutes.filter((route) => route.group === group);

        if (routes.length === 0) {
          return null;
        }

        return (
          <section className="vf-docs-nav__group" key={group}>
            <Caption className="vf-docs-nav__group-title">{group}</Caption>
            <div className="vf-docs-nav__links">
              {routes.map((route) => (
                <Button
                  aria-current={route.id === activeRouteId ? "page" : undefined}
                  className="vf-docs-nav__link"
                  fullWidth
                  key={route.id}
                  onClick={() => onRouteChange(route.id)}
                  size="sm"
                  variant={route.id === activeRouteId ? "subtle" : "ghost"}
                >
                  {route.title}
                </Button>
              ))}
            </div>
          </section>
        );
      })}
    </nav>
  );
}
