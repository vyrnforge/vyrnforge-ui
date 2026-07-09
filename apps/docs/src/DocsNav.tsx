import { Button, Caption } from "@dravyn/ui-components";
import { docsGroups, docsRoutes } from "./docsRegistry";

type DocsNavProps = {
  activeRouteId: string;
  onRouteChange: (routeId: string) => void;
};

export function DocsNav({ activeRouteId, onRouteChange }: DocsNavProps) {
  return (
    <nav className="dv-docs-nav" aria-label="Documentation">
      {docsGroups.map((group) => {
        const routes = docsRoutes.filter((route) => route.group === group);

        if (routes.length === 0) {
          return null;
        }

        return (
          <section className="dv-docs-nav__group" key={group}>
            <Caption className="dv-docs-nav__group-title">{group}</Caption>
            <div className="dv-docs-nav__links">
              {routes.map((route) => (
                <Button
                  aria-current={route.id === activeRouteId ? "page" : undefined}
                  className="dv-docs-nav__link"
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
