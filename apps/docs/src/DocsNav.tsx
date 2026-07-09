import { Badge } from "@dravyn/ui-components";
import { docsGroups, docsRoutes } from "./docsRegistry";

type DocsNavProps = {
  activeRouteId: string;
  onRouteChange: (routeId: string) => void;
};

export function DocsNav({ activeRouteId, onRouteChange }: DocsNavProps) {
  return (
    <nav className="docs-nav" aria-label="Documentation">
      {docsGroups.map((group) => {
        const routes = docsRoutes.filter((route) => route.group === group);

        if (routes.length === 0) {
          return null;
        }

        return (
          <section className="docs-nav__group" key={group}>
            <div className="docs-nav__group-title">{group}</div>
            <div className="docs-nav__links">
              {routes.map((route) => (
                <button
                  aria-current={route.id === activeRouteId ? "page" : undefined}
                  className="docs-nav__link"
                  key={route.id}
                  onClick={() => onRouteChange(route.id)}
                  type="button"
                >
                  <span>{route.title}</span>
                  {route.canonical && (
                    <Badge size="sm" tone="subtle" variant="success">
                      Canonical
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </nav>
  );
}
