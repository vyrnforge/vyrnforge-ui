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
  type DocsFrameworkId,
} from "./docsContext";

type OverviewPageProps = {
  frameworkId: DocsFrameworkId;
  onFrameworkChange: (frameworkId: DocsFrameworkId) => void;
  onRouteChange: (routeId: string) => void;
};

const discoveryLinks = [
  {
    routeId: "getting-started",
    title: "Getting Started",
    description: "Install VyrnForge and choose your framework.",
  },
  {
    routeId: "component-reference",
    title: "Components",
    description: "Browse components, usage, API, and accessibility.",
  },
  {
    routeId: "theming",
    title: "Theming & Styling",
    description: "Customize shared tokens, themes, density, and CSS.",
  },
  {
    routeId: "accessibility",
    title: "Accessibility",
    description:
      "Build with the shared keyboard, focus, and semantic baseline.",
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
              Build with one UI foundation.
            </Heading>
          </div>
          <Text size="lg" tone="muted" className="vf-docs-overview__lede">
            Shared components, design tokens, behavior, and accessibility for
            Native HTML, React, Angular, and Vue.
          </Text>
          <Inline gap="sm" className="vf-docs-overview__actions">
            <Button onClick={() => onRouteChange("getting-started")}>
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
              The integration syntax changes. The VyrnForge design system and
              behavior model do not.
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
              Find what you need
            </Heading>
            <Text tone="muted">
              Start with the common paths. Internal project machinery stays out
              of the way.
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
    </div>
  );
}
