import { Button, Heading, Text } from "@vyrnforge/ui-components";
import type { DocumentationReadinessStatus } from "../../../docs/reference/documentationAvailability";
import { getFramework, type DocsFrameworkId } from "./docsContext";
import { MarkdownView } from "./MarkdownView";

type GuidePageProps = {
  description?: string;
  frameworkId: DocsFrameworkId;
  markdown: string;
  onRouteChange: (routeId: string) => void;
  status: DocumentationReadinessStatus;
  title: string;
};

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

function parseGuide(markdown: string) {
  const lines = markdown.split(/\r?\n/u);
  const summary: string[] = [];
  const sections: GuideSection[] = [];
  let current: GuideSection | null = null;

  for (const line of lines) {
    if (/^#\s+/u.test(line)) {
      continue;
    }

    const sectionMatch = /^##\s+(.*)$/u.exec(line);
    if (sectionMatch) {
      if (current) {
        current.body = current.body.trim();
        sections.push(current);
      }
      current = {
        body: "",
        id: slugify(sectionMatch[1]),
        title: sectionMatch[1],
      };
      continue;
    }

    if (current) {
      current.body += `${line}\n`;
    } else {
      summary.push(line);
    }
  }

  if (current) {
    current.body = current.body.trim();
    sections.push(current);
  }

  return {
    summary: summary.join("\n").trim(),
    sections,
  };
}

function frameworkSectionTitle(frameworkId: DocsFrameworkId) {
  switch (frameworkId) {
    case "native-html":
      return "Native HTML / Custom Elements";
    case "react":
      return "React";
    case "angular":
      return "Angular";
    case "vue":
      return "Vue";
  }
}

export function GuidePage({
  description,
  frameworkId,
  markdown,
  onRouteChange,
  status,
  title,
}: GuidePageProps) {
  const framework = getFramework(frameworkId);
  const parsed = parseGuide(markdown);
  const selectedTitle = frameworkSectionTitle(frameworkId);
  const selectedSection = parsed.sections.find(
    (section) => section.title === selectedTitle,
  );
  const remainingSections = parsed.sections.filter(
    (section) => section !== selectedSection,
  );
  const orderedSections = selectedSection
    ? [selectedSection, ...remainingSections]
    : parsed.sections;

  return (
    <main
      className="vf-docs-guide"
      data-document-template="guide"
      data-guide-framework={frameworkId}
    >
      <header className="vf-docs-guide__hero">
        <div className="vf-docs-guide__hero-copy">
          <div className="vf-docs-guide__eyebrow">
            Guide · {framework.label}
          </div>
          <Heading level={1} size="lg">
            {title}
          </Heading>
          {description ? (
            <Text className="vf-docs-guide__lede" size="lg" tone="muted">
              {description}
            </Text>
          ) : null}
          {parsed.summary ? (
            <MarkdownView
              className="vf-docs-guide__summary"
              markdown={parsed.summary}
              surface="bare"
            />
          ) : null}
          <div className="vf-docs-guide__actions">
            <Button onClick={() => onRouteChange("component-reference")}>
              Browse components
            </Button>
            <Button
              variant="subtle"
              onClick={() => onRouteChange("executable-examples")}
            >
              Framework examples
            </Button>
          </div>
        </div>

        <aside className="vf-docs-guide__context" aria-label="Guide context">
          <div className="vf-docs-guide__context-label">Selected surface</div>
          <strong>{framework.label}</strong>
          <span>Documentation status: {status}</span>
          <span>Shared VyrnForge contracts, idiomatic framework API.</span>
        </aside>
      </header>

      <div className="vf-docs-guide__layout">
        <nav className="vf-docs-guide__outline" aria-label="On this page">
          <span className="vf-docs-guide__outline-title">On this page</span>
          <ol>
            {orderedSections.map((section, index) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="vf-docs-guide__content">
          {orderedSections.map((section, index) => {
            const selected = section === selectedSection;
            return (
              <section
                className="vf-docs-guide__section"
                data-selected-framework={selected || undefined}
                id={section.id}
                key={section.id}
              >
                <div className="vf-docs-guide__section-heading">
                  <span className="vf-docs-guide__step">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    {selected ? (
                      <span className="vf-docs-guide__selected">
                        Your selected surface
                      </span>
                    ) : null}
                    <Heading level={2} size="md">
                      {section.title}
                    </Heading>
                  </div>
                </div>
                <MarkdownView markdown={section.body} surface="bare" />
              </section>
            );
          })}

          <section className="vf-docs-guide__next">
            <div>
              <span className="vf-docs-guide__selected">Ready to build</span>
              <Heading level={2} size="md">
                Continue with the verified reference
              </Heading>
              <Text tone="muted">
                Move from setup to component APIs and runnable framework
                examples without leaving the selected framework context.
              </Text>
            </div>
            <div className="vf-docs-guide__actions">
              <Button onClick={() => onRouteChange("component-reference")}>
                Open component reference
              </Button>
              <Button variant="subtle" onClick={() => onRouteChange("theming")}>
                Theming & styling
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
