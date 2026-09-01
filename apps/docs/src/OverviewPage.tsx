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
    routeId: "component-reference",
    title: "Components",
    description:
      "Browse generated multi-framework usage alongside framework-neutral contracts.",
  },
  {
    routeId: "package-reference",
    title: "Packages",
    description:
      "Understand package responsibilities without exposing internal topology as the consumer model.",
  },
  {
    routeId: "theming-and-styling",
    title: "Theming & tokens",
    description:
      "Use shared semantic tokens, density, typography, surfaces, states, and theme contracts.",
  },
  {
    routeId: "accessibility-standards",
    title: "Accessibility",
    description:
      "Review the keyboard, focus, semantic, and assistive-technology baseline shared across surfaces.",
  },
  {
    routeId: "multi-framework-decision",
    title: "Architecture",
    description:
      "See how canonical contracts and renderer boundaries support all four first-class web surfaces.",
  },
  {
    routeId: "multi-framework-program-gates",
    title: "Support evidence",
    description:
      "Check active program gates before interpreting framework support as release-ready distribution.",
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
      <section className="vf-docs-overview__hero" aria-labelledby="vf-overview-title">
        <Stack gap="lg">
          <div>
            <div className="vf-docs-overview__eyebrow">VyrnForge UI</div>
            <Heading id="vf-overview-title" level={2} size="lg">
              One UI foundation. Four first-class web surfaces.
            </Heading>
          </div>
          <Text size="lg" tone="muted" className="vf-docs-overview__lede">
            Build enterprise web applications with shared design tokens, behavior
            contracts, accessibility rules, component semantics, and release
            evidence across Native HTML, React, Angular, and Vue.
          </Text>
          <Inline gap="sm" className="vf-docs-overview__actions">
            <Button onClick={() => onRouteChange("component-reference")}>
              Explore components
            </Button>
            <Button
              variant="subtle"
              onClick={() => onRouteChange("multi-framework-decision")}
            >
              Read architecture
            </Button>
          </Inline>
        </Stack>
      </section>

      <section className="vf-docs-overview__section" aria-labelledby="vf-surface-title">
        <Stack gap="md">
          <div>
            <Heading id="vf-surface-title" level={2} size="lg">
              Choose your surface
            </Heading>
            <Text tone="muted">
              The framework changes the integration syntax, not the VyrnForge
              design system or behavior model.
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
                    <Text size="sm">{candidate.guidance}</Text>
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
                      {selected ? "Using this surface" : `Use ${candidate.label}`}
                    </Button>
                  </Stack>
                </Card>
              );
            })}
          </div>
        </Stack>
      </section>

      <section className="vf-docs-overview__section" aria-labelledby="vf-discover-title">
        <Stack gap="md">
          <div>
            <Heading id="vf-discover-title" level={2} size="lg">
              Explore the foundation
            </Heading>
            <Text tone="muted">
              Start from reusable VyrnForge capabilities before creating custom
              application UI.
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

      <section className="vf-docs-overview__section" aria-labelledby="vf-release-title">
        <Card padding="md" variant="bordered">
          <Stack gap="md">
            <div>
              <Heading id="vf-release-title" level={2} size="lg">
                Release lines stay explicit
              </Heading>
              <Text tone="muted">
                VyrnForge does not pretend every package shares one global
                version. Documentation and release context are derived from
                canonical release metadata.
              </Text>
            </div>
            <Inline gap="sm" className="vf-docs-overview__release-lines">
              {releaseLineVersions.map((releaseLine) => (
                <Badge key={releaseLine.id} variant="neutral" tone="subtle">
                  {releaseLine.id} · {releaseLine.version} · {releaseLine.channel}
                </Badge>
              ))}
            </Inline>
          </Stack>
        </Card>
      </section>
    </div>
  );
}
