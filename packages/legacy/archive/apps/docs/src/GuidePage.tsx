import {
  Button,
  Card,
  Heading,
  Section,
  Stack,
  Text,
} from "@vyrnforge/ui-components";
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
    <Stack className="vf-docs-landing" gap="xl">
      <Section
        description="Choose the next task using the same components and interaction patterns available to consuming applications."
        title="Move from installation to production UI without changing concepts."
      >
        <div className="vf-docs-link-grid">
          {overviewLinks.map((item) => (
            <Card key={item.routeId} padding="md" variant="bordered">
              <Stack gap="sm">
                <Heading level={3} size="sm">
                  {item.label}
                </Heading>
                <Text tone="muted">{item.description}</Text>
                <div>
                  <Button
                    onClick={() => onRouteChange(item.routeId)}
                    rightSlot={<span aria-hidden="true">→</span>}
                    size="sm"
                    variant="subtle"
                  >
                    Open
                  </Button>
                </div>
              </Stack>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        description="The same contracts, tokens, accessibility model, and terminology carry across each supported surface."
        title="Shared foundation, first-class framework surfaces."
      >
        <div className="vf-docs-principle-grid">
          {principles.map((principle) => (
            <Card key={principle.title} padding="md" variant="bordered">
              <Stack gap="sm">
                <Heading level={3} size="sm">
                  {principle.title}
                </Heading>
                <Text tone="muted">{principle.description}</Text>
              </Stack>
            </Card>
          ))}
        </div>
      </Section>
    </Stack>
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

function guideContent(route: DocsRoute) {
  return splitGuideSections(
    withoutDuplicateTitle(route.content ?? "", route.title),
  );
}

export function hasGuideOutline(route: DocsRoute) {
  return route.kind === "markdown" && guideContent(route).sections.length > 0;
}

export function GuidePageOutline({ route }: Pick<GuidePageProps, "route">) {
  const { sections } = guideContent(route);
  if (sections.length === 0) return null;

  return (
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
  );
}

function GuideDocument({ route }: Pick<GuidePageProps, "route">) {
  const { intro, sections } = guideContent(route);

  return (
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
  );
}

export function GuidePage({ onRouteChange, route }: GuidePageProps) {
  if (route.kind === "overview") {
    return <OverviewGuide onRouteChange={onRouteChange} />;
  }

  return <GuideDocument route={route} />;
}
