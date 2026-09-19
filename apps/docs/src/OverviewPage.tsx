import {
  Badge,
  Button,
  Card,
  Heading,
  Inline,
  Stack,
  Text,
} from "@vyrnforge/ui-components";
import {
  docsFrameworks,
  getFramework,
  releaseLineVersions,
  type DocsFrameworkId,
} from "./docsContext";

type OverviewPageProps = {
  frameworkId: DocsFrameworkId;
  onFrameworkChange: (frameworkId: DocsFrameworkId) => void;
  onRouteChange: (routeId: string) => void;
};

const discoveryLinks = [
  {
    routeId: "import-and-setup",
    title: "Get started",
    description:
      "Install VyrnForge, load the shared styles, and choose the framework surface for your application.",
  },
  {
    routeId: "component-reference",
    title: "Components",
    description:
      "Browse components with framework usage, behavior, accessibility, and API details.",
  },
  {
    routeId: "theming-and-styling",
    title: "Theming",
    description:
      "Customize VyrnForge with the shared token and CSS foundation instead of framework-specific styling systems.",
  },
  {
    routeId: "accessibility-standards",
    title: "Accessibility",
    description:
      "Understand shared semantic, keyboard, focus, and assistive-technology expectations.",
  },
  {
    routeId: "package-reference",
    title: "Packages",
    description:
      "Choose the public VyrnForge packages and entry points that fit your application.",
  },
  {
    routeId: "multi-framework-migration-and-limitations",
    title: "Framework support",
    description:
      "See current Native HTML, React, Angular, and Vue support and known limitations.",
  },
] as const;

export function OverviewPage({
  frameworkId,
  onFrameworkChange,
  onRouteChange,
}: OverviewPageProps) {
  const framework = getFramework(frameworkId);

  return (
    <div className="vf-docs-overview">
      <section
        className="vf-docs-overview__hero"
        aria-labelledby="vf-overview-title"
      >
        <Stack gap="lg">
          <div>
            <div className="vf-docs-overview__eyebrow">VyrnForge UI</div>
            <Heading id="vf-overview-title" level={2} size="lg">
              Build consistent application UI across frameworks.
            </Heading>
          </div>
          <Text size="lg" tone="muted" className="vf-docs-overview__lede">
            VyrnForge provides shared components, design tokens, behavior
            contracts, accessibility rules, and styling foundations for Native
            HTML, React, Angular, and Vue.
          </Text>
          <Inline gap="sm" className="vf-docs-overview__actions">
            <Button onClick={() => onRouteChange("import-and-setup")}>
              Get started
            </Button>
            <Button
              variant="subtle"
              onClick={() => onRouteChange("component-reference")}
            >
              Browse components
            </Button>
          </Inline>
        </Stack>
      </section>

      <section
        className="vf-docs-overview__section"
        aria-labelledby="vf-surface-title"
      >
        <Stack gap="md">
          <div>
            <Heading id="vf-surface-title" level={2} size="lg">
              Choose your framework
            </Heading>
            <Text tone="muted">
              The integration syntax changes. The VyrnForge design system,
              semantics, and behavior contracts stay shared.
            </Text>
          </div>
          <div className="vf-docs-overview__framework-grid">
            {docsFrameworks.map((candidate) => {
              const selected = candidate.id === framework.id;
              return (
                <Card
                  className="vf-docs-overview__framework-card"
                  key={candidate.id}
                  padding="md"
                  variant={selected ? "elevated" : "bordered"}
                >
                  <Stack gap="sm">
                    <Inline gap="sm" justify="between" align="center">
                      <Heading level={3} size="md">
                        {candidate.label}
                      </Heading>
                      {selected ? (
                        <Badge variant="info" tone="subtle">
                          Selected
                        </Badge>
                      ) : null}
                    </Inline>
                    <Text size="sm" tone="muted">
                      {candidate.language}
                    </Text>
                    <Inline gap="xs">
                      <Badge size="sm" variant="neutral" tone="subtle">
                        {candidate.renderer}
                      </Badge>
                      <Badge size="sm" variant="neutral" tone="subtle">
                        {candidate.supportLevel}
                      </Badge>
                    </Inline>
                    <Button
                      fullWidth
                      size="sm"
                      variant={selected ? "subtle" : "ghost"}
                      onClick={() => onFrameworkChange(candidate.id)}
                    >
                      {selected ? "Selected" : `Use ${candidate.label}`}
                    </Button>
                  </Stack>
                </Card>
              );
            })}
          </div>
        </Stack>
      </section>

      <section
        className="vf-docs-overview__section"
        aria-labelledby="vf-discover-title"
      >
        <Stack gap="md">
          <div>
            <Heading id="vf-discover-title" level={2} size="lg">
              Documentation
            </Heading>
            <Text tone="muted">
              Start with the common tasks. Internal governance, build evidence,
              and generated machine context are intentionally kept out of the
              reader navigation.
            </Text>
          </div>
          <div className="vf-docs-overview__discovery-grid">
            {discoveryLinks.map((item) => (
              <Card key={item.routeId} padding="md" variant="bordered">
                <Stack gap="sm">
                  <Heading level={3} size="md">
                    {item.title}
                  </Heading>
                  <Text size="sm" tone="muted">
                    {item.description}
                  </Text>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRouteChange(item.routeId)}
                  >
                    Open {item.title}
                  </Button>
                </Stack>
              </Card>
            ))}
          </div>
        </Stack>
      </section>

      <section
        className="vf-docs-overview__section"
        aria-labelledby="vf-release-title"
      >
        <Card padding="md" variant="bordered">
          <Stack gap="md">
            <div>
              <Heading id="vf-release-title" level={2} size="lg">
                Version information
              </Heading>
              <Text tone="muted">
                Package release lines can move independently. Use the version
                selector and package reference when upgrading.
              </Text>
            </div>
            <Inline gap="sm" className="vf-docs-overview__release-lines">
              {releaseLineVersions.map((releaseLine) => (
                <Badge key={releaseLine.id} variant="neutral" tone="subtle">
                  {releaseLine.id} · {releaseLine.version} ·{" "}
                  {releaseLine.channel}
                </Badge>
              ))}
            </Inline>
          </Stack>
        </Card>
      </section>
    </div>
  );
}
