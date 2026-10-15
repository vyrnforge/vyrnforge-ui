import {
  Badge,
  Button,
  Heading,
  Inline,
  Stack,
  Text,
} from "@vyrnforge/ui-components";
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
    <Stack gap="lg">
      <Inline
        align="center"
        aria-label="Advanced module context"
        gap="sm"
        wrap
      >
        <Badge size="sm" tone="subtle">
          Advanced module
        </Badge>
        <Text size="sm" tone="muted">
          {frameworkId} · {version} · {status}
        </Text>
      </Inline>

      <MarkdownView markdown={route.content ?? ""} />

      {relatedRoutes.length > 0 ? (
        <section
          aria-labelledby="vf-docs-advanced-module-examples"
          className="vf-docs-advanced-module__examples"
        >
          <Stack gap="lg">
            <Stack gap="xs">
              <Heading id="vf-docs-advanced-module-examples" level={3} size="md">
                Module examples
              </Heading>
              <Text tone="muted">Available in the selected context.</Text>
            </Stack>
            <Inline gap="sm" wrap>
              {relatedRoutes.map((candidate) => (
                <Button
                  key={candidate.id}
                  onClick={() => onRouteChange(candidate.id)}
                  variant="subtle"
                >
                  {candidate.title}
                </Button>
              ))}
            </Inline>
          </Stack>
        </section>
      ) : null}
    </Stack>
  );
}
