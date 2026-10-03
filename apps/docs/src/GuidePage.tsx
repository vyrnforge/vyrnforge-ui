import {
  Button,
  Heading,
  Inline,
  Stack,
  Text,
} from "@vyrnforge/ui-components";
import type { DocumentationReadinessStatus } from "../../../docs/reference/documentationAvailability";
import {
  docsFrameworks,
  getFramework,
  type DocsFrameworkId,
} from "./docsContext";
import { getMarkdownHeadings, MarkdownView } from "./MarkdownView";
import type { DocsRoute } from "./referenceRoutes";

type GuidePageProps = {
  frameworkId: DocsFrameworkId;
  onFrameworkChange: (frameworkId: DocsFrameworkId) => void;
  onRouteChange: (routeId: string) => void;
  route: DocsRoute;
  status: DocumentationReadinessStatus;
};

const overviewLinks = [
  {
    routeId: "getting-started",
    label: "Install and start",
    description: "Choose a framework surface and add VyrnForge to an application.",
  },
  {
    routeId: "component-reference",
    label: "Browse components",
    description: "Explore usage, API, accessibility, and framework-specific examples.",
  },
  {
    routeId: "theming",
    label: "Customize the system",
    description: "Use shared tokens, themes, density, and portable CSS contracts.",
  },
] as const;

const principles = [
  {
    title: "One product model",
    description:
      "Components, behaviors, accessibility, styling, and terminology stay aligned across every framework surface.",
  },
  {
    title: "Framework-idiomatic surfaces",
    description:
      "Native HTML, React, Angular, and Vue share VyrnForge contracts without forcing one framework's programming model onto another.",
  },
  {
    title: "Built for real applications",
    description:
      "The foundation is modular, themeable, accessible, testable, and designed to scale from small interfaces to enterprise products.",
  },
] as const;

function FrameworkSwitcher({
  frameworkId,
  onFrameworkChange,
}: Pick<GuidePageProps, "frameworkId" | "onFrameworkChange">) {
  return (
    <div className="vf-docs-guide__framework-switcher">
      <Text size="sm" tone="muted">
        Framework surface
      </Text>
      <Inline gap="sm">
        {docsFrameworks.map((framework) => {
          const selected = framework.id === frameworkId;
          return (
            <Button
              aria-pressed={selected}
              key={framework.id}
              onClick={() => onFrameworkChange(framework.id)}
              size="sm"
              variant={selected ? "primary" : "ghost"}
            >
              {framework.label}
            </Button>
          );
        })}
      </Inline>
    </div>
  );
}

function OverviewGuide({
  frameworkId,
  onFrameworkChange,
  onRouteChange,
}: Pick<
  GuidePageProps,
  "frameworkId" | "onFrameworkChange" | "onRouteChange"
>) {
  const framework = getFramework(frameworkId);

  return (
    <>
      <section
        aria-labelledby="vf-guide-overview-start"
        className="vf-docs-guide__section"
      >
        <div className="vf-docs-guide__section-heading">
          <Text className="vf-docs-guide__kicker" size="sm">
            Start with the system
          </Text>
          <Heading id="vf-guide-overview-start" level={3} size="md">
            Move from installation to production UI without changing concepts.
          </Heading>
        </div>
        <div className="vf-docs-guide__link-grid">
          {overviewLinks.map((item) => (
            <button
              className="vf-docs-guide__link-card"
              key={item.routeId}
              onClick={() => onRouteChange(item.routeId)}
              type="button"
            >
              <span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
              <span aria-hidden="true" className="vf-docs-guide__arrow">
                →
              </span>
            </button>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="vf-guide-overview-principles"
        className="vf-docs-guide__section"
      >
        <div className="vf-docs-guide__section-heading">
          <Text className="vf-docs-guide__kicker" size="sm">
            VyrnForge model
          </Text>
          <Heading id="vf-guide-overview-principles" level={3} size="md">
            Shared foundation, first-class framework surfaces.
          </Heading>
        </div>
        <div className="vf-docs-guide__principle-grid">
          {principles.map((principle) => (
            <article className="vf-docs-guide__principle" key={principle.title}>
              <Heading level={4} size="sm">
                {principle.title}
              </Heading>
              <Text tone="muted">{principle.description}</Text>
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="vf-guide-overview-framework"
        className="vf-docs-guide__section vf-docs-guide__section--surface"
      >
        <Stack gap="sm">
          <div className="vf-docs-guide__section-heading">
            <Text className="vf-docs-guide__kicker" size="sm">
              Current context
            </Text>
            <Heading id="vf-guide-overview-framework" level={3} size="md">
              {framework.label}
            </Heading>
            <Text tone="muted">
              {framework.language} · {framework.renderer} ·{" "}
              {framework.supportLevel}
            </Text>
          </div>
          <FrameworkSwitcher
            frameworkId={frameworkId}
            onFrameworkChange={onFrameworkChange}
          />
        </Stack>
      </section>
    </>
  );
}

export function GuidePage({
  frameworkId,
  onFrameworkChange,
  onRouteChange,
  route,
  status,
}: GuidePageProps) {
  const isOverview = route.kind === "overview";
  const markdown = route.content ?? "";
  const headings = isOverview ? [] : getMarkdownHeadings(markdown);
  const framework = getFramework(frameworkId);

  return (
    <main
      className="vf-docs-guide"
      data-document-template="guide"
      data-guide-kind={route.kind}
    >
      <section
        aria-labelledby="vf-docs-guide-title"
        className="vf-docs-guide__hero"
      >
        <div className="vf-docs-guide__hero-copy">
          <div className="vf-docs-guide__meta">
            <span className="vf-docs-guide__eyebrow">VyrnForge guide</span>
            <span aria-label={`Documentation status: ${status}`} className="vf-docs-guide__status">
              {status}
            </span>
          </div>
          <Heading id="vf-docs-guide-title" level={2} size="lg">
            {isOverview
              ? "One UI foundation for every framework surface."
              : route.title}
          </Heading>
          <Text className="vf-docs-guide__lede" size="lg" tone="muted">
            {isOverview
              ? "Build consistent web applications with shared VyrnForge components, tokens, behavior contracts, accessibility, and developer concepts across Native HTML, React, Angular, and Vue."
              : route.description}
          </Text>
          {isOverview ? (
            <Inline className="vf-docs-guide__hero-actions" gap="sm">
              <Button onClick={() => onRouteChange("getting-started")}>
                Get started
              </Button>
              <Button
                onClick={() => onRouteChange("component-reference")}
                variant="subtle"
              >
                Explore components
              </Button>
            </Inline>
          ) : (
            <div className="vf-docs-guide__context-line">
              <Text size="sm" tone="muted">
                Reading for {framework.label}
              </Text>
              <FrameworkSwitcher
                frameworkId={frameworkId}
                onFrameworkChange={onFrameworkChange}
              />
            </div>
          )}
        </div>
      </section>

      {isOverview ? (
        <OverviewGuide
          frameworkId={frameworkId}
          onFrameworkChange={onFrameworkChange}
          onRouteChange={onRouteChange}
        />
      ) : (
        <div className="vf-docs-guide__content-layout">
          <div className="vf-docs-guide__content">
            <MarkdownView markdown={markdown} />
          </div>
          {headings.length > 0 ? (
            <aside aria-label="On this page" className="vf-docs-guide__outline">
              <Text className="vf-docs-guide__outline-title" size="sm">
                On this page
              </Text>
              <nav>
                <ul>
                  {headings.map((heading) => (
                    <li
                      className={`vf-docs-guide__outline-item vf-docs-guide__outline-item--level-${heading.level}`}
                      key={heading.id}
                    >
                      <a href={`#${heading.id}`}>{heading.label}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          ) : null}
        </div>
      )}
    </main>
  );
}
