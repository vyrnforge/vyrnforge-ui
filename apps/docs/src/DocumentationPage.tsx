import type { ReactNode } from "react";
import { Card, Heading, PageHeader, Text } from "@vyrnforge/ui-components";

export type DocumentationSection = {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
};

export type DocumentationPageProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  status?: ReactNode;
  sections: DocumentationSection[];
};

export function DocumentationPage({
  title,
  description,
  eyebrow,
  status,
  sections,
}: DocumentationPageProps) {
  return (
    <div className="vf-docs-reference-layout">
      <div className="vf-docs-reference">
        <Card className="vf-docs-reference__section" padding="lg">
          <PageHeader
            description={description}
            eyebrow={eyebrow}
            status={status}
            title={title}
          />
        </Card>
        {sections.map((section) => (
          <Card
            className="vf-docs-reference__section"
            id={section.id}
            key={section.id}
            padding="lg"
          >
            <Heading level={2} size="md">
              {section.title}
            </Heading>
            {section.description ? (
              <Text tone="muted">{section.description}</Text>
            ) : null}
            <div className="vf-docs-example-canvas">{section.content}</div>
          </Card>
        ))}
      </div>
      <aside aria-label="On this page" className="vf-docs-reference-outline">
        <Text size="sm" tone="muted">
          On this page
        </Text>
        <nav>
          <ul>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
