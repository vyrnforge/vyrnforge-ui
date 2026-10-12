import { Heading, Text } from "@vyrnforge/ui-components";
import { MarkdownView } from "./MarkdownView";
import type { DocsRoute } from "./referenceRoutes";

type GuidePageProps = {
  onRouteChange: (routeId: string) => void;
  route: DocsRoute;
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

function OverviewGuide({
  onRouteChange,
}: Pick<GuidePageProps, "onRouteChange">) {
  return (
    <div className="vf-docs-landing">
      <section
        aria-labelledby="vf-guide-overview-start"
        className="vf-docs-content-section"
      >
        <div className="vf-docs-content-section__heading">
          <Text className="vf-docs-content-kicker" size="sm">
            Start with the system
          </Text>
          <Heading id="vf-guide-overview-start" level={3} size="md">
            Move from installation to production UI without changing concepts.
          </Heading>
        </div>
        <div className="vf-docs-link-grid">
          {overviewLinks.map((item) => (
            <button
              className="vf-docs-link-card"
              key={item.routeId}
              onClick={() => onRouteChange(item.routeId)}
              type="button"
            >
              <span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
              <span aria-hidden="true" className="vf-docs-link-card__arrow">
                →
              </span>
            </button>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="vf-guide-overview-principles"
        className="vf-docs-content-section"
      >
        <div className="vf-docs-content-section__heading">
          <Text className="vf-docs-content-kicker" size="sm">
            VyrnForge model
          </Text>
          <Heading id="vf-guide-overview-principles" level={3} size="md">
            Shared foundation, first-class framework surfaces.
          </Heading>
        </div>
        <div className="vf-docs-principle-grid">
          {principles.map((principle) => (
            <article className="vf-docs-principle" key={principle.title}>
              <Heading level={4} size="sm">
                {principle.title}
              </Heading>
              <Text tone="muted">{principle.description}</Text>
            </article>
          ))}
        </div>
      </section>
    </div>
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
    <div className="vf-docs-reading-layout">
      {sections.length > 0 ? (
        <nav aria-label="On this page" className="vf-docs-reading-outline">
          <Text className="vf-docs-content-kicker" size="sm">
            On this page
          </Text>
          <ol>
            {sections.map((section, index) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>
                  <span className="vf-docs-reading-outline__step">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{section.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="vf-docs-reading-content">
        {intro ? (
          <MarkdownView className="vf-docs-reading-prose" markdown={intro} />
        ) : null}
        {sections.map((section, index) => (
          <section
            className="vf-docs-reading-section"
            id={section.id}
            key={section.id}
          >
            <div className="vf-docs-reading-section__heading">
              <span className="vf-docs-reading-section__step">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Heading level={3} size="md">
                {section.title}
              </Heading>
            </div>
            <MarkdownView
              className="vf-docs-reading-prose"
              markdown={section.body}
            />
          </section>
        ))}
      </div>
    </div>
  );
}

export function GuidePage({ onRouteChange, route }: GuidePageProps) {
  if (route.kind === "overview") {
    return <OverviewGuide onRouteChange={onRouteChange} />;
  }

  return (
    <GuideDocument
      markdown={withoutDuplicateTitle(route.content ?? "", route.title)}
    />
  );
}
