import type { ReactNode } from "react";
import { Badge, PageHeader, Text } from "@vyrnforge/ui-components";
import type { DocumentationReadinessStatus } from "../../../docs/reference/documentationAvailability";
import type { DocsTemplateDefinition } from "./referenceRoutes";

type DocumentationPageTemplateProps = {
  children: ReactNode;
  description?: string;
  status: DocumentationReadinessStatus;
  template: DocsTemplateDefinition;
  title: string;
};

export function DocumentationPageTemplate({
  children,
  description,
  status,
  template,
  title,
}: DocumentationPageTemplateProps) {
  return (
    <article
      className={`vf-reference-page vf-reference-page--template-${template.id}`}
      data-document-template={template.id}
      data-template-sections={template.sections.join(" ")}
    >
      <section
        aria-labelledby="vf-reference-page-title"
        className="vf-reference-page__hero"
      >
        <div className="vf-reference-page__hero-copy">
          <div className="vf-reference-page__meta">
            <Text className="vf-reference-page__eyebrow" size="sm">
              {template.label}
            </Text>
            <Badge size="sm" tone="subtle" variant="success">
              {status}
            </Badge>
          </div>
          <PageHeader
            description={description}
            title={title}
            titleProps={{ id: "vf-reference-page-title" }}
          />
        </div>
      </section>
      <div className="vf-reference-page__body">{children}</div>
    </article>
  );
}
