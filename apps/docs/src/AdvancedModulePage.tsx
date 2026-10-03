import { Badge, Button, Heading, Text } from "@vyrnforge/ui-components";
import { isDocumentationReady, type DocsFrameworkId } from "./docsContext";
import { MarkdownView } from "./MarkdownView";
import {
  docsRoutes,
  type DocsRoute,
  type DocsRouteResolution,
} from "./referenceRoutes";

type AdvancedModulePageProps = {
  frameworkId: DocsFrameworkId;
  onRouteChange: (routeId: string) => void;
  route: DocsRoute;
  status: DocsRouteResolution["status"];
  version: string;
};

export function AdvancedModulePage({
  frameworkId,
  onRouteChange,
  route,
  status,
  version,
}: AdvancedModulePageProps) {
  const relatedRoutes = docsRoutes
    .filter(
      (candidate) =>
        candidate.section === route.section &&
        candidate.id !== route.id &&
        candidate.availability.some(
          (entry) =>
            entry.framework === frameworkId &&
            entry.version === version &&
            isDocumentationReady(entry.status),
        ),
    )
    .sort((left, right) => left.order - right.order);

  return (
    <div className="vf-docs-advanced-module">
      <div
        aria-label="Advanced module context"
        className="vf-docs-advanced-module__context"
      >
        <Badge size="sm" tone="subtle">
          Advanced module
        </Badge>
        <Text size="sm" tone="muted">
          {frameworkId} · {version} · {status}
        </Text>
      </div>

      <MarkdownView markdown={route.content ?? ""} />

      {relatedRoutes.length > 0 ? (
        <section
          aria-labelledby="vf-docs-advanced-module-examples"
          className="vf-docs-advanced-module__examples"
        >
          <div className="vf-docs-advanced-module__examples-heading">
            <Heading id="vf-docs-advanced-module-examples" level={3} size="md">
              Module examples
            </Heading>
            <Text tone="muted">Available in the selected context.</Text>
          </div>
          <div className="vf-docs-advanced-module__example-list">
            {relatedRoutes.map((candidate) => (
              <Button
                key={candidate.id}
                onClick={() => onRouteChange(candidate.id)}
                variant="subtle"
              >
                {candidate.title}
              </Button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
