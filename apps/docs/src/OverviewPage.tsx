import {
  Button,
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

const startLinks = [
  {
    routeId: "getting-started",
    title: "Install and start",
    description: "Choose your framework and add VyrnForge to an application.",
  },
  {
    routeId: "component-reference",
    title: "Browse components",
    description: "See usage, API, accessibility, and framework examples.",
  },
  {
    routeId: "theming",
    title: "Customize the UI",
    description: "Use shared tokens, themes, density, and CSS.",
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
            <Heading id="vf-overview-title" level={2} size="lg">
              One UI foundation. Four framework surfaces.
            </Heading>
            <Text size="lg" tone="muted" className="vf-docs-overview__lede">
              Build consistent web applications with shared components, tokens,
              behavior, and accessibility across Native HTML, React, Angular,
              and Vue.
            </Text>
          </div>
          <Inline gap="sm" className="vf-docs-overview__actions">
            <Button onClick={() => onRouteChange("getting-started")}>
              Get started
            </Button>
            <Button
              variant="subtle"
              onClick={() => onRouteChange("component-reference")}
            >
              Components
            </Button>
          </Inline>
        </Stack>
      </section>

      <section
        className="vf-docs-overview__section"
        aria-labelledby="vf-framework-title"
      >
        <Stack gap="sm">
          <div>
            <Heading id="vf-framework-title" level={2} size="md">
              Framework
            </Heading>
            <Text tone="muted">
              Switch syntax without switching the VyrnForge design system.
            </Text>
          </div>
          <Inline gap="sm" className="vf-docs-overview__frameworks">
            {docsFrameworks.map((candidate) => {
              const selected = candidate.id === framework.id;
              return (
                <Button
                  key={candidate.id}
                  size="sm"
                  variant={selected ? "primary" : "ghost"}
                  onClick={() => onFrameworkChange(candidate.id)}
                  aria-pressed={selected}
                >
                  {candidate.label}
                </Button>
              );
            })}
          </Inline>
        </Stack>
      </section>

      <section
        className="vf-docs-overview__section"
        aria-labelledby="vf-start-title"
      >
        <Stack gap="sm">
          <Heading id="vf-start-title" level={2} size="md">
            Start here
          </Heading>
          <div className="vf-docs-overview__start-list">
            {startLinks.map((item) => (
              <button
                className="vf-docs-overview__start-link"
                key={item.routeId}
                type="button"
                onClick={() => onRouteChange(item.routeId)}
              >
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
                <span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </Stack>
      </section>
    </div>
  );
}
