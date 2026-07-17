import { useEffect, useMemo, useState } from "react";
import { Button } from "@vyrnforge/ui-components";
import { getRouteById } from "./docsRegistry";
import { DocsShell } from "./DocsShell";

function getHashRoute() {
  return window.location.hash.replace(/^#\/?/, "") || "overview";
}

export default function App() {
  const [activeRouteId, setActiveRouteId] = useState(getHashRoute);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const handleHashChange = () => setActiveRouteId(getHashRoute());

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const activeRoute = useMemo(
    () => getRouteById(activeRouteId),
    [activeRouteId]
  );

  const handleRouteChange = (routeId: string) => {
    window.location.hash = `/${routeId}`;
    setActiveRouteId(routeId);
  };

  return (
    <div className="vf-docs-app" data-theme={theme}>
      <DocsShell
        activeRoute={activeRoute}
        headerAction={
          <Button
            size="sm"
            variant="subtle"
            onClick={() =>
              setTheme((currentTheme) =>
                currentTheme === "light" ? "dark" : "light"
              )
            }
          >
            {theme === "light" ? "Dark" : "Light"}
          </Button>
        }
        onRouteChange={handleRouteChange}
      />
    </div>
  );
}
