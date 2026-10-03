import { Button, Heading, Inline, Stack, Text } from "@vyrnforge/ui-components";
import type { DocumentationReadinessStatus } from "../../../docs/reference/documentationAvailability";
import {
  docsFrameworks,
  getFramework,
  type DocsFrameworkId,
} from "./docsContext";
import { MarkdownView } from "./MarkdownView";
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
    description:
      "Choose a framework surface and add VyrnForge to an application.",
  },
  {
    routeId: "component-reference",
    label: "Browse components",
    description:
      "Explore usage, API, accessibility, and framework-specific examples.",
  },
  {
    routeId: "executable-examples",
    label: "Run framework examples",
    description:
      "Inspect verified consumer examples for the selected framework surface.",
  },
  {
    routeId: "theming",
    label: "Customize the system",
    description:
      "Use shared tokens, themes, density, and portable CSS contracts.",
  },
] as const;

const principles = [
  {
    title: "One product model",
    description:
      "Components, behaviors, accessibility, styling, and terminology stay " +
      "aligned across every framework surface.",
  },
  {
    title: "Framework-idiomatic surfaces",
    description:
      "Native HTML, React, Angular, and Vue share VyrnForge contracts " +
      "without forcing one framework's programming model onto another.",
  },
  {
    title: "Built for real applications",
    description:
      "The foundation is modular, themeable, accessible, testable, and " +
      "designed to scale from small interfaces to enterprise products.",
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
        <div className="vf-docs-guide__surface-layout">
          <div className="vf-docs-guide__section-heading">
            <Text className="vf-docs-guide__kicker" size="sm">
              Current surface
            </Text>
            <Heading id="vf-guide-overview-framework" level={3} size="md">
              {framework.label}
            </Heading>
            <Text tone="muted">
              {framework.language} · {framework.renderer} ·{" "}
              {framework.supportLevel}
            </Text>
            <Text tone="muted">
              The selected framework changes examples and integration guidance,
              not the VyrnForge design system or behavior model.
            </Text>
          </div>
          <FrameworkSwitcher
            frameworkId={frameworkId}
            onFrameworkChange={onFrameworkChange}
          />
        </div>
      </section>
    </>
  );
}

type GuideSection = {
  body: string;
  id: string;
  title: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
}

function withoutDuplicateTitle(markdown: string, title: string) {
  const lines = markdown.split(/\r?\n/u);
  if (lines[0]?.trim() === `# ${title}`) {
    return lines.slice(1).join("\n").replace(/^\s+/u, "");
  }
  return markdown;
}

function splitGuideSections(markdown: string) {
  const intro: string[] = [];
  const sections: GuideSection[] = [];
  let current: GuideSection | null = null;

  for (const line of markdown.split(/\r?\n/u)) {
    const heading = /^##\s+(.*)$/u.exec(line);
    if (heading) {
      if (current) {
        current.body = current.body.trim();
        sections.push(current);
      }
      current = {
        body: "",
        id: slugify(heading[1]),
        title: heading[1],
      };
      continue;
    }

    if (current) {
      current.body += `${line}\n`;
    } else {
      intro.push(line);
    }
  }

  if (current) {
    current.body = current.body.trim();
    sections.push(current);
  }

  return { intro: intro.join("\n").trim(), sections };
}

function GuideDocument({ markdown }: { markdown: string }) {
  const { intro, sections } = splitGuideSections(markdown);

  return (
    <div className="vf-docs-guide__document">
      {sections.length > 0 ? (
        <nav aria-label="On this page" className="vf-docs-guide__outline">
          <Text className="vf-docs-guide__kicker" size="sm">
            On this page
          </Text>
          <ol>
            {sections.map((section, index) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="vf-docs-guide__content">
        {intro ? (
          <MarkdownView className="vf-docs-guide__prose" markdown={intro} />
        ) : null}
        {sections.map((section, index) => (
          <section
            className="vf-docs-guide__document-section"
            id={section.id}
            key={section.id}
          >
            <div className="vf-docs-guide__document-heading">
              <span className="vf-docs-guide__document-step">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Heading level={3} size="md">
                {section.title}
              </Heading>
            </div>
            <MarkdownView
              className="vf-docs-guide__prose"
              markdown={section.body}
            />
          </section>
        ))}
      </div>
    </div>
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
  const markdown = withoutDuplicateTitle(route.content ?? "", route.title);
  const framework = getFramework(frameworkId);

  return (
    <article
      className="vf-docs-guide"
      data-document-template="guide"
      data-guide-kind={route.kind}
    >
      <section
        aria-labelledby="vf-docs-guide-title"
        className="vf-docs-guide__hero"
      >
        <div className="vf-docs-guide__hero-layout">
          <div className="vf-docs-guide__hero-copy">
            <div className="vf-docs-guide__meta">
              <span className="vf-docs-guide__eyebrow">VyrnForge guide</span>
              <span
                aria-label={`Documentation status: ${status}`}
                className="vf-docs-guide__status"
              >
                {status}
              </span>
            </div>
            <Heading id="vf-docs-guide-title" level={2} size="lg">
              {isOverview
                ? "Build once. Stay native to every framework."
                : route.title}
            </Heading>
            <Text className="vf-docs-guide__lede" size="lg" tone="muted">
              {isOverview
                ? "One VyrnForge system for components, tokens, behavior, " +
                  "accessibility, and developer concepts — delivered through " +
                  "first-class Native HTML, React, Angular, and Vue surfaces."
                : route.description}
            </Text>
            {isOverview ? (
              <Inline className="vf-docs-guide__hero-actions" gap="sm">
                <Button onClick={() => onRouteChange("getting-started")}>
                  Start building
                </Button>
                <Button
                  onClick={() => onRouteChange("component-reference")}
                  variant="subtle"
                >
                  Browse components
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
          {isOverview ? (
            <aside
              aria-label="Selected framework surface"
              className="vf-docs-guide__hero-context"
            >
              <Text className="vf-docs-guide__kicker" size="sm">
                Selected surface
              </Text>
              <Heading level={3} size="md">
                {framework.label}
              </Heading>
              <Text tone="muted">
                {framework.language} · {framework.renderer}
              </Text>
              <Text size="sm" tone="muted">
                {framework.supportLevel}
              </Text>
              <FrameworkSwitcher
                frameworkId={frameworkId}
                onFrameworkChange={onFrameworkChange}
              />
            </aside>
          ) : null}
        </div>
      </section>

      {isOverview ? (
        <OverviewGuide
          frameworkId={frameworkId}
          onFrameworkChange={onFrameworkChange}
          onRouteChange={onRouteChange}
        />
      ) : (
        <GuideDocument markdown={markdown} />
      )}
    </article>
  );
}
